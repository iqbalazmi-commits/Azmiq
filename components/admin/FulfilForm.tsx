"use client";

import { useActionState } from "react";
import { Check, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fulfilOrder, type AdminResult } from "@/lib/actions/admin";

export function FulfilForm({
  orderId, trackingNumber, trackingUrl, fulfilled,
}: {
  orderId: string;
  trackingNumber: string;
  trackingUrl: string;
  fulfilled: boolean;
}) {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(fulfilOrder, null);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="orderId" value={orderId} />

      {fulfilled ? (
        <p className="flex items-center gap-2 text-sm text-ink-wellness">
          <Check size={16} aria-hidden="true" />
          Marked as shipped. Saving again updates the tracking details.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="trackingNumber" className="text-sm font-medium text-ink">
            Tracking number
          </label>
          <input
            id="trackingNumber"
            name="trackingNumber"
            defaultValue={trackingNumber}
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base text-ink"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="trackingUrl" className="text-sm font-medium text-ink">
            Tracking link
          </label>
          <input
            id="trackingUrl"
            name="trackingUrl"
            type="url"
            placeholder="https://"
            defaultValue={trackingUrl}
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base text-ink"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              Saving
            </>
          ) : (
            <>
              <Truck size={17} aria-hidden="true" />
              {fulfilled ? "Update tracking" : "Mark as shipped"}
            </>
          )}
        </Button>

        <p role="status" aria-live="polite" className="text-sm">
          {state?.ok ? (
            <span className="text-ink-wellness">{state.message}</span>
          ) : state && !state.ok ? (
            <span className="text-danger">{state.error}</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
