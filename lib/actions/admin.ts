"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import * as t from "@/db/schema";
import { createAdminSession, getCurrentAdmin, verifyPassword } from "@/lib/auth";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { recordServerPurchase } from "@/lib/analytics-server";
import { parseMoneyInput } from "@/lib/money";
import { slugify } from "@/lib/utils";

/* ===========================================================================
   ADMIN ACTIONS

   Every action in this file re-checks the session itself. Relying on the
   layout to have done it is how admin panels end up with an unprotected
   mutation that a layout refactor quietly exposed.
   =========================================================================== */

export type AdminResult = { ok: true; message: string } | { ok: false; error: string } | null;

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/sign-in");
  return admin;
}

/* ----------------------------------------------------------------- AUTH */

export async function adminSignIn(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const generic = { ok: false as const, error: "Those details do not match an account." };
  if (!email || !password) return generic;

  const [user] = await db.select().from(t.adminUsers).where(eq(t.adminUsers.email, email)).limit(1);
  if (!user) {
    // Hash anyway so a missing account and a wrong password take the same
    // time - otherwise the response time tells an attacker which is which.
    await verifyPassword(password, "scrypt$16384$8$1$00$00");
    return generic;
  }

  if (!(await verifyPassword(password, user.passwordHash))) return generic;

  await db.update(t.adminUsers).set({ lastLoginAt: new Date() }).where(eq(t.adminUsers.id, user.id));
  await createAdminSession(user.id);
  redirect("/admin");
}

/* -------------------------------------------------------------- PRODUCTS */

const productSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  summary: z.string().max(500).optional(),
  description: z.string().max(20000).optional(),
  wellnessStory: z.string().max(20000).optional(),
  careInstructions: z.string().max(20000).optional(),
  finish: z.string().max(120).optional(),
  dimensions: z.string().max(200).optional(),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
});

export async function updateProduct(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    slug: slugify(String(formData.get("slug") ?? "")),
    subtitle: formData.get("subtitle") ?? "",
    summary: formData.get("summary") ?? "",
    description: formData.get("description") ?? "",
    wellnessStory: formData.get("wellnessStory") ?? "",
    careInstructions: formData.get("careInstructions") ?? "",
    finish: formData.get("finish") ?? "",
    dimensions: formData.get("dimensions") ?? "",
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };

  const [current] = await db.select().from(t.products).where(eq(t.products.id, parsed.data.id)).limit(1);
  if (!current) return { ok: false, error: "That product no longer exists." };

  // Changing a slug breaks every link to it, so the old one is turned into a
  // redirect automatically. Nobody has to remember to do this by hand.
  if (current.slug !== parsed.data.slug) {
    await db
      .insert(t.redirects)
      .values({
        fromPath: `/products/${current.slug}`,
        toPath: `/products/${parsed.data.slug}`,
        statusCode: 301,
        source: "auto",
        note: "Created automatically when the product URL changed",
      })
      .onConflictDoUpdate({
        target: t.redirects.fromPath,
        set: { toPath: `/products/${parsed.data.slug}` },
      });
  }

  await db
    .update(t.products)
    .set({
      title: parsed.data.title,
      slug: parsed.data.slug,
      subtitle: parsed.data.subtitle || null,
      summary: parsed.data.summary ?? "",
      description: parsed.data.description ?? "",
      wellnessStory: parsed.data.wellnessStory || null,
      careInstructions: parsed.data.careInstructions || null,
      finish: parsed.data.finish || null,
      dimensions: parsed.data.dimensions || null,
      status: parsed.data.status,
      featured: parsed.data.featured,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      updatedAt: new Date(),
    })
    .where(eq(t.products.id, parsed.data.id));

  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}

export async function updateVariant(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const price = parseMoneyInput(String(formData.get("price") ?? ""));
  const compareAtRaw = String(formData.get("compareAt") ?? "").trim();
  const compareAt = compareAtRaw ? parseMoneyInput(compareAtRaw) : null;
  const inventory = Number(formData.get("inventory") ?? 0);

  if (!id || price === null || price < 0) return { ok: false, error: "Enter a valid price." };
  if (!Number.isInteger(inventory) || inventory < 0) {
    return { ok: false, error: "Stock must be a whole number, zero or more." };
  }
  if (compareAt !== null && compareAt <= price) {
    // Stops a "was" price being set below the current one, which would show a
    // negative saving and is a price-marking problem, not just a display bug.
    return { ok: false, error: "The previous price must be higher than the current price." };
  }

  await db
    .update(t.variants)
    .set({ priceGbp: price, compareAtGbp: compareAt, inventory })
    .where(eq(t.variants.id, id));

  revalidatePath("/", "layout");
  return { ok: true, message: "Variant updated." };
}

export async function setProductStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "active", "archived"].includes(status)) return;

  await db.update(t.products).set({ status, updatedAt: new Date() }).where(eq(t.products.id, id));
  revalidatePath("/", "layout");
}

export async function setInventory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("variantId") ?? "");
  const inventory = Number(formData.get("inventory") ?? 0);
  if (!id || !Number.isInteger(inventory) || inventory < 0) return;

  await db.update(t.variants).set({ inventory }).where(eq(t.variants.id, id));
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
}

/* ---------------------------------------------------------------- ORDERS */

/* A bank transfer has no webhook to tell us the money arrived, so a human
   confirms it. This is the manual twin of the Stripe webhook's success path and
   must do exactly the same work: mark paid, take the stock down, count the
   discount, and send the receipt the customer is waiting for.

   Guarded on status "pending" so a double click, or two staff confirming the
   same payment at once, cannot decrement stock twice. */
export async function markOrderPaid(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  await requireAdmin();
  const id = String(formData.get("orderId") ?? "");
  if (!id) return { ok: false, error: "Missing order." };

  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, id)).limit(1);
  if (!order) return { ok: false, error: "That order no longer exists." };
  if (order.status !== "pending") {
    return { ok: false, error: `This order is already marked "${order.status}".` };
  }

  const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id));

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(t.orders)
      .set({
        status: "paid",
        paymentStatus: "paid",
        placedAt: new Date(),
        updatedAt: new Date(),
      })
      // Re-checking the status inside the transaction closes the race that the
      // read above cannot: two confirmations arriving at the same moment.
      .where(and(eq(t.orders.id, order.id), eq(t.orders.status, "pending")))
      .returning({ id: t.orders.id });
    if (updated.length === 0) return;

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
        await tx
          .insert(t.discountRedemptions)
          .values({ discountId: discount.id, orderId: order.id, email: order.email })
          .onConflictDoNothing();
      }
    }
  });

  const [fresh] = await db.select().from(t.orders).where(eq(t.orders.id, order.id)).limit(1);
  if (fresh.status === "paid") {
    // A mail outage must not undo a payment we have confirmed by eye.
    // Same reporting the card webhook does, so a bank transfer is not an
    // invisible sale in GA4, Klaviyo and Meta.
    await Promise.allSettled([
      sendOrderConfirmation(fresh, items),
      recordServerPurchase(fresh, items),
    ]);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin");
  return { ok: true, message: "Marked as paid — stock updated and the receipt is on its way." };
}

export async function fulfilOrder(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  await requireAdmin();
  const id = String(formData.get("orderId") ?? "");
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim();
  if (!id) return { ok: false, error: "Missing order." };

  await db
    .update(t.orders)
    .set({
      status: "fulfilled",
      fulfillmentStatus: "fulfilled",
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(t.orders.id, id));

  revalidatePath("/admin/orders");
  return { ok: true, message: "Marked as shipped." };
}

export async function refundOrder(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("orderId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const restock = formData.get("restock") === "on";

  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, id)).limit(1);
  if (!order) return { ok: false, error: "That order no longer exists." };
  if (!order.stripePaymentIntentId) {
    return { ok: false, error: "That order has no Stripe payment to refund." };
  }

  const refundable = order.grandTotal - order.refundedTotal;
  const amount = amountRaw ? parseMoneyInput(amountRaw) : refundable;

  if (amount === null || amount <= 0) return { ok: false, error: "Enter an amount to refund." };
  if (amount > refundable) {
    return {
      ok: false,
      error: `You can refund at most ${(refundable / 100).toFixed(2)} on this order.`,
    };
  }
  if (!stripeConfigured()) return { ok: false, error: "Stripe is not configured." };

  try {
    const refund = await stripe().refunds.create(
      {
        payment_intent: order.stripePaymentIntentId,
        amount,
        reason: "requested_by_customer",
        metadata: { orderId: order.id, adminId: admin.id, note: reason },
      },
      // Two clicks on the refund button must not refund twice.
      { idempotencyKey: `refund-${order.id}-${amount}-${order.refundedTotal}` },
    );

    await db.insert(t.refunds).values({
      orderId: order.id,
      stripeRefundId: refund.id,
      amount,
      reason: reason || "Refunded by staff",
      createdByAdminId: admin.id,
    });

    // The webhook will also update these totals when charge.refunded arrives;
    // writing them now means the panel reflects reality immediately.
    const refundedTotal = order.refundedTotal + amount;
    await db
      .update(t.orders)
      .set({
        refundedTotal,
        status: refundedTotal >= order.grandTotal ? "refunded" : "partially_refunded",
        paymentStatus: refundedTotal >= order.grandTotal ? "refunded" : "partially_refunded",
        updatedAt: new Date(),
      })
      .where(eq(t.orders.id, order.id));

    if (restock) {
      const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id));
      for (const item of items) {
        if (!item.variantId) continue;
        await db
          .update(t.variants)
          .set({ inventory: sql`${t.variants.inventory} + ${item.quantity}` })
          .where(eq(t.variants.id, item.variantId));
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${order.id}`);
    return { ok: true, message: `Refunded ${(amount / 100).toFixed(2)}.` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Stripe rejected the refund.",
    };
  }
}

export async function saveOrderNote(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("orderId") ?? "");
  const note = String(formData.get("internalNote") ?? "");
  if (!id) return;
  await db.update(t.orders).set({ internalNote: note || null }).where(eq(t.orders.id, id));
  revalidatePath(`/admin/orders/${id}`);
}

/* ------------------------------------------------------------- DISCOUNTS */

export async function createDiscount(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  await requireAdmin();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "percentage");
  const valueRaw = String(formData.get("value") ?? "").trim();
  const minSubtotalRaw = String(formData.get("minSubtotal") ?? "").trim();
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return { ok: false, error: "Codes are 3 to 32 characters: letters, numbers, hyphen, underscore." };
  }
  if (!["percentage", "fixed", "free_shipping"].includes(type)) {
    return { ok: false, error: "Choose a discount type." };
  }

  let value = 0;
  if (type === "percentage") {
    const percent = Number(valueRaw);
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      return { ok: false, error: "Enter a percentage between 1 and 100." };
    }
    value = Math.round(percent * 100); // stored as percent * 100
  } else if (type === "fixed") {
    const amount = parseMoneyInput(valueRaw);
    if (amount === null || amount <= 0) return { ok: false, error: "Enter an amount to take off." };
    value = amount;
  }

  try {
    await db.insert(t.discounts).values({
      code,
      type,
      value,
      minSubtotal: minSubtotalRaw ? (parseMoneyInput(minSubtotalRaw) ?? 0) : 0,
      usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
      active: true,
    });
  } catch {
    return { ok: false, error: `The code ${code} already exists.` };
  }

  revalidatePath("/admin/discounts");
  return { ok: true, message: `${code} created.` };
}

export async function toggleDiscount(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;
  await db.update(t.discounts).set({ active }).where(eq(t.discounts.id, id));
  revalidatePath("/admin/discounts");
}

/* ------------------------------------------------------------- REDIRECTS */

export async function createRedirect(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  await requireAdmin();

  const fromPath = String(formData.get("fromPath") ?? "").trim();
  const toPath = String(formData.get("toPath") ?? "").trim();

  if (!fromPath.startsWith("/")) return { ok: false, error: "The old path must start with /" };
  if (!toPath.startsWith("/")) return { ok: false, error: "The new path must start with /" };
  if (toPath === "/") {
    return {
      ok: false,
      error:
        "Redirecting to the homepage throws away the old URL's search ranking and confuses the visitor. Point it at the closest product or collection instead.",
    };
  }
  if (fromPath === toPath) return { ok: false, error: "That would redirect a page to itself." };

  try {
    await db.insert(t.redirects).values({ fromPath, toPath, statusCode: 301, source: "manual" });
  } catch {
    return { ok: false, error: "There is already a redirect for that path." };
  }

  revalidatePath("/admin/redirects");
  return { ok: true, message: "Redirect added." };
}

export async function deleteRedirect(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(t.redirects).where(eq(t.redirects.id, id));
  revalidatePath("/admin/redirects");
}

/* --------------------------------------------------------------- REVIEWS */

export async function moderateReview(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["published", "rejected", "pending"].includes(status)) return;

  await db
    .update(t.reviews)
    .set({ status, publishedAt: status === "published" ? new Date() : null })
    .where(eq(t.reviews.id, id));

  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function replyToReview(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const reply = String(formData.get("reply") ?? "").trim();
  if (!id) return;
  await db.update(t.reviews).set({ reply: reply || null }).where(eq(t.reviews.id, id));
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

/* --------------------------------------------------------------- RETURNS */

export async function updateReturnStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["requested", "approved", "rejected", "received", "refunded"].includes(status)) return;

  await db
    .update(t.returnRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(t.returnRequests.id, id));
  revalidatePath("/admin/returns");
}
