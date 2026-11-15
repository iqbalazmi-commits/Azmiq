"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { decodeListingFile, parseListingFile, type ListingRow } from "@/lib/listing-import";
import { existingSkus, importListing, importProductImageFromUrl } from "@/lib/actions/admin";

/* Upload a listings file -> review and tick rows -> import as drafts.
   Products are created one at a time and each photo is downloaded in its own
   request, so a large import never runs into a hosting time limit, and a
   failure on one product or photo does not stop the rest. */

type Category = { id: string; title: string };
type Row = ListingRow & { selected: boolean; inShop: boolean };
type Outcome = { line: number; title: string; productId?: string; error?: string; photoNote?: string };

export function ImportListings({ categories }: { categories: Category[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [fileNote, setFileNote] = useState<{ text: string; error?: boolean } | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [progress, setProgress] = useState("");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [pending, startTransition] = useTransition();

  const selected = rows.filter((r) => r.selected);

  function onFile(file: File | undefined) {
    if (!file) return;
    setOutcomes([]);
    startTransition(async () => {
      const decoded = decodeListingFile(new Uint8Array(await file.arrayBuffer()));
      const parsed = decoded.ok ? parseListingFile(decoded.text) : decoded;
      if (!parsed.ok) {
        setRows([]);
        setFileNote({ text: parsed.error, error: true });
        return;
      }
      const inShop = new Set(await existingSkus(parsed.rows.map((r) => r.sku)));
      setRows(
        parsed.rows.map((r) => {
          const already = !!r.sku && inShop.has(r.sku);
          return { ...r, inShop: already, selected: !already && !!r.price };
        }),
      );
      const extra = parsed.skipped ? ` ${parsed.skipped} grouping rows were skipped.` : "";
      setFileNote({ text: `Found ${parsed.rows.length} products in ${file.name}.${extra}` });
    });
  }

  function update(line: number, patch: Partial<Row>) {
    setRows((current) => current.map((r) => (r.line === line ? { ...r, ...patch } : r)));
  }

  function runImport() {
    if (!categoryId || selected.length === 0) return;
    const queue = selected;
    setOutcomes([]);

    startTransition(async () => {
      const results: Outcome[] = [];
      for (const [index, row] of queue.entries()) {
        setProgress(`Importing ${index + 1} of ${queue.length}: ${row.title}`);
        const created = await importListing({
          title: row.title,
          summary: row.summary,
          description: row.description,
          price: row.price,
          compareAt: row.compareAt,
          inventory: row.inventory,
          sku: row.sku,
          categoryId,
        });
        if (!created.ok) {
          results.push({ line: row.line, title: row.title, error: created.error });
          continue;
        }

        let saved = 0;
        for (const [photo, url] of row.images.entries()) {
          setProgress(`Importing ${index + 1} of ${queue.length}: photo ${photo + 1} of ${row.images.length}`);
          const result = await importProductImageFromUrl(created.productId, url);
          if (result?.ok) saved++;
        }
        const missed = row.images.length - saved;
        results.push({
          line: row.line,
          title: row.title,
          productId: created.productId,
          photoNote:
            row.images.length === 0
              ? "No photos in the file - add them on its page."
              : missed > 0
                ? `${saved} of ${row.images.length} photos imported - add the rest on its page.`
                : `${saved} ${saved === 1 ? "photo" : "photos"} imported.`,
        });
      }
      setOutcomes(results);
      setProgress("");
      setRows((current) =>
        current.map((r) => (results.some((o) => o.line === r.line && o.productId) ? { ...r, selected: false, inShop: true } : r)),
      );
    });
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <section className="rounded-lg border border-border bg-surface-raised p-5">
        <h2 className="font-medium text-ink">1. Choose your listings file</h2>
        <p className="mt-1 text-sm text-ink-muted">
          In Amazon Seller Central go to <strong>Inventory → Inventory Reports</strong> and download the{" "}
          <strong>Category Listings Report</strong> (or All Listings Report). Tab-delimited .txt and .csv files
          work. If you have an Excel file, save it as “Text (Tab delimited)” first.
        </p>
        <label
          className={
            "mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border-control px-4 text-sm text-ink hover:border-ink" +
            (pending ? " pointer-events-none opacity-50" : "")
          }
        >
          <FileUp size={16} aria-hidden="true" />
          Choose file
          <input
            type="file"
            accept=".txt,.tsv,.csv,text/plain,text/csv,text/tab-separated-values"
            disabled={pending}
            onChange={(e) => onFile(e.target.files?.[0])}
            className="sr-only"
          />
        </label>
        <p role="status" aria-live="polite" className="mt-2 text-sm">
          {fileNote ? <span className={fileNote.error ? "text-danger" : "text-ink-muted"}>{fileNote.text}</span> : null}
        </p>
      </section>

      {rows.length > 0 ? (
        <section>
          <h2 className="font-medium text-ink">2. Tick the products to import</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Check the prices (in pounds). Products already in your shop are greyed out. Everything is imported as a
            hidden draft, so you can check each one before publishing.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-sm">
              <caption className="sr-only">Products found in the file</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-2 pr-3 font-medium text-ink-muted">
                    <span className="sr-only">Import</span>
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium text-ink-muted">Product</th>
                  <th scope="col" className="py-2 pr-3 font-medium text-ink-muted">Price (£)</th>
                  <th scope="col" className="py-2 pr-3 font-medium text-ink-muted">Stock</th>
                  <th scope="col" className="py-2 font-medium text-ink-muted">Photos</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.line} className={"border-b border-border align-middle" + (row.inShop ? " opacity-50" : "")}>
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        aria-label={`Import ${row.title}`}
                        checked={row.selected}
                        disabled={row.inShop || pending}
                        onChange={(e) => update(row.line, { selected: e.target.checked })}
                        className="h-4 w-4 accent-[var(--color-surface-brand)]"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-3">
                        {row.images[0] ? (
                          // Remote marketplace photo, preview only - next/image would need every host allow-listed.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.images[0]}
                            alt=""
                            width={40}
                            height={40}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 shrink-0 rounded-sm border border-border object-cover"
                          />
                        ) : (
                          <span className="h-10 w-10 shrink-0 rounded-sm border border-border bg-surface-sunken" />
                        )}
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-ink">{row.title}</span>
                          <span className="block text-xs text-ink-muted">
                            {row.inShop ? "Already in your shop" : row.sku || `Line ${row.line}`}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        aria-label={`Price for ${row.title}`}
                        inputMode="decimal"
                        value={row.price}
                        disabled={row.inShop || pending}
                        onChange={(e) => update(row.line, { price: e.target.value })}
                        className={
                          "h-10 w-24 rounded-md border bg-surface px-2 tabular-nums text-ink " +
                          (row.price ? "border-border-control" : "border-danger")
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        aria-label={`Stock for ${row.title}`}
                        inputMode="numeric"
                        value={String(row.inventory)}
                        disabled={row.inShop || pending}
                        onChange={(e) => update(row.line, { inventory: Math.max(0, Number.parseInt(e.target.value, 10) || 0) })}
                        className="h-10 w-20 rounded-md border border-border-control bg-surface px-2 tabular-nums text-ink"
                      />
                    </td>
                    <td className="py-2 tabular-nums text-ink-muted">{row.images.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="import-section" className="text-sm font-medium text-ink">
                3. Shop section for these products
              </label>
              <select
                id="import-section"
                value={categoryId}
                disabled={pending}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-12 rounded-md border border-border-control bg-surface px-3 text-base text-ink"
              >
                <option value="">Choose a section…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={runImport}
              disabled={pending || !categoryId || selected.length === 0}
            >
              {pending && progress ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Importing
                </>
              ) : (
                `Import ${selected.length} ${selected.length === 1 ? "product" : "products"}`
              )}
            </Button>
          </div>
          <p role="status" aria-live="polite" className="mt-3 text-sm text-ink-muted">
            {progress || (!categoryId && selected.length > 0 ? "Choose a section to continue. You can add more sections on each product later." : "")}
          </p>
        </section>
      ) : null}

      {outcomes.length > 0 ? (
        <section className="rounded-lg border border-border bg-surface-raised p-5">
          <h2 className="font-medium text-ink">Done</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {outcomes.filter((o) => o.productId).length} imported as drafts. Open each one to check it, then press
            Publish.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {outcomes.map((o) => (
              <li key={o.line}>
                {o.productId ? (
                  <>
                    <Link href={`/admin/products/${o.productId}`} className="text-ink-brand underline underline-offset-4">
                      {o.title}
                    </Link>{" "}
                    <span className="text-ink-muted">— {o.photoNote}</span>
                  </>
                ) : (
                  <>
                    <span className="text-ink">{o.title}</span> <span className="text-danger">— {o.error}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
