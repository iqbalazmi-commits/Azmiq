"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { formatMoney, type Currency } from "@/lib/money";
import { toMajorUnits, track, trackKlaviyo } from "@/lib/analytics";

/* ===========================================================================
   CHECKOUT

   Two steps on one page: who and where, then how to pay. The customer is never
   asked to create an account - guest is the default and the only required
   identity is an email address to send the receipt to.

   The amount is never held in this component's state as something the server
   will trust. /api/checkout recalculates the entire order from the database
   and returns a client secret for that amount; the number shown here is only
   ever a display of what the server decided.
   =========================================================================== */

type Rate = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  freeOver: number | null;
  minDeliveryDays: number | null;
  maxDeliveryDays: number | null;
};

type Zone = {
  id: string;
  name: string;
  countries: string[];
  dutiesNotice: string | null;
  rates: Rate[];
};

type Props = {
  zones: Zone[];
  countries: { code: string; name: string }[];
  currency: Currency;
  initialCountry: string;
  customerEmail: string | null;
  customerName: string | null;
  publishableKey: string | null;
  cartLines: { sku: string; title: string; quantity: number; unitAmount: number }[];
};

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(key: string) {
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

export function CheckoutForm(props: Props) {
  const [email, setEmail] = useState(props.customerEmail ?? "");
  const [name, setName] = useState(props.customerName ?? "");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState(props.initialCountry);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [rateId, setRateId] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  const zone = useMemo(
    () =>
      props.zones.find((z) => z.countries.includes(country)) ??
      props.zones.find((z) => z.countries.includes("*")) ??
      null,
    [props.zones, country],
  );

  // Reset the delivery choice when the destination changes - a UK rate is not
  // valid for a parcel going to Australia.
  useEffect(() => {
    setRateId(zone?.rates[0]?.id ?? "");
    setClientSecret(null);
  }, [zone]);

  async function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shippingAddress: { name, line1, line2, city, region, postcode, country, phone },
          shippingRateId: rateId,
          customerNote: note,
          marketingConsent,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Something went wrong.");
        setFieldErrors(body.issues ?? {});
        return;
      }

      setClientSecret(body.clientSecret);
      setAmount(body.amount);

      track("begin_checkout", {
        currency: props.currency,
        value: toMajorUnits(body.amount),
        items: props.cartLines.map((l) => ({
          item_id: l.sku,
          item_name: l.title,
          price: toMajorUnits(l.unitAmount),
          quantity: l.quantity,
        })),
      });
      trackKlaviyo("Started Checkout", {
        value: toMajorUnits(body.amount),
        Items: props.cartLines.map((l) => ({ SKU: l.sku, ProductName: l.title, Quantity: l.quantity })),
      });
    } catch {
      setError("We could not reach the payment service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ------------------------------------------- GUEST VS ACCOUNT ---- */}
      {!props.customerEmail ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-surface-brand bg-surface-brand-wash p-5">
            <p className="font-medium text-ink">Checkout as a guest</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              No account, no password. We will email your receipt and tracking.
            </p>
          </div>
          <div className="rounded-lg border border-border-control bg-surface-raised p-5">
            <p className="font-medium text-ink">Already have an account?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              <Link
                href="/account/sign-in?next=/checkout"
                className="text-ink-brand underline underline-offset-4"
              >
                Sign in
              </Link>{" "}
              to use a saved address and see your order history.
            </p>
          </div>
        </div>
      ) : null}

      {/* -------------------------------------------------- STEP 1 ------ */}
      <form onSubmit={submitDetails} noValidate>
        <fieldset disabled={!!clientSecret}>
          <legend className="font-serif text-2xl text-ink">1. Where it is going</legend>

          <div className="mt-6 grid gap-5">
            <Field
              id="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={setEmail}
              error={fieldErrors.email?.[0]}
              hint="For your receipt and delivery updates."
            />
            <Field
              id="name"
              label="Full name"
              required
              autoComplete="name"
              value={name}
              onChange={setName}
            />
            <Field
              id="line1"
              label="Address"
              required
              autoComplete="address-line1"
              value={line1}
              onChange={setLine1}
            />
            <Field
              id="line2"
              label="Apartment, suite, etc."
              optional
              autoComplete="address-line2"
              value={line2}
              onChange={setLine2}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="city" label="City" required autoComplete="address-level2" value={city} onChange={setCity} />
              <Field
                id="region"
                label="County or state"
                optional
                autoComplete="address-level1"
                value={region}
                onChange={setRegion}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="postcode"
                label="Postcode"
                required
                autoComplete="postal-code"
                value={postcode}
                onChange={setPostcode}
              />
              <Select
                id="country"
                label="Country"
                required
                autoComplete="country"
                value={country}
                onChange={setCountry}
                options={props.countries.map((c) => ({ value: c.code, label: c.name }))}
              />
            </div>

            <Field
              id="phone"
              label="Phone"
              optional
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={setPhone}
              hint="Only used if the courier needs to reach you."
            />
          </div>

          {/* ----------------------------------------------- DELIVERY --- */}
          <fieldset className="mt-10">
            <legend className="font-serif text-2xl text-ink">2. Delivery</legend>

            {zone?.rates.length ? (
              <div className="mt-6 flex flex-col gap-3">
                {zone.rates.map((rate) => {
                  const selected = rate.id === rateId;
                  const days =
                    rate.minDeliveryDays && rate.maxDeliveryDays
                      ? `${rate.minDeliveryDays}-${rate.maxDeliveryDays} working days`
                      : null;
                  return (
                    <label
                      key={rate.id}
                      className={
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors " +
                        (selected
                          ? "border-surface-brand bg-surface-brand-wash"
                          : "border-border-control bg-surface-raised hover:border-ink")
                      }
                    >
                      <input
                        type="radio"
                        name="shippingRate"
                        value={rate.id}
                        checked={selected}
                        onChange={() => setRateId(rate.id)}
                        className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
                      />
                      <span className="flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-medium text-ink">{rate.name}</span>
                          <span className="tabular-nums text-ink">
                            {rate.amount === 0 ? "Free" : formatMoney(rate.amount, props.currency)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-sm text-ink-muted">
                          {[rate.description, days].filter(Boolean).join(" · ")}
                          {rate.freeOver
                            ? ` · Free over ${formatMoney(rate.freeOver, props.currency)}`
                            : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-muted">
                We do not currently ship to that country. Please{" "}
                <Link href="/contact" className="text-ink-brand underline underline-offset-4">
                  get in touch
                </Link>{" "}
                and we will see what we can do.
              </p>
            )}

            {zone?.dutiesNotice ? (
              <p className="mt-4 rounded-md bg-surface-sunken p-3 text-sm leading-relaxed text-ink-muted">
                {zone.dutiesNotice}
              </p>
            ) : null}
          </fieldset>

          <Field
            id="note"
            label="Delivery note"
            optional
            multiline
            value={note}
            onChange={setNote}
            className="mt-8"
            hint="Safe place, access code, anything the courier should know."
          />

          <label className="mt-6 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
            />
            <span className="text-ink-muted">
              Email me occasionally about new pieces and copper care. No more than monthly, and you
              can unsubscribe in one click.
            </span>
          </label>

          {error ? (
            <p role="alert" className="mt-6 rounded-md bg-danger-wash p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {!clientSecret ? (
            <Button type="submit" size="lg" className="mt-8 w-full" disabled={pending || !rateId}>
              {pending ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Preparing payment
                </>
              ) : (
                "Continue to payment"
              )}
            </Button>
          ) : null}
        </fieldset>
      </form>

      {/* -------------------------------------------------- STEP 3 ------ */}
      {clientSecret && props.publishableKey ? (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl text-ink">3. Payment</h2>
            <button
              type="button"
              onClick={() => setClientSecret(null)}
              className="text-sm text-ink-brand underline underline-offset-4"
            >
              Edit delivery details
            </button>
          </div>

          <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
            <Lock size={14} aria-hidden="true" />
            Card details are entered directly with Stripe and never reach our servers.
          </p>

          <div className="mt-6">
            <Elements
              stripe={getStripe(props.publishableKey)}
              options={{
                clientSecret,
                appearance: {
                  theme: "flat",
                  variables: {
                    colorPrimary: "#0E3B43",
                    colorBackground: "#FFFFFF",
                    colorText: "#14181A",
                    colorDanger: "#B3261E",
                    fontFamily: "var(--font-hanken), system-ui, sans-serif",
                    borderRadius: "4px",
                    spacingUnit: "4px",
                  },
                },
              }}
            >
              <PaymentStep amount={amount} currency={props.currency} />
            </Elements>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PaymentStep({ amount, currency }: { amount: number | null; currency: Currency }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setPending(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation`,
      },
    });

    // Reaching here at all means the redirect did not happen, which means
    // something went wrong. On success the browser has already left.
    if (result.error) {
      setError(result.error.message ?? "Your payment could not be completed.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={pay}>
      {/* Apple Pay and Google Pay appear here automatically once the domain is
          verified in Stripe - they are wallets inside Payment Element, not a
          separate integration. */}
      <PaymentElement options={{ layout: "tabs" }} />

      {error ? (
        <p role="alert" className="mt-5 rounded-md bg-danger-wash p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-7 w-full" disabled={!stripe || pending}>
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Processing
          </>
        ) : amount !== null ? (
          `Pay ${formatMoney(amount, currency)}`
        ) : (
          "Pay now"
        )}
      </Button>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
        By paying you agree to our{" "}
        <Link href="/policies/terms" className="underline underline-offset-4">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/policies/refunds" className="underline underline-offset-4">
          refund policy
        </Link>
        . You have 14 days to cancel under the Consumer Contracts Regulations.
      </p>
    </form>
  );
}
