import { SITE } from "./site";
import { minorUnitExponent } from "./money";
import type { CatalogueProduct } from "./data";
import type { Review } from "@/db/schema";

/* ===========================================================================
   STRUCTURED DATA

   Google will only show price, availability and stars in a result if the
   Product markup is complete and matches the visible page. Two rules are
   enforced here: prices are emitted as decimal strings from the same integer
   the page renders, and aggregateRating is omitted entirely when there are no
   published reviews - an empty rating object is a manual-action risk, not a
   neutral one.
   =========================================================================== */

function decimal(minor: number, currency: string): string {
  const exponent = minorUnitExponent(currency);
  return (minor / 10 ** exponent).toFixed(exponent);
}

export function productJsonLd(product: CatalogueProduct, reviews: Review[]) {
  const url = `${SITE.url}/products/${product.slug}`;
  const currency = product.from.currency;

  const offers = product.variants.map((variant) => ({
    "@type": "Offer",
    url: `${url}?variant=${variant.id}`,
    sku: variant.sku,
    price: decimal(variant.price.amount, variant.price.currency),
    priceCurrency: variant.price.currency,
    availability: variant.available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    priceValidUntil: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
    seller: { "@type": "Organization", name: SITE.name },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "GB",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  }));

  const published = reviews.filter((r) => r.status === "published");
  const average =
    published.length > 0
      ? published.reduce((sum, r) => sum + r.rating, 0) / published.length
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    name: product.title,
    description: product.summary || product.description.slice(0, 300),
    sku: product.variants[0]?.sku,
    url,
    image: product.images.map((i) => `${SITE.url}${i.url}`),
    brand: { "@type": "Brand", name: SITE.name },
    material: product.material,
    ...(product.capacityMl
      ? { additionalProperty: [{ "@type": "PropertyValue", name: "Capacity", value: `${product.capacityMl}ml` }] }
      : {}),
    offers:
      offers.length === 1
        ? offers[0]
        : {
            "@type": "AggregateOffer",
            priceCurrency: currency,
            lowPrice: decimal(Math.min(...product.variants.map((v) => v.price.amount)), currency),
            highPrice: decimal(Math.max(...product.variants.map((v) => v.price.amount)), currency),
            offerCount: offers.length,
            offers,
          },
    ...(average !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: published.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: published.slice(0, 8).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.authorName },
            datePublished: (r.publishedAt ?? r.createdAt).toISOString().slice(0, 10),
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            name: r.title ?? undefined,
            reviewBody: r.body,
          })),
        }
      : {}),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE.url}${crumb.path}`,
    })),
  };
}

export function organisationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}#organisation`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    slogan: SITE.tagline,
    logo: `${SITE.url}/brand/azmiq-logo.png`,
    sameAs: [SITE.social.instagram, SITE.social.facebook],
    address: { "@type": "PostalAddress", addressCountry: "GB" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE.email,
      telephone: SITE.phone,
      areaServed: "GB",
      availableLanguage: "English",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function itemListJsonLd(products: CatalogueProduct[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE.url}/products/${product.slug}`,
      name: product.title,
    })),
  };
}

/** JSON-LD is injected as a script tag, so the payload is escaped to prevent a
    product description containing "</script>" from breaking out of it. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
