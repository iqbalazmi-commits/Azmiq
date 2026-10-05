"use client";

import { useSyncExternalStore } from "react";
import { resolveCurrency } from "./currency";
import { BASE_CURRENCY, type Currency } from "./money";
import type { CataloguePrice } from "./catalogue";
import {
  CART_COUNT_COOKIE, COUNTRY_COOKIE, CURRENCY_COOKIE, SIGNED_IN_COOKIE,
} from "./cookie-names";

/* ===========================================================================
   BROWSER STATE

   Storefront pages are static: one HTML file, served from Vercel's cache to
   every visitor, with no server code running per request. Anything that
   differs per visitor - currency, basket count, signed-in state - is read
   here, in the browser, from cookies.

   The server snapshot is always the default (GBP, empty basket, signed out),
   so hydration never mismatches; the real value is applied straight after.
   =========================================================================== */

const CHANGE_EVENT = "azmiq:cookies";

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export function writeCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 180) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure}`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  // A Server Action that sets a cookie, or another tab, is picked up when the
  // page regains focus.
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

/** Tell subscribers to re-read cookies, e.g. after a Server Action set one. */
export function notifyCookieChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useCookie(name: string): string | null {
  return useSyncExternalStore(subscribe, () => readCookie(name), () => null);
}

export function useDisplayCurrency(): Currency {
  const explicit = useCookie(CURRENCY_COOKIE);
  const country = useCookie(COUNTRY_COOKIE);
  return explicit || country ? resolveCurrency(explicit, country) : BASE_CURRENCY;
}

/** The price in the visitor's currency, falling back to the price as given. */
export function useLocalPrice(price: CataloguePrice): CataloguePrice {
  const currency = useDisplayCurrency();
  if (currency === price.currency) return price;
  const local = price.byCurrency?.[currency];
  return local ? { ...local, currency, byCurrency: price.byCurrency } : price;
}

export function useCartCount(): number {
  const raw = useCookie(CART_COUNT_COOKIE);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function useSignedIn(): boolean {
  return useCookie(SIGNED_IN_COOKIE) === "1";
}
