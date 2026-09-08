import type { Config } from "drizzle-kit";

// Migrations are generated from db/schema.ts and applied by scripts/migrate.ts,
// which works against whichever driver is configured at runtime.
export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost:5432/azmiq" },
  verbose: true,
  strict: false,
} satisfies Config;
