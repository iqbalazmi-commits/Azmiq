import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";

/* ===========================================================================
   URL REDIRECTS

   Resolves a path against the redirects table, which is managed from the admin
   panel and written to automatically whenever a product slug changes.

   The rule that matters: a redirect NEVER points at "/". Sending a dead
   product URL to the homepage tells Google the page was replaced by the
   homepage, throwing away whatever ranking that URL had earned, and gives the
   visitor who clicked an old bookmark no idea what happened.

   An unmatched path therefore resolves to a 404 that lists real alternatives,
   which is the honest signal: this specific thing is gone.
   =========================================================================== */

export type ResolvedRedirect = { toPath: string; statusCode: number };

export async function resolveRedirect(path: string): Promise<ResolvedRedirect | null> {
  // Match on the path only, so /products/x?ref=email and /products/x share
  // a single row.
  const normalised = path.split("?")[0].replace(/\/+$/, "") || "/";

  const [row] = await db
    .select()
    .from(t.redirects)
    .where(eq(t.redirects.fromPath, normalised))
    .limit(1);

  if (!row) return null;

  // Fire-and-forget: a hit counter must never delay the redirect itself, and
  // it gives the admin panel a list of legacy URLs still receiving traffic.
  void db
    .update(t.redirects)
    .set({ hits: sql`${t.redirects.hits} + 1`, lastHitAt: new Date() })
    .where(eq(t.redirects.id, row.id))
    .catch(() => {});

  if (!row.toPath || row.statusCode === 410) return null;
  if (row.toPath === "/") return null; // Defensive: never honour a homepage redirect.

  return { toPath: row.toPath, statusCode: row.statusCode };
}
