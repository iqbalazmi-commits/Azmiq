import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminSignInForm } from "@/components/admin/AdminSignInForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminSignInPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-inverse p-6">
      <div className="w-full max-w-sm rounded-lg bg-surface-raised p-8 shadow-panel">
        <p className="font-serif text-xl tracking-[0.28em] text-ink">AZMIQ</p>
        <p className="mt-1 text-2xs tracking-widest text-ink-muted">ADMIN</p>
        <hr className="rule-accent my-6" />
        <h1 className="font-serif text-2xl text-ink">Sign in</h1>
        <AdminSignInForm />
      </div>
    </div>
  );
}
