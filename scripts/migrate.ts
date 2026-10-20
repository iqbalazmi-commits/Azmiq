import "./load-env";

/* Applies db/migrations to whichever database is configured. Safe to run
   repeatedly - drizzle records what it has already applied. */

async function main() {
  const url = process.env.DATABASE_URL;

  if (url) {
    const postgres = (await import("postgres")).default;
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    // Transaction-mode poolers (Supabase :6543, PgBouncer) cannot hold
    // prepared statements across checkouts - same rule as db/index.ts.
    const client = postgres(url, { max: 1, prepare: !/pgbouncer|pooler/i.test(url) });
    await migrate(drizzle(client), { migrationsFolder: "./db/migrations" });
    await client.end();
    console.log("Migrations applied to PostgreSQL.");
    return;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(process.env.PGLITE_DIR ?? "./.pgdata");
  await migrate(drizzle(client), { migrationsFolder: "./db/migrations" });
  await client.close();
  console.log("Migrations applied to the embedded PGlite database (./.pgdata).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
