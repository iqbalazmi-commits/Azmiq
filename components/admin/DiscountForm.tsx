"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createDiscount, type AdminResult } from "@/lib/actions/admin";

export function DiscountForm() {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(createDiscount, null);
  const [type, setType] = useState("percentage");

  return (
    <form action={formAction} className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code" className="text-sm font-medium text-ink">
            Code
          </label>
          <input
            id="code"
            name="code"
            required
            placeholder="SPRING10"
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base uppercase tracking-wide text-ink"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm font-medium text-ink">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-12 rounded-md border border-border-control bg-surface px-3 text-base text-ink"
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
            <option value="free_shipping">Free delivery</option>
          </select>
        </div>

        {type !== "free_shipping" ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="value" className="text-sm font-medium text-ink">
              {type === "percentage" ? "Percentage" : "Amount off (£)"}
            </label>
            <input
              id="value"
              name="value"
              type="number"
              step={type === "percentage" ? "1" : "0.01"}
              min="0"
              required
              className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base tabular-nums text-ink"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="minSubtotal" className="text-sm font-medium text-ink">
            Minimum basket (£)
          </label>
          <p className="text-xs text-ink-muted">Leave empty for no minimum.</p>
          <input
            id="minSubtotal"
            name="minSubtotal"
            type="number"
            step="0.01"
            min="0"
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base tabular-nums text-ink"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="usageLimit" className="text-sm font-medium text-ink">
            Total uses allowed
          </label>
          <p className="text-xs text-ink-muted">Leave empty for unlimited.</p>
          <input
            id="usageLimit"
            name="usageLimit"
            type="number"
            step="1"
            min="1"
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base tabular-nums text-ink"
          />
        </div>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="mt-4 rounded-md bg-danger-wash p-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="mt-4 text-sm text-ink-wellness">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="mt-5" disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            Creating
          </>
        ) : (
          "Create code"
        )}
      </Button>
    </form>
  );
}
