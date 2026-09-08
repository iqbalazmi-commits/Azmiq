"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { applyDiscountCode, removeDiscountCode, type ActionResult } from "@/lib/actions/cart";

export function DiscountForm({
  currentCode,
  invalidReason,
}: {
  currentCode: string | null;
  invalidReason: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    applyDiscountCode,
    null,
  );

  if (currentCode) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-pill border border-border-control bg-surface-raised px-4 py-2 text-sm text-ink">
          {currentCode} applied
        </span>
        <form action={removeDiscountCode}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            <X size={14} aria-hidden="true" />
            Remove discount
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 max-w-sm">
      <label htmlFor="discount-code" className="eyebrow">
        Discount code
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="discount-code"
          name="code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-describedby="discount-status"
          aria-invalid={state && !state.ok ? true : undefined}
          className="h-12 min-w-0 flex-1 rounded-md border border-border-control bg-surface-raised px-3 text-sm uppercase tracking-wide text-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 shrink-0 rounded-md border border-border-control bg-surface-raised px-5 text-sm font-medium text-ink hover:border-ink disabled:opacity-50"
        >
          {pending ? "Checking" : "Apply"}
        </button>
      </div>

      <p id="discount-status" role="status" aria-live="polite" className="mt-2 min-h-5 text-sm">
        {state && !state.ok ? (
          <span className="text-danger">{state.error}</span>
        ) : invalidReason ? (
          <span className="text-danger">{invalidReason}</span>
        ) : state?.ok && state.message ? (
          <span className="text-ink-wellness">{state.message}</span>
        ) : null}
      </p>
    </form>
  );
}
