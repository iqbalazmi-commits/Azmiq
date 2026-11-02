import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView, SearchViewFromUrl } from "@/components/shop/SearchView";
import { getCatalogue } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
  // Search result pages are thin and infinite; they must never be indexed.
  robots: { index: false, follow: true },
};

export const revalidate = 3600;

export default async function SearchPage() {
  // No searchParams here: the page is built once with the catalogue and the
  // query is matched in the browser (components/shop/SearchView.tsx).
  const catalogue = await getCatalogue();

  return (
    <div className="container-page py-12 pb-24">
      <h1 className="font-serif text-4xl text-ink">Search</h1>
      <hr className="rule-accent mt-6" />

      {/* The fallback is the empty search page, which is what the cached HTML
          shows before the browser reads ?q= from the URL. */}
      <Suspense fallback={<SearchView products={catalogue} query="" />}>
        <SearchViewFromUrl products={catalogue} />
      </Suspense>
    </div>
  );
}
