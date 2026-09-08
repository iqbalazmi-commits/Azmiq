import { SUPPORTED_CURRENCIES } from "@/lib/money";
import { readCurrency } from "@/lib/cart";
import { setCurrency } from "@/lib/actions/cart";
import { CurrencySelect } from "./CurrencySelect";

/* Rendered on the server so the correct currency is in the HTML on first
   paint - a switcher that hydrates into the right value a second later shows
   the customer a price flicker, which is exactly the wrong first impression
   on a store that sells in five currencies. */

export async function CurrencySwitcher() {
  const current = await readCurrency();
  return (
    <form action={setCurrency} className="hidden sm:block">
      <CurrencySelect current={current} options={[...SUPPORTED_CURRENCIES]} />
      {/* Visible on focus: the no-JS and keyboard path still works. */}
      <button type="submit" className="sr-only-focusable rounded-md bg-surface px-3 py-2 text-sm text-ink">
        Change currency
      </button>
    </form>
  );
}
