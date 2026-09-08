import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Filters, SortLinks } from "@/components/shop/Filters";
import { ProductCard } from "@/components/shop/ProductCard";
import { JsonLd, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import {
  facetCounts, filterAndSort, getCatalogue, getCategories, getCategoryBySlug,
  type Facets, type SortKey,
} from "@/lib/data";
import { readCurrency } from "@/lib/cart";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

type Params = { slug: string };
type Search = Record<string, string | string[] | undefined>;

/** Every collection is prerendered at build time; there are only a handful. */
export async function generateStaticParams() {
  const categories = await getCategories();
  return [{ slug: "all" }, ...categories.map((c) => ({ slug: c.slug }))];
}

async function resolveCategory(slug: string) {
  if (slug === "all") {
    return {
      slug: "all",
      title: "Everything",
      subtitle: "The complete collection",
      description:
        "Every piece we make, in 100% pure copper and sustainably sourced acacia. Handcrafted, food-grade and fairly priced.",
    };
  }
  return getCategoryBySlug(slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  if (!category) return {};

  return {
    title: category.title,
    description: category.description ?? SITE.description,
    // Canonical points at the unfiltered collection: filtered permutations must
    // not compete with each other, or with the collection, in the index.
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: `${category.title} | ${SITE.name}`,
      description: category.description ?? SITE.description,
      url: `${SITE.url}/collections/${slug}`,
    },
  };
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function CollectionPage({
  params, searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const category = await resolveCategory(slug);
  if (!category) notFound();

  const currency = await readCurrency();
  const all = await getCatalogue(currency);

  const facets: Facets = {
    category: slug,
    finish: toArray(search.finish),
    capacity: toArray(search.capacity),
    price: toArray(search.price),
    onSale: search.sale === "1",
    inStock: search.stock === "1",
  };
  const sort = (typeof search.sort === "string" ? search.sort : "featured") as SortKey;

  // Counts are computed against the products in this collection only.
  const inCategory = filterAndSort(all, { category: slug }, "featured");
  const products = filterAndSort(all, facets, sort);
  const counts = facetCounts(inCategory, facets);

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    for (const v of toArray(value)) query.append(key, v);
  }

  const basePath = `/collections/${slug}`;
  const trail = [
    { name: "Home", path: "/" },
    { name: category.title, path: basePath },
  ];

  // A filtered view that returns nothing must not be indexed as a thin page.
  const hasFilters =
    facets.finish!.length + facets.capacity!.length + facets.price!.length > 0 ||
    facets.onSale || facets.inStock;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={itemListJsonLd(products, category.title)} />
      {hasFilters ? <meta name="robots" content="noindex, follow" /> : null}

      <div className="container-page pb-24 pt-8">
        <Breadcrumbs trail={trail} />

        <header className="mt-8 max-w-2xl">
          <h1 className="font-serif text-4xl leading-tight text-ink">{category.title}</h1>
          {category.subtitle ? (
            <p className="mt-2 text-lg text-ink-muted">{category.subtitle}</p>
          ) : null}
          {category.description ? (
            <p className="mt-5 leading-relaxed text-ink-muted">{category.description}</p>
          ) : null}
          <hr className="rule-accent mt-8" />
        </header>

        <div className="mt-12 grid gap-x-12 gap-y-10 lg:grid-cols-[15rem_1fr]">
          <Filters
            basePath={basePath}
            params={query}
            facets={facets}
            counts={counts}
            total={products.length}
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <SortLinks basePath={basePath} params={query} current={sort} />
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
              <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 xl:grid-cols-3 xl:gap-x-8">
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
      </div>
    </>
  );
}
