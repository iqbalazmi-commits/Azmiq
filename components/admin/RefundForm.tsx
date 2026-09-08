"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { refundOrder, type AdminResult } from "@/lib/actions/admin";
import { formatMoney, type Currency } from "@/lib/money";

/* Refunds move real money, so this form asks for confirmation before it fires
   and the action itself carries an idempotency key - two clicks cannot refund
   twice, whatever the browser does. */

export function RefundForm({
  orderId, maxAmount, currency,
}: {
  orderId: string;
  maxAmount: number;
  currency: Currency;
}) {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(refundOrder, null);
  const [confirming, setConfirming] = useState(false);
  const [amount, setAmount] = useState((maxAmount / 100).toFixed(2));

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="refundAmount" className="text-sm font-medium text-ink">
            Amount to refund
          </label>
          <input
            id="refundAmount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={(maxAmount / 100).toFixed(2)}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base tabular-nums text-ink"
          />
          <p className="text-xs text-ink-muted">
            Maximum {formatMoney(maxAmount, currency)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="refundReason" className="text-sm font-medium text-ink">
            Reason
          </label>
          <input
            id="refundReason"
            name="reason"
            placeholder="Returned, damaged in transit…"
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base text-ink"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="restock"
          defaultChecked
          className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
        />
        <span className="text-ink-muted">
          Put the items back into stock. Untick if they came back damaged.
        </span>
      </label>

      {state && !state.ok ? (
        <p role="alert" className="rounded-md bg-danger-wash p-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="rounded-md bg-surface-sunken p-3 text-sm text-ink-wellness">
          {state.message}
        </p>
      ) : null}

      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md bg-surface-sunken p-4">
          <p className="text-sm text-ink">
            Refund {formatMoney(Math.round(Number(amount || 0) * 100), currency)} to the customer?
            This cannot be undone.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 rounded-md bg-danger px-5 text-sm font-medium text-ink-on-brand hover:opacity-90 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              "Yes, refund"
            )}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="min-h-11 px-3 text-sm text-ink underline underline-offset-4"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="min-h-12 self-start rounded-md border border-border-control px-5 text-sm font-medium text-ink hover:border-ink"
        >
          Refund…
        </button>
      )}
    </form>
  );
}
