import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { updateReturnStatus } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Returns" };
export const dynamic = "force-dynamic";

const NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  requested: [
    { value: "approved", label: "Approve and send label" },
    { value: "rejected", label: "Reject" },
  ],
  approved: [{ value: "received", label: "Mark as received" }],
  received: [{ value: "refunded", label: "Mark as refunded" }],
  rejected: [{ value: "requested", label: "Reopen" }],
  refunded: [],
};

const REASON_LABEL: Record<string, string> = {
  "changed-mind": "Changed their mind",
  "not-as-described": "Not as described",
  "arrived-damaged": "Arrived damaged",
  "wrong-item": "Wrong item sent",
  faulty: "Faulty",
  other: "Something else",
};

export default async function AdminReturnsPage() {
  await requireAdminPage();

  const rows = await db
    .select({ request: t.returnRequests, orderNumber: t.orders.number, email: t.orders.email, orderId: t.orders.id })
    .from(t.returnRequests)
    .innerJoin(t.orders, eq(t.returnRequests.orderId, t.orders.id))
    .orderBy(desc(t.returnRequests.createdAt));

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-ink">Returns</h1>
      <p className="mt-1.5 max-w-2xl text-ink-muted">
        Customers start these themselves, with or without an account. Approving one is your cue to
        email a prepaid label; marking it refunded does not move money — do that from the order.
      </p>
      <hr className="rule-accent mt-6" />

      {rows.length === 0 ? (
        <p className="mt-10 text-ink-muted">No returns requested yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {rows.map(({ request, orderNumber, email, orderId }) => {
            const items = (request.items as { orderItemId: string; quantity: number }[]) ?? [];
            return (
              <li key={request.id} className="rounded-lg border border-border bg-surface-raised p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">{request.rma}</p>
                    <p className="text-sm text-ink-muted">
                      Order{" "}
                      <Link
                        href={`/admin/orders/${orderId}`}
                        className="text-ink-brand underline underline-offset-4"
                      >
                        #{orderNumber}
                      </Link>{" "}
                      &middot; {email} &middot; {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-pill bg-surface-sunken px-3 py-1 text-xs font-medium text-ink">
                    {request.status}
                  </span>
                </div>

                <p className="mt-3 text-sm text-ink-muted">
                  {REASON_LABEL[request.reason] ?? request.reason} &middot; wants a{" "}
                  {request.resolution} &middot; {items.length}{" "}
                  {items.length === 1 ? "item" : "items"}
                </p>

                {request.comment ? (
                  <p className="mt-2 rounded-md bg-surface-sunken p-3 text-sm leading-relaxed text-ink-muted">
                    {request.comment}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(NEXT_STATUS[request.status] ?? []).map((next) => (
                    <form action={updateReturnStatus} key={next.value}>
                      <input type="hidden" name="id" value={request.id} />
                      <input type="hidden" name="status" value={next.value} />
                      <button
                        type="submit"
                        className="min-h-11 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink"
                      >
                        {next.label}
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
