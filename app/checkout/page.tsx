import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { Media } from "@/components/ui/Media";
import { getCart } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/auth";
import { getShippingZones } from "@/lib/shipping";
import { stripeConfigured } from "@/lib/stripe";
import { formatMoney } from "@/lib/money";
import { COUNTRIES } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) redirect("/cart");

  const [customer, zones] = await Promise.all([getCurrentCustomer(), getShippingZones()]);

  const serialisableZones = zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    countries: zone.countries,
    dutiesNotice: zone.dutiesNotice,
    rates: zone.rates.map((rate) => ({
      id: rate.id,
      name: rate.name,
      description: rate.description,
      amount: rate.amount,
      freeOver: rate.freeOver,
      minDeliveryDays: rate.minDeliveryDays,
      maxDeliveryDays: rate.maxDeliveryDays,
    })),
  }));

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-serif text-4xl text-ink">Checkout</h1>
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Lock size={15} aria-hidden="true" />
          Secure payment by Stripe
        </p>
      </div>
      <hr className="rule-accent mt-6" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_23rem] lg:gap-16">
        <div>
          {!stripeConfigured() ? (
            <div className="mb-8 rounded-lg border border-border-control bg-surface-sunken p-5">
              <p className="font-medium text-ink">Payments are not connected yet</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                Add <code className="rounded-sm bg-surface px-1">STRIPE_SECRET_KEY</code> and{" "}
                <code className="rounded-sm bg-surface px-1">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
                to <code className="rounded-sm bg-surface px-1">.env.local</code>, then restart.
                Everything up to the payment step works without them.
              </p>
            </div>
          ) : null}

          <CheckoutForm
            zones={serialisableZones}
            countries={[...COUNTRIES]}
            currency={cart.currency}
            initialCountry={cart.country}
            customerEmail={customer?.email ?? null}
            customerName={
              customer ? [customer.firstName, customer.lastName].filter(Boolean).join(" ") : null
            }
            publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null}
            cartLines={cart.lines.map((l) => ({
              sku: l.sku,
              title: l.productTitle,
              quantity: l.quantity,
              unitAmount: l.unitAmount,
            }))}
          />
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <ul className="mb-6 flex flex-col gap-4">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex gap-4">
                <div className="relative w-16 shrink-0">
                  {line.imageUrl ? (
                    <Media
                      src={line.imageUrl}
                      alt=""
                      width={200}
                      height={250}
                      sizes="64px"
                      aspect="portrait"
                      className="rounded-md border border-border"
                    />
                  ) : null}
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-pill bg-surface-brand px-1.5 text-2xs font-semibold tabular-nums text-ink-on-brand">
                    {line.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{line.productTitle}</p>
                  <p className="text-xs text-ink-muted">{line.variantTitle}</p>
                </div>
                <p className="text-sm tabular-nums text-ink">
                  {formatMoney(line.lineTotal, cart.currency)}
                </p>
              </li>
            ))}
          </ul>

          <OrderSummary cart={cart} />

          <Link
            href="/cart"
            className="mt-5 block text-center text-sm text-ink-brand underline underline-offset-4"
          >
            Edit basket
          </Link>
        </aside>
      </div>
    </div>
  );
}
