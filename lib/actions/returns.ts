"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import * as t from "@/db/schema";
import { sendReturnReceived } from "@/lib/email";

/* ===========================================================================
   RETURNS

   Deliberately open to guests. Most orders on this store will be guest
   checkouts, so gating returns behind an account would push the majority of
   customers into emailing support - which is slower for them and more work for
   AZMIQ.

   Identity is proved by order number plus the email the order was placed with.
   Both are needed, the lookup is exact, and a mismatch returns the same
   message as a missing order so the form cannot be used to test whether an
   address has shopped here.
   =========================================================================== */

const RETURN_WINDOW_DAYS = 30;

export type LookupResult =
  | { ok: true; order: LookupOrder }
  | { ok: false; error: string }
  | null;

export type LookupOrder = {
  id: string;
  number: number;
  email: string;
  placedAt: string;
  daysLeft: number;
  currency: string;
  items: { id: string; title: string; variantTitle: string; quantity: number; lineTotal: number }[];
  alreadyRequested: boolean;
};

const lookupSchema = z.object({
  orderNumber: z.coerce.number().int().positive(),
  email: z.string().email(),
});

export async function lookupOrder(_prev: LookupResult, formData: FormData): Promise<LookupResult> {
  const parsed = lookupSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });

  const notFound = {
    ok: false as const,
    error:
      "We could not find an order with that number and email address. Check both and try again, or contact us and we will look it up.",
  };
  if (!parsed.success) return notFound;

  const [order] = await db
    .select()
    .from(t.orders)
    .where(and(eq(t.orders.number, parsed.data.orderNumber), eq(t.orders.email, parsed.data.email)))
    .limit(1);

  if (!order) return notFound;

  if (!["paid", "fulfilled", "partially_refunded"].includes(order.status)) {
    return { ok: false, error: "That order is not eligible for a return yet." };
  }

  const placedAt = order.placedAt ?? order.createdAt;
  const daysSince = Math.floor((Date.now() - placedAt.getTime()) / 864e5);
  if (daysSince > RETURN_WINDOW_DAYS) {
    return {
      ok: false,
      error: `That order was placed ${daysSince} days ago, which is outside our ${RETURN_WINDOW_DAYS}-day window. Get in touch anyway — if something is faulty we will still put it right.`,
    };
  }

  const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id));
  const existing = await db
    .select()
    .from(t.returnRequests)
    .where(eq(t.returnRequests.orderId, order.id));

  return {
    ok: true,
    order: {
      id: order.id,
      number: order.number,
      email: order.email,
      placedAt: placedAt.toISOString(),
      daysLeft: RETURN_WINDOW_DAYS - daysSince,
      currency: order.currency,
      items: items.map((i) => ({
        id: i.id,
        title: i.productTitle,
        variantTitle: i.variantTitle,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
      alreadyRequested: existing.length > 0,
    },
  };
}

export type SubmitResult = { ok: true; rma: string } | { ok: false; error: string } | null;

const submitSchema = z.object({
  orderId: z.string().uuid(),
  email: z.string().email(),
  reason: z.enum([
    "changed-mind",
    "not-as-described",
    "arrived-damaged",
    "wrong-item",
    "faulty",
    "other",
  ]),
  resolution: z.enum(["refund", "exchange"]),
  comment: z.string().max(1000).optional(),
});

export async function submitReturn(_prev: SubmitResult, formData: FormData): Promise<SubmitResult> {
  const parsed = submitSchema.safeParse({
    orderId: formData.get("orderId"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    reason: formData.get("reason"),
    resolution: formData.get("resolution") ?? "refund",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Please choose a reason for the return." };

  const selected = formData
    .getAll("items")
    .map(String)
    .filter(Boolean);
  if (selected.length === 0) {
    return { ok: false, error: "Select at least one item to return." };
  }

  // Re-verify ownership: the hidden orderId alone must never be enough.
  const [order] = await db
    .select()
    .from(t.orders)
    .where(and(eq(t.orders.id, parsed.data.orderId), eq(t.orders.email, parsed.data.email)))
    .limit(1);
  if (!order) return { ok: false, error: "We could not verify that order." };

  const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id));
  const validIds = new Set(items.map((i) => i.id));
  const chosen = selected.filter((id) => validIds.has(id));
  if (chosen.length === 0) return { ok: false, error: "Select at least one item to return." };

  const rma = `RMA-${order.number}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  await db.insert(t.returnRequests).values({
    orderId: order.id,
    rma,
    status: "requested",
    reason: parsed.data.reason,
    comment: parsed.data.comment || null,
    resolution: parsed.data.resolution,
    items: chosen.map((id) => ({
      orderItemId: id,
      quantity: items.find((i) => i.id === id)?.quantity ?? 1,
    })),
  });

  await sendReturnReceived(order.email, rma, order.number);

  return { ok: true, rma };
}
