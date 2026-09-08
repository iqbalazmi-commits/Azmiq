import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { dutiesNoticeFor, taxRegimeFor } from "./currency";
import type { Currency } from "./money";

export type ShippingOption = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  freeOver: number | null;
  minDeliveryDays: number | null;
  maxDeliveryDays: number | null;
  zoneName: string;
};

export const getShippingZones = cache(async () => {
  const zones = await db.select().from(t.shippingZones).orderBy(asc(t.shippingZones.position));
  const rates = await db.select().from(t.shippingRates).orderBy(asc(t.shippingRates.position));
  return zones.map((z) => ({ ...z, rates: rates.filter((r) => r.zoneId === z.id) }));
});

/** Most specific zone wins; "*" is the rest-of-world fallback so no country is
    ever left with an empty shipping list at checkout. */
export async function shippingOptionsFor(country: string): Promise<ShippingOption[]> {
  const zones = await getShippingZones();
  const code = country.toUpperCase();
  const zone =
    zones.find((z) => z.countries.includes(code)) ??
    zones.find((z) => z.countries.includes("*"));
  if (!zone) return [];

  return zone.rates.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    amount: r.amount,
    freeOver: r.freeOver,
    minDeliveryDays: r.minDeliveryDays,
    maxDeliveryDays: r.maxDeliveryDays,
    zoneName: zone.name,
  }));
}

export async function shippingRateById(id: string) {
  const [row] = await db.select().from(t.shippingRates).where(eq(t.shippingRates.id, id)).limit(1);
  return row ?? null;
}

/** Plain-language delivery estimate. "3-5 working days" beats a date the
    carrier has not actually promised. */
export function deliveryEstimate(option: ShippingOption): string | null {
  const { minDeliveryDays: min, maxDeliveryDays: max } = option;
  if (!min && !max) return null;
  if (min && max && min !== max) return `${min}-${max} working days`;
  const single = max ?? min;
  return `${single} working ${single === 1 ? "day" : "days"}`;
}

export function dutiesNoticeForCountry(country: string, subtotal: number, currency: Currency) {
  return dutiesNoticeFor(taxRegimeFor(country, subtotal, currency));
}
