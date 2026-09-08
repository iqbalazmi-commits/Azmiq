import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";

/* ===========================================================================
   AUTHENTICATION

   Deliberately small and auditable rather than delegated to a framework:

   - Customers sign in with an emailed magic link. There is no customer
     password, so there is no customer password to leak, reset or reuse.
   - Staff sign in with a password, hashed with scrypt.
   - Sessions are opaque random ids stored server-side. Nothing about identity
     travels in a cookie the browser could edit.

   Guest checkout never touches any of this. That is the point: the fastest
   path to paying does not involve an account at all.
   =========================================================================== */

// promisify() cannot see scrypt's options overload, so the signature is
// declared here rather than losing the cost parameters to an `any`.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

export const CUSTOMER_SESSION_COOKIE = "azmiq_session";
export const ADMIN_SESSION_COOKIE = "azmiq_admin";

const CUSTOMER_SESSION_DAYS = 30;
const ADMIN_SESSION_HOURS = 12;
const MAGIC_LINK_MINUTES = 20;

/* ------------------------------------------------------------- PASSWORDS */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 })) as Buffer;
  return `scrypt$16384$8$1$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, salt, hash] = parts;
  const derived = (await scryptAsync(password, salt, 64, {
    N: Number(N), r: Number(r), p: Number(p),
  })) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/* -------------------------------------------------------------- SESSIONS */

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function createCustomerSession(customerId: string) {
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_DAYS * 864e5);
  const [session] = await db.insert(t.sessions).values({ customerId, expiresAt }).returning();
  const jar = await cookies();
  jar.set(CUSTOMER_SESSION_COOKIE, session.id, cookieOptions(CUSTOMER_SESSION_DAYS * 86400));
  return session;
}

export async function createAdminSession(adminUserId: string) {
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_HOURS * 36e5);
  const [session] = await db.insert(t.sessions).values({ adminUserId, expiresAt }).returning();
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, session.id, cookieOptions(ADMIN_SESSION_HOURS * 3600));
  return session;
}

export async function getCurrentCustomer() {
  const jar = await cookies();
  const id = jar.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!id) return null;

  const [row] = await db
    .select({ customer: t.customers })
    .from(t.sessions)
    .innerJoin(t.customers, eq(t.sessions.customerId, t.customers.id))
    .where(and(eq(t.sessions.id, id), gt(t.sessions.expiresAt, new Date())))
    .limit(1);
  return row?.customer ?? null;
}

export async function getCurrentAdmin() {
  const jar = await cookies();
  const id = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!id) return null;

  const [row] = await db
    .select({ admin: t.adminUsers })
    .from(t.sessions)
    .innerJoin(t.adminUsers, eq(t.sessions.adminUserId, t.adminUsers.id))
    .where(and(eq(t.sessions.id, id), gt(t.sessions.expiresAt, new Date())))
    .limit(1);
  return row?.admin ?? null;
}

export async function destroySession(which: "customer" | "admin") {
  const jar = await cookies();
  const name = which === "admin" ? ADMIN_SESSION_COOKIE : CUSTOMER_SESSION_COOKIE;
  const id = jar.get(name)?.value;
  if (id) await db.delete(t.sessions).where(eq(t.sessions.id, id));
  jar.delete(name);
}

/* ------------------------------------------------------------ MAGIC LINK */

/** Only the SHA-256 of the token is stored. A database dump does not hand an
    attacker a set of working sign-in links. */
export async function createLoginToken(email: string): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  await db.insert(t.loginTokens).values({
    email: email.toLowerCase().trim(),
    tokenHash,
    expiresAt: new Date(Date.now() + MAGIC_LINK_MINUTES * 60000),
  });
  return raw;
}

export async function consumeLoginToken(raw: string): Promise<string | null> {
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const [row] = await db
    .select()
    .from(t.loginTokens)
    .where(and(
      eq(t.loginTokens.tokenHash, tokenHash),
      gt(t.loginTokens.expiresAt, new Date()),
      isNull(t.loginTokens.consumedAt),
    ))
    .limit(1);
  if (!row) return null;

  await db.update(t.loginTokens).set({ consumedAt: new Date() }).where(eq(t.loginTokens.id, row.id));
  return row.email;
}

export async function findOrCreateCustomer(email: string, extra?: { firstName?: string; lastName?: string }) {
  const normalised = email.toLowerCase().trim();
  const [existing] = await db.select().from(t.customers).where(eq(t.customers.email, normalised)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(t.customers).values({ email: normalised, ...extra }).returning();
  return created;
}

/** Housekeeping for a cron job - expired rows are not needed and sessions are
    the one table that grows without bound. */
export async function pruneExpired() {
  const now = new Date();
  await db.delete(t.sessions).where(lt(t.sessions.expiresAt, now));
  await db.delete(t.loginTokens).where(lt(t.loginTokens.expiresAt, now));
}
