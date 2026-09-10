import Link from "next/link";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { AlertTriangle } from "lucide-react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { stripeConfigured } from "@/lib/stripe";
import { formatMoney, type Currency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";

export const metadata = { title: "Dashboard" };

const PAID_STATUSES = ["paid", "fulfilled", "partially_refunded"];
const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboard() {
  const admin = await requireAdminPage();

  // Server Component: renders once per request, so "now" is stable here.
  // eslint-disable-next-line react-hooks/purity
  const since = (days: number) => new Date(Date.now() - days * 864e5);

  const revenueFor = async (days: number) => {
    const [row] = await db
      .select({
        total: sql<number>`coalesce(sum(${t.orders.grandTotal} - ${t.orders.refundedTotal}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(t.orders)
      .where(and(inArray(t.orders.status, PAID_STATUSES), gte(t.orders.placedAt, since(days))));
    return { total: Number(row?.total ?? 0), count: Number(row?.count ?? 0) };
  };

  const [today, week, month, recentOrders, lowStock, pendingReviews, openReturns, deadLinks] =
    await Promise.all([
      revenueFor(1),
      revenueFor(7),
      revenueFor(30),
      db.select().from(t.orders).orderBy(desc(t.orders.createdAt)).limit(8),
      db
        .select({
          id: t.variants.id,
          sku: t.variants.sku,
          title: t.variants.title,
          inventory: t.variants.inventory,
          productTitle: t.products.title,
          productId: t.products.id,
        })
        .from(t.variants)
        .innerJoin(t.products, eq(t.variants.productId, t.products.id))
        .where(and(lte(t.variants.inventory, LOW_STOCK_THRESHOLD), eq(t.products.status, "active")))
        .orderBy(t.variants.inventory)
        .limit(8),
      db.select({ count: sql<number>`count(*)` }).from(t.reviews).where(eq(t.reviews.status, "pending")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(t.returnRequests)
        .where(inArray(t.returnRequests.status, ["requested", "approved", "received"])),
      db
        .select()
        .from(t.redirects)
        .where(sql`${t.redirects.hits} > 0`)
        .orderBy(desc(t.redirects.hits))
        .limit(5),
    ]);

  const needsAttention = recentOrders.filter((o) => o.status === "paid").length;

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-3xl text-ink">
        Good to see you{admin.name ? `, ${admin.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-1.5 text-ink-muted">Here is where the shop stands right now.</p>
      <hr className="rule-accent mt-6" />

      {/* The single most important thing an owner can be wrong about: whether
          the shop can actually take money. Loud until it is sorted. */}
      {!stripeConfigured() ? (
        <Link
          href="/admin/payments"
          className="mt-8 flex items-start gap-4 rounded-lg border border-border-control bg-surface-sunken p-5 transition-colors hover:border-ink/25"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-ink-muted" aria-hidden="true" />
          <span>
            <span className="block font-medium text-ink">This shop cannot take payments yet</span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
              Customers can browse and fill a basket, but the payment step is switched off until
              your Stripe keys are in. Open Payments to see what is left — it is a five-minute job.
            </span>
          </span>
        </Link>
      ) : null}

      {/* Net of refunds throughout - gross revenue that ignores refunds is a
          number that flatters and misleads in equal measure. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Last 24 hours" value={formatMoney(today.total, "GBP")} note={`${today.count} orders`} />
        <Stat label="Last 7 days" value={formatMoney(week.total, "GBP")} note={`${week.count} orders`} />
        <Stat label="Last 30 days" value={formatMoney(month.total, "GBP")} note={`${month.count} orders`} />
        <Stat
          label="To ship"
          value={String(needsAttention)}
          note={needsAttention === 1 ? "order paid, not sent" : "orders paid, not sent"}
          highlight={needsAttention > 0}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Panel title="Recent orders" href="/admin/orders" linkLabel="All orders">
          {recentOrders.length === 0 ? (
            <Empty>No orders yet.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-wrap items-center gap-3 py-3 text-sm hover:bg-surface"
                  >
                    <span className="w-16 font-medium text-ink">#{order.number}</span>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-ink-muted">{order.email}</span>
                    <span className="ml-auto tabular-nums text-ink">
                      {formatMoney(order.grandTotal, order.currency as Currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Running low" href="/admin/inventory" linkLabel="Manage stock">
          {lowStock.length === 0 ? (
            <Empty>Everything is comfortably in stock.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.map((variant) => (
                <li key={variant.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="flex-1">
                    <Link
                      href={`/admin/products/${variant.productId}`}
                      className="text-ink underline-offset-4 hover:underline"
                    >
                      {variant.productTitle}
                    </Link>
                    <span className="block text-ink-muted">
                      {variant.title} &middot; {variant.sku}
                    </span>
                  </span>
                  <span
                    className={
                      "rounded-pill px-2.5 py-1 text-xs font-medium tabular-nums " +
                      (variant.inventory === 0
                        ? "bg-danger-wash text-danger"
                        : "bg-surface-sunken text-ink")
                    }
                  >
                    {variant.inventory === 0 ? "Out of stock" : `${variant.inventory} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Waiting on you">
          <ul className="divide-y divide-border text-sm">
            <li className="flex items-center justify-between py-3">
              <Link href="/admin/reviews" className="text-ink underline-offset-4 hover:underline">
                Reviews awaiting moderation
              </Link>
              <span className="tabular-nums text-ink">{Number(pendingReviews[0]?.count ?? 0)}</span>
            </li>
            <li className="flex items-center justify-between py-3">
              <Link href="/admin/returns" className="text-ink underline-offset-4 hover:underline">
                Open returns
              </Link>
              <span className="tabular-nums text-ink">{Number(openReturns[0]?.count ?? 0)}</span>
            </li>
          </ul>
        </Panel>

        <Panel title="Old links still getting traffic" href="/admin/redirects" linkLabel="All redirects">
          {deadLinks.length === 0 ? (
            <Empty>
              Nothing yet. Renaming a product creates a redirect here automatically, and this
              shows how often the old address is still being used.
            </Empty>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {deadLinks.map((row) => (
                <li key={row.id} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ink">{row.fromPath}</span>
                    <span className="block truncate text-ink-muted">to {row.toPath}</span>
                  </span>
                  <span className="tabular-nums text-ink-muted">
                    {row.hits}
                    {row.lastHitAt ? (
                      <span className="ml-2 text-xs">{formatDate(row.lastHitAt)}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({
  label, value, note, highlight,
}: {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border p-5 " +
        (highlight ? "border-surface-wellness bg-surface-sunken" : "border-border bg-surface-raised")
      }
    >
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-serif text-2xl tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{note}</p>
    </div>
  );
}

function Panel({
  title, href, linkLabel, children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-raised p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-xl text-ink">{title}</h2>
        {href ? (
          <Link href={href} className="text-sm text-ink-brand underline underline-offset-4">
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-sm text-ink-muted">{children}</p>;
}
