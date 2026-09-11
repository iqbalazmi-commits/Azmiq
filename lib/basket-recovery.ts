import { randomBytes } from "node:crypto";
import { and, eq, gt, gte, inArray, isNull, lt, notExists, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ensureCart, MAX_LINE_QUANTITY } from "@/lib/cart";
import { sendBasketReminder } from "@/lib/email";
import { SITE } from "@/lib/site";
import type { Currency } from "@/lib/money";

/* ===========================================================================
   ABANDONED BASKET RECOVERY

   Someone reaches checkout, types their email, and leaves without paying. The
   checkout has already written a pending order for them, so everything needed
   to bring them back exists: who they are, and exactly what they chose.

   Once a day a cron finds those orders and sends ONE reminder with a link that
   rebuilds the basket on any device. That matters more than it sounds: the
   reminder is usually opened on a phone, while the basket cookie lives on the
   laptop they walked away from.

   Deliberately excluded:
     - bank-transfer orders. Those customers placed their order; they are not
       abandoning anything, they have simply not paid yet.
     - anyone who has bought since. Reminding someone about a basket they went
       on to purchase is the quickest way to look careless.
     - anyone who opted out. Suppression is by address, so it covers every
       future basket, not only the one they clicked from.
     - baskets older than a week. A fortnight-old nudge reads as spam.
   =========================================================================== */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Give people a real chance to come back on their own first. */
export const REMIND_AFTER = HOUR;
/** Past this a reminder irritates more than it helps. */
export const STOP_REMINDING_AFTER = 7 * DAY;
/** Matches the 30-day basket retention stated in the privacy policy. */
export const RESTORE_LINK_TTL = 30 * DAY;
/** Bounded so one run can never last long enough to overlap the next. */
const BATCH_SIZE = 50;
/** Statuses that mean the customer went on to actually buy. */
const PURCHASED = ["paid", "fulfilled", "partially_refunded", "refunded"];

const TOKEN_SHAPE = /^[A-Za-z0-9_-]{16,64}$/;

export const restoreUrl = (token: string) =>
  `${SITE.url}/basket/restore?token=${encodeURIComponent(token)}`;
export const unsubscribeUrl = (token: string) =>
  `${SITE.url}/basket/unsubscribe?token=${encodeURIComponent(token)}`;
/** RFC 8058 one-click target. Mail providers POST to it; humans never see it. */
export const oneClickUnsubscribeUrl = (token: string) =>
  `${SITE.url}/api/basket/unsubscribe?token=${encodeURIComponent(token)}`;

/* ------------------------------------------------------------------ SEND */

export async function sendDueReminders(now = new Date()) {
  const bought = alias(t.orders, "bought");

  const due = await db
    .select({ id: t.orders.id })
    .from(t.orders)
    .where(
      and(
        eq(t.orders.status, "pending"),
        eq(t.orders.paymentMethod, "card"),
        isNull(t.orders.recoverySentAt),
        lt(t.orders.updatedAt, new Date(now.getTime() - REMIND_AFTER)),
        gt(t.orders.updatedAt, new Date(now.getTime() - STOP_REMINDING_AFTER)),
        // Excluded in SQL rather than skipped in the loop, so ineligible orders
        // never occupy a batch slot and starve the eligible ones behind them.
        // Built with notExists() rather than raw SQL: an aliased table dropped
        // into a raw sql template renders as the bare alias, which Postgres
        // then reads as a table that does not exist.
        notExists(
          db
            .select({ one: sql`1` })
            .from(t.emailSuppressions)
            .where(sql`${t.emailSuppressions.email} = lower(${t.orders.email})`),
        ),
        notExists(
          db
            .select({ one: sql`1` })
            .from(bought)
            .where(
              and(
                sql`lower(${bought.email}) = lower(${t.orders.email})`,
                inArray(bought.status, PURCHASED),
                gte(bought.createdAt, t.orders.createdAt),
              ),
            ),
        ),
      ),
    )
    .orderBy(t.orders.updatedAt)
    .limit(BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const { id } of due) {
    const token = randomBytes(24).toString("base64url");

    // Claim before sending, and only if still unclaimed, so two overlapping
    // runs cannot both email the same person.
    const [order] = await db
      .update(t.orders)
      .set({ recoverySentAt: now, recoveryToken: token })
      .where(and(eq(t.orders.id, id), isNull(t.orders.recoverySentAt)))
      .returning();
    if (!order) continue;

    const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, id));
    // Nothing to bring back. The claim stays, so this order is never retried.
    if (items.length === 0) continue;

    const ok = await sendBasketReminder(order, items, {
      restore: restoreUrl(token),
      unsubscribe: unsubscribeUrl(token),
      oneClickUnsubscribe: oneClickUnsubscribeUrl(token),
    });
    if (ok) {
      sent++;
      continue;
    }

    // The mail did not go. Release the claim so the next run tries again.
    failed++;
    await db
      .update(t.orders)
      .set({ recoverySentAt: null, recoveryToken: null })
      .where(eq(t.orders.id, id));
  }

  return { due: due.length, sent, failed };
}

/* --------------------------------------------------------------- RESTORE */

export type RestoreResult =
  | { ok: true; added: number; unavailable: string[] }
  | { ok: false; reason: "invalid" | "expired" | "completed" };

/* Called from the link in the email. Not single-use: mail security scanners
   routinely fetch links before a human does, and a link that died on first
   touch would already be dead when the customer tapped it. That is safe here
   because restoring is idempotent - each line is raised to AT LEAST what was
   in the basket, never added on top - so a second click changes nothing. */
export async function restoreBasketFromToken(token: string): Promise<RestoreResult> {
  if (!TOKEN_SHAPE.test(token)) return { ok: false, reason: "invalid" };

  const [order] = await db.select().from(t.orders).where(eq(t.orders.recoveryToken, token)).limit(1);
  if (!order?.recoverySentAt) return { ok: false, reason: "invalid" };
  if (Date.now() - order.recoverySentAt.getTime() > RESTORE_LINK_TTL) {
    return { ok: false, reason: "expired" };
  }
  // Already bought. Refilling the basket now would invite a double purchase.
  if (order.status !== "pending") return { ok: false, reason: "completed" };

  const lines = await db
    .select({
      variantId: t.orderItems.variantId,
      quantity: t.orderItems.quantity,
      productTitle: t.orderItems.productTitle,
      inventory: t.variants.inventory,
      allowBackorder: t.variants.allowBackorder,
      productStatus: t.products.status,
    })
    .from(t.orderItems)
    .leftJoin(t.variants, eq(t.orderItems.variantId, t.variants.id))
    .leftJoin(t.products, eq(t.variants.productId, t.products.id))
    .where(eq(t.orderItems.orderId, order.id));

  const cart = await ensureCart(order.currency as Currency);
  let added = 0;
  const unavailable: string[] = [];

  for (const line of lines) {
    if (!line.variantId || line.productStatus !== "active") {
      unavailable.push(line.productTitle);
      continue;
    }
    const cap = line.allowBackorder
      ? MAX_LINE_QUANTITY
      : Math.min(line.inventory ?? 0, MAX_LINE_QUANTITY);
    if (cap <= 0) {
      unavailable.push(line.productTitle);
      continue;
    }
    const wanted = Math.min(line.quantity, cap);

    const [existing] = await db
      .select()
      .from(t.cartItems)
      .where(and(eq(t.cartItems.cartId, cart.id), eq(t.cartItems.variantId, line.variantId)))
      .limit(1);

    if (!existing) {
      await db.insert(t.cartItems).values({ cartId: cart.id, variantId: line.variantId, quantity: wanted });
    } else if (existing.quantity < wanted) {
      await db.update(t.cartItems).set({ quantity: wanted }).where(eq(t.cartItems.id, existing.id));
    }
    added++;
  }

  // Bring their code back too, but never overwrite one already on the basket.
  // It is revalidated on every basket read, so an expired code simply drops.
  if (order.discountCode) {
    await db
      .update(t.carts)
      .set({ discountCode: order.discountCode })
      .where(and(eq(t.carts.id, cart.id), isNull(t.carts.discountCode)));
  }
  await db.update(t.carts).set({ updatedAt: new Date() }).where(eq(t.carts.id, cart.id));

  return { ok: true, added, unavailable };
}

/* ------------------------------------------------------------ OPTING OUT */

export async function emailForToken(token: string): Promise<string | null> {
  if (!TOKEN_SHAPE.test(token)) return null;
  const [row] = await db
    .select({ email: t.orders.email })
    .from(t.orders)
    .where(eq(t.orders.recoveryToken, token))
    .limit(1);
  return row?.email ?? null;
}

/** Deliberately ignores the link expiry: an opt-out must always work. */
export async function suppressByToken(token: string): Promise<boolean> {
  const email = await emailForToken(token);
  if (!email) return false;
  await db
    .insert(t.emailSuppressions)
    .values({ email: email.toLowerCase() })
    .onConflictDoNothing();
  return true;
}
