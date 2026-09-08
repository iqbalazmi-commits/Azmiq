import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { formatMoney, type Currency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "paid", label: "To ship" },
  { value: "fulfilled", label: "Shipped" },
  { value: "refunded", label: "Refunded" },
  { value: "pending", label: "Unpaid" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const filter = typeof params.status === "string" ? params.status : "all";

  const rows = await db
    .select({
      order: t.orders,
      itemCount: sql<number>`(
        select coalesce(sum(${t.orderItems.quantity}), 0)
        from ${t.orderItems}
        where ${t.orderItems.orderId} = ${t.orders.id}
      )`,
    })
    .from(t.orders)
    .where(filter === "all" ? undefined : eq(t.orders.status, filter))
    .orderBy(desc(t.orders.createdAt))
    .limit(200);

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-3xl text-ink">Orders</h1>
      <p className="mt-1.5 text-ink-muted">
        Newest first. An order only appears as paid once Stripe has confirmed it — that
        confirmation, not the customer&rsquo;s browser, is what we trust.
      </p>
      <hr className="rule-accent mt-6" />

      <nav aria-label="Filter orders" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <li key={option.value}>
                <Link
                  href={option.value === "all" ? "/admin/orders" : `/admin/orders?status=${option.value}`}
                  aria-current={active ? "true" : undefined}
                  className={
                    "inline-block rounded-pill px-4 py-2 text-sm transition-colors " +
                    (active
                      ? "bg-surface-brand text-ink-on-brand"
                      : "border border-border-control bg-surface-raised text-ink hover:border-ink")
                  }
                >
                  {option.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {rows.length === 0 ? (
        <p className="mt-10 text-ink-muted">No orders match that filter.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Orders</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Order</th>
                <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Placed</th>
                <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Customer</th>
                <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Items</th>
                <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Status</th>
                <th scope="col" className="py-3 text-right font-medium text-ink-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ order, itemCount }) => (
                <tr key={order.id} className="border-b border-border">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-ink underline-offset-4 hover:underline"
                    >
                      #{order.number}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-ink-muted">
                    {formatDate(order.placedAt ?? order.createdAt)}
                  </td>
                  <td className="py-3 pr-4 text-ink-muted">{order.email}</td>
                  <td className="py-3 pr-4 tabular-nums text-ink-muted">{Number(itemCount)}</td>
                  <td className="py-3 pr-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right tabular-nums text-ink">
                    {formatMoney(order.grandTotal, order.currency as Currency)}
                    {order.refundedTotal > 0 ? (
                      <span className="block text-xs text-ink-muted">
                        −{formatMoney(order.refundedTotal, order.currency as Currency)} refunded
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
