import "./load-env";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../db";
import * as t from "../db/schema";
import { hashPassword } from "../lib/auth";

/* Sets the admin password from ADMIN_EMAIL / ADMIN_PASSWORD in .env.local.
   Upserts by email, so it works whether or not an admin already exists -
   `db:seed` deliberately never touches an existing admin, so this is the
   supported way to (re)set the owner login. Run: npm run admin:reset */

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.");
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("ADMIN_PASSWORD must be at least 10 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const [existing] = await db
    .select()
    .from(t.adminUsers)
    .where(eq(t.adminUsers.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(t.adminUsers)
      .set({ passwordHash })
      .where(eq(t.adminUsers.id, existing.id));
    console.log(`Password reset for existing admin ${email}.`);
  } else {
    await db.insert(t.adminUsers).values({
      email,
      name: "AZMIQ Owner",
      passwordHash,
      role: "owner",
    });
    console.log(`Created admin ${email}.`);
  }

  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb().catch(() => {});
  process.exit(1);
});
