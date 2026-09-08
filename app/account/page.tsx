import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ChevronRight, LogOut, Package, RotateCcw } from "lucide-react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { getCurrentCustomer } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { formatMoney, type Currency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in");

  const orders = await db
    .select()
    .from(t.orders)
    .where(eq(t.orders.customerId, customer.id))
    .orderBy(desc(t.orders.createdAt))
    .limit(5);

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return (
    <div className="container-page py-12 pb-24">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-serif text-4xl text-ink">{name ? `Hello, ${name}` : "Your account"}</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-2 text-ink-muted">{customer.email}</p>
      <hr className="rule-accent mt-6" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="flex items-center gap-4 rounded-lg border border-border bg-surface-raised p-5 transition-colors hover:border-border-control"
        >
          <Package size={22} className="text-ink-brand" aria-hidden="true" />
          <span className="flex-1">
            <span className="block font-medium text-ink">Orders</span>
            <span className="block text-sm text-ink-muted">Track deliveries and download receipts</span>
          </span>
          <ChevronRight size={18} className="text-ink-muted" aria-hidden="true" />
        </Link>

        <Link
          href="/returns"
          className="flex items-center gap-4 rounded-lg border border-border bg-surface-raised p-5 transition-colors hover:border-border-control"
        >
          <RotateCcw size={22} className="text-ink-brand" aria-hidden="true" />
          <span className="flex-1">
            <span className="block font-medium text-ink">Start a return</span>
            <span className="block text-sm text-ink-muted">30 days, free, no questions</span>
          </span>
          <ChevronRight size={18} className="text-ink-muted" aria-hidden="true" />
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-ink">Recent orders</h2>

        {orders.length === 0 ? (
          <p className="mt-4 text-ink-muted">
            No orders yet.{" "}
            <Link href="/collections/all" className="text-ink-brand underline underline-offset-4">
              Have a look at what we make
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-wrap items-center gap-4 py-5 transition-colors hover:bg-surface-raised"
                >
                  <span className="min-w-24">
                    <span className="block font-medium text-ink">#{order.number}</span>
                    <span className="block text-sm text-ink-muted">
                      {formatDate(order.placedAt ?? order.createdAt)}
                    </span>
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <span className="ml-auto tabular-nums text-ink">
                    {formatMoney(order.grandTotal, order.currency as Currency)}
                  </span>
                  <ChevronRight size={18} className="text-ink-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
