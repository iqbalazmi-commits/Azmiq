import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { saveOrderNote } from "@/lib/actions/admin";
import { formatMoney, type Currency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { FulfilForm } from "@/components/admin/FulfilForm";
import { RefundForm } from "@/components/admin/RefundForm";
import { MarkPaidForm } from "@/components/admin/MarkPaidForm";
import { transferReference } from "@/lib/bank-transfer";

export const metadata = { title: "Order" };
export const dynamic = "force-dynamic";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const [order] = await db.select().from(t.orders).where(eq(t.orders.id, id)).limit(1);
  if (!order) notFound();

  const [items, refundRows] = await Promise.all([
    db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id)),
    db.select().from(t.refunds).where(eq(t.refunds.orderId, order.id)),
  ]);

  const currency = order.currency as Currency;
  const address = order.shippingAddress as Record<string, string> | null;
  const refundable = order.grandTotal - order.refundedTotal;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/orders" className="text-sm text-ink-brand underline underline-offset-4">
        ← All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-3xl text-ink">Order #{order.number}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1.5 text-ink-muted">
        {formatDate(order.placedAt ?? order.createdAt)} &middot; {order.email}
      </p>
      <hr className="rule-accent mt-6" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <section className="rounded-lg border border-border bg-surface-raised p-6">
            <h2 className="font-serif text-xl text-ink">Items</h2>
            <ul className="mt-4 divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                  <span>
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="text-ink underline-offset-4 hover:underline"
                    >
                      {item.productTitle}
                    </Link>
                    <span className="block text-ink-muted">
                      {item.variantTitle} &middot; {item.sku} &middot; qty {item.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums text-ink">
                    {formatMoney(item.lineTotal, currency)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 flex flex-col gap-2 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatMoney(order.subtotal, currency)} />
              {order.discountTotal > 0 ? (
                <Row
                  label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
                  value={`−${formatMoney(order.discountTotal, currency)}`}
                />
              ) : null}
              <Row label="Delivery" value={formatMoney(order.shippingTotal, currency)} />
              <Row label="VAT included" value={formatMoney(order.taxTotal, currency)} />
              <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-serif text-lg text-ink">Total</dt>
                <dd className="font-serif text-lg tabular-nums text-ink">
                  {formatMoney(order.grandTotal, currency)}
                </dd>
              </div>
              {order.refundedTotal > 0 ? (
                <Row
                  label="Refunded"
                  value={`−${formatMoney(order.refundedTotal, currency)}`}
                />
              ) : null}
            </dl>
          </section>

          {order.status === "pending" && order.paymentMethod === "bank_transfer" ? (
            <section className="rounded-lg border-2 border-surface-brand bg-surface-brand-wash p-6">
              <h2 className="font-serif text-xl text-ink">Awaiting bank transfer</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                The customer chose to pay by bank transfer, so nothing is automatic here. Check your
                bank for{" "}
                <strong className="text-ink">{formatMoney(order.grandTotal, currency)}</strong> with
                the reference{" "}
                <strong className="text-ink">{transferReference(order.number)}</strong>. Confirm it
                only once you can see the money — that is what reduces stock and sends their receipt.
              </p>
              <MarkPaidForm
                orderId={order.id}
                amount={formatMoney(order.grandTotal, currency)}
                reference={transferReference(order.number)}
              />
            </section>
          ) : order.status === "pending" ? (
            <p className="rounded-lg border border-border bg-surface-sunken p-5 text-sm leading-relaxed text-ink-muted">
              This order has not been paid. It was created when the customer reached the payment
              step and will stay here until Stripe confirms a payment. Unpaid orders are normal —
              most are simply abandoned baskets.
            </p>
          ) : (
            <>
              <section className="rounded-lg border border-border bg-surface-raised p-6">
                <h2 className="font-serif text-xl text-ink">Shipping</h2>
                <FulfilForm
                  orderId={order.id}
                  trackingNumber={order.trackingNumber ?? ""}
                  trackingUrl={order.trackingUrl ?? ""}
                  fulfilled={order.fulfillmentStatus === "fulfilled"}
                />
              </section>

              <section className="rounded-lg border border-border bg-surface-raised p-6">
                <h2 className="font-serif text-xl text-ink">Refund</h2>
                {order.paymentMethod === "bank_transfer" ? (
                  /* There is no card to send the money back to. Stripe cannot
                     help, so this has to be done from the bank by hand. */
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    This order was paid by bank transfer, so a refund has to be sent from your bank
                    back to the customer&apos;s account — there is no card to reverse. Their contact
                    details are on the right; ask them for their account details, send the transfer,
                    then note it below.
                  </p>
                ) : (
                  <>
                    <p className="mt-1.5 text-sm text-ink-muted">
                      Refunds go back to the original payment method through Stripe. Up to{" "}
                      {formatMoney(refundable, currency)} can still be refunded on this order.
                    </p>
                    {refundRows.length > 0 ? (
                      <ul className="mt-4 flex flex-col gap-1.5 text-sm text-ink-muted">
                        {refundRows.map((refund) => (
                          <li key={refund.id}>
                            {formatMoney(refund.amount, currency)} on {formatDate(refund.createdAt)}
                            {refund.reason ? ` — ${refund.reason}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {refundable > 0 ? (
                      <RefundForm orderId={order.id} maxAmount={refundable} currency={currency} />
                    ) : (
                      <p className="mt-4 text-sm text-ink-wellness">Fully refunded.</p>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          {address ? (
            <section className="rounded-lg border border-border bg-surface-raised p-6">
              <h2 className="font-serif text-lg text-ink">Deliver to</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {address.name}
                <br />
                {address.line1}
                <br />
                {address.line2 ? (
                  <>
                    {address.line2}
                    <br />
                  </>
                ) : null}
                {address.city}
                <br />
                {address.region ? (
                  <>
                    {address.region}
                    <br />
                  </>
                ) : null}
                {address.postcode}
                <br />
                {address.country}
              </p>
              {address.phone ? (
                <p className="mt-2 text-sm text-ink-muted">{address.phone}</p>
              ) : null}
              {order.shippingMethod ? (
                <p className="mt-3 border-t border-border pt-3 text-sm text-ink">
                  {order.shippingMethod}
                </p>
              ) : null}
            </section>
          ) : null}

          {order.customerNote ? (
            <section className="rounded-lg border border-border bg-surface-sunken p-6">
              <h2 className="font-serif text-lg text-ink">Note from the customer</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{order.customerNote}</p>
            </section>
          ) : null}

          <section className="rounded-lg border border-border bg-surface-raised p-6">
            <h2 className="font-serif text-lg text-ink">Internal note</h2>
            <form action={saveOrderNote} className="mt-3">
              <input type="hidden" name="orderId" value={order.id} />
              <label htmlFor="internalNote" className="sr-only">
                Internal note
              </label>
              <textarea
                id="internalNote"
                name="internalNote"
                rows={4}
                defaultValue={order.internalNote ?? ""}
                placeholder="Only staff can see this."
                className="w-full rounded-md border border-border-control bg-surface px-3 py-2.5 text-sm text-ink"
              />
              <button
                type="submit"
                className="mt-2 min-h-11 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink"
              >
                Save note
              </button>
            </form>
          </section>

          {order.stripePaymentIntentId ? (
            <p className="text-xs text-ink-muted">
              Stripe payment {order.stripePaymentIntentId}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  );
}
