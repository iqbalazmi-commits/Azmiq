"use server";

import { and, eq, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import * as t from "@/db/schema";
import { getCurrentCustomer } from "@/lib/auth";

/* ===========================================================================
   CUSTOMER REVIEWS

   Anyone can write a review; nothing they submit is shown until a person
   approves it in the admin panel (status starts "pending"). That is the spam
   defence — plus a honeypot field, length limits, and a block on an identical
   review being posted twice.

   If the reviewer gives the email they ordered with and that email has a paid
   order containing the product, the review is flagged as a verified purchase.
   The email is only used for that check and for de-duplication; it is not
   stored on the review and never shown.
   =========================================================================== */

export type ReviewResult = { ok: true; message: string } | { ok: false; error: string } | null;

const schema = z.object({
  productId: z.string().uuid(),
  productSlug: z.string().min(1).max(200),
  rating: z.coerce.number().int().min(1).max(5),
  authorName: z.string().trim().min(2, "Please add your name.").max(60),
  authorLocation: z.string().trim().max(60).optional().or(z.literal("")),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters.")
    .max(2000, "Please keep it under 2000 characters."),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  // Honeypot: real people leave this empty; bots fill every field.
  website: z.string().max(0).optional().or(z.literal("")),
});

const PURCHASED_STATUSES = ["paid", "fulfilled", "partially_refunded", "refunded"];

export async function submitReview(_prev: ReviewResult, formData: FormData): Promise<ReviewResult> {
  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    authorName: formData.get("authorName") ?? "",
    authorLocation: formData.get("authorLocation") ?? "",
    title: formData.get("title") ?? "",
    body: formData.get("body") ?? "",
    email: formData.get("email") ?? "",
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const d = parsed.data;

  const [product] = await db
    .select({ id: t.products.id })
    .from(t.products)
    .where(and(eq(t.products.id, d.productId), eq(t.products.status, "active")))
    .limit(1);
  if (!product) return { ok: false, error: "That product could not be found." };

  // Block an identical review being posted twice (any status).
  const bodyStart = d.body.slice(0, 80);
  const [dupe] = await db
    .select({ id: t.reviews.id })
    .from(t.reviews)
    .where(
      and(
        eq(t.reviews.productId, d.productId),
        ilike(t.reviews.authorName, d.authorName),
        ilike(t.reviews.body, `${bodyStart}%`),
      ),
    )
    .limit(1);
  if (dupe) {
    return { ok: false, error: "It looks like you have already left this review. Thank you." };
  }

  // Verified purchase: does the given email have a paid order for this product?
  let verifiedPurchase = false;
  const customer = await getCurrentCustomer();
  const emailToCheck = (d.email || customer?.email || "").toLowerCase();
  if (emailToCheck) {
    const paidOrders = await db
      .select({ id: t.orders.id })
      .from(t.orders)
      .where(and(eq(t.orders.email, emailToCheck), inArray(t.orders.status, PURCHASED_STATUSES)));
    if (paidOrders.length > 0) {
      const [bought] = await db
        .select({ id: t.orderItems.id })
        .from(t.orderItems)
        .where(
          and(
            inArray(t.orderItems.orderId, paidOrders.map((o) => o.id)),
            eq(t.orderItems.productSlug, d.productSlug),
          ),
        )
        .limit(1);
      verifiedPurchase = !!bought;
    }
  }

  await db.insert(t.reviews).values({
    productId: d.productId,
    customerId: customer?.id ?? null,
    authorName: d.authorName,
    authorLocation: d.authorLocation || null,
    rating: d.rating,
    title: d.title || null,
    body: d.body,
    verifiedPurchase,
    status: "pending",
    source: "native",
  });

  // The PDP caches for an hour; drop it so the count/summary refresh once the
  // review is approved (and so a returning reviewer sees their pending state).
  revalidatePath(`/products/${d.productSlug}`);

  return {
    ok: true,
    message: verifiedPurchase
      ? "Thank you — your review has been received and will appear once it is approved."
      : "Thank you — your review has been received and will appear once we have checked it over.",
  };
}
