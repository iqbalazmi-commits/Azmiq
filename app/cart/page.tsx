import type { Metadata } from "next";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Media } from "@/components/ui/Media";
import { ButtonLink } from "@/components/ui/Button";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { DiscountForm } from "@/components/shop/DiscountForm";
import { getCart } from "@/lib/cart";
import { removeCartItem, updateCartItem } from "@/lib/actions/cart";
import { formatMoney } from "@/lib/money";
import { MAX_LINE_QUANTITY } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Your basket",
  robots: { index: false, follow: false },
};

// The basket is per-visitor; nothing about it may be cached or prerendered.
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="container-page py-28 text-center">
        <h1 className="font-serif text-4xl text-ink">Your basket is empty</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-muted">
          Nothing in here yet. The water bottles are the place most people start.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/collections/copper-water-bottles" size="lg">
            Shop water bottles
          </ButtonLink>
          <ButtonLink href="/collections/all" variant="secondary" size="lg">
            Browse everything
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-serif text-4xl text-ink">Your basket</h1>
      <hr className="rule-accent mt-6" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <section aria-label="Basket contents">
          <ul className="divide-y divide-border border-y border-border">
            {cart.lines.map((line) => (
              <li key={line.id} className="grid grid-cols-[5.5rem_1fr] gap-5 py-6 sm:grid-cols-[7rem_1fr]">
                <Link href={`/products/${line.productSlug}`} className="block">
                  {line.imageUrl ? (
                    <Media
                      src={line.imageUrl}
                      alt={line.imageAlt}
                      width={400}
                      height={500}
                      sizes="112px"
                      aspect="portrait"
                      className="rounded-md border border-border"
                    />
                  ) : null}
                </Link>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-lg text-ink">
                        <Link href={`/products/${line.productSlug}`} className="underline-offset-4 hover:underline">
                          {line.productTitle}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {line.variantTitle} &middot; {line.sku}
                      </p>
                    </div>
                    <p className="text-base font-medium tabular-nums text-ink">
                      {formatMoney(line.lineTotal, cart.currency)}
                    </p>
                  </div>

                  {!line.available ? (
                    <p className="text-sm text-danger">
                      Out of stock — remove this to continue to checkout.
                    </p>
                  ) : line.inventory > 0 && line.inventory <= 3 ? (
                    <p className="text-sm text-ink-wellness">Only {line.inventory} left</p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
                    {/* Quantity as three small forms rather than a JS stepper:
                        it works before hydration and without JavaScript. */}
                    <div className="flex items-center rounded-md border border-border-control">
                      <QuantityButton
                        itemId={line.id}
                        quantity={line.quantity - 1}
                        label={`Decrease quantity of ${line.productTitle}`}
                        disabled={line.quantity <= 1}
                      >
                        <Minus size={15} aria-hidden="true" />
                      </QuantityButton>

                      <span className="min-w-10 text-center text-sm tabular-nums text-ink">
                        <span className="sr-only">Quantity: </span>
                        {line.quantity}
                      </span>

                      <QuantityButton
                        itemId={line.id}
                        quantity={line.quantity + 1}
                        label={`Increase quantity of ${line.productTitle}`}
                        disabled={line.quantity >= MAX_LINE_QUANTITY}
                      >
                        <Plus size={15} aria-hidden="true" />
                      </QuantityButton>
                    </div>

                    <form action={removeCartItem}>
                      <input type="hidden" name="itemId" value={line.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Remove
                        <span className="sr-only"> {line.productTitle} from basket</span>
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <DiscountForm
            currentCode={cart.discountCode}
            invalidReason={cart.discountInvalidReason}
          />
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary cart={cart} />

          <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
            Checkout
          </ButtonLink>

          <p className="mt-3 text-center text-sm text-ink-muted">
            No account needed — guest checkout available
          </p>

          <p className="mt-6 text-center text-xs leading-relaxed text-ink-muted">
            Taxes and delivery are calculated at checkout.
            <br />
            Secure payment by Stripe. Apple Pay and Google Pay accepted.
          </p>

          <Link
            href="/collections/all"
            className="mt-6 block text-center text-sm text-ink-brand underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function QuantityButton({
  itemId, quantity, label, disabled, children,
}: {
  itemId: string;
  quantity: number;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={updateCartItem}>
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="quantity" value={quantity} />
      <button
        type="submit"
        disabled={disabled}
        className="flex h-11 w-11 items-center justify-center text-ink disabled:opacity-40"
      >
        {children}
        <span className="sr-only">{label}</span>
      </button>
    </form>
  );
}
