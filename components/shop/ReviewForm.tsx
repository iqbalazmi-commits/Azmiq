"use client";

import { useActionState, useState } from "react";
import { Loader2, PenLine, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitReview, type ReviewResult } from "@/lib/actions/reviews";

/* Anyone can write a review. It is held for moderation, so nothing here trusts
   the input — the honeypot, the length limits and the "pending" status on the
   server do the work. The star control is a real radio group so it is usable
   with a keyboard and announced properly. */

const FIELD =
  "w-full rounded-md border border-border-control bg-surface px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-ink-muted focus-visible:border-ink";

export function ReviewForm({
  productId,
  productSlug,
  defaultName = "",
  defaultEmail = "",
}: {
  productId: string;
  productSlug: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, formAction, pending] = useActionState<ReviewResult, FormData>(submitReview, null);

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-border bg-surface-sunken p-6 text-sm text-ink">
        <p className="font-medium">Review received</p>
        <p className="mt-1 text-ink-muted">{state.message}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <PenLine size={15} aria-hidden="true" />
        Write a review
      </Button>
    );
  }

  const shown = hover || rating;

  return (
    <form action={formAction} className="max-w-xl rounded-lg border border-border bg-surface p-6 md:p-8">
      <h3 className="font-serif text-xl tracking-tight text-ink">Write a review</h3>
      <p className="mt-1 text-sm text-ink-muted">
        Reviews are checked by a person before they appear.
      </p>

      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />

      {/* Honeypot — off-screen, not announced, skipped by keyboard. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-ink">Your rating</legend>
        <div
          className="mt-2 flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="cursor-pointer p-0.5"
              onMouseEnter={() => setHover(n)}
            >
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
              />
              <span className="sr-only">
                {n} star{n === 1 ? "" : "s"}
              </span>
              <Star
                size={26}
                aria-hidden="true"
                className={
                  n <= shown ? "fill-[var(--color-surface-wellness)] text-[var(--color-surface-wellness)]" : "text-border-strong"
                }
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Name</span>
          <input name="authorName" required defaultValue={defaultName} maxLength={60} className={`mt-1.5 ${FIELD}`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Location <span className="text-ink-muted">(optional)</span></span>
          <input name="authorLocation" maxLength={60} placeholder="e.g. London" className={`mt-1.5 ${FIELD}`} />
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-ink">Headline <span className="text-ink-muted">(optional)</span></span>
        <input name="title" maxLength={120} placeholder="Sum it up in a few words" className={`mt-1.5 ${FIELD}`} />
      </label>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-ink">Your review</span>
        <textarea
          name="body"
          required
          rows={5}
          minLength={20}
          maxLength={2000}
          placeholder="What did you think? How are you using it?"
          className={`mt-1.5 ${FIELD} resize-y`}
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-ink">Email <span className="text-ink-muted">(optional)</span></span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          maxLength={200}
          placeholder="you@example.com"
          className={`mt-1.5 ${FIELD}`}
        />
        <span className="mt-1 block text-xs text-ink-muted">
          Give the address you ordered with and we can mark your review a verified purchase. Not published.
        </span>
      </label>

      {state && !state.ok ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={pending || rating === 0}>
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            "Submit review"
          )}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Cancel
        </button>
      </div>
      {rating === 0 ? (
        <p className="mt-2 text-xs text-ink-muted">Choose a star rating to submit.</p>
      ) : null}
    </form>
  );
}
