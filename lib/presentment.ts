/* ===========================================================================
   PRESENTMENT PRICING

   Hand-set, rounded prices per currency, derived from the live GBP price. Not
   a live FX feed. Shared by the seed script and the admin panel, so a product
   added or repriced in the admin gets the same EUR/USD/CAD/AUD prices a
   seeded one would.
   =========================================================================== */

export const PRESENTMENT_MULTIPLIERS: Record<string, number> = {
  EUR: 1.18,
  USD: 1.28,
  CAD: 1.74,
  AUD: 1.94,
};

/** Round to a whole major unit so the result looks deliberate, not converted. */
export function presentmentPrice(gbpMinor: number, multiplier: number): number {
  const major = (gbpMinor / 100) * multiplier;
  return Math.round(major) * 100;
}

/** One row per non-GBP currency for a variant, ready to insert. */
export function presentmentRows(variantId: string, priceGbp: number, compareAtGbp: number | null) {
  return Object.entries(PRESENTMENT_MULTIPLIERS).map(([currency, multiplier]) => ({
    variantId,
    currency,
    amount: presentmentPrice(priceGbp, multiplier),
    compareAt: compareAtGbp ? presentmentPrice(compareAtGbp, multiplier) : null,
  }));
}
