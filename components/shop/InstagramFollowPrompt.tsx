"use client";

import { useEffect, useRef } from "react";
import { Instagram, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

/* A one-time "follow us on Instagram" card on the order confirmation page.

   It waits a moment so the customer first sees that their order went through,
   and it shows once per order: a refresh, or coming back to the page from the
   receipt email, does not bring it back. It is a native <dialog>, so focus,
   Escape and the backdrop behave as people expect, with no library. */

const DELAY_MS = 1800;
const handle = SITE.social.instagram.replace(/\/+$/, "").split("/").pop() ?? "azmiquk";

export function InstagramFollowPrompt({ orderNumber, firstName }: { orderNumber: number; firstName?: string | null }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const key = `azmiq:ig-prompt:${orderNumber}`;
    try {
      if (window.localStorage.getItem(key)) return;
    } catch {
      // Private browsing or blocked storage: still show it, just once per visit.
    }
    const timer = window.setTimeout(() => {
      const dialog = ref.current;
      if (!dialog || dialog.open) return;
      dialog.showModal();
      try {
        window.localStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [orderNumber]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="ig-prompt-title"
      // Clicking the dimmed backdrop closes it, as people expect.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border border-border bg-surface-raised p-0 text-ink shadow-xl backdrop:bg-black/50"
    >
      <div className="relative px-7 pb-7 pt-9 text-center">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:text-ink"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-brand-wash text-ink-brand">
          <Instagram size={26} aria-hidden="true" />
        </span>

        <h2 id="ig-prompt-title" className="mt-5 font-serif text-2xl leading-tight text-ink">
          {firstName ? `Thank you, ${firstName}!` : "Thank you!"}
          <br />
          Come and say hello on Instagram
        </h2>
        <hr className="rule-accent mx-auto mt-5" />
        <p className="mt-5 text-sm leading-relaxed text-ink-muted">
          Follow us for new pieces first, a look behind the scenes with our artisans, and ideas for
          your copper and leather.
        </p>

        <a
          href={SITE.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className={buttonStyles("primary", "lg", "mt-7 w-full")}
        >
          <Instagram size={18} aria-hidden="true" />
          Follow @{handle}
        </a>
        <button
          type="button"
          onClick={close}
          className="mt-3 min-h-11 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Maybe later
        </button>
      </div>
    </dialog>
  );
}
