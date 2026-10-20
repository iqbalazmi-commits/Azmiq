import { HeaderShell } from "./HeaderShell";
import { CurrencySwitcher } from "./CurrencySwitcher";

/* The header is in the root layout, so anything it reads per request makes
   every page on the site render per request. It reads nothing on the server:
   basket count, account state and currency all come from cookies in the
   browser (lib/browser-state.ts). */

export function Header() {
  return <HeaderShell currencySwitcher={<CurrencySwitcher />} />;
}
