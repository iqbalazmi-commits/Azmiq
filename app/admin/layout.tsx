import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeftRight, BadgePercent, Boxes, CreditCard, LayoutDashboard, LogOut,
  MessageSquareQuote, Package, RotateCcw,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { signOutAdmin } from "@/lib/actions/auth";
import { usingEmbeddedDatabase } from "@/db";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | AZMIQ Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: Package },
  { href: "/admin/products", label: "Products", Icon: Boxes },
  { href: "/admin/inventory", label: "Stock", Icon: Boxes },
  { href: "/admin/discounts", label: "Discounts", Icon: BadgePercent },
  { href: "/admin/reviews", label: "Reviews", Icon: MessageSquareQuote },
  { href: "/admin/returns", label: "Returns", Icon: RotateCcw },
  { href: "/admin/redirects", label: "Redirects", Icon: ArrowLeftRight },
  { href: "/admin/payments", label: "Payments", Icon: CreditCard },
];

/* The sign-in page lives under /admin too, so the guard has to let it
   through. Every action re-checks the session independently regardless. */

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="grid lg:grid-cols-[15rem_1fr]">
        <nav
          aria-label="Admin"
          className="border-b border-border bg-surface-inverse text-ink-inverse lg:min-h-screen lg:border-b-0 lg:border-r"
        >
          <div className="p-6">
            <Link href="/admin" className="block">
              <span className="font-serif text-lg tracking-[0.28em]">AZMIQ</span>
              <span className="mt-1 block text-2xs tracking-widest text-ink-on-inverse-muted">
                ADMIN
              </span>
            </Link>
          </div>

          <ul className="flex flex-wrap gap-1 px-3 pb-4 lg:flex-col">
            {NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink-inverse/85 transition-colors hover:bg-white/10 hover:text-ink-inverse"
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-white/15 p-4">
            <p className="text-xs text-ink-on-inverse-muted">{admin.email}</p>
            <form action={signOutAdmin} className="mt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-sm text-ink-inverse/85 hover:text-ink-inverse"
              >
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </form>
            <Link
              href="/"
              className="mt-3 block text-xs text-ink-on-inverse-muted underline underline-offset-4"
            >
              View the shop
            </Link>
          </div>
        </nav>

        <div>
          {usingEmbeddedDatabase ? (
            <p className="bg-surface-accent px-6 py-2 text-center text-xs font-medium text-ink-on-accent">
              Embedded development database (./.pgdata) — this is not production data.
            </p>
          ) : null}
          <main className="p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
