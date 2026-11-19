import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { formatMoney } from "@/lib/money";
import { bestSellers, notSelling, parsePeriod, PERIODS, salesOverTime, salesSummary } from "@/lib/reports";
import { SalesChart } from "@/components/admin/SalesChart";

export const metadata = { title: "Sales" };
export const dynamic = "force-dynamic";

const PERIOD_LABEL: Record<number, string> = { 7: "7 days", 30: "30 days", 90: "90 days", 365: "12 months" };

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const days = parsePeriod((await searchParams).days);

  const [summary, series, top, idle] = await Promise.all([
    salesSummary(days),
    salesOverTime(days),
    bestSellers(days),
    notSelling(days),
  ]);
  const topUnits = Math.max(1, ...top.map((p) => p.units));

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-3xl text-ink">Sales</h1>
      <p className="mt-1.5 text-ink-muted">
        Paid orders, after refunds. Days run on UK time.
      </p>
      <hr className="rule-accent mt-6" />

      <nav aria-label="Time period" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <li key={p}>
              <Link
                href={`/admin/sales?days=${p}`}
                aria-current={p === days ? "true" : undefined}
                className={
                  "inline-block rounded-pill px-4 py-2 text-sm transition-colors " +
                  (p === days ? "bg-surface-brand text-ink-on-brand" : "bg-surface-raised text-ink hover:bg-surface-sunken")
                }
              >
                Last {PERIOD_LABEL[p]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Takings" value={formatMoney(summary.revenue, "GBP")} note={`Last ${PERIOD_LABEL[days]}`} />
        <Stat label="Orders" value={String(summary.orders)} note={summary.orders === 1 ? "paid order" : "paid orders"} />
        <Stat label="Average order" value={formatMoney(summary.averageOrder, "GBP")} note="takings ÷ orders" />
      </div>
      {summary.otherCurrencyOrders > 0 ? (
        <p className="mt-3 text-sm text-ink-muted">
          {summary.otherCurrencyOrders} {summary.otherCurrencyOrders === 1 ? "order was" : "orders were"} paid in
          another currency. They are counted as orders but not added to the pound totals.
        </p>
      ) : null}

      <section className="mt-8 rounded-lg border border-border bg-surface-raised p-6">
        <h2 className="font-serif text-xl text-ink">
          Takings {series.bucket === "week" ? "by week" : "by day"}
        </h2>
        <div className="mt-5">
          <SalesChart points={series.points} bucket={series.bucket} />
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-border bg-surface-raised p-6">
          <h2 className="font-serif text-xl text-ink">Best sellers</h2>
          {top.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No sales in this period yet.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-ink-muted">
                <tr>
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 text-right font-medium">Sold</th>
                  <th className="py-2 text-right font-medium">Takings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {top.map((p) => (
                  <tr key={p.slug}>
                    <td className="py-3 pr-4">
                      <Link href={`/products/${p.slug}`} className="text-ink underline-offset-4 hover:underline">
                        {p.title}
                      </Link>
                      {/* A thin bar beside the name: the ranking at a glance. */}
                      <span className="mt-1.5 block h-1 rounded-full bg-surface-sunken">
                        <span
                          className="block h-1 rounded-full bg-surface-brand-hover"
                          style={{ width: `${(p.units / topUnits) * 100}%` }}
                        />
                      </span>
                    </td>
                    <td className="py-3 text-right tabular-nums text-ink">{p.units}</td>
                    <td className="py-3 pl-4 text-right tabular-nums text-ink">{formatMoney(p.revenue, "GBP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-lg border border-border bg-surface-raised p-6">
          <h2 className="font-serif text-xl text-ink">Not sold yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Live products with no sale in the last {PERIOD_LABEL[days]}. Worth a look at their photos and price.
          </p>
          {idle.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">Everything has sold at least once. Lovely.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border text-sm">
              {idle.map((p) => (
                <li key={p.id} className="py-2.5">
                  <Link href={`/admin/products/${p.id}`} className="text-ink underline-offset-4 hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-serif text-2xl tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{note}</p>
    </div>
  );
}
