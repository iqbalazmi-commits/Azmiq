import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import * as t from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { recordServerPurchase } from "@/lib/analytics-server";

export const runtime = "nodejs";
// The raw body is required for signature verification; any parsing or
// transformation of it invalidates the signature.
export const dynamic = "force-dynamic";

/* ===========================================================================
   STRIPE WEBHOOK - THE SOURCE OF TRUTH FOR ORDER STATUS

   The browser redirect after payment is a convenience, not evidence. A
   customer can close the tab, lose signal, or never come back, and the payment
   still succeeded. So nothing marks an order paid except this endpoint.

   IDEMPOTENCY
   Stripe retries a failed delivery for up to three days, and may deliver the
   same event more than once even on success. Every event id is inserted into
   webhook_events, whose primary key rejects the second insert. A duplicate is
   therefore detected *before* any side effect runs - inventory is decremented
   once, the confirmation email is sent once, the discount is counted once.
   =========================================================================== */

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    // A bad signature is an unauthenticated request, not a processing failure.
    console.error("[stripe-webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // --- The idempotency gate --------------------------------------------
  try {
    await db.insert(t.webhookEvents).values({
      id: event.id,
      type: event.type,
      status: "processing",
    });
  } catch {
    // Primary key violation: this event has already been seen. Returning 200
    // stops Stripe retrying an event we have, by definition, already handled.
    console.log(`[stripe-webhook] duplicate ${event.id} (${event.type}) ignored`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handleSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handleFailed(event.data.object);
        break;
      case "charge.refunded":
        await handleRefunded(event.data.object);
        break;
      default:
        // Acknowledged and recorded, but nothing to do.
        break;
    }

    await db
      .update(t.webhookEvents)
      .set({ status: "done", processedAt: new Date() })
      .where(eq(t.webhookEvents.id, event.id));

    return NextResponse.json({ received: true });
  } catch (error) {
    // Mark it failed and return 500 so Stripe retries. The row stays, but with
    // status "failed" - the retry path below clears it so the retry can work.
    console.error(`[stripe-webhook] ${event.type} failed`, error);
    await db
      .update(t.webhookEvents)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        attempts: sql`${t.webhookEvents.attempts} + 1`,
      })
      .where(eq(t.webhookEvents.id, event.id));
    // Delete the gate row so Stripe's retry is allowed to run the handler
    // again - a failed attempt must not permanently block the order.
    await db.delete(t.webhookEvents).where(eq(t.webhookEvents.id, event.id));
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}

async function handleSucceeded(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.orderId;
  if (!orderId) {
    console.warn(`[stripe-webhook] ${intent.id} has no orderId in metadata`);
    return;
  }

  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, orderId)).limit(1);
  if (!order) {
    console.error(`[stripe-webhook] order ${orderId} not found for ${intent.id}`);
    return;
  }

  // Already paid: nothing to do. Belt-and-braces behind the event gate.
  if (order.status !== "pending") return;

  const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id));

  await db.transaction(async (tx) => {
    await tx
      .update(t.orders)
      .set({
        status: "paid",
        paymentStatus: "paid",
        placedAt: new Date(),
        updatedAt: new Date(),
        // Trust the amount Stripe actually captured, not the one we stored.
        grandTotal: intent.amount_received || order.grandTotal,
        stripePaymentIntentId: intent.id,
      })
      .where(eq(t.orders.id, order.id));

    for (const item of items) {
      if (!item.variantId) continue;
      await tx
        .update(t.variants)
        .set({ inventory: sql`greatest(0, ${t.variants.inventory} - ${item.quantity})` })
        .where(eq(t.variants.id, item.variantId));
    }

    if (order.discountCode) {
      const [discount] = await tx
        .select()
        .from(t.discounts)
        .where(eq(t.discounts.code, order.discountCode))
        .limit(1);
      if (discount) {
        await tx
          .update(t.discounts)
          .set({ usedCount: sql`${t.discounts.usedCount} + 1` })
          .where(eq(t.discounts.id, discount.id));
        await tx.insert(t.discountRedemptions).values({
          discountId: discount.id,
          orderId: order.id,
          email: order.email,
        });
      }
    }

    // The basket has become an order; emptying it prevents a double purchase
    // if the customer navigates back.
    const cartToken = intent.metadata?.cartToken;
    if (cartToken) {
      const [cart] = await tx.select().from(t.carts).where(eq(t.carts.token, cartToken)).limit(1);
      if (cart) {
        await tx.delete(t.cartItems).where(eq(t.cartItems.cartId, cart.id));
        await tx.update(t.carts).set({ discountCode: null }).where(eq(t.carts.id, cart.id));
      }
    }
  });

  const [fresh] = await db.select().from(t.orders).where(eq(t.orders.id, order.id)).limit(1);

  // Analytics and email are outside the transaction on purpose: a failing
  // third party must never roll back a payment we have already taken.
  await Promise.allSettled([
    sendOrderConfirmation(fresh, items),
    recordServerPurchase(fresh, items),
  ]);
}

async function handleFailed(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.orderId;
  if (!orderId) return;
  await db
    .update(t.orders)
    .set({
      paymentStatus: "failed",
      internalNote: intent.last_payment_error?.message ?? "Payment failed",
      updatedAt: new Date(),
    })
    .where(eq(t.orders.id, orderId));
}

async function handleRefunded(charge: Stripe.Charge) {
  const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!intentId) return;

  const [order] = await db
    .select()
    .from(t.orders)
    .where(eq(t.orders.stripePaymentIntentId, intentId))
    .limit(1);
  if (!order) return;

  const refunded = charge.amount_refunded;
  const fullyRefunded = refunded >= order.grandTotal;

  await db
    .update(t.orders)
    .set({
      refundedTotal: refunded,
      status: fullyRefunded ? "refunded" : "partially_refunded",
      paymentStatus: fullyRefunded ? "refunded" : "partially_refunded",
      updatedAt: new Date(),
    })
    .where(eq(t.orders.id, order.id));

  // Stripe-initiated refunds (dashboard, disputes) are recorded here; refunds
  // started in our admin panel already wrote their own row.
  for (const refund of charge.refunds?.data ?? []) {
    await db
      .insert(t.refunds)
      .values({
        orderId: order.id,
        stripeRefundId: refund.id,
        amount: refund.amount,
        reason: refund.reason ?? "Refunded in Stripe",
      })
      .onConflictDoNothing();
  }
}
