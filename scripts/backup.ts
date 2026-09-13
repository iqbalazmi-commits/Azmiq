import "./load-env";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import { db } from "@/db";
import * as schema from "@/db/schema";

/* ===========================================================================
   BACKUP

   Neon keeps its own point-in-time history, which covers "I deleted the wrong
   row an hour ago" but not "the account is gone" or "I want last month as a
   file". This writes every table to JSON on disk so a copy exists somewhere
   that is not Neon.

   Tables are discovered from the schema rather than listed by hand, so a table
   added later is backed up without anyone remembering to update this.

   The output contains real customer names, addresses and emails, so backups/
   is gitignored. Keep it somewhere you would be comfortable keeping an order
   book, because that is what it is.
   =========================================================================== */

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join("backups", stamp);
  mkdirSync(dir, { recursive: true });

  const tables = Object.values(schema).filter((v) => is(v, PgTable)) as PgTable[];
  let total = 0;
  const summary: string[] = [];

  for (const table of tables) {
    const name = getTableConfig(table).name;
    const rows = await db.select().from(table);
    writeFileSync(join(dir, name + ".json"), JSON.stringify(rows, null, 2), "utf8");
    total += rows.length;
    summary.push("  " + name.padEnd(24) + String(rows.length).padStart(6) + " rows");
  }

  writeFileSync(
    join(dir, "_manifest.json"),
    JSON.stringify({ takenAt: new Date().toISOString(), tables: tables.length, rows: total }, null, 2),
    "utf8",
  );

  console.log(summary.sort().join("\n"));
  console.log("\n" + tables.length + " tables, " + total + " rows -> " + dir);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
