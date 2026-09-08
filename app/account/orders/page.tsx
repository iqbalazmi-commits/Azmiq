import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { getCurrentCustomer } from "@/lib/auth";
import { formatMoney, type Currency } from "@/lib/money";
import { formatDate, pluralise } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";

export const metadata: Metadata = { title: "Your orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/sign-in?next=/account/orders");

  const orders = await db
    .select()
    .from(t.orders)
    .where(eq(t.orders.customerId, customer.id))
    .orderBy(desc(t.orders.createdAt));

  const items = await db.select().from(t.orderItems);
  const countFor = (orderId: string) =>
    items.filter((i) => i.orderId === orderId).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="container-page py-8 pb-24">
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Account", path: "/account" },
          { name: "Orders", path: "/account/orders" },
        ]}
      />

      <h1 className="mt-8 font-serif text-4xl text-ink">Your orders</h1>
      <hr className="rule-accent mt-6" />

      {orders.length === 0 ? (
        <p className="mt-8 text-ink-muted">
          Nothing here yet.{" "}
          <Link href="/collections/all" className="text-ink-brand underline underline-offset-4">
            Browse the collection
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {orders.map((order) => {
            const count = countFor(order.id);
            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-surface-raised p-5 transition-colors hover:border-border-control"
                >
                  <span className="min-w-28">
                    <span className="block font-serif text-lg text-ink">#{order.number}</span>
                    <span className="block text-sm text-ink-muted">
                      {formatDate(order.placedAt ?? order.createdAt)}
                    </span>
                  </span>

                  <OrderStatusBadge status={order.status} />

                  <span className="text-sm text-ink-muted">
                    {count} {pluralise(count, "item")}
                  </span>

                  <span className="ml-auto flex items-center gap-4">
                    <span className="tabular-nums text-ink">
                      {formatMoney(order.grandTotal, order.currency as Currency)}
                    </span>
                    <ChevronRight size={18} className="text-ink-muted" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
