import { cache } from "react";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { BASE_CURRENCY, SUPPORTED_CURRENCIES, type Currency } from "./money";
import type { CatalogueProduct, CataloguePrice, CatalogueVariant, PriceAmount } from "./catalogue";

export * from "./catalogue";

/* ===========================================================================
   DATA LAYER

   Server-only. Every storefront read goes through here so that price
   resolution, stock rules and published/draft filtering exist in exactly one
   place rather than being re-derived in each page.

   At 25-100 SKUs the whole active catalogue is a few hundred kilobytes, so it
   is loaded once per request and faceted in memory. That is a deliberate
   choice, not laziness: it makes facet *counts* trivial (the hard part in SQL)
   and keeps a category page to a single round trip. Past a few thousand SKUs
   this should become a proper indexed query with a materialised facet table.
   =========================================================================== */

function pickPrice(
  variantId: string,
  base: { amount: number; compareAt: number | null },
  rows: { variantId: string; currency: string; amount: number; compareAt: number | null }[],
  currency: Currency,
): CataloguePrice {
  if (currency === BASE_CURRENCY) {
    // Static pages are rendered once, in GBP, for every visitor. Carry the
    // other hand-set prices along so the browser can show the visitor's own
    // currency without a server render per request.
    const byCurrency: Partial<Record<Currency, PriceAmount>> = {};
    for (const c of SUPPORTED_CURRENCIES) {
      if (c === BASE_CURRENCY) continue;
      const r = rows.find((x) => x.variantId === variantId && x.currency === c);
      if (r) byCurrency[c] = { amount: r.amount, compareAt: r.compareAt };
    }
    return { ...base, currency, byCurrency };
  }
  const row = rows.find((r) => r.variantId === variantId && r.currency === currency);
  // Falling back to the GBP figure is wrong-looking but never wrong-charging:
  // Stripe is always given the same integer the customer was shown.
  if (!row) return { ...base, currency: BASE_CURRENCY };
  return { amount: row.amount, compareAt: row.compareAt, currency };
}

/** One query set per request. `cache` dedupes across a single render pass. */
export const getCatalogue = cache(async (currency: Currency = BASE_CURRENCY): Promise<CatalogueProduct[]> => {
  const rows = await db.query.products.findMany({
    where: eq(t.products.status, "active"),
    orderBy: [asc(t.products.position), asc(t.products.title)],
    with: {
      images: { orderBy: [asc(t.productImages.position)] },
      variants: { orderBy: [asc(t.variants.position)] },
      categories: { with: { category: true } },
    },
  });

  const variantIds = rows.flatMap((p) => p.variants.map((v) => v.id));
  const priceRows = variantIds.length
    ? await db.select().from(t.variantPrices).where(inArray(t.variantPrices.variantId, variantIds))
    : [];

  const ratingRows = await db
    .select({
      productId: t.reviews.productId,
      average: sql<number>`avg(${t.reviews.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(t.reviews)
    .where(eq(t.reviews.status, "published"))
    .groupBy(t.reviews.productId);

  return rows.map((p) => {
    const variants: CatalogueVariant[] = p.variants.map((v) => {
      const price = pickPrice(
        v.id,
        { amount: v.priceGbp, compareAt: v.compareAtGbp ?? null },
        priceRows,
        currency,
      );
      return {
        id: v.id,
        sku: v.sku,
        title: v.title,
        capacityMl: v.capacityMl,
        inventory: v.inventory,
        allowBackorder: v.allowBackorder,
        available: v.inventory > 0 || v.allowBackorder,
        price,
      };
    });

    const sellable = variants.filter((v) => v.available);
    const cheapest = (sellable.length ? sellable : variants).reduce(
      (min, v) => (v.price.amount < min.price.amount ? v : min),
      sellable[0] ?? variants[0],
    );

    const rating = ratingRows.find((r) => r.productId === p.id);

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      summary: p.summary,
      description: p.description,
      wellnessStory: p.wellnessStory,
      careInstructions: p.careInstructions,
      material: p.material,
      finish: p.finish,
      dimensions: p.dimensions,
      weightGrams: p.weightGrams,
      capacityMl: p.capacityMl,
      leakProof: p.leakProof,
      foodGrade: p.foodGrade,
      handcrafted: p.handcrafted,
      featured: p.featured,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      images: p.images.map((i) => ({
        url: i.url, alt: i.alt, kind: i.kind, width: i.width, height: i.height,
      })),
      variants,
      categorySlugs: p.categories.map((pc) => pc.category.slug),
      from: cheapest?.price ?? { amount: 0, compareAt: null, currency },
      available: sellable.length > 0,
      rating: rating ? { average: Number(rating.average), count: Number(rating.count) } : null,
    };
  });
});

export const getCategories = cache(async () => {
  return db.select().from(t.categories).orderBy(asc(t.categories.position));
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const [row] = await db.select().from(t.categories).where(eq(t.categories.slug, slug)).limit(1);
  return row ?? null;
});

export const getProductBySlug = cache(
  async (slug: string, currency: Currency = BASE_CURRENCY): Promise<CatalogueProduct | null> => {
    const all = await getCatalogue(currency);
    return all.find((p) => p.slug === slug) ?? null;
  },
);

export const getPublishedReviews = cache(async (productId: string) => {
  return db
    .select()
    .from(t.reviews)
    .where(and(eq(t.reviews.productId, productId), eq(t.reviews.status, "published")))
    .orderBy(desc(t.reviews.publishedAt), desc(t.reviews.createdAt));
});
