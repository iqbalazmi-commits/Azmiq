import { formatMoney } from "@/lib/money";
import { dutiesNoticeFor } from "@/lib/currency";
import type { CartView } from "@/lib/cart";

/* The totals block. It shows every component of the price, including the tax
   already inside it, because "£X of which VAT is £Y" is what a UK invoice has
   to say and hiding it until the last step is how carts get abandoned. */

export function OrderSummary({
  cart,
  shippingLabel,
}: {
  cart: CartView;
  shippingLabel?: string | null;
}) {
  const { totals, currency } = cart;
  const duties = dutiesNoticeFor(totals.regime);

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-6">
      <h2 className="font-serif text-xl text-ink">Summary</h2>

      <dl className="mt-6 flex flex-col gap-3 text-sm">
        <Row label={`Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"})`}>
          {formatMoney(totals.subtotal, currency)}
        </Row>

        {totals.savingsTotal > 0 ? (
          <Row label="You save" tone="wellness">
            &minus;{formatMoney(totals.savingsTotal, currency)}
          </Row>
        ) : null}

        {totals.discountTotal > 0 ? (
          <Row label={`Discount${cart.discountCode ? ` (${cart.discountCode})` : ""}`} tone="wellness">
            &minus;{formatMoney(totals.discountTotal, currency)}
          </Row>
        ) : null}

        <Row label="Delivery">
          {shippingLabel === undefined && totals.shippingTotal === 0 ? (
            <span className="text-ink-muted">Calculated at checkout</span>
          ) : totals.shippingTotal === 0 ? (
            <span className="text-ink-wellness">Free</span>
          ) : (
            formatMoney(totals.shippingTotal, currency)
          )}
        </Row>

        <div className="mt-2 flex items-baseline justify-between border-t border-border pt-4">
          <dt className="font-serif text-lg text-ink">Total</dt>
          <dd className="font-serif text-xl tabular-nums text-ink">
            {formatMoney(totals.grandTotal, currency)}
          </dd>
        </div>

        {totals.taxInclusive ? (
          <p className="text-xs text-ink-muted">
            Includes {formatMoney(totals.taxTotal, currency)} VAT at{" "}
            {(totals.vatRate / 100).toFixed(0)}%
          </p>
        ) : (
          <p className="text-xs text-ink-muted">
            UK VAT has been removed for delivery outside the UK.
          </p>
        )}
      </dl>

      {duties ? (
        <p className="mt-5 rounded-md bg-surface-sunken p-3 text-xs leading-relaxed text-ink-muted">
          {duties}
        </p>
      ) : null}
    </div>
  );
}

function Row({
  label, children, tone,
}: {
  label: string;
  children: React.ReactNode;
  tone?: "wellness";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={"tabular-nums " + (tone === "wellness" ? "text-ink-wellness" : "text-ink")}>
        {children}
      </dd>
    </div>
  );
}
