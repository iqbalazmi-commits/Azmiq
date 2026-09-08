"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createRedirect, type AdminResult } from "@/lib/actions/admin";

export function RedirectForm() {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(createRedirect, null);

  return (
    <form action={formAction} className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fromPath" className="text-sm font-medium text-ink">
            Old address
          </label>
          <p className="text-xs text-ink-muted">Everything after the domain, e.g. /products/old-bottle</p>
          <input
            id="fromPath"
            name="fromPath"
            required
            placeholder="/products/old-handle"
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 font-mono text-sm text-ink"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="toPath" className="text-sm font-medium text-ink">
            Goes to
          </label>
          <p className="text-xs text-ink-muted">
            Point it at the closest product or collection — never the home page.
          </p>
          <input
            id="toPath"
            name="toPath"
            required
            placeholder="/products/new-handle"
            className="h-12 rounded-md border border-border-control bg-surface px-3.5 font-mono text-sm text-ink"
          />
        </div>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="mt-4 rounded-md bg-danger-wash p-3 text-sm leading-relaxed text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="mt-4 text-sm text-ink-wellness">{state.message}</p>
      ) : null}

      <Button type="submit" className="mt-5" disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            Adding
          </>
        ) : (
          "Add redirect"
        )}
      </Button>
    </form>
  );
}
