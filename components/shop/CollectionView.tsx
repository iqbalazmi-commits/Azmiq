"use client";

import { useSearchParams } from "next/navigation";
import { Filters, SortLinks } from "./Filters";
import { ProductCard } from "./ProductCard";
import {
  facetCounts, filterAndSort, type CatalogueProduct, type Facets, type SortKey,
} from "@/lib/catalogue";

/* ===========================================================================
   COLLECTION VIEW

   Filtering and sorting run in the browser against the products shipped with
   the page. That lets the collection page be one static file served from
   cache, instead of a server render for every filter click - and for every
   crawler walking every filter permutation. Filter links are unchanged real
   URLs, so views stay bookmarkable and shareable.
   =========================================================================== */

/** `query` is the URL query string; a plain string so the server can pass it. */
type Props = { products: CatalogueProduct[]; slug: string; query: string };

export function CollectionView({ products: inCategory, slug, query }: Props) {
  const params = new URLSearchParams(query);
  const facets: Facets = {
    category: slug,
    finish: params.getAll("finish"),
    capacity: params.getAll("capacity"),
    price: params.getAll("price"),
    onSale: params.get("sale") === "1",
    inStock: params.get("stock") === "1",
  };
  const sort = (params.get("sort") ?? "featured") as SortKey;

  const products = filterAndSort(inCategory, facets, sort);
  const counts = facetCounts(inCategory, facets);
  const basePath = `/collections/${slug}`;

  return (
    <div className="mt-14 grid gap-x-12 gap-y-10 lg:grid-cols-[15rem_1fr]">
      <Filters
        basePath={basePath}
        params={params}
        facets={facets}
        counts={counts}
        total={products.length}
      />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <SortLinks basePath={basePath} params={params} current={sort} />
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-ink">Nothing matches those filters</p>
            <p className="mt-3 text-ink-muted">
              Try widening the capacity or price range, or clear the filters to see the whole
              collection.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-16 xl:grid-cols-3 xl:gap-x-8">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 3}
                sizes="(min-width: 1280px) 26vw, (min-width: 1024px) 38vw, 45vw"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Reads the filters from the URL. Must sit inside a Suspense boundary. */
export function CollectionViewFromUrl(props: Omit<Props, "query">) {
  const search = useSearchParams();
  return <CollectionView {...props} query={search.toString()} />;
}
