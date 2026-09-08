/* ===========================================================================
   MONEY

   Every amount in this application is an integer in the currency's minor unit.
   There is no float arithmetic anywhere in the pricing path. Formatting to a
   human string happens once, at the edge, in this file.
   =========================================================================== */

export const SUPPORTED_CURRENCIES = ["GBP", "EUR", "USD", "CAD", "AUD"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
export const BASE_CURRENCY: Currency = "GBP";

/** Zero-decimal currencies have no minor unit. AZMIQ does not sell in one
    today, but Stripe rejects amounts that assume cents for JPY/KRW, so the
    exponent is data rather than an assumption baked into the arithmetic. */
const EXPONENT: Record<string, number> = { JPY: 0, KRW: 0, VND: 0 };

export function minorUnitExponent(currency: string): number {
  return EXPONENT[currency.toUpperCase()] ?? 2;
}

const LOCALE: Record<Currency, string> = {
  GBP: "en-GB",
  EUR: "en-IE",
  USD: "en-US",
  CAD: "en-CA",
  AUD: "en-AU",
};

export function isSupportedCurrency(value: string | undefined | null): value is Currency {
  return !!value && (SUPPORTED_CURRENCIES as readonly string[]).includes(value.toUpperCase());
}

/**
 * Format a minor-unit integer for display.
 * Whole amounts drop the decimals - "£34" reads more considered than "£34.00",
 * and the catalogue is deliberately priced on whole pounds.
 */
export function formatMoney(
  minor: number,
  currency: Currency = BASE_CURRENCY,
  options: { showDecimals?: "auto" | "always" } = {},
): string {
  const exponent = minorUnitExponent(currency);
  const value = minor / 10 ** exponent;
  const isWhole = minor % 10 ** exponent === 0;
  const decimals = options.showDecimals === "always" ? exponent : isWhole ? 0 : exponent;

  return new Intl.NumberFormat(LOCALE[currency] ?? "en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Whole-number percentage saved, floored.
 * Floored on purpose: claiming 30% off when the true figure is 29.6% is a
 * price-marking offence under the UK CPRs, and the rounding is not worth it.
 */
export function percentSaved(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.floor(((compareAt - price) / compareAt) * 100);
}

export function isOnSale(price: number, compareAt: number | null | undefined): boolean {
  return !!compareAt && compareAt > price;
}

/**
 * Unit price per litre. Lets a customer compare a 500ml bottle against a 950ml
 * one honestly, and it is the comparator UK price-marking guidance expects for
 * volume-based goods.
 */
export function pricePerLitre(
  minor: number,
  capacityMl: number | null | undefined,
  currency: Currency = BASE_CURRENCY,
): string | null {
  if (!capacityMl || capacityMl <= 0) return null;
  const perLitreMinor = Math.round((minor / capacityMl) * 1000);
  return `${formatMoney(perLitreMinor, currency, { showDecimals: "always" })} per litre`;
}

/** Apply a percentage held as basis points * 100 (i.e. 15% is stored as 1500). */
export function applyPercentage(minor: number, percentTimes100: number): number {
  return Math.round((minor * percentTimes100) / 10000);
}

/** Never let a computed total go negative, whatever the discount stack says. */
export function clampToZero(minor: number): number {
  return minor < 0 ? 0 : minor;
}

/** Parse a human-entered price ("34", "34.50", "£34.50") into minor units. */
export function parseMoneyInput(input: string, currency: Currency = BASE_CURRENCY): number | null {
  const cleaned = input.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  if (!cleaned || Number.isNaN(Number(cleaned))) return null;
  return Math.round(Number(cleaned) * 10 ** minorUnitExponent(currency));
}
