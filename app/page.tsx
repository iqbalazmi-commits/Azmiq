import Link from "next/link";
import type { Metadata } from "next";
import { Globe, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import { HeroCarousel, type HeroSlide } from "@/components/shop/HeroCarousel";
import { getCatalogue } from "@/lib/data";
import { readCurrency } from "@/lib/cart";
import { SITE } from "@/lib/site";
import type { CatalogueProduct } from "@/lib/data";

export const metadata: Metadata = {
  title: "AZMIQ — Leather, Copperware & Home",
  description: SITE.description,
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

type Tile = { label: string; slug: string; blurb: string };

/* The rotating hero band — a scene from each side of the range. */
const HERO_PICKS: { slug: string; kind?: string; alt: string }[] = [
  { slug: "pure-copper-water-bottle", alt: "A handcrafted copper water bottle styled with lemon and linen" },
  { slug: "womens-leather-jacket", kind: "gallery", alt: "A black leather trench coat against a concrete wall" },
  { slug: "womens-burgundy-leather-jacket", kind: "lifestyle", alt: "A burgundy leather trench in a wood-panelled boutique" },
  { slug: "mens-leather-jacket", kind: "gallery", alt: "A black leather café-racer jacket, laid flat" },
  { slug: "ayurvedic-copper-water-set", alt: "A copper jug, bottle and two tumblers" },
];

function heroSlides(products: CatalogueProduct[]): HeroSlide[] {
  return HERO_PICKS.flatMap(({ slug, kind, alt }) => {
    const p = products.find((x) => x.slug === slug);
    if (!p) return [];
    const img = (kind && p.images.find((i) => i.kind === kind)) || p.images[0];
    return img ? [{ src: img.url, alt, width: img.width, height: img.height }] : [];
  });
}

const BENTO: Tile[] = [
  { label: "Leather", slug: "leather-jackets", blurb: "Jackets and a leather trench" },
  { label: "Copperware", slug: "copper-water-bottles", blurb: "Pure copper, hand-hammered" },
  { label: "Kitchen", slug: "kitchen-utensils", blurb: "Sustainable acacia wood" },
  { label: "Gifts", slug: "wellness-gift-sets", blurb: "Matched sets, ready to give" },
];

function tileImage(products: CatalogueProduct[], slug: string) {
  const p = products.find((x) => x.categorySlugs.includes(slug));
  const img = p?.images.find((i) => i.kind === "lifestyle") ?? p?.images[0];
  return img ?? null;
}

export default async function HomePage() {
  const currency = await readCurrency();
  const products = await getCatalogue(currency);
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const carousel = featured.length >= 4 ? featured : products.slice(0, 8);
  const slides = heroSlides(products);

  return (
    <>
      {/* ============================================================= HERO */}
      <section className="relative isolate flex min-h-[82svh] items-end overflow-hidden bg-surface-inverse">
        <HeroCarousel slides={slides} />

        <div className="container-page relative z-10 w-full pb-16 pt-24 md:pb-24 md:pt-28">
          <div className="max-w-xl rounded-lg bg-surface/92 p-9 shadow-lift ring-1 ring-black/[0.05] backdrop-blur-md md:p-14">
            <p className="eyebrow text-ink-muted">Modern luxury &middot; Artisanal craft</p>
            <hr className="rule-accent mt-5" />
            <h1 className="mt-6 font-serif text-[2.35rem] leading-[1.1] tracking-tightest text-ink sm:text-[2.9rem] lg:text-[3.4rem]">
              Considered goods,
              <br />
              made to last.
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-ink-muted">
              Leather, pure copper drinkware and home essentials &mdash; a small, curated
              collection, priced openly and shipped worldwide.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink href="/collections/all" size="lg">
                Shop the collection
              </ButtonLink>
              <Link
                href="/collections/leather-jackets"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-[color-mix(in_srgb,var(--color-accent-gold)_70%,transparent)] decoration-1 underline-offset-[6px] transition hover:decoration-2"
              >
                New: the leather line
                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== CATEGORY BENTO */}
      <section className="container-page py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-ink-muted">Browse</p>
            <hr className="rule-accent mt-4" />
            <h2 className="mt-5 font-serif text-3xl tracking-tightest text-ink md:text-4xl">
              Shop by category
            </h2>
          </div>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-brand underline decoration-1 underline-offset-[6px] hover:decoration-2"
          >
            View all
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:auto-rows-[minmax(190px,1fr)] md:grid-cols-3 lg:auto-rows-[minmax(228px,1fr)]">
          {BENTO.map((tile, i) => {
            const img = tileImage(products, tile.slug);
            return (
              <Link
                key={tile.slug}
                href={`/collections/${tile.slug}`}
                className={
                  "group relative isolate flex items-end overflow-hidden rounded-lg bg-surface-raised " +
                  (i === 0
                    ? "min-h-[280px] md:col-span-2 md:row-span-2"
                    : i === 3
                      ? "min-h-[220px] md:col-span-3 lg:col-span-1"
                      : "min-h-[220px]")
                }
              >
                {img ? (
                  <Media
                    src={img.url}
                    alt=""
                    width={img.width}
                    height={img.height}
                    sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                    aspect="none"
                    className="absolute inset-0 -z-10 h-full"
                    imgClassName="object-cover transition-transform duration-[900ms] ease-out-soft group-hover:scale-[1.04]"
                  />
                ) : null}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(24_24_27/0.68)] via-[rgb(24_24_27/0.12)] to-transparent"
                />
                <div className="p-7 text-ink-inverse">
                  <span aria-hidden="true" className="block h-px w-8 bg-accent-gold" />
                  <p className="mt-3 text-2xs uppercase tracking-widest text-ink-inverse/80">
                    {tile.blurb}
                  </p>
                  <h3 className="mt-1.5 flex items-center gap-2 font-serif text-2xl tracking-tight">
                    {tile.label}
                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                      className="-translate-x-1 text-ink-gold opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================= FEATURED CAROUSEL */}
      <section className="bg-surface-sunken py-24 md:py-32">
        <div className="container-page flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-ink-muted">The edit</p>
            <hr className="rule-accent mt-4" />
            <h2 className="mt-5 font-serif text-3xl tracking-tightest text-ink md:text-4xl">
              Featured this season
            </h2>
          </div>
          <p className="text-sm text-ink-muted">Swipe to explore &rarr;</p>
        </div>

        <div className="scroll-x mt-12 gap-7 px-5 pb-3 md:px-8 [scroll-padding-left:2rem]">
          {carousel.map((product, i) => (
            <div key={product.id} className="w-[16rem] sm:w-[18.5rem]">
              <ProductCard product={product} priority={i < 3} sizes="18.5rem" />
            </div>
          ))}
          <Link
            href="/collections/all"
            className="group flex w-[16rem] shrink-0 flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface text-center transition-colors hover:border-border-strong sm:w-[18.5rem]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-accent text-ink-on-brand transition-transform duration-300 group-hover:scale-105">
              <ArrowRight size={20} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-ink">Shop everything</span>
          </Link>
        </div>
      </section>

      {/* ========================================================= EDITORIAL */}
      <section className="bg-surface-inverse text-ink-inverse">
        <div className="container-page grid items-center gap-16 py-28 md:py-36 lg:grid-cols-[1fr_1.05fr]">
          <div className="max-w-lg">
            <p className="eyebrow eyebrow-gold">New &mdash; the leather line</p>
            <hr className="rule-gold mt-5" />
            <h2 className="mt-7 font-serif text-3xl leading-[1.1] tracking-tightest md:text-5xl">
              Genuine leather,
              <br />
              the same standard
            </h2>
            <p className="mt-7 max-w-md leading-relaxed text-ink-inverse/85">
              Genuine leather outerwear in clean, modern cuts &mdash; a café-racer jacket for men,
              and belted double-breasted trenches for women in black and deep burgundy. Full-grain
              hide, a soft full lining, a tailored fit. Five sizes, S to XXL.
            </p>
            <ButtonLink href="/collections/leather-jackets" variant="secondary-inverse" className="mt-10">
              Shop leather jackets
            </ButtonLink>
          </div>
          <Media
            src="/images/products/mens-leather-jacket/00-hero.png"
            alt="AZMIQ men's leather jacket, a black café-racer with a low stand collar"
            width={1024}
            height={1536}
            sizes="(min-width: 1024px) 46vw, 90vw"
            aspect="portrait"
            className="rounded-lg bg-surface-raised"
          />
        </div>
      </section>

      {/* ======================================================= VALUE PROPS */}
      <section className="border-t border-border bg-surface">
        <div className="container-page grid gap-x-10 gap-y-12 py-20 sm:grid-cols-3 md:py-24">
          {[
            {
              Icon: Globe,
              title: "Shipped worldwide",
              body: "A flat £10 anywhere in the world, tracked, and free in the UK over £50. Duties shown before you pay.",
            },
            {
              Icon: Sparkles,
              title: "Made properly",
              body: "100% pure copper, full-grain leather, sustainable acacia. No shortcuts.",
            },
            {
              Icon: ShieldCheck,
              title: "Secure checkout",
              body: "Card, Apple Pay and Google Pay. Card details never touch our servers.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex flex-col items-start">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-sunken text-[var(--color-accent-gold-deep)] ring-1 ring-[color-mix(in_srgb,var(--color-accent-gold)_35%,transparent)]">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif text-lg tracking-tight text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
