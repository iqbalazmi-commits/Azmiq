import { clampToZero, type Currency } from "./money";
import { EU_COUNTRIES, taxRegimeFor, type TaxRegime } from "./currency";

/* ===========================================================================
   PRICING ENGINE

   The single place totals are calculated. It runs on the server only, and it
   is called twice on every order: once to render the cart, and again
   immediately before the PaymentIntent is created. The browser never supplies
   an amount - only variant ids and quantities - so there is nothing for it to
   tamper with.

   VAT MODEL
   Displayed prices are VAT-inclusive, as UK and EU consumer law requires.
   That has a consequence people often get wrong: an export sale to a customer
   outside the UK and EU is zero-rated, so the UK VAT element must be *removed*
   rather than simply not added. Otherwise a customer in Sydney quietly pays
   HMRC's 20% and AZMIQ keeps it, which is both an overcharge and a liability.
   =========================================================================== */

export const UK_VAT_RATE = 2000; // basis points

/** Destination VAT for EU OSS. Stripe Tax is authoritative at checkout; this
    table exists so the cart can show an honest figure before that call. */
const EU_VAT_RATES: Record<string, number> = {
  AT: 2000, BE: 2100, BG: 2000, HR: 2500, CY: 1900, CZ: 2100, DK: 2500,
  EE: 2200, FI: 2550, FR: 2000, DE: 1900, GR: 2400, HU: 2700, IE: 2300,
  IT: 2200, LV: 2100, LT: 2100, LU: 1700, MT: 1800, NL: 2100, PL: 2300,
  PT: 2300, RO: 1900, SK: 2300, SI: 2200, ES: 2100, SE: 2500,
};

export function vatRateFor(country: string): number {
  const c = country.toUpperCase();
  if (c === "GB" || c === "IM") return UK_VAT_RATE;
  if ((EU_COUNTRIES as readonly string[]).includes(c)) return EU_VAT_RATES[c] ?? UK_VAT_RATE;
  return 0;
}

/** Extract the tax already contained in a VAT-inclusive amount. */
export function taxFromGross(gross: number, rateBasisPoints: number): number {
  if (rateBasisPoints <= 0) return 0;
  return Math.round((gross * rateBasisPoints) / (10000 + rateBasisPoints));
}

/** Strip the UK VAT element from a display price for a zero-rated export. */
export function netForExport(gross: number): number {
  return gross - taxFromGross(gross, UK_VAT_RATE);
}

export type PricingLine = {
  variantId: string;
  quantity: number;
  /** Per-unit amount actually charged, after any export VAT removal. */
  unitAmount: number;
  compareAtAmount: number | null;
  lineTotal: number;
};

export type PricingInput = {
  items: { variantId: string; quantity: number; unitAmount: number; compareAtAmount: number | null }[];
  currency: Currency;
  /** Undefined until the customer gives an address; UK is assumed for display. */
  country?: string | null;
  shipping?: { amount: number; freeOver: number | null } | null;
  discount?:
    | { type: "percentage"; value: number }
    | { type: "fixed"; value: number }
    | { type: "free_shipping" }
    | null;
};

export type PricingResult = {
  lines: PricingLine[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  /** True when tax is already inside the displayed prices (UK/EU). */
  taxInclusive: boolean;
  regime: TaxRegime;
  vatRate: number;
  savingsTotal: number;
};

export function computeTotals(input: PricingInput): PricingResult {
  const country = (input.country ?? "GB").toUpperCase();
  const zeroRatedExport = vatRateFor(country) === 0;

  const lines: PricingLine[] = input.items.map((item) => {
    const unitAmount = zeroRatedExport ? netForExport(item.unitAmount) : item.unitAmount;
    const compareAtAmount =
      item.compareAtAmount == null
        ? null
        : zeroRatedExport
          ? netForExport(item.compareAtAmount)
          : item.compareAtAmount;
    return {
      variantId: item.variantId,
      quantity: item.quantity,
      unitAmount,
      compareAtAmount,
      lineTotal: unitAmount * item.quantity,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  const savingsTotal = lines.reduce(
    (sum, l) => sum + (l.compareAtAmount && l.compareAtAmount > l.unitAmount
      ? (l.compareAtAmount - l.unitAmount) * l.quantity
      : 0),
    0,
  );

  let discountTotal = 0;
  let freeShipping = false;
  if (input.discount) {
    if (input.discount.type === "percentage") {
      discountTotal = Math.round((subtotal * input.discount.value) / 10000);
    } else if (input.discount.type === "fixed") {
      discountTotal = Math.min(input.discount.value, subtotal);
    } else {
      freeShipping = true;
    }
  }

  const discountedSubtotal = clampToZero(subtotal - discountTotal);

  let shippingTotal = 0;
  if (input.shipping) {
    const qualifiesFree =
      freeShipping ||
      (input.shipping.freeOver !== null && discountedSubtotal >= input.shipping.freeOver);
    shippingTotal = qualifiesFree ? 0 : input.shipping.amount;
  }

  const vatRate = vatRateFor(country);
  const regime = taxRegimeFor(country, discountedSubtotal, input.currency);
  const taxInclusive = vatRate > 0;

  // Inclusive VAT is extracted from the total, not added to it. Shipping is
  // taxed at the same rate as the goods for a single-rate consignment.
  const taxTotal = taxInclusive
    ? taxFromGross(discountedSubtotal + shippingTotal, vatRate)
    : 0;

  const grandTotal = discountedSubtotal + shippingTotal;

  return {
    lines,
    itemCount,
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    grandTotal,
    taxInclusive,
    regime,
    vatRate,
    savingsTotal,
  };
}

/** Stripe wants the amount in the smallest currency unit - the same integer we
    displayed. Passing anything derived from a float here is how stores end up
    charging a penny more than the cart said. */
export function stripeAmount(result: PricingResult): number {
  return result.grandTotal;
}
