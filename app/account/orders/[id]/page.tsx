import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { getCurrentCustomer } from "@/lib/auth";
import { formatMoney, type Currency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Media } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";

export const metadata: Metadata = { title: "Order", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RETURN_WINDOW_DAYS = 30;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/account/sign-in?next=/account/orders/${id}`);

  // Scoped to the signed-in customer: an order id from someone else 404s
  // rather than leaking so much as its existence.
  const [order] = await db
    .select()
    .from(t.orders)
    .where(and(eq(t.orders.id, id), eq(t.orders.customerId, customer.id)))
    .limit(1);
  if (!order) notFound();

  const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id));
  const returns = await db
    .select()
    .from(t.returnRequests)
    .where(eq(t.returnRequests.orderId, order.id));

  const currency = order.currency as Currency;
  const address = order.shippingAddress as Record<string, string> | null;
  const placedAt = order.placedAt ?? order.createdAt;
  // Server Component: renders once per request, so "now" is stable here.
  // eslint-disable-next-line react-hooks/purity
  const daysSince = Math.floor((Date.now() - placedAt.getTime()) / 864e5);
  const canReturn =
    ["paid", "fulfilled"].includes(order.status) &&
    daysSince <= RETURN_WINDOW_DAYS &&
    returns.length === 0;

  return (
    <div className="container-page py-8 pb-24">
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Orders", path: "/account/orders" },
          { name: `#${order.number}`, path: `/account/orders/${order.id}` },
        ]}
      />

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-4xl text-ink">Order #{order.number}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-ink-muted">Placed {formatDate(placedAt)}</p>
      <hr className="rule-accent mt-6" />

      {order.trackingNumber ? (
        <div className="mt-8 rounded-lg border border-border bg-surface-sunken p-5">
          <p className="font-medium text-ink">On its way</p>
          <p className="mt-1 text-sm text-ink-muted">
            Tracking number <span className="tabular-nums">{order.trackingNumber}</span>
            {order.trackingUrl ? (
              <>
                {" — "}
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-brand underline underline-offset-4"
                >
                  track your parcel
                </a>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
        <section>
          <h2 className="font-serif text-2xl text-ink">Items</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {items.map((item) => (
              <li key={item.id} className="flex gap-5 py-5">
                {item.imageUrl ? (
                  <div className="w-20 shrink-0">
                    <Media
                      src={item.imageUrl}
                      alt=""
                      width={200}
                      height={250}
                      sizes="80px"
                      aspect="portrait"
                      className="rounded-md border border-border"
                    />
                  </div>
                ) : null}
                <div className="flex-1">
                  <h3 className="text-ink">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {item.productTitle}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {item.variantTitle} &middot; {item.sku} &middot; qty {item.quantity}
                  </p>
                </div>
                <p className="tabular-nums text-ink">{formatMoney(item.lineTotal, currency)}</p>
              </li>
            ))}
          </ul>

          {returns.length > 0 ? (
            <div className="mt-8 rounded-lg border border-border bg-surface-raised p-5">
              <h2 className="font-serif text-lg text-ink">Return in progress</h2>
              {returns.map((request) => (
                <p key={request.id} className="mt-2 text-sm text-ink-muted">
                  {request.rma} &middot; {request.status} &middot; requested{" "}
                  {formatDate(request.createdAt)}
                </p>
              ))}
            </div>
          ) : canReturn ? (
            <div className="mt-8 rounded-lg border border-border bg-surface-raised p-5">
              <h2 className="font-serif text-lg text-ink">Not right?</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                You have {RETURN_WINDOW_DAYS - daysSince} days left to return this order. Returns
                are free and we do not ask why.
              </p>
              <ButtonLink href={`/returns?order=${order.number}`} variant="secondary" className="mt-4">
                Start a return
              </ButtonLink>
            </div>
          ) : null}
        </section>

        <aside>
          <div className="rounded-lg border border-border bg-surface-raised p-6">
            <h2 className="font-serif text-xl text-ink">Total</h2>
            <dl className="mt-5 flex flex-col gap-2.5 text-sm">
              <Row label="Subtotal" value={formatMoney(order.subtotal, currency)} />
              {order.discountTotal > 0 ? (
                <Row
                  label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
                  value={`−${formatMoney(order.discountTotal, currency)}`}
                />
              ) : null}
              <Row
                label="Delivery"
                value={order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal, currency)}
              />
              <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-serif text-lg text-ink">Paid</dt>
                <dd className="font-serif text-lg tabular-nums text-ink">
                  {formatMoney(order.grandTotal, currency)}
                </dd>
              </div>
              {order.taxTotal > 0 ? (
                <p className="text-xs text-ink-muted">
                  Includes {formatMoney(order.taxTotal, currency)} VAT
                </p>
              ) : null}
              {order.refundedTotal > 0 ? (
                <p className="text-xs text-ink-wellness">
                  {formatMoney(order.refundedTotal, currency)} refunded
                </p>
              ) : null}
            </dl>
          </div>

          {address ? (
            <div className="mt-5 rounded-lg border border-border bg-surface-raised p-6">
              <h2 className="font-serif text-xl text-ink">Delivered to</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
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
                {address.postcode}
                <br />
                {address.country}
              </p>
              {order.shippingMethod ? (
                <p className="mt-3 text-sm text-ink-muted">{order.shippingMethod}</p>
              ) : null}
            </div>
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
