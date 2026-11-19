import { Truck } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/money";

/* "£12 away from free delivery", shown in the basket. The threshold comes from
   the shipping rate in the database (admin-editable), so this never promises a
   number checkout would not honour. The parent only renders it for UK baskets
   priced in GBP, the one case where the threshold is a like-for-like amount. */

export function FreeDeliveryBar({
  subtotal,
  freeOver,
  currency,
}: {
  /** Basket value after discounts, in minor units. */
  subtotal: number;
  freeOver: number;
  currency: Currency;
}) {
  const remaining = Math.max(0, freeOver - subtotal);
  const percent = Math.min(100, Math.round((subtotal / freeOver) * 100));
  const qualifies = remaining === 0;

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <p className="flex items-center gap-2.5 text-sm text-ink">
        <Truck size={17} className="shrink-0 text-ink-wellness" aria-hidden="true" />
        {qualifies ? (
          <span>
            <strong className="font-medium text-ink-wellness">You&rsquo;ve got free UK delivery.</strong>
          </span>
        ) : (
          <span>
            You&rsquo;re <strong className="font-medium">{formatMoney(remaining, currency)}</strong> away
            from free UK delivery.
          </span>
        )}
      </p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-label="Progress towards free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-surface-brand transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
