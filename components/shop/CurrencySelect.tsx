"use client";

import { useRef } from "react";

export function CurrencySelect({ current, options }: { current: string; options: string[] }) {
  const ref = useRef<HTMLSelectElement>(null);

  return (
    <>
      <label htmlFor="currency-select" className="sr-only">
        Currency
      </label>
      <select
        id="currency-select"
        ref={ref}
        name="currency"
        defaultValue={current}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-11 cursor-pointer rounded-md border border-white/25 bg-transparent px-2 text-sm text-ink-on-brand hover:border-white/60"
      >
        {options.map((code) => (
          // The option list is painted by the OS, so it needs its own colours.
          <option key={code} value={code} className="bg-surface text-ink">
            {code}
          </option>
        ))}
      </select>
    </>
  );
}
