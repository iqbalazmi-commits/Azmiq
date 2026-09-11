import { NextResponse } from "next/server";
import { restoreBasketFromToken } from "@/lib/basket-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The link in a basket reminder. Rebuilds the basket, sets the basket cookie on
   whatever device opened it, and lands on /cart with a note saying what came
   back. Redirects are relative to the request so this works on any host. */

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const result = await restoreBasketFromToken(token);

  if (!result.ok) {
    return NextResponse.redirect(new URL(`/cart?restore=${result.reason}`, request.url));
  }

  const query = new URLSearchParams({ restored: String(result.added) });
  if (result.unavailable.length > 0) query.set("missing", String(result.unavailable.length));
  return NextResponse.redirect(new URL(`/cart?${query}`, request.url));
}
