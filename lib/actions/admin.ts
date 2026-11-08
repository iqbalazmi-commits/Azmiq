"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import * as t from "@/db/schema";
import { createHash, timingSafeEqual } from "node:crypto";
import { createAdminSession, getCurrentAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { recordServerPurchase } from "@/lib/analytics-server";
import { parseMoneyInput } from "@/lib/money";
import { slugify } from "@/lib/utils";
import { presentmentRows } from "@/lib/presentment";

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

  // ADMIN_EMAIL / ADMIN_PASSWORD in the hosting environment always work as the
  // owner login, and bring the stored hash in line with them. Vercel stores
  // these as "sensitive" values that can never be read back, so changing them
  // there is the owner's only recovery route if the password is forgotten.
  if (matchesEnvOwner(email, password)) {
    const passwordHash = await hashPassword(password);
    const [owner] = await db
      .insert(t.adminUsers)
      .values({ email, name: "AZMIQ Owner", passwordHash, role: "owner", lastLoginAt: new Date() })
      .onConflictDoUpdate({
        target: t.adminUsers.email,
        set: { passwordHash, role: "owner", lastLoginAt: new Date() },
      })
      .returning({ id: t.adminUsers.id });
    await createAdminSession(owner.id);
    redirect("/admin");
  }

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

/* Constant-time comparison against the environment credentials. Digesting
   first gives both sides the same length, which timingSafeEqual requires. The
   10-character floor matches `npm run admin:reset`, and the seed default is
   refused outright because it is published in this repository. */
function matchesEnvOwner(email: string, password: string): boolean {
  const envEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!envEmail || envPassword.length < 10 || envPassword === "change-me-before-launch") return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  const emailOk = timingSafeEqual(digest(email), digest(envEmail));
  const passwordOk = timingSafeEqual(digest(password), digest(envPassword));
  return emailOk && passwordOk;
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
  categoryIds: z.array(z.string().min(1)).max(50),
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
    categoryIds: [...new Set(formData.getAll("categoryIds").map(String))],
  });
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };
  // A product in no section can only be found through search or "Shop all".
  if (parsed.data.categoryIds.length === 0) {
    return { ok: false, error: "Tick at least one section, or the product disappears from the shop menus." };
  }

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

  // Replace the product's sections with exactly what was ticked. Only ids that
  // are real categories are kept, so a tampered form cannot insert junk.
  const productId = parsed.data.id;
  const valid = await db
    .select({ id: t.categories.id })
    .from(t.categories)
    .where(inArray(t.categories.id, parsed.data.categoryIds));
  if (valid.length === 0) return { ok: false, error: "Those sections no longer exist. Reload the page." };
  await db.transaction(async (tx) => {
    await tx.delete(t.productCategories).where(eq(t.productCategories.productId, productId));
    await tx.insert(t.productCategories).values(valid.map((c) => ({ productId, categoryId: c.id })));
  });

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

  await db.transaction(async (tx) => {
    await tx
      .update(t.variants)
      .set({ priceGbp: price, compareAtGbp: compareAt, inventory })
      .where(eq(t.variants.id, id));
    // Keep the EUR/USD/CAD/AUD prices in step with the new GBP price.
    // Without this, a repriced item kept charging overseas buyers the old one.
    await tx.delete(t.variantPrices).where(eq(t.variantPrices.variantId, id));
    await tx.insert(t.variantPrices).values(presentmentRows(id, price, compareAt));
  });

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

/* ------------------------------------------------------- NEW PRODUCTS */

const newProductSchema = z.object({
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(500),
  description: z.string().trim().max(20000),
  categoryIds: z.array(z.string().min(1)).min(1).max(50),
});

/* Creates the product as a draft with one variant, then sends the owner to
   its edit page to add photos. It only goes live when they press Publish, so
   a half-finished product with no photos never appears in the shop. */
export async function createProduct(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  await requireAdmin();

  const parsed = newProductSchema.safeParse({
    title: formData.get("title") ?? "",
    summary: formData.get("summary") ?? "",
    description: formData.get("description") ?? "",
    categoryIds: [...new Set(formData.getAll("categoryIds").map(String))],
  });
  if (!parsed.success) {
    const missingSection = parsed.error.issues.some((i) => i.path[0] === "categoryIds");
    return {
      ok: false,
      error: missingSection
        ? "Tick at least one section, or the product will not appear in the shop menus."
        : "Please give the product a name (at least 2 letters).",
    };
  }

  const price = parseMoneyInput(String(formData.get("price") ?? ""));
  const compareAtRaw = String(formData.get("compareAt") ?? "").trim();
  const compareAt = compareAtRaw ? parseMoneyInput(compareAtRaw) : null;
  const inventory = Number(formData.get("inventory") ?? 0);
  if (price === null || price <= 0) return { ok: false, error: "Enter a price, e.g. 24.99." };
  if (compareAt !== null && compareAt <= price) {
    return { ok: false, error: "The “was” price must be higher than the price, or left empty." };
  }
  if (!Number.isInteger(inventory) || inventory < 0) {
    return { ok: false, error: "Stock must be a whole number, zero or more." };
  }

  const valid = await db
    .select({ id: t.categories.id })
    .from(t.categories)
    .where(inArray(t.categories.id, parsed.data.categoryIds));
  if (valid.length === 0) return { ok: false, error: "Those sections no longer exist. Reload the page." };

  // A free web address: "copper-mug", then "copper-mug-2", "copper-mug-3"...
  const base = slugify(parsed.data.title) || "product";
  const taken = new Set(
    (
      await db
        .select({ slug: t.products.slug })
        .from(t.products)
        .where(sql`${t.products.slug} = ${base} or ${t.products.slug} like ${base + "-%"}`)
    ).map((r) => r.slug),
  );
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

  const sku = `AZMIQ-${slug.toUpperCase().replace(/-/g, "").slice(0, 24)}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${t.products.position}), -1) + 1` })
    .from(t.products);

  const productId = await db.transaction(async (tx) => {
    const [product] = await tx
      .insert(t.products)
      .values({
        slug,
        title: parsed.data.title,
        summary: parsed.data.summary,
        description: parsed.data.description,
        status: "draft",
        position: Number(next),
        seoDescription: parsed.data.summary || null,
      })
      .returning({ id: t.products.id });
    await tx.insert(t.productCategories).values(valid.map((c) => ({ productId: product.id, categoryId: c.id })));
    const [variant] = await tx
      .insert(t.variants)
      .values({ productId: product.id, sku, title: "Standard", priceGbp: price, compareAtGbp: compareAt, inventory })
      .returning({ id: t.variants.id });
    await tx.insert(t.variantPrices).values(presentmentRows(variant.id, price, compareAt));
    return product.id;
  });

  redirect(`/admin/products/${productId}?created=1`);
}

/* ---------------------------------------------------------------- PHOTOS */

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const PHOTO_TYPES: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
};

/* One photo per call. The browser shrinks each photo first and sends them one
   after another, which keeps every request far below the hosting limits. */
export async function uploadProductImage(formData: FormData): Promise<AdminResult> {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("file");
  if (!productId || !(file instanceof File)) return { ok: false, error: "No photo was received." };
  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: "That photo is too large. Please use one under 4 MB." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Trust the file's own first bytes, not the name or the browser's label.
  const contentType = Object.keys(PHOTO_TYPES).find((type) => PHOTO_TYPES[type](bytes));
  if (!contentType) return { ok: false, error: "Please upload a JPG, PNG or WebP photo." };

  const width = clampDimension(Number(formData.get("width")));
  const height = clampDimension(Number(formData.get("height")));

  const [product] = await db
    .select({ id: t.products.id, title: t.products.title })
    .from(t.products)
    .where(eq(t.products.id, productId))
    .limit(1);
  if (!product) return { ok: false, error: "That product no longer exists." };

  await db.transaction(async (tx) => {
    const [media] = await tx
      .insert(t.productMedia)
      .values({ contentType, data: bytes, byteSize: bytes.byteLength })
      .returning({ id: t.productMedia.id });
    const [{ next, count }] = await tx
      .select({
        next: sql<number>`coalesce(max(${t.productImages.position}), -1) + 1`,
        count: sql<number>`count(*)`,
      })
      .from(t.productImages)
      .where(eq(t.productImages.productId, productId));
    await tx.insert(t.productImages).values({
      productId,
      url: `/media/${media.id}`,
      alt: product.title,
      kind: Number(count) === 0 ? "hero" : "lifestyle",
      width,
      height,
      position: Number(next),
    });
  });

  revalidatePath("/", "layout");
  return { ok: true, message: "Photo added." };
}

function clampDimension(value: number): number {
  return Number.isFinite(value) && value >= 50 ? Math.min(Math.round(value), 6000) : 1200;
}

export async function deleteProductImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const imageId = String(formData.get("imageId") ?? "");
  if (!imageId) return;

  const [image] = await db.select().from(t.productImages).where(eq(t.productImages.id, imageId)).limit(1);
  if (!image) return;

  await db.transaction(async (tx) => {
    await tx.delete(t.productImages).where(eq(t.productImages.id, imageId));
    // Uploaded photos are removed with their row; bundled /images files stay.
    if (image.url.startsWith("/media/")) {
      await tx.delete(t.productMedia).where(eq(t.productMedia.id, image.url.slice("/media/".length)));
    }
  });
  revalidatePath("/", "layout");
}

/* The first photo is the one on product cards, in search and in Google. */
export async function setMainProductImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const imageId = String(formData.get("imageId") ?? "");
  if (!imageId) return;

  const [image] = await db.select().from(t.productImages).where(eq(t.productImages.id, imageId)).limit(1);
  if (!image) return;

  const [{ min }] = await db
    .select({ min: sql<number>`coalesce(min(${t.productImages.position}), 0)` })
    .from(t.productImages)
    .where(eq(t.productImages.productId, image.productId));
  await db
    .update(t.productImages)
    .set({ position: Number(min) - 1 })
    .where(eq(t.productImages.id, imageId));
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
