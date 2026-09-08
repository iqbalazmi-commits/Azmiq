"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { FOOTER_LINKS } from "@/lib/site";

/* The only reason this is a Client Component is the open/closed state. It
   keeps focus inside the panel while open, closes on Escape and on navigation,
   and returns focus to the trigger - the four things a disclosure menu has to
   do to be usable without a mouse. */

export function MobileNav({ items }: { items: readonly { title: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-white/10 lg:hidden"
      >
        <Menu size={22} aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-surface-inverse/55"
          />
          <div
            ref={panelRef}
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-surface p-6 shadow-panel"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl tracking-[0.28em] text-ink">AZMIQ</span>
              <button
                type="button"
                onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
                className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-surface-sunken"
              >
                <X size={22} aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>

            <nav aria-label="Primary" className="mt-8">
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li key={item.href} className="border-b border-border">
                    <Link href={item.href} className="block py-4 font-serif text-xl text-ink">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Help" className="mt-8">
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.help.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-ink-muted">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
