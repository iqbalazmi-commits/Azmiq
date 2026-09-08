import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { setInventory } from "@/lib/actions/admin";

export const metadata = { title: "Stock" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await requireAdminPage();

  const rows = await db
    .select({
      id: t.variants.id,
      sku: t.variants.sku,
      title: t.variants.title,
      inventory: t.variants.inventory,
      productId: t.products.id,
      productTitle: t.products.title,
      productStatus: t.products.status,
    })
    .from(t.variants)
    .innerJoin(t.products, eq(t.variants.productId, t.products.id))
    .orderBy(asc(t.products.title), asc(t.variants.position));

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-ink">Stock</h1>
      <p className="mt-1.5 text-ink-muted">
        Type a new number and press Update. Stock drops automatically when an order is paid, and
        goes back up if you refund with restock ticked.
      </p>
      <hr className="rule-accent mt-6" />

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="min-w-52 flex-1">
              <Link
                href={`/admin/products/${row.productId}`}
                className="text-ink underline-offset-4 hover:underline"
              >
                {row.productTitle}
              </Link>
              <p className="text-sm text-ink-muted">
                {row.title} &middot; {row.sku}
                {row.productStatus !== "active" ? ` · ${row.productStatus}` : ""}
              </p>
            </div>

            <span
              className={
                "rounded-pill px-3 py-1 text-xs font-medium tabular-nums " +
                (row.inventory === 0
                  ? "bg-danger-wash text-danger"
                  : row.inventory <= 5
                    ? "bg-surface-sunken text-ink"
                    : "bg-surface-sunken text-ink-muted")
              }
            >
              {row.inventory === 0 ? "Out of stock" : `${row.inventory} in stock`}
            </span>

            <form action={setInventory} className="flex items-center gap-2">
              <input type="hidden" name="variantId" value={row.id} />
              <label htmlFor={`stock-${row.id}`} className="sr-only">
                Stock for {row.productTitle} {row.title}
              </label>
              <input
                id={`stock-${row.id}`}
                name="inventory"
                type="number"
                min="0"
                step="1"
                defaultValue={row.inventory}
                className="h-11 w-24 rounded-md border border-border-control bg-surface-raised px-3 text-base tabular-nums text-ink"
              />
              <button
                type="submit"
                className="min-h-11 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink"
              >
                Update
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
