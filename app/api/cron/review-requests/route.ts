import { NextResponse } from "next/server";
import { sendDueReviewRequests } from "@/lib/review-requests";
import { refuseUnlessCron } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* Triggered once a day, on Netlify by netlify/functions/review-requests.mjs.
   Sends the one review request each shipped order gets. */

export async function GET(request: Request) {
  const refused = refuseUnlessCron(request);
  if (refused) return refused;

  const result = await sendDueReviewRequests();
  console.log("[review-requests]", result);
  return NextResponse.json({ ok: true, ...result });
}
