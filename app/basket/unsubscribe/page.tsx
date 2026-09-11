import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { emailForToken } from "@/lib/basket-recovery";
import { stopBasketReminders } from "@/lib/actions/basket";

export const metadata: Metadata = {
  title: "Basket reminders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* A button rather than an instant opt-out on page load, because mail scanners
   visit links before people do. See app/api/basket/unsubscribe/route.ts. */

/** "iqbal.azmi@gmail.com" -> "i•••••••••@gmail.com". Links get forwarded; the
    page should confirm whose address it is without publishing it. */
function mask(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "your address";
  return `${local.slice(0, 1)}${"•".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

export default async function BasketUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const done = params.done === "1";
  const email = token ? await emailForToken(token) : null;

  return (
    <div className="container-page py-24">
      <div className="mx-auto max-w-lg text-center">
        {done ? (
          <>
            <h1 className="font-serif text-4xl leading-tight text-ink">You will not hear from us about baskets</h1>
            <hr className="rule-accent mx-auto mt-7" />
            <p className="mt-6 leading-relaxed text-ink-muted">
              Basket reminders are switched off for {email ? mask(email) : "that address"}, including
              any future basket. Order receipts and delivery updates still arrive as normal.
            </p>
          </>
        ) : email ? (
          <>
            <h1 className="font-serif text-4xl leading-tight text-ink">Stop basket reminders?</h1>
            <hr className="rule-accent mx-auto mt-7" />
            <p className="mt-6 leading-relaxed text-ink-muted">
              We send at most one reminder when a basket is left at checkout. Stop them for{" "}
              <strong className="text-ink">{mask(email)}</strong>, now and for any future basket.
            </p>
            <form action={stopBasketReminders} className="mt-9">
              <input type="hidden" name="token" value={token} />
              <Button type="submit" size="lg">
                Stop basket reminders
              </Button>
            </form>
            <p className="mt-5 text-sm text-ink-muted">
              Receipts and delivery updates are not affected.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-4xl leading-tight text-ink">That link did not work</h1>
            <hr className="rule-accent mx-auto mt-7" />
            <p className="mt-6 leading-relaxed text-ink-muted">
              It may have been copied incompletely. Reply to the email and we will switch reminders off
              by hand.
            </p>
          </>
        )}
        <p className="mt-10">
          <Link href="/" className="text-sm text-ink-brand underline underline-offset-4">
            Back to the shop
          </Link>
        </p>
      </div>
    </div>
  );
}
