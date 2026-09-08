import { NextResponse } from "next/server";
import { consumeLoginToken, createCustomerSession, findOrCreateCustomer } from "@/lib/auth";
import { attachCartToCustomer } from "@/lib/actions/cart";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Consumes a magic-link token exactly once and starts a session. A used or
   expired token is indistinguishable from an invalid one in the response, so
   the link cannot be probed for validity after the fact. */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const nextParam = url.searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";

  if (!token) {
    return NextResponse.redirect(`${SITE.url}/account/sign-in?error=invalid`);
  }

  const email = await consumeLoginToken(token);
  if (!email) {
    return NextResponse.redirect(`${SITE.url}/account/sign-in?error=expired`);
  }

  const customer = await findOrCreateCustomer(email);
  await createCustomerSession(customer.id);
  await attachCartToCustomer(customer.id);

  return NextResponse.redirect(`${SITE.url}${next}`);
}
