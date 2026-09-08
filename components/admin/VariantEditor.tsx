"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateVariant, type AdminResult } from "@/lib/actions/admin";
import { percentSaved } from "@/lib/money";

/* One small form per variant, so saving a price change on the 950ml does not
   risk overwriting an edit someone else just made to the 750ml. */

export function VariantEditor({
  variant,
}: {
  variant: {
    id: string;
    sku: string;
    title: string;
    priceGbp: number;
    compareAtGbp: number | null;
    inventory: number;
  };
}) {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(updateVariant, null);
  const saved = percentSaved(variant.priceGbp, variant.compareAtGbp);

  return (
    <form
      action={formAction}
      className="grid items-end gap-4 rounded-lg border border-border bg-surface-raised p-5 sm:grid-cols-[1fr_auto_auto_auto_auto]"
    >
      <input type="hidden" name="id" value={variant.id} />

      <div>
        <p className="font-medium text-ink">{variant.title}</p>
        <p className="text-xs text-ink-muted">{variant.sku}</p>
        {saved !== null ? (
          <p className="mt-1 text-xs text-ink-wellness">Currently showing “Save {saved}%”</p>
        ) : null}
      </div>

      <NumberField
        name={`price-${variant.id}`}
        formName="price"
        label="Price (£)"
        defaultValue={(variant.priceGbp / 100).toFixed(2)}
      />
      <NumberField
        name={`compare-${variant.id}`}
        formName="compareAt"
        label="Was (£)"
        defaultValue={variant.compareAtGbp ? (variant.compareAtGbp / 100).toFixed(2) : ""}
      />
      <NumberField
        name={`stock-${variant.id}`}
        formName="inventory"
        label="Stock"
        defaultValue={String(variant.inventory)}
        step="1"
      />

      <div className="flex flex-col items-start gap-1">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink disabled:opacity-50"
        >
          {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : "Save"}
        </button>
      </div>

      <p role="status" aria-live="polite" className="text-sm sm:col-span-5">
        {state?.ok ? (
          <span className="flex items-center gap-2 text-ink-wellness">
            <Check size={15} aria-hidden="true" />
            {state.message}
          </span>
        ) : state && !state.ok ? (
          <span className="text-danger">{state.error}</span>
        ) : null}
      </p>
    </form>
  );
}

function NumberField({
  name, formName, label, defaultValue, step = "0.01",
}: {
  name: string;
  formName: string;
  label: string;
  defaultValue: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
      <input
        id={name}
        name={formName}
        type="number"
        inputMode="decimal"
        step={step}
        min="0"
        defaultValue={defaultValue}
        className="h-11 w-28 rounded-md border border-border-control bg-surface px-3 text-base tabular-nums text-ink"
      />
    </div>
  );
}
