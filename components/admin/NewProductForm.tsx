"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createProduct, type AdminResult } from "@/lib/actions/admin";

/* Only what a product needs to exist. Photos come next, on the product's own
   page, and everything else (strapline, care notes, Google listing) can be
   filled in there later. */

type Category = { id: string; title: string; slug: string };

export function NewProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(createProduct, null);

  // Submitted by hand rather than through <form action>, because React clears
  // a form after an action runs - a "tick a section" error would otherwise
  // wipe everything the owner had just typed.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
      <Field name="title" label="Name" required help="e.g. Hammered Copper Mug. Shown on the product page and in Google." />

      <div className="grid gap-6 sm:grid-cols-3">
        <Field name="price" label="Price (£)" required inputMode="decimal" placeholder="24.99" />
        <Field name="compareAt" label="Was price (£)" inputMode="decimal"
          help="Optional. Only if it is on sale." />
        <Field name="inventory" label="Stock" inputMode="numeric" defaultValue="10" />
      </div>

      <Field name="summary" label="Short description"
        help="One sentence. Appears under the price and as the Google search snippet." />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-ink">
          Full description
        </label>
        <p id="description-help" className="text-xs text-ink-muted">
          Leave a blank line between paragraphs.
        </p>
        <textarea
          id="description"
          name="description"
          rows={6}
          aria-describedby="description-help"
          className="rounded-md border border-border-control bg-surface-raised px-3.5 py-3 text-base text-ink"
        />
      </div>

      <fieldset className="rounded-lg border border-border bg-surface-raised p-5">
        <legend className="px-2 text-sm font-medium text-ink">Sections</legend>
        <p className="mt-1 px-2 text-sm text-ink-muted">Which shop sections it appears in. Tick at least one.</p>
        <div className="mt-4 grid gap-3 px-2 sm:grid-cols-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
              />
              <span className="font-medium text-ink">{category.title}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Creating
            </>
          ) : (
            "Create product and add photos"
          )}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {state && !state.ok ? <span className="text-danger">{state.error}</span> : null}
        </p>
      </div>
    </form>
  );
}

function Field({
  name, label, help, required, inputMode, placeholder, defaultValue,
}: {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  inputMode?: "decimal" | "numeric";
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      {help ? (
        <p id={`${name}-help`} className="text-xs text-ink-muted">
          {help}
        </p>
      ) : null}
      <input
        id={name}
        name={name}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-describedby={help ? `${name}-help` : undefined}
        className="h-12 rounded-md border border-border-control bg-surface-raised px-3.5 text-base text-ink"
      />
    </div>
  );
}
