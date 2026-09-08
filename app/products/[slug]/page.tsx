import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Gallery } from "@/components/shop/Gallery";
import { PurchasePanel } from "@/components/shop/PurchasePanel";
import { ProductCard } from "@/components/shop/ProductCard";
import { ReviewList, ReviewSummary } from "@/components/shop/ReviewList";
import { Rating } from "@/components/ui/Rating";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { getCatalogue, getProductBySlug, getPublishedReviews, relatedProducts } from "@/lib/data";
import { resolveRedirect } from "@/lib/redirects";
import { readCurrency } from "@/lib/cart";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateStaticParams() {
  const products = await getCatalogue();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.summary,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.summary,
      url: `${SITE.url}/products/${slug}`,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const currency = await readCurrency();
  const product = await getProductBySlug(slug, currency);

  if (!product) {
    // A renamed product lands here first, so an old link is redirected rather
    // than 404ing on its way to the catch-all.
    const redirect = await resolveRedirect(`/products/${slug}`);
    if (redirect) permanentRedirect(redirect.toPath);
    notFound();
  }

  const [reviews, all] = await Promise.all([
    getPublishedReviews(product.id),
    getCatalogue(currency),
  ]);
  const related = relatedProducts(all, product);

  const primaryCategory = product.categorySlugs[0];
  const categoryTitle = primaryCategory
    ? primaryCategory.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Shop";

  const trail = [
    { name: "Home", path: "/" },
    ...(primaryCategory ? [{ name: categoryTitle, path: `/collections/${primaryCategory}` }] : []),
    { name: product.title, path: `/products/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product, reviews)} />
      <JsonLd data={breadcrumbJsonLd(trail)} />

      <div className="container-page pt-8">
        <Breadcrumbs trail={trail} />
      </div>

      {/* ------------------------------------------------- BUY BOX */}
      <div className="container-page grid gap-12 pb-20 pt-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} title={product.title} />

        <div className="lg:pt-4">
          <p className="eyebrow">{product.finish}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink">{product.title}</h1>
          {product.subtitle ? (
            <p className="mt-2 text-lg text-ink-muted">{product.subtitle}</p>
          ) : null}

          {product.rating ? (
            <Link href="#reviews" className="mt-4 inline-flex underline-offset-4 hover:underline">
              <Rating value={product.rating.average} count={product.rating.count} />
            </Link>
          ) : null}

          <hr className="rule-accent my-7" />

          <p className="leading-relaxed text-ink-muted">{product.summary}</p>

          <PurchasePanel product={product} />

          {/* Reassurance, stated plainly and only once. */}
          <ul className="mt-8 grid gap-3 border-t border-border pt-7 text-sm sm:grid-cols-2">
            {[
              { Icon: Truck, text: "Free UK delivery over £50" },
              { Icon: RotateCcw, text: "30-day returns, free" },
              { Icon: PackageCheck, text: "Leak-proof, bag-tested" },
              { Icon: Leaf, text: "Plastic-free packaging" },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-ink-muted">
                <Icon size={17} className="shrink-0 text-ink-wellness" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ------------------------------------------------ DESCRIPTION */}
      <section className="bg-surface-sunken">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="prose-editorial">
            <h2 className="font-serif text-2xl text-ink">About this piece</h2>
            <hr className="rule-accent my-5" />
            {product.description.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-4 leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink">Specification</h2>
            <hr className="rule-accent my-5" />
            <dl className="divide-y divide-border border-y border-border">
              {[
                ["Material", product.material],
                ["Finish", product.finish],
                ["Capacity", product.variants.map((v) => v.title).join(", ")],
                ["Dimensions", product.dimensions],
                ["Weight", product.weightGrams ? `${product.weightGrams}g` : null],
                ["Leak-proof", product.leakProof ? "Yes, silicone-sealed cap" : "Open vessel"],
                ["Food grade", product.foodGrade ? "Yes, unlined and unlacquered" : null],
                ["Made", product.handcrafted ? "Handcrafted in small batches" : null],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label as string} className="grid grid-cols-[9rem_1fr] gap-4 py-3.5 text-sm">
                    <dt className="text-ink-muted">{label}</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- AYURVEDA */}
      {product.wellnessStory ? (
        <section className="bg-surface-inverse text-ink-inverse">
          <div className="container-page py-20">
            <div className="prose-editorial">
              <p className="eyebrow text-ink-on-inverse-muted">Ayurvedic wellness</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight">Why copper</h2>
              <hr className="rule-accent my-7" />
              {product.wellnessStory.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4 leading-relaxed text-ink-inverse/85">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------ CARE */}
      {product.careInstructions ? (
        <section className="container-page py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="eyebrow">Looking after it</p>
              <h2 className="mt-3 font-serif text-3xl text-ink">Copper care</h2>
              <hr className="rule-accent mt-6" />
            </div>
            <div className="prose-editorial">
              {product.careInstructions.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4 leading-relaxed text-ink-muted first:mt-0">
                  {paragraph}
                </p>
              ))}
              <Link
                href="/copper-care"
                className="mt-6 inline-block text-sm text-ink-brand underline underline-offset-4"
              >
                Read the full copper care guide
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------- REVIEWS */}
      <section id="reviews" className="border-t border-border bg-surface">
        <div className="container-page py-20">
          <p className="eyebrow">What customers say</p>
          <h2 className="mt-3 font-serif text-3xl text-ink">Reviews</h2>
          <hr className="rule-accent my-8" />

          <ReviewSummary reviews={reviews} />
          <div className="mt-12">
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- RELATED */}
      {related.length > 0 ? (
        <section className="container-page py-20">
          <h2 className="font-serif text-2xl text-ink">You might also like</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
