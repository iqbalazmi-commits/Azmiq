"use client";

import { formatMoney, isOnSale } from "@/lib/money";
import { useLocalPrice } from "@/lib/browser-state";
import type { CataloguePrice } from "@/lib/catalogue";

/* The price line on a product tile, in the visitor's currency. A client
   component so the tile - and the page around it - can stay static. */

export function CardPrice({ price, multiple }: { price: CataloguePrice; multiple: boolean }) {
  const p = useLocalPrice(price);
  const onSale = isOnSale(p.amount, p.compareAt);
  return (
    <p className="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 pt-1 text-sm tabular-nums">
      {multiple ? <span className="text-ink-muted">From</span> : null}
      <span className="text-ink">{formatMoney(p.amount, p.currency)}</span>
      {onSale && p.compareAt ? (
        <s className="text-ink-muted/80 decoration-1">
          <span className="sr-only">Previous price </span>
          {formatMoney(p.compareAt, p.currency)}
        </s>
      ) : null}
    </p>
  );
}
