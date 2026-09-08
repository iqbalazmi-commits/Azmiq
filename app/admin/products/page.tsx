import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { setProductStatus } from "@/lib/actions/admin";
import { formatMoney } from "@/lib/money";
import { Media } from "@/components/ui/Media";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  await requireAdminPage();

  const products = await db.query.products.findMany({
    orderBy: [asc(t.products.position), asc(t.products.title)],
    with: {
      variants: { orderBy: [asc(t.variants.position)] },
      images: { orderBy: [asc(t.productImages.position)] },
    },
  });

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-3xl text-ink">Products</h1>
      <p className="mt-1.5 text-ink-muted">
        {products.length} products. Click one to edit its copy, price and stock.
      </p>
      <hr className="rule-accent mt-6" />

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-3xl border-collapse text-sm">
          <caption className="sr-only">All products with price, stock and status</caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Product</th>
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Price</th>
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Stock</th>
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Status</th>
              <th scope="col" className="py-3 font-medium text-ink-muted">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const prices = product.variants.map((v) => v.priceGbp);
              const low = prices.length ? Math.min(...prices) : 0;
              const high = prices.length ? Math.max(...prices) : 0;
              const stock = product.variants.reduce((sum, v) => sum + v.inventory, 0);
              const image = product.images[0];

              return (
                <tr key={product.id} className="border-b border-border align-middle">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {image ? (
                        <div className="w-12 shrink-0">
                          <Media
                            src={image.url}
                            alt=""
                            width={120}
                            height={150}
                            sizes="48px"
                            aspect="portrait"
                            className="rounded-sm border border-border"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-ink underline-offset-4 hover:underline"
                        >
                          {product.title}
                        </Link>
                        <span className="block truncate text-xs text-ink-muted">
                          /products/{product.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-4 tabular-nums text-ink">
                    {low === high
                      ? formatMoney(low, "GBP")
                      : `${formatMoney(low, "GBP")} – ${formatMoney(high, "GBP")}`}
                  </td>

                  <td className="py-3 pr-4">
                    <span
                      className={
                        "tabular-nums " + (stock === 0 ? "text-danger" : stock <= 5 ? "text-ink" : "text-ink-muted")
                      }
                    >
                      {stock}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {product.variants.length} {product.variants.length === 1 ? "variant" : "variants"}
                    </span>
                  </td>

                  <td className="py-3 pr-4">
                    <span
                      className={
                        "inline-flex rounded-pill px-2.5 py-1 text-xs font-medium " +
                        (product.status === "active"
                          ? "bg-surface-wellness text-ink-on-brand"
                          : product.status === "draft"
                            ? "bg-surface-sunken text-ink"
                            : "bg-surface-inverse text-ink-inverse")
                      }
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="py-3">
                    <form action={setProductStatus} className="flex justify-end gap-2">
                      <input type="hidden" name="id" value={product.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={product.status === "active" ? "draft" : "active"}
                      />
                      <button
                        type="submit"
                        className="min-h-11 rounded-md border border-border-control px-3 text-xs text-ink hover:border-ink"
                      >
                        {product.status === "active" ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-8 rounded-lg border border-border bg-surface-raised p-5 text-sm leading-relaxed text-ink-muted">
        Unpublishing removes a product from the shop immediately, but keeps its URL working so old
        links and search results do not break. To retire something permanently, unpublish it and add
        a redirect to the closest alternative under{" "}
        <Link href="/admin/redirects" className="text-ink-brand underline underline-offset-4">
          Redirects
        </Link>
        .
      </p>
    </div>
  );
}

// Product rows are only ever read here; every mutation goes through a form
// posting to a server action, so this page ships no client JavaScript at all.
export const dynamic = "force-dynamic";
