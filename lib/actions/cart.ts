"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import * as t from "@/db/schema";
import {
  CART_COOKIE, COUNTRY_COOKIE, CURRENCY_COOKIE, MAX_LINE_QUANTITY,
  ensureCart, readCartToken, readCurrency,
} from "@/lib/cart";
import { SUPPORTED_CURRENCIES } from "@/lib/money";
import { COUNTRIES } from "@/lib/currency";

/* ===========================================================================
   CART ACTIONS

   Every input is validated with a schema before it reaches the database. The
   client sends a variant id and a quantity - never a price, never a title,
   never a total. Anything else it sends is ignored.
   =========================================================================== */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const addSchema = z.object({
  variantId: z.string().uuid("Unknown product."),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY),
});

export async function addToCart(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = addSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity") ?? 1,
  });
  if (!parsed.success) {
    return { ok: false, error: "That option is no longer available. Please refresh and try again." };
  }

  const [variant] = await db
    .select({
      id: t.variants.id,
      inventory: t.variants.inventory,
      allowBackorder: t.variants.allowBackorder,
      title: t.variants.title,
      productTitle: t.products.title,
      status: t.products.status,
    })
    .from(t.variants)
    .innerJoin(t.products, eq(t.variants.productId, t.products.id))
    .where(eq(t.variants.id, parsed.data.variantId))
    .limit(1);

  if (!variant || variant.status !== "active") {
    return { ok: false, error: "That product is no longer available." };
  }

  const currency = await readCurrency();
  const cart = await ensureCart(currency);

  const [existing] = await db
    .select()
    .from(t.cartItems)
    .where(and(eq(t.cartItems.cartId, cart.id), eq(t.cartItems.variantId, variant.id)))
    .limit(1);

  const desired = Math.min((existing?.quantity ?? 0) + parsed.data.quantity, MAX_LINE_QUANTITY);

  // Stock is checked here for a fast, honest message, and checked AGAIN inside
  // the transaction that creates the order. Between the two, someone else may
  // have taken the last one.
  if (!variant.allowBackorder && desired > variant.inventory) {
    if (variant.inventory === 0) {
      return { ok: false, error: `${variant.productTitle} is out of stock.` };
    }
    return {
      ok: false,
      error: `Only ${variant.inventory} left in stock. We have set your basket to ${variant.inventory}.`,
    };
  }

  if (existing) {
    await db.update(t.cartItems).set({ quantity: desired }).where(eq(t.cartItems.id, existing.id));
  } else {
    await db.insert(t.cartItems).values({
      cartId: cart.id,
      variantId: variant.id,
      quantity: parsed.data.quantity,
    });
  }
  await db.update(t.carts).set({ updatedAt: new Date() }).where(eq(t.carts.id, cart.id));

  revalidatePath("/", "layout");
  return { ok: true, message: `${variant.productTitle} added to your basket.` };
}

const updateSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(MAX_LINE_QUANTITY),
});

export async function updateCartItem(formData: FormData): Promise<void> {
  const parsed = updateSchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return;

  const token = await readCartToken();
  if (!token) return;

  // Scoped by cart token so an item id from someone else's basket does nothing.
  const [item] = await db
    .select({ id: t.cartItems.id })
    .from(t.cartItems)
    .innerJoin(t.carts, eq(t.cartItems.cartId, t.carts.id))
    .where(and(eq(t.cartItems.id, parsed.data.itemId), eq(t.carts.token, token)))
    .limit(1);
  if (!item) return;

  if (parsed.data.quantity === 0) {
    await db.delete(t.cartItems).where(eq(t.cartItems.id, item.id));
  } else {
    await db.update(t.cartItems).set({ quantity: parsed.data.quantity }).where(eq(t.cartItems.id, item.id));
  }
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData): Promise<void> {
  const itemId = String(formData.get("itemId") ?? "");
  const token = await readCartToken();
  if (!token || !itemId) return;

  const [item] = await db
    .select({ id: t.cartItems.id })
    .from(t.cartItems)
    .innerJoin(t.carts, eq(t.cartItems.cartId, t.carts.id))
    .where(and(eq(t.cartItems.id, itemId), eq(t.carts.token, token)))
    .limit(1);
  if (item) await db.delete(t.cartItems).where(eq(t.cartItems.id, item.id));

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function applyDiscountCode(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  const token = await readCartToken();
  if (!token) return { ok: false, error: "Your basket is empty." };

  if (!raw) {
    await db.update(t.carts).set({ discountCode: null }).where(eq(t.carts.token, token));
    revalidatePath("/cart");
    return { ok: true, message: "Discount removed." };
  }

  const [discount] = await db.select().from(t.discounts).where(eq(t.discounts.code, raw)).limit(1);
  if (!discount || !discount.active) return { ok: false, error: "That code is not recognised." };

  await db.update(t.carts).set({ discountCode: raw }).where(eq(t.carts.token, token));
  revalidatePath("/cart");
  return { ok: true, message: `Code ${raw} applied.` };
}

export async function removeDiscountCode(): Promise<void> {
  const token = await readCartToken();
  if (!token) return;
  await db.update(t.carts).set({ discountCode: null }).where(eq(t.carts.token, token));
  revalidatePath("/cart");
}

/* ------------------------------------------------------- LOCALE SWITCHING */

export async function setCurrency(formData: FormData): Promise<void> {
  const value = String(formData.get("currency") ?? "").toUpperCase();
  if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(value)) return;

  const jar = await cookies();
  jar.set(CURRENCY_COOKIE, value, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  const token = jar.get(CART_COOKIE)?.value;
  if (token) await db.update(t.carts).set({ currency: value }).where(eq(t.carts.token, token));

  revalidatePath("/", "layout");
}

export async function setCountry(formData: FormData): Promise<void> {
  const value = String(formData.get("country") ?? "").toUpperCase();
  if (!COUNTRIES.some((c) => c.code === value)) return;

  const jar = await cookies();
  jar.set(COUNTRY_COOKIE, value, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  revalidatePath("/", "layout");
  revalidatePath("/checkout");
}

/** Merge a guest basket into the account basket on sign-in, so a customer who
    fills a basket and then signs in does not watch it disappear. */
export async function attachCartToCustomer(customerId: string): Promise<void> {
  const token = await readCartToken();
  if (!token) return;
  await db
    .update(t.carts)
    .set({ customerId })
    .where(and(eq(t.carts.token, token), sql`${t.carts.customerId} is null`));
}
