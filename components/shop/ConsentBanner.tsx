"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { readConsentFromDocument, writeConsentToDocument } from "@/lib/consent";

/* A banner, not a wall. It sits at the bottom, it does not cover the page, and
   Reject is the same size and weight as Accept. Nothing is pre-ticked. */

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!readConsentFromDocument()) setVisible(true);
  }, []);

  useEffect(() => {
    if (visible) ref.current?.focus();
  }, [visible]);

  function decide(next: { analytics: boolean; marketing: boolean }) {
    writeConsentToDocument(next);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-surface-raised shadow-panel"
    >
      <div className="container-page py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <h2 id="consent-heading" className="font-serif text-lg text-ink">
              Cookies
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              We use essential cookies to run the basket and checkout. With your permission we
              would also like to use analytics cookies to understand how the site is used, and
              marketing cookies to measure our advertising. Nothing optional is loaded until you
              choose.{" "}
              <Link href="/policies/cookies" className="text-ink-brand underline underline-offset-4">
                Read our cookie policy
              </Link>
              .
            </p>

            {showDetail ? (
              <fieldset className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                <legend className="sr-only">Choose which cookies to allow</legend>

                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]" />
                  <span>
                    <span className="font-medium text-ink">Essential</span>
                    <span className="block text-ink-muted">
                      Basket, checkout, sign-in and security. Always on - the site cannot work
                      without them.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
                  />
                  <span>
                    <span className="font-medium text-ink">Analytics</span>
                    <span className="block text-ink-muted">
                      Google Analytics. Tells us which pages are useful and where people get stuck.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
                  />
                  <span>
                    <span className="font-medium text-ink">Marketing</span>
                    <span className="block text-ink-muted">
                      Klaviyo on-site tracking, used to measure campaigns and tailor emails.
                    </span>
                  </span>
                </label>
              </fieldset>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            {showDetail ? (
              <button
                type="button"
                onClick={() => decide({ analytics, marketing })}
                className="min-h-12 rounded-md bg-surface-brand px-6 text-sm font-medium text-ink-on-brand hover:bg-surface-brand-hover"
              >
                Save choices
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowDetail(true)}
                className="min-h-12 rounded-md border border-border-control bg-surface-raised px-6 text-sm font-medium text-ink hover:border-ink"
              >
                Choose
              </button>
            )}
            {/* Equal prominence: same size, same weight, adjacent. */}
            <button
              type="button"
              onClick={() => decide({ analytics: false, marketing: false })}
              className="min-h-12 rounded-md border border-border-control bg-surface-raised px-6 text-sm font-medium text-ink hover:border-ink"
            >
              Reject optional
            </button>
            <button
              type="button"
              onClick={() => decide({ analytics: true, marketing: true })}
              className="min-h-12 rounded-md bg-surface-brand px-6 text-sm font-medium text-ink-on-brand hover:bg-surface-brand-hover"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
