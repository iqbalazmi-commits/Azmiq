"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requestMagicLink, type AuthResult } from "@/lib/actions/auth";

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    requestMagicLink,
    null,
  );

  if (state?.ok) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-surface-sunken p-6">
        <Mail size={22} className="text-ink-wellness" aria-hidden="true" />
        <p role="status" className="mt-3 leading-relaxed text-ink">
          {state.message}
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          The link expires in 20 minutes and works once. If it does not arrive, check your spam
          folder before requesting another.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="email" className="text-sm font-medium text-ink">
        Email
        <span aria-hidden="true" className="ml-1 text-ink-muted">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        aria-describedby="signin-status"
        aria-invalid={state && !state.ok ? true : undefined}
        className="mt-2 h-12 w-full rounded-md border border-border-control bg-surface-raised px-3.5 text-base text-ink"
      />

      <p id="signin-status" role="status" aria-live="polite" className="mt-2 min-h-5 text-sm">
        {state && !state.ok ? <span className="text-danger">{state.error}</span> : null}
      </p>

      <Button type="submit" size="lg" className="mt-4 w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Sending
          </>
        ) : (
          "Email me a sign-in link"
        )}
      </Button>
    </form>
  );
}
