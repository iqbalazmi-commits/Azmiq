"use client";

import { useDisplayCurrency, writeCookie } from "@/lib/browser-state";
import { CURRENCY_COOKIE } from "@/lib/cookie-names";

export function CurrencySelect({ options }: { options: string[] }) {
  const current = useDisplayCurrency();

  return (
    <>
      <label htmlFor="currency-select" className="sr-only">
        Currency
      </label>
      <select
        id="currency-select"
        name="currency"
        value={current}
        onChange={(event) => {
          // Switch prices on this page immediately, then let the Server Action
          // update the basket.
          writeCookie(CURRENCY_COOKIE, event.currentTarget.value);
          event.currentTarget.form?.requestSubmit();
        }}
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
