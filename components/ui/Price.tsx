import { cn } from "@/lib/utils";
import { formatMoney, isOnSale, percentSaved, pricePerLitre, type Currency } from "@/lib/money";

/* ===========================================================================
   PRICE

   Sale pricing is a compliance surface, not just a visual one. Under the UK
   Digital Markets, Competition and Consumers Act a "was" price must be one the
   goods were actually offered at, and the saving must not be overstated - so
   the percentage is floored, and the previous price is announced to screen
   readers as "was", never left as a bare struck-through number that reads as
   the current price.
   =========================================================================== */

type Props = {
  amount: number;
  compareAt?: number | null;
  currency?: Currency;
  capacityMl?: number | null;
  size?: "sm" | "md" | "lg";
  showUnitPrice?: boolean;
  showSavedBadge?: boolean;
  className?: string;
};

const SIZES = {
  sm: { now: "text-base", was: "text-sm" },
  md: { now: "text-xl", was: "text-base" },
  lg: { now: "text-2xl", was: "text-lg" },
};

export function Price({
  amount,
  compareAt,
  currency = "GBP",
  capacityMl,
  size = "md",
  showUnitPrice = false,
  showSavedBadge = true,
  className,
}: Props) {
  const onSale = isOnSale(amount, compareAt);
  const saved = percentSaved(amount, compareAt);
  const unit = showUnitPrice ? pricePerLitre(amount, capacityMl, currency) : null;
  const s = SIZES[size];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cn(s.now, "font-medium tabular-nums text-ink")}>
          {formatMoney(amount, currency)}
        </span>

        {onSale && compareAt ? (
          <s className={cn(s.was, "tabular-nums text-ink-muted decoration-1")}>
            <span className="sr-only">Previous price </span>
            {formatMoney(compareAt, currency)}
          </s>
        ) : null}

        {onSale && saved !== null && showSavedBadge ? (
          <span className="text-2xs uppercase tracking-widest text-ink-muted">
            Save {saved}%
          </span>
        ) : null}
      </div>

      {unit ? <p className="text-xs text-ink-muted tabular-nums">{unit}</p> : null}
    </div>
  );
}

/** "From £25" for a product card where variants differ in price. */
export function FromPrice({
  amount,
  compareAt,
  currency = "GBP",
  multipleVariants,
  className,
}: {
  amount: number;
  compareAt?: number | null;
  currency?: Currency;
  multipleVariants?: boolean;
  className?: string;
}) {
  const onSale = isOnSale(amount, compareAt);
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {multipleVariants ? <span className="text-xs text-ink-muted">From</span> : null}
      <span className="font-medium tabular-nums text-ink">{formatMoney(amount, currency)}</span>
      {onSale && compareAt ? (
        <s className="text-sm tabular-nums text-ink-muted">
          <span className="sr-only">Previous price </span>
          {formatMoney(compareAt, currency)}
        </s>
      ) : null}
    </p>
  );
}
