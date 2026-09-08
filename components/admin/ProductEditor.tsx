"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateProduct, type AdminResult } from "@/lib/actions/admin";

/* Written for someone who has never used a CMS: plain labels, an explanation
   under each field of where the text actually appears on the shop, and no
   jargon. "Slug" is called "Web address" because that is what it is. */

type Product = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  description: string;
  wellnessStory: string;
  careInstructions: string;
  finish: string;
  dimensions: string;
  status: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
};

export function ProductEditor({ product }: { product: Product }) {
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(updateProduct, null);

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-6">
      <input type="hidden" name="id" value={product.id} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Text name="title" label="Name" defaultValue={product.title} required
          help="Shown on the product page, product cards and in Google." />
        <Text name="slug" label="Web address" defaultValue={product.slug} required
          help="The bit after /products/. Changing it creates a redirect from the old address automatically." />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Text name="subtitle" label="Strapline" defaultValue={product.subtitle}
          help="One short line under the name, e.g. “The one that started it”." />
        <Text name="finish" label="Finish" defaultValue={product.finish}
          help="Used as the eyebrow label and as a filter on collection pages." />
      </div>

      <Text name="summary" label="Short description" defaultValue={product.summary}
        help="One sentence. Appears under the price and as the Google search snippet." />

      <Textarea name="description" label="Full description" defaultValue={product.description} rows={6}
        help="Leave a blank line between paragraphs. Appears in the “About this piece” section." />

      <Textarea name="wellnessStory" label="Ayurvedic story" defaultValue={product.wellnessStory} rows={5}
        help="The dark editorial section. Leave empty to hide that section entirely." />

      <Textarea name="careInstructions" label="Care instructions" defaultValue={product.careInstructions} rows={5}
        help="Copper care specific to this piece. Leave empty to hide the care section." />

      <Text name="dimensions" label="Dimensions" defaultValue={product.dimensions}
        help="e.g. 26cm tall x 7.5cm diameter. Shown in the specification table." />

      <fieldset className="rounded-lg border border-border bg-surface-raised p-5">
        <legend className="px-2 text-sm font-medium text-ink">Visibility</legend>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium text-ink">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              className="h-12 max-w-xs rounded-md border border-border-control bg-surface px-3 text-base text-ink"
            >
              <option value="active">Published — visible in the shop</option>
              <option value="draft">Draft — hidden, but the URL still works</option>
              <option value="archived">Archived — hidden and removed from the sitemap</option>
            </select>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product.featured}
              className="mt-1 h-4 w-4 accent-[var(--color-surface-brand)]"
            />
            <span>
              <span className="font-medium text-ink">Feature on the home page</span>
              <span className="block text-ink-muted">
                Featured products fill the “The pieces we would buy” row.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-border bg-surface-raised p-5">
        <legend className="px-2 text-sm font-medium text-ink">Google listing</legend>
        <p className="mt-1 px-2 text-sm text-ink-muted">
          Leave these empty and we use the name and short description, which is usually right.
        </p>
        <div className="mt-4 flex flex-col gap-6">
          <Text name="seoTitle" label="Title in search results" defaultValue={product.seoTitle}
            help="Around 60 characters before Google truncates it." />
          <Text name="seoDescription" label="Description in search results" defaultValue={product.seoDescription}
            help="Around 155 characters." />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Saving
            </>
          ) : (
            "Save changes"
          )}
        </Button>

        <p role="status" aria-live="polite" className="text-sm">
          {state?.ok ? (
            <span className="flex items-center gap-2 text-ink-wellness">
              <Check size={16} aria-hidden="true" />
              {state.message}
            </span>
          ) : state && !state.ok ? (
            <span className="text-danger">{state.error}</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

function Text({
  name, label, defaultValue, help, required,
}: {
  name: string;
  label: string;
  defaultValue: string;
  help?: string;
  required?: boolean;
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
        defaultValue={defaultValue}
        required={required}
        aria-describedby={help ? `${name}-help` : undefined}
        className="h-12 rounded-md border border-border-control bg-surface-raised px-3.5 text-base text-ink"
      />
    </div>
  );
}

function Textarea({
  name, label, defaultValue, help, rows = 4,
}: {
  name: string;
  label: string;
  defaultValue: string;
  help?: string;
  rows?: number;
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
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-describedby={help ? `${name}-help` : undefined}
        className="rounded-md border border-border-control bg-surface-raised px-3.5 py-3 text-base leading-relaxed text-ink"
      />
    </div>
  );
}
