import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { Download } from "lucide-react";
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
  // From the Customers page: one person's orders, matched case-insensitively.
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase().slice(0, 200) : "";
  // The month input's default: this month, in UK time.
  const thisMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date()).slice(0, 7);

  const rows = await db
    .select({
      order: t.orders,
      // Plain SQL with explicit table aliases: inside a sub-select Drizzle
      // prints bare column names, so "order_id" = "id" compared each item
      // with itself and every order showed 0 items.
      itemCount: sql<number>`(
        select coalesce(sum(oi.quantity), 0)
        from order_items oi
        where oi.order_id = "orders"."id"
      )`,
      // "Copper Bottle (1L) × 2, Tumbler × 1" - so the list says what to pack
      // without opening every order.
      products: sql<string | null>`(
        select string_agg(
          oi.product_title
            || case when oi.variant_title <> '' then ' (' || oi.variant_title || ')' else '' end
            || ' × ' || oi.quantity,
          ', ' order by oi.product_title
        )
        from order_items oi
        where oi.order_id = "orders"."id"
      )`,
    })
    .from(t.orders)
    .where(
      and(
        filter === "all" ? undefined : eq(t.orders.status, filter),
        email ? sql`lower(${t.orders.email}) = ${email}` : undefined,
      ),
    )
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

      <form
        action="/admin/orders/export"
        method="get"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface-raised p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="export-month" className="text-sm font-medium text-ink">
            Download orders as a spreadsheet
          </label>
          <input
            id="export-month"
            name="month"
            type="month"
            defaultValue={thisMonth}
            max={thisMonth}
            className="h-11 rounded-md border border-border-control bg-surface px-3 text-base text-ink"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-surface-brand px-5 text-sm font-medium text-ink-on-brand hover:bg-surface-brand-hover"
        >
          <Download size={16} aria-hidden="true" />
          Download month
        </button>
        {/* A file download, not a page: a plain link, so Next does not try to route to it. */}
        <a
          href="/admin/orders/export?month=all"
          download
          className="inline-flex h-11 items-center text-sm text-ink-brand underline underline-offset-4"
        >
          or every order ever
        </a>
        <p className="w-full text-xs text-ink-muted">
          Paid, shipped and refunded orders, with VAT and refunds, as a CSV file that opens in Excel,
          Numbers or Google Sheets. Handy for your accountant.
        </p>
      </form>

      {email ? (
        <p className="mt-6 flex flex-wrap items-center gap-3 rounded-md bg-surface-brand-wash px-4 py-3 text-sm text-ink">
          Showing orders for <strong>{email}</strong>
          <Link href="/admin/orders" className="text-ink-brand underline underline-offset-4">
            Show everyone
          </Link>
        </p>
      ) : null}

      <nav aria-label="Filter orders" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <li key={option.value}>
                <Link
                  href={`/admin/orders?${new URLSearchParams({
                    ...(option.value === "all" ? {} : { status: option.value }),
                    ...(email ? { email } : {}),
                  })}`}
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
                <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Products</th>
                <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Status</th>
                <th scope="col" className="py-3 text-right font-medium text-ink-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ order, itemCount, products }) => (
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
                  <td className="py-3 pr-4 text-ink">
                    {products ?? "—"}
                    <span className="block text-xs tabular-nums text-ink-muted">
                      {Number(itemCount)} {Number(itemCount) === 1 ? "item" : "items"}
                    </span>
                  </td>
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
