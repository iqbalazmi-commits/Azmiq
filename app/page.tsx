import Link from "next/link";
import type { Metadata } from "next";
import { Droplet, Hammer, Leaf, ShieldCheck } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCatalogue, getCategories } from "@/lib/data";
import { readCurrency } from "@/lib/cart";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "AZMIQ — Handcrafted Copper Drinkware",
  description: SITE.description,
  alternates: { canonical: "/" },
};

// The catalogue changes rarely; revalidating hourly keeps the home page on the
// edge cache while still picking up a price change without a deploy.
export const revalidate = 3600;

export default async function HomePage() {
  const currency = await readCurrency();
  const [products, categories] = await Promise.all([getCatalogue(currency), getCategories()]);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestRated = [...products]
    .filter((p) => (p.rating?.count ?? 0) >= 4)
    .sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
    .slice(0, 4);

  return (
    <>
      {/* ------------------------------------------------------------ HERO */}
      <section className="relative bg-surface-inverse text-ink-inverse">
        <div className="absolute inset-0">
          <Media
            src="/images/hero-pour.svg"
            alt=""
            width={2000}
            height={1200}
            sizes="100vw"
            priority
            aspect="none"
            className="h-full"
            imgClassName="opacity-70"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface-inverse)] via-[var(--color-surface-inverse)]/75 to-transparent"
          />
        </div>

        <div className="container-page relative py-28 md:py-40">
          <div className="max-w-xl">
            <p className="eyebrow text-ink-on-inverse-muted">Ayurvedic copper, made properly</p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.06] md:text-5xl">
              drink well,
              <br />
              live well
            </h1>
            <hr className="rule-accent my-7" />
            <p className="max-w-md text-lg leading-relaxed text-ink-inverse/85">
              Handcrafted bottles, jugs and sets in 100% pure copper. Traditional artistry,
              contemporary design, and prices we are happy to explain.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/collections/copper-water-bottles" size="lg">
                Shop water bottles
              </ButtonLink>
              <ButtonLink
                href="/ayurveda"
                variant="secondary"
                size="lg"
                className="border-white/40 bg-transparent text-ink-inverse hover:border-white hover:bg-white/10"
              >
                Why copper
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- TRUST */}
      <section aria-label="What every AZMIQ piece guarantees" className="border-b border-border bg-surface">
        <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-12 lg:grid-cols-4">
          {[
            { Icon: Droplet, title: "100% pure copper", note: "Unlined, unlacquered, food-grade" },
            { Icon: Hammer, title: "Handcrafted", note: "Raised and hammered by hand" },
            { Icon: ShieldCheck, title: "Leak-proof", note: "Silicone-sealed, bag-tested" },
            { Icon: Leaf, title: "Eco-friendly", note: "Endlessly recyclable, plastic-free" },
          ].map(({ Icon, title, note }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon size={22} className="mt-0.5 shrink-0 text-ink-wellness" aria-hidden="true" />
              <div>
                <p className="font-medium text-ink">{title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{note}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------------------------------- FEATURED */}
      <section className="container-page py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Chosen by us</p>
            <h2 className="mt-3 font-serif text-3xl text-ink">The pieces we would buy</h2>
          </div>
          <Link
            href="/collections/all"
            className="text-sm text-ink-brand underline underline-offset-4 hover:decoration-2"
          >
            View everything
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- AYURVEDA */}
      <section className="bg-surface-inverse text-ink-inverse">
        <div className="container-page grid items-center gap-14 py-24 md:py-32 lg:grid-cols-2">
          <div className="max-w-lg">
            <p className="eyebrow text-ink-on-inverse-muted">The practice</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              Water, left overnight in copper
            </h2>
            <hr className="rule-accent my-7" />
            <div className="prose-editorial space-y-5 text-ink-inverse/85">
              <p>
                Ayurveda calls it <em>tamra jal</em>. Fill the vessel in the evening, leave it to
                stand at room temperature, and drink it in the morning. The practice is thousands
                of years old and takes about four seconds to adopt.
              </p>
              <p>
                Copper is an essential trace mineral, and copper surfaces are naturally
                antimicrobial. Practitioners hold that tamra jal helps balance the doshas and
                supports digestion.
              </p>
              <p className="text-sm text-ink-on-inverse-muted">
                We make no medical claims. We make the vessel properly — unlined, unlacquered,
                100% pure copper — so the tradition works as it is meant to.
              </p>
            </div>
            <ButtonLink
              href="/ayurveda"
              variant="secondary"
              className="mt-8 border-white/40 bg-transparent text-ink-inverse hover:border-white hover:bg-white/10"
            >
              Read the full story
            </ButtonLink>
          </div>

          <Media
            src="/images/editorial-ayurveda.svg"
            alt="A hammered copper bottle resting on linen in low morning light"
            width={1400}
            height={1000}
            sizes="(min-width: 1024px) 46vw, 90vw"
            aspect="wide"
            className="rounded-lg"
          />
        </div>
      </section>

      {/* ------------------------------------------------------ CATEGORIES */}
      <section className="container-page py-20 md:py-28">
        <p className="eyebrow">Browse</p>
        <h2 className="mt-3 font-serif text-3xl text-ink">By what it is for</h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const sample = products.find((p) => p.categorySlugs.includes(category.slug));
            return (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="group relative overflow-hidden rounded-lg border border-border bg-surface-raised"
              >
                {sample?.images[0] ? (
                  <Media
                    src={sample.images[2]?.url ?? sample.images[0].url}
                    alt=""
                    width={1200}
                    height={1500}
                    sizes="(min-width: 1024px) 30vw, 90vw"
                    aspect="square"
                    imgClassName="transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                  />
                ) : null}
                <div className="p-6">
                  <h3 className="font-serif text-xl text-ink">{category.title}</h3>
                  {category.subtitle ? (
                    <p className="mt-1 text-sm text-ink-muted">{category.subtitle}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- FAIR PRICING */}
      <section className="bg-surface-sunken">
        <div className="container-page grid gap-14 py-24 lg:grid-cols-[1fr_1.1fr]">
          <div className="max-w-md">
            <p className="eyebrow">Fair and transparent</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink">
              Luxury-grade quality, without the luxury mark-up
            </h2>
            <hr className="rule-accent my-6" />
            <p className="text-ink-muted">
              We sell direct. There is no distributor, no department-store margin and no licensing
              fee folded into the price — which is why a bottle that would sit at £90 elsewhere
              sits at £34 here.
            </p>
            <ButtonLink href="/fair-pricing" variant="secondary" className="mt-8">
              How we price
            </ButtonLink>
          </div>

          <Media
            src="/images/editorial-texture.svg"
            alt="Macro detail of a hand-hammered copper surface"
            width={1600}
            height={1000}
            sizes="(min-width: 1024px) 52vw, 90vw"
            aspect="wide"
            className="rounded-lg"
          />
        </div>
      </section>

      {/* --------------------------------------------------- SOCIAL PROOF */}
      <section className="container-page py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2 className="mt-3 font-serif text-3xl text-ink">Highest rated by customers</h2>
          </div>
          <Link
            href="/collections/all?sort=rating"
            className="text-sm text-ink-brand underline underline-offset-4 hover:decoration-2"
          >
            Sort everything by rating
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {bestRated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
