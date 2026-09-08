"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createLoginToken, destroySession } from "@/lib/auth";
import { sendMagicLink } from "@/lib/email";
import { SITE } from "@/lib/site";

export type AuthResult = { ok: true; message: string } | { ok: false; error: string };

const emailSchema = z.string().email().max(200);

/**
 * Request a sign-in link.
 *
 * The response is identical whether or not the address has an account. Telling
 * an anonymous visitor "no account with that email" turns the login form into
 * a way to enumerate the customer list.
 */
export async function requestMagicLink(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const next = String(formData.get("next") ?? "/account");
  // Only same-site paths: an open redirect here would be a phishing vector.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  const token = await createLoginToken(parsed.data);
  const url = `${SITE.url}/api/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext)}`;
  await sendMagicLink(parsed.data, url);

  return {
    ok: true,
    message: "Check your email. If we have an account for that address, a sign-in link is on its way.",
  };
}

export async function signOut() {
  await destroySession("customer");
  redirect("/");
}

export async function signOutAdmin() {
  await destroySession("admin");
  redirect("/admin/sign-in");
}
