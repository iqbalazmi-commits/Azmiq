import { cookies } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { BASE_CURRENCY, type Currency } from "./money";
import { computeTotals, type PricingResult } from "./pricing";
import { resolveCurrency } from "./currency";

export const CART_COOKIE = "azmiq_cart";
export const CURRENCY_COOKIE = "azmiq_currency";
export const COUNTRY_COOKIE = "azmiq_country";

const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
/** A cap that stops a scripted client inflating a line to 10,000 units and
    turning a cart render into a denial of service. */
export const MAX_LINE_QUANTITY = 20;

export type CartLine = {
  id: string;
  variantId: string;
  quantity: number;
  productSlug: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  capacityMl: number | null;
  imageUrl: string | null;
  imageAlt: string;
  unitAmount: number;
  compareAtAmount: number | null;
  lineTotal: number;
  available: boolean;
  /** Stock actually on hand, so the cart can say "only 2 left" honestly. */
  inventory: number;
};

export type CartView = {
  id: string | null;
  token: string | null;
  currency: Currency;
  country: string;
  lines: CartLine[];
  totals: PricingResult;
  discountCode: string | null;
  discountInvalidReason: string | null;
};

export async function readCartToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value ?? null;
}

export async function readCurrency(): Promise<Currency> {
  const jar = await cookies();
  return resolveCurrency(jar.get(CURRENCY_COOKIE)?.value, jar.get(COUNTRY_COOKIE)?.value);
}

export async function readCountry(): Promise<string> {
  const jar = await cookies();
  return (jar.get(COUNTRY_COOKIE)?.value ?? "GB").toUpperCase();
}

/** Called only from Server Actions and Route Handlers - never during render. */
export async function ensureCart(currency: Currency): Promise<{ id: string; token: string }> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;

  if (existing) {
    const [row] = await db.select().from(t.carts).where(eq(t.carts.token, existing)).limit(1);
    if (row) return { id: row.id, token: row.token };
  }

  const token = crypto.randomUUID();
  const [row] = await db.insert(t.carts).values({ token, currency }).returning();
  jar.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
  return { id: row.id, token };
}

async function loadDiscount(code: string | null, subtotal: number) {
  if (!code) return { discount: null, reason: null as string | null };
  const [row] = await db.select().from(t.discounts).where(eq(t.discounts.code, code.toUpperCase())).limit(1);

  if (!row || !row.active) return { discount: null, reason: "That code is not recognised." };
  const now = new Date();
  if (row.startsAt && row.startsAt > now) return { discount: null, reason: "That code is not active yet." };
  if (row.endsAt && row.endsAt < now) return { discount: null, reason: "That code has expired." };
  if (row.usageLimit !== null && row.usedCount >= row.usageLimit) {
    return { discount: null, reason: "That code has been fully redeemed." };
  }
  if (subtotal < row.minSubtotal) {
    return { discount: null, reason: "Your basket does not meet the minimum for that code." };
  }

  if (row.type === "percentage") return { discount: { type: "percentage" as const, value: row.value }, reason: null };
  if (row.type === "fixed") return { discount: { type: "fixed" as const, value: row.value }, reason: null };
  return { discount: { type: "free_shipping" as const }, reason: null };
}

/**
 * Build the full cart view. Prices come from the database on every call, so a
 * price change between adding to the basket and paying is reflected honestly
 * rather than being honoured from a stale snapshot the client held.
 */
export async function getCart(options?: { shippingRateId?: string | null }): Promise<CartView> {
  const token = await readCartToken();
  const currency = await readCurrency();
  const country = await readCountry();

  const empty: CartView = {
    id: null,
    token: null,
    currency,
    country,
    lines: [],
    totals: computeTotals({ items: [], currency, country }),
    discountCode: null,
    discountInvalidReason: null,
  };
  if (!token) return empty;

  const [cart] = await db.select().from(t.carts).where(eq(t.carts.token, token)).limit(1);
  if (!cart) return empty;

  const rows = await db
    .select({
      itemId: t.cartItems.id,
      quantity: t.cartItems.quantity,
      variantId: t.variants.id,
      sku: t.variants.sku,
      variantTitle: t.variants.title,
      capacityMl: t.variants.capacityMl,
      priceGbp: t.variants.priceGbp,
      compareAtGbp: t.variants.compareAtGbp,
      inventory: t.variants.inventory,
      allowBackorder: t.variants.allowBackorder,
      productSlug: t.products.slug,
      productTitle: t.products.title,
      productStatus: t.products.status,
    })
    .from(t.cartItems)
    .innerJoin(t.variants, eq(t.cartItems.variantId, t.variants.id))
    .innerJoin(t.products, eq(t.variants.productId, t.products.id))
    .where(eq(t.cartItems.cartId, cart.id));

  const variantIds = rows.map((r) => r.variantId);
  const prices = variantIds.length
    ? await db.select().from(t.variantPrices).where(
        and(
          eq(t.variantPrices.currency, currency),
          sql`${t.variantPrices.variantId} in ${variantIds}`,
        ),
      )
    : [];

  const images = await db
    .select({ productSlug: t.products.slug, url: t.productImages.url, alt: t.productImages.alt })
    .from(t.productImages)
    .innerJoin(t.products, eq(t.productImages.productId, t.products.id))
    .where(eq(t.productImages.position, 0));

  const lines: CartLine[] = rows
    // An archived product must not remain purchasable through an old basket.
    .filter((r) => r.productStatus === "active")
    .map((r) => {
      const priceRow = prices.find((p) => p.variantId === r.variantId);
      const unitAmount = currency === BASE_CURRENCY ? r.priceGbp : (priceRow?.amount ?? r.priceGbp);
      const compareAtAmount =
        currency === BASE_CURRENCY ? r.compareAtGbp : (priceRow?.compareAt ?? r.compareAtGbp);
      const image = images.find((i) => i.productSlug === r.productSlug);
      return {
        id: r.itemId,
        variantId: r.variantId,
        quantity: r.quantity,
        productSlug: r.productSlug,
        productTitle: r.productTitle,
        variantTitle: r.variantTitle,
        sku: r.sku,
        capacityMl: r.capacityMl,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt ?? r.productTitle,
        unitAmount,
        compareAtAmount: compareAtAmount ?? null,
        lineTotal: unitAmount * r.quantity,
        available: r.inventory > 0 || r.allowBackorder,
        inventory: r.inventory,
      };
    });

  const rawSubtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const { discount, reason } = await loadDiscount(cart.discountCode, rawSubtotal);

  let shipping: { amount: number; freeOver: number | null } | null = null;
  if (options?.shippingRateId) {
    const [rate] = await db
      .select()
      .from(t.shippingRates)
      .where(eq(t.shippingRates.id, options.shippingRateId))
      .limit(1);
    if (rate) shipping = { amount: rate.amount, freeOver: rate.freeOver };
  }

  const totals = computeTotals({
    items: lines.map((l) => ({
      variantId: l.variantId,
      quantity: l.quantity,
      unitAmount: l.unitAmount,
      compareAtAmount: l.compareAtAmount,
    })),
    currency,
    country,
    shipping,
    discount,
  });

  return {
    id: cart.id,
    token: cart.token,
    currency,
    country,
    lines,
    totals,
    discountCode: discount ? cart.discountCode : null,
    discountInvalidReason: reason,
  };
}

/** Cheap count for the header badge - avoids building the whole cart view. */
export async function getCartCount(): Promise<number> {
  const token = await readCartToken();
  if (!token) return 0;
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${t.cartItems.quantity}), 0)` })
    .from(t.cartItems)
    .innerJoin(t.carts, eq(t.cartItems.cartId, t.carts.id))
    .where(eq(t.carts.token, token));
  return Number(row?.total ?? 0);
}
