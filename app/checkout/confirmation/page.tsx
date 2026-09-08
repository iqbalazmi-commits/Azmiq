import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Check, Clock } from "lucide-react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney, type Currency } from "@/lib/money";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* The page a customer lands on after paying. It reports what the database
   says; it never writes. If the webhook has not arrived yet - usually a second
   or two - it says so plainly rather than inventing a status, and the customer
   is told their payment went through either way, because it did. */

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const intentId = typeof params.payment_intent === "string" ? params.payment_intent : null;

  if (!intentId) {
    return (
      <Shell title="We could not find that order">
        <p className="mt-4 text-ink-muted">
          If you have just paid, check your email for the receipt. Anything unexpected and we will
          sort it out.
        </p>
        <ButtonLink href="/contact" className="mt-8">
          Contact us
        </ButtonLink>
      </Shell>
    );
  }

  const [order] = await db
    .select()
    .from(t.orders)
    .where(eq(t.orders.stripePaymentIntentId, intentId))
    .limit(1);

  if (!order) {
    return (
      <Shell title="Payment received">
        <p className="mt-4 text-ink-muted">
          We are still matching your payment to an order. Your receipt will arrive by email shortly
          — nothing further is needed from you.
        </p>
      </Shell>
    );
  }

  const items = await db.select().from(t.orderItems).where(eq(t.orderItems.orderId, order.id));
  const currency = order.currency as Currency;
  const address = order.shippingAddress as Record<string, string> | null;
  const settled = order.status !== "pending";

  return (
    <Shell
      title={settled ? "Thank you — your order is confirmed" : "Payment received"}
      icon={settled ? "check" : "clock"}
    >
      <p className="mt-4 text-lg text-ink-muted">
        Order <strong className="text-ink">#{order.number}</strong>. A receipt is on its way to{" "}
        <strong className="text-ink">{order.email}</strong>.
      </p>

      {!settled ? (
        <p className="mt-4 rounded-md bg-surface-sunken p-4 text-sm leading-relaxed text-ink-muted">
          Your payment has gone through. We are finishing the last step of confirming it, which
          usually takes a few seconds. You do not need to pay again or refresh.
        </p>
      ) : null}

      <div className="mt-10 rounded-lg border border-border bg-surface-raised p-6 text-left">
        <h2 className="font-serif text-xl text-ink">What you ordered</h2>
        <ul className="mt-5 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
              <span>
                <span className="text-ink">{item.productTitle}</span>
                <span className="block text-ink-muted">
                  {item.variantTitle} &middot; qty {item.quantity}
                </span>
              </span>
              <span className="tabular-nums text-ink">{formatMoney(item.lineTotal, currency)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 border-t border-border pt-5 text-sm">
          <Row label="Subtotal" value={formatMoney(order.subtotal, currency)} />
          {order.discountTotal > 0 ? (
            <Row label="Discount" value={`−${formatMoney(order.discountTotal, currency)}`} />
          ) : null}
          <Row
            label="Delivery"
            value={order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal, currency)}
          />
          <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
            <dt className="font-serif text-lg text-ink">Total paid</dt>
            <dd className="font-serif text-lg tabular-nums text-ink">
              {formatMoney(order.grandTotal, currency)}
            </dd>
          </div>
          {order.taxTotal > 0 ? (
            <p className="text-xs text-ink-muted">
              Includes {formatMoney(order.taxTotal, currency)} VAT
            </p>
          ) : null}
        </dl>

        {address ? (
          <div className="mt-6 border-t border-border pt-5">
            <h3 className="text-sm font-medium text-ink">Delivering to</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {address.name}
              <br />
              {address.line1}
              <br />
              {address.line2 ? (
                <>
                  {address.line2}
                  <br />
                </>
              ) : null}
              {address.city}
              <br />
              {address.postcode}
            </p>
            {order.shippingMethod ? (
              <p className="mt-3 text-sm text-ink-muted">{order.shippingMethod}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/collections/all">Continue shopping</ButtonLink>
        <ButtonLink href="/copper-care" variant="secondary">
          Copper care guide
        </ButtonLink>
      </div>

      <p className="mt-8 text-sm text-ink-muted">
        Track this order any time from{" "}
        <Link href="/account/orders" className="text-ink-brand underline underline-offset-4">
          your account
        </Link>
        , or start a return within 30 days.
      </p>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function Shell({
  title, children, icon = "check",
}: {
  title: string;
  children: React.ReactNode;
  icon?: "check" | "clock";
}) {
  const Icon = icon === "clock" ? Clock : Check;
  return (
    <div className="container-page py-20 text-center">
      <div className="mx-auto max-w-xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-surface-wellness text-ink-on-brand">
          <Icon size={26} aria-hidden="true" />
        </span>
        <h1 className="mt-7 font-serif text-4xl leading-tight text-ink">{title}</h1>
        <hr className="rule-accent mx-auto mt-7" />
        {children}
      </div>
    </div>
  );
}
