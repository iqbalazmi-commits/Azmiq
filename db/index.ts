import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/* ===========================================================================
   DATABASE CLIENT

   One schema, two drivers:

     DATABASE_URL set    -> postgres.js against real PostgreSQL (prod, staging)
     DATABASE_URL unset  -> PGlite, an embedded PostgreSQL in ./.pgdata

   PGlite is real PostgreSQL compiled to WASM, not a shim - the same SQL, the
   same types, the same migrations. It exists so `npm run dev` works on a
   laptop with nothing installed. Production always points at a real server.

   Nothing in this file may ever be imported by a Client Component. The data
   layer in lib/data.ts is the only thing the app should import.
   =========================================================================== */

type Schema = typeof schema;
export type Database = PostgresJsDatabase<Schema>;

// Cached on globalThis so Next.js hot reload does not open a fresh pool - or a
// second PGlite instance holding a lock on ./.pgdata - on every file save.
const globalForDb = globalThis as unknown as {
  __azmiqDb?: Database;
  __azmiqClose?: () => Promise<void>;
};

function createDb(): Database {
  const url = process.env.DATABASE_URL;

  if (url) {
    const client = postgres(url, {
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idle_timeout: 20,
      connect_timeout: 10,
      // Transaction-mode poolers (PgBouncer, Supabase, Neon) cannot hold
      // prepared statements across checkouts.
      prepare: !/pgbouncer|pooler/i.test(url),
    });
    globalForDb.__azmiqClose = () => client.end();
    return drizzlePg(client, { schema });
  }

  const client = new PGlite(process.env.PGLITE_DIR ?? "./.pgdata");
  globalForDb.__azmiqClose = () => client.close();
  return drizzlePglite(client, { schema }) as unknown as Database;
}

export const db: Database = globalForDb.__azmiqDb ?? (globalForDb.__azmiqDb = createDb());

/** True when running on the embedded dev database. Surfaced in the admin panel
    so nobody mistakes a laptop database for production. */
export const usingEmbeddedDatabase = !process.env.DATABASE_URL;

/** Only for scripts - the long-running server never closes its pool. */
export async function closeDb() {
  await globalForDb.__azmiqClose?.();
}

export { schema };
