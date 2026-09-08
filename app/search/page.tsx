import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCatalogue, searchCatalogue } from "@/lib/data";
import { readCurrency } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Search",
  // Search result pages are thin and infinite; they must never be indexed.
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const currency = await readCurrency();
  const catalogue = await getCatalogue(currency);
  const results = query ? searchCatalogue(catalogue, query) : [];

  const suggestions = ["hammered", "950ml", "jug", "acacia", "gift set", "copper ball"];

  return (
    <div className="container-page py-12 pb-24">
      <h1 className="font-serif text-4xl text-ink">Search</h1>
      <hr className="rule-accent mt-6" />

      {/* A plain GET form: it works with JavaScript disabled, the query lands
          in the URL, and the browser's own history handles back and forward. */}
      <form action="/search" method="get" role="search" className="mt-8 max-w-xl">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              autoComplete="off"
              placeholder="Try “hammered 950ml” or “jug set”"
              className="h-13 min-h-12 w-full rounded-md border border-border-control bg-surface-raised py-3 pl-11 pr-3.5 text-base text-ink"
            />
          </div>
          <button
            type="submit"
            className="min-h-12 shrink-0 rounded-md bg-surface-brand px-6 text-sm font-medium text-ink-on-brand hover:bg-surface-brand-hover"
          >
            Search
          </button>
        </div>
      </form>

      {!query ? (
        <div className="mt-12">
          <p className="eyebrow">Popular searches</p>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {suggestions.map((term) => (
              <li key={term}>
                <Link
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="inline-block rounded-pill border border-border-control bg-surface-raised px-4 py-2 text-sm text-ink hover:border-ink"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-16 max-w-lg">
          <p className="font-serif text-2xl text-ink">
            Nothing matched &ldquo;{query}&rdquo;
          </p>
          <p className="mt-3 text-ink-muted">
            Try a shorter term, or browse the full collection — there are only a few dozen pieces,
            so it is quick to look through.
          </p>
          <Link
            href="/collections/all"
            className="mt-6 inline-block text-ink-brand underline underline-offset-4"
          >
            Browse everything
          </Link>
        </div>
      ) : (
        <>
          <p role="status" className="mt-8 text-sm text-ink-muted">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {results.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
