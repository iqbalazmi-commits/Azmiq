import type { Metadata } from "next";
import Link from "next/link";
import { ReturnsFlow } from "@/components/shop/ReturnsFlow";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";

export const metadata: Metadata = {
  title: "Start a return",
  description:
    "Return anything within 30 days, free. Enter your order number and email to get a prepaid label - no account needed.",
  alternates: { canonical: "/returns" },
};

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderNumber = typeof params.order === "string" ? params.order : "";

  return (
    <div className="container-page py-8 pb-24">
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Start a return", path: "/returns" },
        ]}
      />

      <div className="mt-8 max-w-2xl">
        <h1 className="font-serif text-4xl text-ink">Start a return</h1>
        <hr className="rule-accent mt-6" />
        <p className="mt-6 leading-relaxed text-ink-muted">
          Thirty days, free returns, and we do not ask you to justify yourself. Enter your order
          number and the email you ordered with - you do not need an account.
        </p>

        <ReturnsFlow initialOrderNumber={orderNumber} />

        <div className="mt-14 border-t border-border pt-8">
          <h2 className="font-serif text-xl text-ink">Before you send it back</h2>
          <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-ink-muted">
            <li>Copper tarnishes - that is not a fault, and a return is not needed for it.</li>
            <li>Keep the original box if you still have it. If not, any sturdy box is fine.</li>
            <li>Refunds land back on the original payment method within 5 working days of arrival.</li>
            <li>
              Faulty or damaged? Tell us in the notes and we will send a replacement rather than a
              label.
            </li>
          </ul>
          <p className="mt-6 text-sm text-ink-muted">
            Full details in our{" "}
            <Link href="/policies/refunds" className="text-ink-brand underline underline-offset-4">
              refund policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
