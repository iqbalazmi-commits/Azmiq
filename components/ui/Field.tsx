"use client";

import { cn } from "@/lib/utils";

/* ===========================================================================
   FORM FIELDS

   Every field has a real <label> tied by id - never a placeholder standing in
   for one, because placeholder text disappears the moment someone starts
   typing and takes the field's meaning with it.

   Errors are announced through aria-describedby and marked with aria-invalid,
   so a screen reader hears the problem rather than only seeing red. Red is
   used here and nowhere else on the site.
   =========================================================================== */

type BaseProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  autoComplete?: string;
};

const CONTROL =
  "w-full min-h-12 rounded-md border bg-surface-raised px-3.5 py-3 text-base text-ink " +
  "transition-colors placeholder:text-ink-muted/70";

export function Field({
  id, label, value, onChange, required, optional, hint, error, className,
  type = "text", autoComplete, multiline = false,
}: BaseProps & { type?: string; multiline?: boolean }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-ink-muted">(optional)</span> : null}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-ink-muted">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}

      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={3}
          value={value}
          required={required}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(CONTROL, error ? "border-danger" : "border-border-control focus:border-ink")}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(CONTROL, error ? "border-danger" : "border-border-control focus:border-ink")}
        />
      )}

      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  id, label, value, onChange, options, required, hint, error, className, autoComplete,
}: BaseProps & { options: { value: string; label: string }[] }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-ink-muted">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}

      <select
        id={id}
        name={id}
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, "cursor-pointer", error ? "border-danger" : "border-border-control focus:border-ink")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
