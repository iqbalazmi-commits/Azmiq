import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/* Shared guard for the daily cron routes. The schedulers (Netlify scheduled
   functions, Vercel Cron, a self-hosted cron) all send
   `Authorization: Bearer <CRON_SECRET>`. Without the secret a route refuses to
   run at all, rather than emailing anyone who can guess the URL. Returns a
   response to send back when the request is refused, or null to carry on. */
export function refuseUnlessCron(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }
  return null;
}
