"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/* Shown when a render throws. It says what a customer can do next rather than
   showing a stack trace, and it never claims their order failed - the webhook
   is the source of truth for that, not this page. */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <div className="container-page py-24">
      <div className="max-w-xl">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-ink">
          We could not load that page
        </h1>
        <hr className="rule-accent mt-7" />
        <p className="mt-6 leading-relaxed text-ink-muted">
          This is our fault, not yours. Try again - and if you were in the middle of paying, check
          your email before retrying, because the payment may well have gone through.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-md border border-border-control bg-surface-raised px-6 text-base font-medium text-ink hover:border-ink"
          >
            Go to the home page
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-8 text-xs text-ink-muted">
            If you contact us, quote reference <code>{error.digest}</code>.
          </p>
        ) : null}
      </div>
    </div>
  );
}
