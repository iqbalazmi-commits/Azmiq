import { createHash } from "node:crypto";
import { minorUnitExponent } from "./money";
import type { Order, OrderItem } from "@/db/schema";

/* ===========================================================================
   SERVER-SIDE PURCHASE TRACKING

   The purchase event is sent from the Stripe webhook, not the browser. That
   matters more than it sounds:

   - it fires even if the customer closed the tab on the Stripe redirect
   - it fires even if an ad blocker removed gtag entirely
   - it fires even if the customer declined analytics cookies, because this is
     a record of a transaction we are legally required to keep, sent without
     any cookie or device identifier

   The trade-off is that GA cannot stitch this to the browsing session unless a
   client id is available, so the event is sent with a deterministic pseudo-id
   derived from the order. Revenue reporting is correct; attribution to a
   specific channel needs the client id, which is only present with consent.
   =========================================================================== */

function major(minor: number, currency: string): number {
  return Number((minor / 10 ** minorUnitExponent(currency)).toFixed(2));
}

export async function recordServerPurchase(order: Order, items: OrderItem[]): Promise<void> {
  await Promise.allSettled([sendGa4Purchase(order, items), sendKlaviyoPlacedOrder(order, items)]);
}

async function sendGa4Purchase(order: Order, items: OrderItem[]): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return;

  // Stable, non-identifying: the same order always produces the same id, and
  // the id cannot be reversed into an email address.
  const clientId = createHash("sha256").update(`azmiq:${order.id}`).digest("hex").slice(0, 20);

  const body = {
    client_id: `${parseInt(clientId.slice(0, 8), 16)}.${parseInt(clientId.slice(8, 16), 16)}`,
    non_personalized_ads: true,
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: String(order.number),
          currency: order.currency,
          value: major(order.grandTotal, order.currency),
          tax: major(order.taxTotal, order.currency),
          shipping: major(order.shippingTotal, order.currency),
          coupon: order.discountCode ?? undefined,
          items: items.map((item) => ({
            item_id: item.sku,
            item_name: item.productTitle,
            item_variant: item.variantTitle,
            price: major(item.unitAmount, order.currency),
            quantity: item.quantity,
          })),
        },
      },
    ],
  };

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      { method: "POST", body: JSON.stringify(body) },
    );
  } catch (error) {
    console.error("[analytics] GA4 purchase failed", error);
  }
}

/**
 * Klaviyo "Placed Order" - the metric post-purchase and win-back flows listen
 * for. Sent server-side so it fires whatever the browser did.
 */
async function sendKlaviyoPlacedOrder(order: Order, items: OrderItem[]): Promise<void> {
  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!key) return;

  const address = order.shippingAddress as Record<string, string> | null;

  const payload = {
    data: {
      type: "event",
      attributes: {
        properties: {
          OrderId: String(order.number),
          Categories: [...new Set(items.map((i) => i.productSlug))],
          ItemNames: items.map((i) => i.productTitle),
          DiscountCode: order.discountCode ?? undefined,
          Items: items.map((item) => ({
            ProductID: item.variantId,
            SKU: item.sku,
            ProductName: item.productTitle,
            Quantity: item.quantity,
            ItemPrice: major(item.unitAmount, order.currency),
            RowTotal: major(item.lineTotal, order.currency),
            ProductURL: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${item.productSlug}`,
            ImageURL: item.imageUrl ?? undefined,
          })),
        },
        value: major(order.grandTotal, order.currency),
        value_currency: order.currency,
        metric: { data: { type: "metric", attributes: { name: "Placed Order" } } },
        profile: {
          data: {
            type: "profile",
            attributes: {
              email: order.email,
              first_name: address?.name?.split(" ")[0],
              location: address
                ? { address1: address.line1, city: address.city, zip: address.postcode, country: address.country }
                : undefined,
            },
          },
        },
      },
    },
  };

  try {
    const response = await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
        revision: "2024-10-15",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error("[analytics] Klaviyo event rejected", response.status, await response.text());
    }
  } catch (error) {
    console.error("[analytics] Klaviyo event failed", error);
  }
}

/** Fired when a PaymentIntent is created - the trigger an abandoned-checkout
    flow listens for. */
export async function recordCheckoutStarted(
  email: string,
  value: number,
  currency: string,
  items: { sku: string; title: string; quantity: number; unitAmount: number }[],
): Promise<void> {
  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!key) return;

  try {
    await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
        revision: "2024-10-15",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties: {
              Items: items.map((i) => ({
                SKU: i.sku,
                ProductName: i.title,
                Quantity: i.quantity,
                ItemPrice: major(i.unitAmount, currency),
              })),
            },
            value: major(value, currency),
            value_currency: currency,
            metric: { data: { type: "metric", attributes: { name: "Started Checkout" } } },
            profile: { data: { type: "profile", attributes: { email } } },
          },
        },
      }),
    });
  } catch (error) {
    console.error("[analytics] Klaviyo checkout-started failed", error);
  }
}
