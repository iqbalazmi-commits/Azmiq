import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { getCatalogue } from "@/lib/data";

/* The 404 a customer reaches from a dead bookmark or an old Google result.

   It does not apologise and it does not dump them on the homepage. It says
   what happened, gives them a search box, and shows four things they can
   actually buy - which is the whole point of not redirecting everything to "/"
   in the first place. */

export default async function NotFound() {
  const catalogue = await getCatalogue();
  const suggestions = catalogue.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="container-page py-20 pb-28">
      <div className="max-w-2xl">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-ink">
          That page is not here any more
        </h1>
        <hr className="rule-accent mt-7" />
        <p className="mt-6 leading-relaxed text-ink-muted">
          The link may be old, or the piece it pointed to may have sold out for good. Nothing is
          broken on your end.
        </p>

        <form action="/search" method="get" role="search" className="mt-8 flex max-w-md gap-2">
          <label htmlFor="notfound-q" className="sr-only">
            Search products
          </label>
          <input
            id="notfound-q"
            name="q"
            type="search"
            placeholder="Search for something instead"
            className="h-12 min-w-0 flex-1 rounded-md border border-border-control bg-surface-raised px-3.5 text-base text-ink"
          />
          <button
            type="submit"
            className="min-h-12 shrink-0 rounded-md bg-surface-brand px-6 text-sm font-medium text-ink-on-brand hover:bg-surface-brand-hover"
          >
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/collections/all" variant="secondary">
            Browse everything
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Ask us what happened
          </ButtonLink>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <section className="mt-20">
          <h2 className="font-serif text-2xl text-ink">In the meantime</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {suggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-12 text-ink-muted">
          <Link href="/" className="text-ink-brand underline underline-offset-4">
            Back to the home page
          </Link>
        </p>
      )}
    </div>
  );
}
