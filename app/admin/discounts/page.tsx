import { desc } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { toggleDiscount } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/money";
import { DiscountForm } from "@/components/admin/DiscountForm";

export const metadata = { title: "Discounts" };
export const dynamic = "force-dynamic";

function describe(row: typeof t.discounts.$inferSelect) {
  if (row.type === "percentage") return `${(row.value / 100).toFixed(0)}% off`;
  if (row.type === "fixed") return `${formatMoney(row.value, "GBP")} off`;
  return "Free delivery";
}

export default async function AdminDiscountsPage() {
  await requireAdminPage();
  const rows = await db.select().from(t.discounts).orderBy(desc(t.discounts.createdAt));

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-ink">Discounts</h1>
      <p className="mt-1.5 text-ink-muted">
        Codes customers type at the basket. Turning one off stops it working immediately.
      </p>
      <hr className="rule-accent mt-6" />

      <div className="mt-8 rounded-lg border border-border bg-surface-raised p-6">
        <h2 className="font-serif text-xl text-ink">New code</h2>
        <DiscountForm />
      </div>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="min-w-40 flex-1">
              <p className="font-mono text-sm font-medium text-ink">{row.code}</p>
              <p className="text-sm text-ink-muted">
                {describe(row)}
                {row.minSubtotal > 0 ? ` · over ${formatMoney(row.minSubtotal, "GBP")}` : ""}
                {row.usageLimit ? ` · ${row.usedCount}/${row.usageLimit} used` : ` · ${row.usedCount} used`}
              </p>
            </div>

            <span
              className={
                "rounded-pill px-3 py-1 text-xs font-medium " +
                (row.active ? "bg-surface-wellness text-ink-on-brand" : "bg-surface-sunken text-ink")
              }
            >
              {row.active ? "Active" : "Off"}
            </span>

            <form action={toggleDiscount}>
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="active" value={row.active ? "false" : "true"} />
              <button
                type="submit"
                className="min-h-11 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink"
              >
                {row.active ? "Turn off" : "Turn on"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
