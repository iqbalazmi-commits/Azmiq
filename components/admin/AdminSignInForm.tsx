"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminSignIn, type AdminResult } from "@/lib/actions/admin";

export function AdminSignInForm() {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(adminSignIn, null);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base text-ink"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-password" className="text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-12 rounded-md border border-border-control bg-surface px-3.5 text-base text-ink"
        />
      </div>

      {state && !state.ok ? (
        <p role="alert" className="rounded-md bg-danger-wash p-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Checking
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
