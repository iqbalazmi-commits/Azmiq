import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { getCartCount } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/auth";
import { MobileNav } from "./MobileNav";
import { CurrencySwitcher } from "./CurrencySwitcher";

export async function Header() {
  const [count, customer] = await Promise.all([getCartCount(), getCurrentCustomer()]);

  return (
    <>
      {/* One quiet line. No countdown, no urgency, no dismiss button to fight. */}
      <div className="bg-surface-inverse text-ink-inverse">
        <p className="container-page py-2.5 text-center text-xs tracking-wide">
          Free UK delivery over £50 &middot; Handmade in small batches &middot; 30-day returns
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-surface-brand text-ink-on-brand">
        <div className="container-page flex h-20 items-center gap-4">
          <MobileNav items={NAV} />

          <Link
            href="/"
            className="flex shrink-0 flex-col leading-none"
            aria-label={`${SITE.name} home`}
          >
            <span className="font-serif text-2xl tracking-[0.28em] text-ink-on-brand">AZMIQ</span>
            <span className="mt-1 text-2xs tracking-widest text-ink-on-inverse-muted">
              {SITE.tagline}
            </span>
          </Link>

          <nav aria-label="Primary" className="ml-8 hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-on-brand/90 underline-offset-8 transition-colors hover:text-ink-on-brand hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <CurrencySwitcher />

            <Link
              href="/search"
              className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            >
              <Search size={20} aria-hidden="true" />
              <span className="sr-only">Search</span>
            </Link>

            <Link
              href={customer ? "/account" : "/account/sign-in"}
              className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            >
              <User size={20} aria-hidden="true" />
              <span className="sr-only">{customer ? "Your account" : "Sign in"}</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {count > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-surface-accent px-1 text-2xs font-semibold tabular-nums text-ink-on-accent"
                >
                  {count}
                </span>
              ) : null}
              <span className="sr-only">
                Basket{count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ", empty"}
              </span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
