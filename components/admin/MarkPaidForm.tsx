"use client";

import { useActionState, useState } from "react";
import { BadgePoundSterling, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { markOrderPaid, type AdminResult } from "@/lib/actions/admin";

/* Confirming a bank transfer takes stock down and emails the customer a
   receipt, and there is no undo. So it asks once - a mis-click here posts goods
   for money that never arrived. */
export function MarkPaidForm({
  orderId, amount, reference,
}: {
  orderId: string;
  amount: string;
  reference: string;
}) {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(markOrderPaid, null);
  const [confirming, setConfirming] = useState(false);

  if (state?.ok) {
    return (
      <p role="status" className="mt-4 text-sm text-ink-wellness">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="orderId" value={orderId} />

      {!confirming ? (
        <Button type="button" onClick={() => setConfirming(true)}>
          <BadgePoundSterling size={17} aria-hidden="true" />
          Mark as paid
        </Button>
      ) : (
        <div className="rounded-md border border-border-control bg-surface p-4">
          <p className="text-sm leading-relaxed text-ink">
            Confirm you can see <strong>{amount}</strong> in your account with reference{" "}
            <strong>{reference}</strong>.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            This reduces stock and emails the customer their receipt. It cannot be undone.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                  Confirming
                </>
              ) : (
                "Yes, the money has arrived"
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <p role="status" aria-live="polite" className="mt-3 text-sm">
        {state && !state.ok ? <span className="text-danger">{state.error}</span> : null}
      </p>
    </form>
  );
}
