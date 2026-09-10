"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, ShoppingBag } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { addToCart, type ActionResult } from "@/lib/actions/cart";
import { toMajorUnits, track, trackKlaviyo } from "@/lib/analytics";
import type { CatalogueProduct } from "@/lib/data";

/* The interactive half of the product page. Variant choice changes the price,
   the stock line and the SKU that gets posted - everything else on the page is
   server-rendered around it.

   The server recomputes the price when the form is submitted. Nothing here is
   trusted: the panel posts a variant id and a quantity, and that is all. */

export function PurchasePanel({ product }: { product: CatalogueProduct }) {
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(addToCart, null);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const multiple = product.variants.length > 1;

  // view_item fires once per product, after consent has been checked inside
  // track(). Firing it per variant change would inflate the funnel.
  useEffect(() => {
    if (!variant) return;
    track("view_item", {
      currency: variant.price.currency,
      value: toMajorUnits(variant.price.amount),
      items: [{
        item_id: variant.sku,
        item_name: product.title,
        item_variant: variant.title,
        item_category: product.categorySlugs[0],
        price: toMajorUnits(variant.price.amount),
        quantity: 1,
      }],
    });
    trackKlaviyo("Viewed Product", {
      ProductName: product.title,
      ProductID: product.id,
      SKU: variant.sku,
      Categories: product.categorySlugs,
      Price: toMajorUnits(variant.price.amount),
      URL: typeof window !== "undefined" ? window.location.href : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  useEffect(() => {
    if (state?.ok && variant) {
      track("add_to_cart", {
        currency: variant.price.currency,
        value: toMajorUnits(variant.price.amount),
        items: [{
          item_id: variant.sku,
          item_name: product.title,
          item_variant: variant.title,
          price: toMajorUnits(variant.price.amount),
          quantity: 1,
        }],
      });
      trackKlaviyo("Added to Cart", { ProductName: product.title, SKU: variant.sku });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!variant) return null;

  return (
    <div>
      <Price
        amount={variant.price.amount}
        compareAt={variant.price.compareAt}
        currency={variant.price.currency}
        capacityMl={variant.capacityMl ?? product.capacityMl}
        size="lg"
        showUnitPrice
      />

      <form action={formAction} className="mt-8">
        <input type="hidden" name="variantId" value={variant.id} />
        <input type="hidden" name="quantity" value={1} />

        {multiple ? (
          <fieldset className="mb-7">
            <legend className="eyebrow mb-3">
              {product.variants.some((v) => v.capacityMl)
                ? "Capacity"
                : product.categorySlugs.includes("leather-jackets")
                  ? "Size"
                  : "Option"}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((option) => {
                const selected = option.id === variant.id;
                return (
                  <label
                    key={option.id}
                    className={
                      "cursor-pointer rounded-md border px-4 py-3 text-sm transition-colors " +
                      (selected
                        ? "border-surface-brand bg-surface-brand-wash text-ink"
                        : "border-border-control bg-surface-raised text-ink hover:border-ink") +
                      (option.available ? "" : " opacity-50")
                    }
                  >
                    <input
                      type="radio"
                      name="variantChoice"
                      value={option.id}
                      checked={selected}
                      onChange={() => setVariantId(option.id)}
                      className="sr-only"
                    />
                    {option.title}
                    {!option.available ? <span className="ml-1.5 text-xs">(sold out)</span> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {/* Stock language is specific and honest. "Only 3 left" when there are
            three; nothing at all when there are plenty. No invented scarcity. */}
        <p className="mb-5 flex items-center gap-2 text-sm">
          {variant.available ? (
            <>
              <Check size={16} className="text-ink-wellness" aria-hidden="true" />
              <span className="text-ink-wellness">
                {variant.inventory > 0 && variant.inventory <= 5
                  ? `In stock — only ${variant.inventory} left`
                  : "In stock, ready to ship"}
              </span>
            </>
          ) : (
            <span className="text-ink-muted">
              Out of stock.{" "}
              <Link href="/contact" className="text-ink-brand underline underline-offset-4">
                Ask us when it is back
              </Link>
            </span>
          )}
        </p>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending || !variant.available}
        >
          {pending ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Adding
            </>
          ) : (
            <>
              <ShoppingBag size={18} aria-hidden="true" />
              Add to basket
            </>
          )}
        </Button>

        <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm">
          {state?.ok ? (
            <span className="flex items-center gap-2 text-ink-wellness">
              <Check size={16} aria-hidden="true" />
              {state.message}{" "}
              <Link href="/cart" className="underline underline-offset-4">
                View basket
              </Link>
            </span>
          ) : state && !state.ok ? (
            <span className="text-danger">{state.error}</span>
          ) : null}
        </p>
      </form>
    </div>
  );
}
