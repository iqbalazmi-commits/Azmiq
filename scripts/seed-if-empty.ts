import "./load-env";
import { execFileSync } from "node:child_process";
import { sql } from "drizzle-orm";
import { db, closeDb } from "../db";
import * as t from "../db/schema";

/* Runs during every production build, after migrations. On a brand-new
   database (no products yet) it loads the starting catalogue once; on any
   database that already has products it does nothing, so a deploy can never
   wipe the shop. `npm run db:seed` truncates the catalogue tables, which is
   why it is never called unconditionally from a build. */

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed-if-empty] No DATABASE_URL - skipping (local builds use PGlite).");
    return;
  }

  const [row] = await db.select({ n: sql<number>`count(*)` }).from(t.products);
  const count = Number(row?.n ?? 0);
  await closeDb();

  if (count > 0) {
    console.log(`[seed-if-empty] ${count} products already present - leaving the database alone.`);
    return;
  }

  console.log("[seed-if-empty] Empty database - loading the starting catalogue.");
  execFileSync("npx", ["tsx", "scripts/seed.ts"], { stdio: "inherit" });
}

main().catch(async (error) => {
  console.error(error);
  await closeDb().catch(() => {});
  process.exit(1);
});
