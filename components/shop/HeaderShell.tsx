"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { MobileNav } from "./MobileNav";
import { Logo } from "./Logo";

/* Minimalist navbar: navigation on the left, logo dead centre, search and cart
   on the right. Solid crisp white, a hairline border that deepens into a soft
   shadow once the page scrolls. */

export function HeaderShell({
  cartCount,
  signedIn,
  currencySwitcher,
}: {
  cartCount: number;
  signedIn: boolean;
  currencySwitcher: ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="border-b border-[color-mix(in_srgb,var(--color-accent-gold)_30%,transparent)] bg-surface-inverse text-ink-inverse">
        <p className="container-page py-2.5 text-center text-2xs uppercase tracking-widest text-ink-inverse/80">
          £10 delivery worldwide &nbsp;·&nbsp; Free UK over £50 &nbsp;·&nbsp; 30-day returns
        </p>
      </div>

      <header
        className={
          "sticky top-0 z-50 bg-surface transition-shadow duration-300 " +
          (scrolled ? "shadow-[0_1px_0_var(--color-border),0_10px_30px_-20px_rgb(24_24_27/0.25)]" : "border-b border-border")
        }
      >
        <div className="container-page grid h-[4.75rem] grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* left — navigation */}
          <div className="flex items-center justify-self-start">
            <div className="lg:hidden">
              <MobileNav items={NAV} />
            </div>
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={
                          "text-[0.72rem] uppercase tracking-widest underline-offset-[10px] transition-colors " +
                          (active
                            ? "text-ink underline decoration-2 decoration-[var(--color-accent-gold)]"
                            : "text-ink-muted hover:text-ink")
                        }
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* centre — logo */}
          <Link href="/" className="justify-self-center" aria-label={`${SITE.name} home`}>
            <Logo on="light" />
          </Link>

          {/* right — utilities */}
          <div className="flex items-center gap-1 justify-self-end sm:gap-1.5">
            <div className="hidden sm:block">{currencySwitcher}</div>

            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-sm text-ink transition-colors hover:text-accent-hover"
            >
              <Search size={19} aria-hidden="true" />
              <span className="sr-only">Search</span>
            </Link>

            <Link
              href={signedIn ? "/account" : "/account/sign-in"}
              className="hidden h-10 w-10 items-center justify-center rounded-sm text-ink transition-colors hover:text-accent-hover sm:flex"
            >
              <User size={19} aria-hidden="true" />
              <span className="sr-only">{signedIn ? "Your account" : "Sign in"}</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-sm text-ink transition-colors hover:text-accent-hover"
            >
              <ShoppingBag size={19} aria-hidden="true" />
              {cartCount > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[0.6rem] font-semibold tabular-nums text-ink-on-brand"
                >
                  {cartCount}
                </span>
              ) : null}
              <span className="sr-only">
                Basket{cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ", empty"}
              </span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
