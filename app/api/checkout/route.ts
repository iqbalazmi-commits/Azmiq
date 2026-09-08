import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import * as t from "@/db/schema";
import { getCart } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/auth";
import { shippingRateById } from "@/lib/shipping";
import { stripe, stripeConfigured, stripeCurrency } from "@/lib/stripe";

export const runtime = "nodejs";

/* ===========================================================================
   CREATE OR UPDATE THE PAYMENT INTENT

   This is the moment the price becomes real, so everything is recalculated
   here from the database - the request body supplies an address, a shipping
   choice and an email, and nothing else. Any amount the browser might have
   sent is ignored.

   A pending order row is written alongside the PaymentIntent so that the
   webhook, which is the source of truth for payment status, always has a row
   to find. If the customer abandons, the pending row is simply never paid.
   =========================================================================== */

const addressSchema = z.object({
  name: z.string().min(1).max(120),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1).max(120),
  region: z.string().max(120).optional().or(z.literal("")),
  postcode: z.string().min(1).max(24),
  country: z.string().length(2),
  phone: z.string().max(40).optional().or(z.literal("")),
});

const bodySchema = z.object({
  email: z.string().email().max(200),
  shippingAddress: addressSchema,
  shippingRateId: z.string().uuid(),
  customerNote: z.string().max(500).optional().or(z.literal("")),
  marketingConsent: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add your Stripe keys to .env.local." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email, shippingAddress, shippingRateId, customerNote, marketingConsent } = parsed.data;

  const rate = await shippingRateById(shippingRateId);
  if (!rate) return NextResponse.json({ error: "Choose a delivery method." }, { status: 400 });

  // Totals recomputed against the destination country, so export VAT removal
  // and the correct shipping rate are both applied before Stripe sees a figure.
  const cart = await getCart({ shippingRateId });
  if (cart.lines.length === 0) {
    return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });
  }

  const unavailable = cart.lines.filter((line) => !line.available);
  if (unavailable.length > 0) {
    return NextResponse.json(
      { error: `${unavailable[0].productTitle} is out of stock. Please remove it to continue.` },
      { status: 409 },
    );
  }

  const { totals, currency } = cart;
  const customer = await getCurrentCustomer();

  // One pending order per cart, reused if the customer edits and resubmits -
  // otherwise every keystroke-triggered retry would litter the orders table.
  const [existing] = await db
    .select()
    .from(t.orders)
    .where(and(eq(t.orders.email, email), eq(t.orders.status, "pending")))
    .limit(1);

  let orderId = existing?.id ?? null;
  let paymentIntentId = existing?.stripePaymentIntentId ?? null;

  const orderValues = {
    email,
    customerId: customer?.id ?? null,
    currency,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    shippingTotal: totals.shippingTotal,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    discountCode: cart.discountCode,
    shippingAddress,
    billingAddress: shippingAddress,
    shippingMethod: `${rate.name}${rate.description ? ` - ${rate.description}` : ""}`,
    customerNote: customerNote || null,
    updatedAt: new Date(),
  };

  if (orderId) {
    await db.update(t.orders).set(orderValues).where(eq(t.orders.id, orderId));
    await db.delete(t.orderItems).where(eq(t.orderItems.orderId, orderId));
  } else {
    const [created] = await db.insert(t.orders).values({ ...orderValues, status: "pending" }).returning();
    orderId = created.id;
  }

  await db.insert(t.orderItems).values(
    cart.lines.map((line) => {
      const priced = totals.lines.find((l) => l.variantId === line.variantId);
      const unitAmount = priced?.unitAmount ?? line.unitAmount;
      return {
        orderId: orderId!,
        variantId: line.variantId,
        productSlug: line.productSlug,
        productTitle: line.productTitle,
        variantTitle: line.variantTitle,
        sku: line.sku,
        imageUrl: line.imageUrl,
        quantity: line.quantity,
        unitAmount,
        compareAtAmount: priced?.compareAtAmount ?? null,
        lineTotal: unitAmount * line.quantity,
      };
    }),
  );

  const client = stripe();
  const metadata = {
    orderId: orderId!,
    cartToken: cart.token ?? "",
    email,
    discountCode: cart.discountCode ?? "",
    shippingRateId,
  };

  let intent;
  if (paymentIntentId) {
    // Updating rather than creating keeps a single intent per checkout, so a
    // customer who changes their address does not leave orphaned intents.
    intent = await client.paymentIntents.update(paymentIntentId, {
      amount: totals.grandTotal,
      currency: stripeCurrency(currency),
      metadata,
      receipt_email: email,
    });
  } else {
    intent = await client.paymentIntents.create(
      {
        amount: totals.grandTotal,
        currency: stripeCurrency(currency),
        automatic_payment_methods: { enabled: true },
        metadata,
        receipt_email: email,
        shipping: {
          name: shippingAddress.name,
          phone: shippingAddress.phone || undefined,
          address: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || undefined,
            city: shippingAddress.city,
            state: shippingAddress.region || undefined,
            postal_code: shippingAddress.postcode,
            country: shippingAddress.country,
          },
        },
      },
      // Same cart, same amount, same currency -> same intent, even if the
      // request is retried by the browser or a flaky connection.
      { idempotencyKey: `order-${orderId}-${totals.grandTotal}-${currency}` },
    );
    paymentIntentId = intent.id;
    await db.update(t.orders).set({ stripePaymentIntentId: intent.id }).where(eq(t.orders.id, orderId!));
  }

  if (marketingConsent && customer) {
    await db
      .update(t.customers)
      .set({ marketingConsent: true, acceptsMarketingAt: new Date() })
      .where(eq(t.customers.id, customer.id));
  }

  return NextResponse.json({
    clientSecret: intent.client_secret,
    orderId,
    amount: totals.grandTotal,
    currency,
  });
}
