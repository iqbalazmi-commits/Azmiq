import { SUPPORTED_CURRENCIES } from "@/lib/money";
import { setCurrency } from "@/lib/actions/cart";
import { CurrencySelect } from "./CurrencySelect";

/* The selected currency is read in the browser (CurrencySelect), not here, so
   the header stays static. Prices on static pages switch instantly from the
   hand-set figures shipped with the page; the Server Action only keeps an
   existing basket in step. */

export function CurrencySwitcher() {
  return (
    <form action={setCurrency} className="hidden sm:block">
      <CurrencySelect options={[...SUPPORTED_CURRENCIES]} />
      {/* Visible on focus: the no-JS and keyboard path still works. */}
      <button type="submit" className="sr-only-focusable rounded-md bg-surface px-3 py-2 text-sm text-ink">
        Change currency
      </button>
    </form>
  );
}
