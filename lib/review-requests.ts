import { randomBytes } from "node:crypto";
import { and, eq, gt, isNull, lt, notExists, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { sendReviewRequest } from "@/lib/email";
import { oneClickUnsubscribeUrl, unsubscribeUrl } from "@/lib/basket-recovery";

/* ===========================================================================
   REVIEW REQUESTS

   Once a day, find orders that shipped about ten days ago and send each one
   a single email asking for a review. That gives the parcel time to arrive
   and the customer time to actually use what they bought.

   Deliberately excluded:
     - orders shipped before this existed (shippedAt is null on those), so the
       first run does not email every past customer at once.
     - refunded or cancelled orders: status must still be "fulfilled".
     - anyone who opted out of follow-up emails (the same list as basket
       reminders, so one opt-out stops both).
     - orders that shipped more than 40 days ago. If a request failed for that
       long, a late one reads as spam.

   The opt-out link reuses the order's recovery token, so the existing
   unsubscribe page and one-click endpoint work for this email unchanged.
   =========================================================================== */

const DAY = 24 * 60 * 60 * 1000;
export const ASK_AFTER = 10 * DAY;
export const STOP_ASKING_AFTER = 40 * DAY;
const BATCH_SIZE = 50;

export async function sendDueReviewRequests(now = new Date()) {
  const due = await db
    .select({ id: t.orders.id })
    .from(t.orders)
    .where(
      and(
        eq(t.orders.status, "fulfilled"),
        isNull(t.orders.reviewRequestSentAt),
        lt(t.orders.shippedAt, new Date(now.getTime() - ASK_AFTER)),
        gt(t.orders.shippedAt, new Date(now.getTime() - STOP_ASKING_AFTER)),
        notExists(
          db
            .select({ one: sql`1` })
            .from(t.emailSuppressions)
            .where(sql`${t.emailSuppressions.email} = lower(${t.orders.email})`),
        ),
      ),
    )
    .orderBy(t.orders.shippedAt)
    .limit(BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const { id } of due) {
    // Claim before sending, and only if still unclaimed, so two overlapping
    // runs cannot both email the same person. A paid order normally has no
    // recovery token yet; give it one for the opt-out link.
    const [order] = await db
      .update(t.orders)
      .set({
        reviewRequestSentAt: now,
        recoveryToken: sql`coalesce(${t.orders.recoveryToken}, ${randomBytes(24).toString("base64url")})`,
      })
      .where(and(eq(t.orders.id, id), isNull(t.orders.reviewRequestSentAt)))
      .returning();
    if (!order?.recoveryToken) continue;

    const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, id));
    // Nothing to review. The claim stays, so this order is never retried.
    if (items.length === 0) continue;

    const ok = await sendReviewRequest(order, items, {
      unsubscribe: unsubscribeUrl(order.recoveryToken),
      oneClickUnsubscribe: oneClickUnsubscribeUrl(order.recoveryToken),
    });
    if (ok) {
      sent++;
      continue;
    }

    // The mail did not go. Release the claim so the next run tries again.
    failed++;
    await db.update(t.orders).set({ reviewRequestSentAt: null }).where(eq(t.orders.id, id));
  }

  return { due: due.length, sent, failed };
}
