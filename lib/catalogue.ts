import type { Currency } from "./money";

/* ===========================================================================
   CATALOGUE - types and pure functions

   No database access in this file, so it is safe to import from client
   components (the collection grid filters in the browser). Everything that
   touches the database lives in lib/data.ts.
   =========================================================================== */

export type PriceAmount = { amount: number; compareAt: number | null };

export type CataloguePrice = {
  amount: number;
  compareAt: number | null;
  currency: Currency;
  /** Hand-set prices in every other supported currency. Present when the
      catalogue is loaded in the base currency for a static page; the browser
      picks the visitor's currency from these (see useLocalPrice). */
  byCurrency?: Partial<Record<Currency, PriceAmount>>;
};

export type CatalogueVariant = {
  id: string;
  sku: string;
  title: string;
  capacityMl: number | null;
  inventory: number;
  allowBackorder: boolean;
  available: boolean;
  price: CataloguePrice;
};

export type CatalogueProduct = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  description: string;
  wellnessStory: string | null;
  careInstructions: string | null;
  material: string;
  finish: string | null;
  dimensions: string | null;
  weightGrams: number | null;
  capacityMl: number | null;
  leakProof: boolean;
  foodGrade: boolean;
  handcrafted: boolean;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: { url: string; alt: string; kind: string; width: number; height: number }[];
  variants: CatalogueVariant[];
  categorySlugs: string[];
  /** Cheapest available variant - what a product card shows. */
  from: CataloguePrice;
  available: boolean;
  rating: { average: number; count: number } | null;
};

/* ------------------------------------------------------------------ FACETS */

export type Facets = {
  category?: string;
  finish?: string[];
  capacity?: string[];   // "0-600" | "600-800" | "800-1200" | "1200+"
  price?: string[];      // "0-3000" | "3000-5000" | "5000+"  (minor units)
  onSale?: boolean;
  inStock?: boolean;
};

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

const CAPACITY_BUCKETS: Record<string, [number, number]> = {
  "0-600": [0, 600],
  "600-800": [600, 800],
  "800-1200": [800, 1200],
  "1200+": [1200, Number.MAX_SAFE_INTEGER],
};

const PRICE_BUCKETS: Record<string, [number, number]> = {
  "0-3000": [0, 3000],
  "3000-5000": [3000, 5000],
  "5000+": [5000, Number.MAX_SAFE_INTEGER],
};

function productCapacity(p: CatalogueProduct): number | null {
  return p.capacityMl ?? p.variants.find((v) => v.capacityMl)?.capacityMl ?? null;
}

function matches(p: CatalogueProduct, f: Facets): boolean {
  if (f.category && f.category !== "all" && !p.categorySlugs.includes(f.category)) return false;
  if (f.finish?.length && !(p.finish && f.finish.includes(p.finish))) return false;
  if (f.inStock && !p.available) return false;
  if (f.onSale && !p.variants.some((v) => v.price.compareAt && v.price.compareAt > v.price.amount)) return false;

  if (f.capacity?.length) {
    const cap = productCapacity(p);
    const hit = cap !== null && f.capacity.some((key) => {
      const b = CAPACITY_BUCKETS[key];
      return b && cap >= b[0] && cap < b[1];
    });
    if (!hit) return false;
  }

  if (f.price?.length) {
    const hit = f.price.some((key) => {
      const b = PRICE_BUCKETS[key];
      return b && p.from.amount >= b[0] && p.from.amount < b[1];
    });
    if (!hit) return false;
  }
  return true;
}

export function filterAndSort(
  products: CatalogueProduct[],
  facets: Facets,
  sort: SortKey = "featured",
): CatalogueProduct[] {
  const out = products.filter((p) => matches(p, facets));
  switch (sort) {
    case "price-asc": return out.sort((a, b) => a.from.amount - b.from.amount);
    case "price-desc": return out.sort((a, b) => b.from.amount - a.from.amount);
    case "rating": return out.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));
    case "newest": return out;
    default:
      // In-stock first, then featured. Never lead a grid with a sold-out line.
      return out.sort((a, b) =>
        Number(b.available) - Number(a.available) || Number(b.featured) - Number(a.featured),
      );
  }
}

/** Facet counts are computed against the *other* selected facets, so a count
    never shows zero for an option that is currently selected. */
export function facetCounts(products: CatalogueProduct[], facets: Facets) {
  const count = <K extends keyof Facets>(key: K, value: string) => {
    const probe: Facets = { ...facets, [key]: [value] } as Facets;
    return products.filter((p) => matches(p, probe)).length;
  };

  const finishes = Array.from(new Set(products.map((p) => p.finish).filter(Boolean) as string[])).sort();

  return {
    finish: finishes.map((value) => ({ value, label: value, count: count("finish", value) })),
    capacity: Object.keys(CAPACITY_BUCKETS).map((value) => ({
      value,
      label: capacityLabel(value),
      count: count("capacity", value),
    })),
    price: Object.keys(PRICE_BUCKETS).map((value) => ({
      value,
      label: priceLabel(value),
      count: count("price", value),
    })),
  };
}

function capacityLabel(key: string) {
  switch (key) {
    case "0-600": return "Up to 600ml";
    case "600-800": return "600 - 800ml";
    case "800-1200": return "800ml - 1.2L";
    default: return "1.2L and over";
  }
}
function priceLabel(key: string) {
  switch (key) {
    case "0-3000": return "Under £30";
    case "3000-5000": return "£30 - £50";
    default: return "£50 and over";
  }
}

/* ------------------------------------------------------------------ SEARCH */

/** Weighted substring search. At this catalogue size it beats a tsvector for
    both latency and relevance, and it needs no index maintenance. */
export function searchCatalogue(products: CatalogueProduct[], query: string): CatalogueProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  return products
    .map((p) => {
      const haystacks: [string, number][] = [
        [p.title.toLowerCase(), 10],
        [(p.subtitle ?? "").toLowerCase(), 4],
        [p.summary.toLowerCase(), 3],
        [(p.finish ?? "").toLowerCase(), 3],
        [p.categorySlugs.join(" ").replace(/-/g, " "), 2],
        [p.variants.map((v) => v.sku + " " + v.title).join(" ").toLowerCase(), 2],
        [p.description.toLowerCase(), 1],
      ];
      let score = 0;
      for (const term of terms) {
        for (const [text, weight] of haystacks) {
          if (text.includes(term)) score += weight;
          if (text.startsWith(term)) score += weight;
        }
      }
      return { p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}

/** Same category first, then anything else - never an empty related rail. */
export function relatedProducts(all: CatalogueProduct[], product: CatalogueProduct, limit = 4) {
  const sameCategory = all.filter(
    (p) => p.id !== product.id && p.categorySlugs.some((c) => product.categorySlugs.includes(c)),
  );
  const rest = all.filter((p) => p.id !== product.id && !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, limit);
}
