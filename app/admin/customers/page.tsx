import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { customerList, customerTotals } from "@/lib/reports";

export const metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const [customers, totals] = await Promise.all([customerList(q || null), customerTotals()]);

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-3xl text-ink">Customers</h1>
      <p className="mt-1.5 text-ink-muted">
        Everyone who has bought from you, most recent first. Click a customer to see their orders.
      </p>
      <hr className="rule-accent mt-6" />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Customers" value={String(totals.customers)} note="have placed a paid order" />
        <Stat label="Came back" value={String(totals.repeat)} note="have ordered more than once" />
        <Stat
          label="Repeat rate"
          value={totals.customers ? `${Math.round((totals.repeat / totals.customers) * 100)}%` : "–"}
          note="of customers order again"
        />
      </div>

      <form role="search" className="mt-8 flex flex-wrap gap-3" action="/admin/customers">
        <label htmlFor="q" className="sr-only">
          Search by name or email
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by name or email"
          className="h-12 min-w-0 flex-1 rounded-md border border-border-control bg-surface px-3.5 text-base text-ink"
        />
        <button
          type="submit"
          className="h-12 rounded-md bg-surface-brand px-6 text-sm font-medium text-ink-on-brand hover:bg-surface-brand-hover"
        >
          Search
        </button>
      </form>

      {customers.length === 0 ? (
        <p className="mt-8 rounded-lg border border-border bg-surface-raised p-6 text-sm text-ink-muted">
          {q ? "Nobody matches that search." : "No customers yet. Your first paid order will appear here."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface-raised">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 text-right font-medium">Orders</th>
                <th className="px-4 py-3 text-right font-medium">Spent</th>
                <th className="px-4 py-3 font-medium">First order</th>
                <th className="px-4 py-3 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.email}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders?email=${encodeURIComponent(c.email)}`}
                      className="text-ink underline-offset-4 hover:underline"
                    >
                      {c.name || c.email}
                    </Link>
                    {c.name ? <span className="block text-ink-muted">{c.email}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">
                    {c.orders}
                    {c.orders > 1 ? (
                      <span className="ml-2 rounded-pill bg-surface-brand-wash px-2 py-0.5 text-xs text-ink">
                        Repeat
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{formatMoney(c.spent, "GBP")}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(c.firstOrder)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(c.lastOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-muted">
        &ldquo;Spent&rdquo; is pound orders after refunds. Customer details are personal data: please keep
        them inside the shop.
      </p>
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
