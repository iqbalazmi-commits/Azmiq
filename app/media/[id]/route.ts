import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";

/* Serves photos uploaded in the admin panel (see productMedia in
   db/schema.ts). A media id never changes what it points at - replacing a
   photo uploads a new row - so the response is cached for a year, by the
   browser and by Netlify's CDN, and the database is only read the first time. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FOREVER = "public, max-age=31536000, immutable";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });

  const [row] = await db
    .select({ contentType: t.productMedia.contentType, data: t.productMedia.data })
    .from(t.productMedia)
    .where(eq(t.productMedia.id, id))
    .limit(1);
  if (!row) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(row.data), {
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": FOREVER,
      "Netlify-CDN-Cache-Control": FOREVER,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
