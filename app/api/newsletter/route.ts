import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

/* Subscribes through our own server rather than Klaviyo's onsite script, so an
   address is only sent to a third party once someone has actually asked to
   subscribe - and so the form still works when marketing cookies are declined.

   Klaviyo's subscription endpoint sends its own double opt-in confirmation,
   which is what makes the consent record defensible under PECR. */

const schema = z.object({ email: z.string().email().max(200) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const key = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!key || !listId) {
    console.log(`[newsletter] would subscribe ${parsed.data.email} (Klaviyo not configured)`);
    return NextResponse.json({ ok: true, configured: false });
  }

  try {
    const response = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
        revision: "2024-10-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: parsed.data.email,
                    subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: "list", id: listId } } },
        },
      }),
    });

    if (!response.ok) {
      console.error("[newsletter] Klaviyo rejected", response.status, await response.text());
      return NextResponse.json({ error: "We could not sign you up just now." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[newsletter] failed", error);
    return NextResponse.json({ error: "We could not sign you up just now." }, { status: 502 });
  }
}
