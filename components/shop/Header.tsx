import { getCartCount } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/auth";
import { HeaderShell } from "./HeaderShell";
import { CurrencySwitcher } from "./CurrencySwitcher";

export async function Header() {
  const [count, customer] = await Promise.all([getCartCount(), getCurrentCustomer()]);
  return (
    <HeaderShell
      cartCount={count}
      signedIn={!!customer}
      currencySwitcher={<CurrencySwitcher />}
    />
  );
}
