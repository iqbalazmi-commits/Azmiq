import { NextResponse } from "next/server";
import { suppressByToken } from "@/lib/basket-recovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Two doors, on purpose.

   POST is RFC 8058 one-click unsubscribe: Gmail and Yahoo POST here when
   someone presses "Unsubscribe" beside the sender name, and they now expect it
   from anyone sending in volume.

   GET never unsubscribes. Mail security scanners fetch every link in a message
   before a human sees it; if GET opted people out, reminders would switch
   themselves off unread. GET goes to a page with a button instead. */

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  await suppressByToken(token);
  return new NextResponse(null, { status: 200 });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return NextResponse.redirect(
    new URL(`/basket/unsubscribe?token=${encodeURIComponent(token)}`, request.url),
  );
}
