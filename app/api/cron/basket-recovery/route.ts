import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/basket-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* Triggered once a day by Vercel Cron (see vercel.json), which sends
   `Authorization: Bearer <CRON_SECRET>`. Without the secret this refuses to
   run at all rather than sending reminders to anyone who can guess the URL. */

function authorised(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  }
  if (!authorised(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const result = await sendDueReminders();
  console.log("[basket-recovery]", result);
  return NextResponse.json({ ok: true, ...result });
}
