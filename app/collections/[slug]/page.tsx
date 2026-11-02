import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Suspense } from "react";
import { CollectionView, CollectionViewFromUrl } from "@/components/shop/CollectionView";
import { JsonLd, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { filterAndSort, getCatalogue, getCategories, getCategoryBySlug } from "@/lib/data";
import { SITE } from "@/lib/site";
import { resolveRedirect } from "@/lib/redirects";

export const revalidate = 3600;

type Params = { slug: string };

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

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  // No searchParams and no cookies: this page is rendered once per collection
  // and served from cache. Filters and sort are applied in the browser.
  const { slug } = await params;
  const category = await resolveCategory(slug);
  if (!category) {
    // A renamed or retired collection still has to honour its redirect. This
    // route matches /collections/anything, so the catch-all never sees it and
    // an old Shopify collection URL would 404 without this.
    const redirect = await resolveRedirect(`/collections/${slug}`);
    if (redirect) permanentRedirect(redirect.toPath);
    notFound();
  }

  const all = await getCatalogue();
  const inCategory = filterAndSort(all, { category: slug }, "featured");

  const basePath = `/collections/${slug}`;
  const trail = [
    { name: "Home", path: "/" },
    { name: category.title, path: basePath },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={itemListJsonLd(inCategory, category.title)} />

      <div className="container-page pb-28 pt-14 md:pt-20">
        <Breadcrumbs trail={trail} />

        <header className="mt-10 max-w-2xl">
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tightest text-ink md:text-5xl">
            {category.title}
          </h1>
          {category.subtitle ? (
            <p className="mt-3 text-lg text-ink-muted">{category.subtitle}</p>
          ) : null}
          {category.description ? (
            <p className="mt-6 leading-relaxed text-ink-muted">{category.description}</p>
          ) : null}
          <hr className="rule-accent mt-9" />
        </header>

        {/* The fallback is the unfiltered grid, so the cached HTML - what
            crawlers and no-JS visitors get - is the full collection. */}
        <Suspense
          fallback={
            <CollectionView products={inCategory} slug={slug} query="" />
          }
        >
          <CollectionViewFromUrl products={inCategory} slug={slug} />
        </Suspense>
      </div>
    </>
  );
}
