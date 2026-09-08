import { desc } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { deleteRedirect } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { RedirectForm } from "@/components/admin/RedirectForm";

export const metadata = { title: "Redirects" };
export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  await requireAdminPage();

  const rows = await db.select().from(t.redirects).orderBy(desc(t.redirects.hits), t.redirects.fromPath);
  const automatic = rows.filter((r) => r.source === "auto");
  const used = rows.filter((r) => r.hits > 0);

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-3xl text-ink">Redirects</h1>
      <p className="mt-1.5 max-w-2xl text-ink-muted">
        When an address changes, this is what stops the old link breaking. {rows.length} in
        total, {automatic.length} created automatically when a product was renamed,{" "}
        {used.length} used so far.
      </p>
      <hr className="rule-accent mt-6" />

      <div className="mt-8 rounded-lg border border-border bg-surface-raised p-6">
        <h2 className="font-serif text-xl text-ink">Add a redirect</h2>
        <RedirectForm />
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">All redirects</caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Old address</th>
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Goes to</th>
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Source</th>
              <th scope="col" className="py-3 pr-4 font-medium text-ink-muted">Used</th>
              <th scope="col" className="py-3"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border">
                <td className="py-3 pr-4 font-mono text-xs text-ink">{row.fromPath}</td>
                <td className="py-3 pr-4 font-mono text-xs text-ink-muted">{row.toPath ?? "—"}</td>
                <td className="py-3 pr-4 text-ink-muted">{row.source}</td>
                <td className="py-3 pr-4 tabular-nums text-ink-muted">
                  {row.hits}
                  {row.lastHitAt ? (
                    <span className="block text-xs">{formatDate(row.lastHitAt)}</span>
                  ) : null}
                </td>
                <td className="py-3 text-right">
                  <form action={deleteRedirect}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="min-h-11 px-2 text-sm text-ink-muted underline-offset-4 hover:text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
