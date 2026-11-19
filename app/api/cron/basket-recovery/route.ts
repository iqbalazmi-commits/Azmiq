import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/basket-recovery";
import { refuseUnlessCron } from "@/lib/cron-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* Triggered once a day by Vercel Cron (vercel.json) or, on Netlify, by the
   scheduled function in netlify/functions/basket-recovery.mjs. */

export async function GET(request: Request) {
  const refused = refuseUnlessCron(request);
  if (refused) return refused;

  const result = await sendDueReminders();
  console.log("[basket-recovery]", result);
  return NextResponse.json({ ok: true, ...result });
}
