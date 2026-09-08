/* ===========================================================================
   FUNNEL ANALYTICS (client)

   GA4 ecommerce event names, so the standard reports work without remapping:
   view_item -> add_to_cart -> begin_checkout -> purchase.

   `purchase` is deliberately NOT sent from here. It is sent server-side from
   the Stripe webhook, because a browser event can be lost to an ad blocker, a
   closed tab, or a declined cookie banner - and revenue you cannot see is
   worse than revenue attributed slightly late.
   =========================================================================== */

import { readConsentFromDocument } from "./consent";

type Item = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_category?: string;
  price: number;      // major units, as GA4 expects
  quantity?: number;
};

type Payload = {
  currency: string;
  value: number;      // major units
  items: Item[];
  [key: string]: unknown;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    _learnq?: unknown[];
  }
}

function canTrack(): boolean {
  return typeof window !== "undefined" && !!readConsentFromDocument()?.analytics;
}

export function toMajorUnits(minor: number, exponent = 2): number {
  return Number((minor / 10 ** exponent).toFixed(exponent));
}

export function track(event: "view_item" | "add_to_cart" | "begin_checkout" | "view_cart" | "select_item", payload: Payload) {
  if (!canTrack()) return;
  window.gtag?.("event", event, payload);
}

/** Klaviyo's equivalents, for flows like abandoned browse and abandoned cart.
    Gated on marketing consent separately from analytics. */
export function trackKlaviyo(event: string, properties: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!readConsentFromDocument()?.marketing) return;
  window._learnq = window._learnq || [];
  window._learnq.push(["track", event, properties]);
}
