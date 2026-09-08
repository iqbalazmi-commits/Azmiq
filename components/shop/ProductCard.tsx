import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { FromPrice } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { percentSaved } from "@/lib/money";
import type { CatalogueProduct } from "@/lib/data";

/* A product tile on warm white. The card itself is pure white with a hairline
   border - no drop shadow at rest, because a grid of floating cards competes
   with the photography for depth and the photography must win. */

export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw",
}: {
  product: CatalogueProduct;
  priority?: boolean;
  sizes?: string;
}) {
  const hero = product.images[0];
  const saved = percentSaved(product.from.amount, product.from.compareAt);
  const multiple = product.variants.length > 1;

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface-raised">
        {hero ? (
          <Media
            src={hero.url}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            sizes={sizes}
            priority={priority}
            aspect="portrait"
            imgClassName="transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
          />
        ) : (
          <div className="media-portrait bg-surface-sunken" />
        )}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-2">
          {saved !== null ? (
            <span className="rounded-sm bg-surface-accent px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-ink-on-accent">
              Save {saved}%
            </span>
          ) : null}
          {!product.available ? (
            <span className="rounded-sm bg-surface-inverse px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-ink-inverse">
              Sold out
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-4">
        <h3 className="font-serif text-lg leading-snug text-ink">
          {/* The whole card is clickable via this stretched link, so there is
              still exactly one link and one accessible name per product. */}
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        {product.subtitle ? (
          <p className="text-sm text-ink-muted">{product.subtitle}</p>
        ) : null}

        {product.rating ? (
          <Rating value={product.rating.average} count={product.rating.count} size="sm" />
        ) : null}

        <FromPrice
          amount={product.from.amount}
          compareAt={product.from.compareAt}
          currency={product.from.currency}
          multipleVariants={multiple}
          className="mt-auto pt-1"
        />
      </div>
    </article>
  );
}
