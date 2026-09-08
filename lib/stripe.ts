import Stripe from "stripe";

/* ===========================================================================
   STRIPE

   Card fields are rendered by Stripe inside their own iframes (Payment
   Element). Card numbers, expiry and CVC never touch this server, never reach
   our DOM and never appear in our logs - which is what keeps AZMIQ in PCI-DSS
   SAQ A scope rather than SAQ A-EP.

   Apple Pay and Google Pay are not a separate integration: Payment Element
   surfaces them automatically once the domain is verified in the Stripe
   dashboard.
   =========================================================================== */

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local - see .env.example.",
    );
  }
  cached = new Stripe(key, {
    // Retries protect against a transient network blip creating a duplicate
    // charge attempt; the idempotency key on each call protects against the
    // retry itself being duplicated.
    maxNetworkRetries: 2,
    timeout: 20000,
    appInfo: { name: "AZMIQ Store", version: "1.0.0" },
  });
  return cached;
}

export function stripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

/** Stripe expects lowercase ISO-4217. */
export function stripeCurrency(currency: string): string {
  return currency.toLowerCase();
}
