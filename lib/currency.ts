import { BASE_CURRENCY, isSupportedCurrency, type Currency } from "./money";

/* ===========================================================================
   MULTI-CURRENCY & SHIPPING GEOGRAPHY

   AZMIQ sells worldwide. Currency is a *presentment* decision made from the
   customer's country; the settlement currency is whatever Stripe is configured
   for. Prices per currency are hand-set in `variant_prices` - never converted
   at request time - so a bottle is GBP 34 / EUR 39 / USD 42, not EUR 39.87.
   =========================================================================== */

export const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
] as const;

const COUNTRY_CURRENCY: Record<string, Currency> = {
  GB: "GBP", IM: "GBP", JE: "GBP", GG: "GBP",
  US: "USD", PR: "USD",
  CA: "CAD",
  AU: "AUD", NZ: "AUD",
  ...Object.fromEntries(EU_COUNTRIES.map((c) => [c, "EUR" as Currency])),
};

export function currencyForCountry(country: string | null | undefined): Currency {
  if (!country) return BASE_CURRENCY;
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? BASE_CURRENCY;
}

export function resolveCurrency(
  explicit: string | null | undefined,
  country?: string | null,
): Currency {
  if (isSupportedCurrency(explicit)) return explicit.toUpperCase() as Currency;
  return currencyForCountry(country);
}

/* --------------------------------------------------------------------------
   TAX AND DUTIES

   Stripe Tax computes the actual figures. These helpers only decide what the
   customer is *told* before they pay, which is a legal requirement in its own
   right: a UK seller shipping DDU to the US must not imply the price at
   checkout is the final cost of delivery.
   -------------------------------------------------------------------------- */

export type TaxRegime = "uk-vat" | "eu-ioss" | "eu-standard" | "row-ddu";

/** IOSS covers EU consignments at or under EUR 150 (intrinsic value). */
export const IOSS_THRESHOLD_EUR_MINOR = 15000;

export function taxRegimeFor(country: string, subtotalMinor: number, currency: Currency): TaxRegime {
  const c = country.toUpperCase();
  if (c === "GB" || c === "IM") return "uk-vat";
  if ((EU_COUNTRIES as readonly string[]).includes(c)) {
    const underThreshold = currency === "EUR" && subtotalMinor <= IOSS_THRESHOLD_EUR_MINOR;
    return underThreshold ? "eu-ioss" : "eu-standard";
  }
  return "row-ddu";
}

export function dutiesNoticeFor(regime: TaxRegime): string | null {
  switch (regime) {
    case "uk-vat":
      return null;
    case "eu-ioss":
      return "Import VAT is collected at checkout under IOSS. Nothing further to pay on delivery.";
    case "eu-standard":
      return "Import VAT and any customs charges are collected by the carrier before delivery.";
    case "row-ddu":
      return "Shipped duties unpaid. Import duties and local taxes are payable to the carrier on delivery and are not included in this total.";
  }
}

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "CH", name: "Switzerland" },
  { code: "NO", name: "Norway" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
];

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code.toUpperCase())?.name ?? code;
}
