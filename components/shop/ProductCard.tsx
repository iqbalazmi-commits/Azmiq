import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Rating } from "@/components/ui/Rating";
import { formatMoney, isOnSale } from "@/lib/money";
import type { CatalogueProduct } from "@/lib/data";

/* An editorial product tile. The image carries the card: no border, no drop
   shadow, no sale flag shouting over the photograph. Title in the serif, price
   quiet beneath. A second image, where the product has one, cross-fades on
   hover. Everything else recedes so a grid of these reads as a lookbook. */

export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 46vw",
}: {
  product: CatalogueProduct;
  priority?: boolean;
  sizes?: string;
}) {
  const hero = product.images[0];
  const alt = product.images.find((i) => i.kind === "lifestyle") ?? product.images[1];
  const multiple = product.variants.length > 1;
  const onSale = isOnSale(product.from.amount, product.from.compareAt);

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-lg bg-surface-raised">
        {hero ? (
          <Media
            src={hero.url}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            sizes={sizes}
            priority={priority}
            aspect="portrait"
            imgClassName={
              "transition-[transform,opacity] duration-[900ms] ease-out-soft " +
              (alt ? "group-hover:opacity-0" : "group-hover:scale-[1.035]")
            }
          />
        ) : (
          <div className="media-portrait bg-surface-sunken" />
        )}

        {alt ? (
          <Media
            src={alt.url}
            alt=""
            width={alt.width}
            height={alt.height}
            sizes={sizes}
            aspect="portrait"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[900ms] ease-out-soft group-hover:opacity-100"
          />
        ) : null}

        {!product.available ? (
          <span className="absolute left-4 top-4 rounded-sm bg-surface-inverse/90 px-2.5 py-1 text-2xs uppercase tracking-widest text-ink-inverse">
            Sold out
          </span>
        ) : onSale ? (
          <span className="absolute left-4 top-4 rounded-sm bg-surface/92 px-2.5 py-1 text-2xs uppercase tracking-widest text-ink">
            Sale
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <h3 className="font-serif text-lg leading-snug tracking-tight text-ink underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-300 group-hover:decoration-[var(--color-accent-gold)]">
          {/* One stretched link makes the whole tile the target. */}
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        {product.rating ? (
          <Rating
            value={product.rating.average}
            count={product.rating.count}
            size="sm"
            className="mt-2"
          />
        ) : null}

        {product.subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{product.subtitle}</p>
        ) : null}

        <p className="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 pt-1 text-sm tabular-nums">
          {multiple ? <span className="text-ink-muted">From</span> : null}
          <span className="text-ink">{formatMoney(product.from.amount, product.from.currency)}</span>
          {onSale && product.from.compareAt ? (
            <s className="text-ink-muted/80 decoration-1">
              <span className="sr-only">Previous price </span>
              {formatMoney(product.from.compareAt, product.from.currency)}
            </s>
          ) : null}
        </p>
      </div>
    </article>
  );
}
