"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatMoney, type Currency } from "@/lib/money";
import {
  lookupOrder, submitReturn,
  type LookupResult, type SubmitResult,
} from "@/lib/actions/returns";

const REASONS = [
  { value: "changed-mind", label: "Changed my mind" },
  { value: "not-as-described", label: "Not as described" },
  { value: "arrived-damaged", label: "Arrived damaged" },
  { value: "wrong-item", label: "Wrong item sent" },
  { value: "faulty", label: "Faulty" },
  { value: "other", label: "Something else" },
];

export function ReturnsFlow({ initialOrderNumber }: { initialOrderNumber: string }) {
  const [lookup, lookupAction, looking] = useActionState<LookupResult, FormData>(lookupOrder, null);
  const [submit, submitAction, submitting] = useActionState<SubmitResult, FormData>(submitReturn, null);
  const [email, setEmail] = useState("");

  if (submit?.ok) {
    return (
      <div className="mt-10 rounded-lg border border-border bg-surface-sunken p-6">
        <CheckCircle2 size={26} className="text-ink-wellness" aria-hidden="true" />
        <h2 className="mt-3 font-serif text-2xl text-ink">Return requested</h2>
        <p className="mt-3 leading-relaxed text-ink-muted">
          Your reference is <strong className="text-ink">{submit.rma}</strong>. We have emailed a
          confirmation, and a prepaid label will follow within one working day.
        </p>
      </div>
    );
  }

  if (lookup?.ok) {
    const order = lookup.order;

    if (order.alreadyRequested) {
      return (
        <div className="mt-10 rounded-lg border border-border bg-surface-raised p-6">
          <h2 className="font-serif text-xl text-ink">A return is already in progress</h2>
          <p className="mt-2 leading-relaxed text-ink-muted">
            We already have a return open for order #{order.number}. Check your email for the
            label, or contact us if it has not arrived.
          </p>
        </div>
      );
    }

    return (
      <form action={submitAction} className="mt-10">
        <input type="hidden" name="orderId" value={order.id} />
        <input type="hidden" name="email" value={order.email} />

        <p className="text-sm text-ink-muted">
          Order #{order.number} &middot; {order.daysLeft} days left to return
        </p>

        <fieldset className="mt-6">
          <legend className="font-serif text-xl text-ink">What are you sending back?</legend>
          <ul className="mt-4 flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-control bg-surface-raised p-4">
                  <input
                    type="checkbox"
                    name="items"
                    value={item.id}
                    className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
                  />
                  <span className="flex-1">
                    <span className="block text-ink">{item.title}</span>
                    <span className="block text-sm text-ink-muted">
                      {item.variantTitle} &middot; qty {item.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums text-ink">
                    {formatMoney(item.lineTotal, order.currency as Currency)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="font-serif text-xl text-ink">Why?</legend>
          <p className="mt-1 text-sm text-ink-muted">
            It helps us make better things. You are not being asked to justify the return.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {REASONS.map((reason, index) => (
              <label
                key={reason.value}
                className="cursor-pointer rounded-md border border-border-control bg-surface-raised px-4 py-2.5 text-sm text-ink hover:border-ink has-[:checked]:border-surface-brand has-[:checked]:bg-surface-brand-wash"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  defaultChecked={index === 0}
                  className="sr-only"
                />
                {reason.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="font-serif text-xl text-ink">What would you like?</legend>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {[
              { value: "refund", label: "A refund" },
              { value: "exchange", label: "An exchange" },
            ].map((option, index) => (
              <label
                key={option.value}
                className="cursor-pointer rounded-md border border-border-control bg-surface-raised px-4 py-2.5 text-sm text-ink hover:border-ink has-[:checked]:border-surface-brand has-[:checked]:bg-surface-brand-wash"
              >
                <input
                  type="radio"
                  name="resolution"
                  value={option.value}
                  defaultChecked={index === 0}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-8">
          <label htmlFor="comment" className="text-sm font-medium text-ink">
            Anything else? <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            className="mt-2 w-full rounded-md border border-border-control bg-surface-raised px-3.5 py-3 text-base text-ink"
          />
        </div>

        {submit && !submit.ok ? (
          <p role="alert" className="mt-6 rounded-md bg-danger-wash p-3 text-sm text-danger">
            {submit.error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="mt-8" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Submitting
            </>
          ) : (
            "Request return"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form action={lookupAction} className="mt-10 max-w-md">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="orderNumber" className="text-sm font-medium text-ink">
            Order number
          </label>
          <p className="text-xs text-ink-muted">The number on your receipt, without the #.</p>
          <input
            id="orderNumber"
            name="orderNumber"
            type="text"
            inputMode="numeric"
            required
            defaultValue={initialOrderNumber}
            className="h-12 w-full rounded-md border border-border-control bg-surface-raised px-3.5 text-base text-ink"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lookupEmail" className="text-sm font-medium text-ink">
            Email used for the order
          </label>
          <input
            id="lookupEmail"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-md border border-border-control bg-surface-raised px-3.5 text-base text-ink"
          />
        </div>
      </div>

      {lookup && !lookup.ok ? (
        <p role="alert" className="mt-5 rounded-md bg-danger-wash p-3 text-sm leading-relaxed text-danger">
          {lookup.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-6" disabled={looking}>
        {looking ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Looking up
          </>
        ) : (
          "Find my order"
        )}
      </Button>
    </form>
  );
}
