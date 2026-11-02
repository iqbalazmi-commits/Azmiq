"use client";

import { useEffect } from "react";
import { readCookie, writeCookie } from "@/lib/browser-state";
import { CART_COUNT_COOKIE, SIGNED_IN_COOKIE } from "@/lib/cookie-names";

/* Dropped onto the few server-rendered pages that already know the truth
   (basket, order confirmation, account). They correct the browser-readable
   hints the static header shows, which covers changes made where no cookie
   could be set - a Stripe webhook emptying the basket, a restored basket, a
   session that predates the hint cookie. */

function useSync(name: string, value: string | null) {
  useEffect(() => {
    if (value === null) {
      if (readCookie(name) !== null) writeCookie(name, "", 0);
    } else if (readCookie(name) !== value) {
      writeCookie(name, value, 60 * 60 * 24 * 30);
    }
  }, [name, value]);
}

export function CartCountSync({ count }: { count: number }) {
  useSync(CART_COUNT_COOKIE, String(count));
  return null;
}

export function SignedInSync({ signedIn }: { signedIn: boolean }) {
  useSync(SIGNED_IN_COOKIE, signedIn ? "1" : null);
  return null;
}
