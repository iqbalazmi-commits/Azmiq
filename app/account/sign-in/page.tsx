import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { SignInForm } from "@/components/shop/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const customer = await getCurrentCustomer();
  if (customer) redirect("/account");

  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/account";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-4xl text-ink">Sign in</h1>
        <hr className="rule-accent mt-6" />

        <p className="mt-6 leading-relaxed text-ink-muted">
          We will email you a link. No password to remember, and nothing for anyone to steal.
        </p>

        {error ? (
          <p role="alert" className="mt-6 rounded-md bg-danger-wash p-3 text-sm text-danger">
            {error === "expired"
              ? "That link has expired or has already been used. Request a new one below."
              : "That link was not valid. Request a new one below."}
          </p>
        ) : null}

        <SignInForm next={next} />

        <div className="mt-10 rounded-lg border border-border bg-surface-raised p-5">
          <p className="font-medium text-ink">You do not need an account to order</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            Guest checkout is always available and just as quick.{" "}
            <Link href="/cart" className="text-ink-brand underline underline-offset-4">
              Go to your basket
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
