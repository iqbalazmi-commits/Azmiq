import Link from "next/link";
import { X } from "lucide-react";
import type { Facets, SortKey } from "@/lib/data";

/* ===========================================================================
   FILTERS

   Every control is a link. No JavaScript, no client bundle, no hydration cost,
   and each filtered view has a real URL a customer can bookmark or share. The
   trade-off is a server round trip per click, which at this page weight is
   faster than shipping a filtering runtime to every visitor.

   Counts come from the same catalogue the grid renders, so a facet never
   offers a combination that returns nothing.
   =========================================================================== */

export type FacetGroup = { value: string; label: string; count: number }[];

type Props = {
  basePath: string;
  params: URLSearchParams;
  facets: Facets;
  counts: { finish: FacetGroup; capacity: FacetGroup; price: FacetGroup };
  total: number;
};

function toggleHref(basePath: string, params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params);
  const current = next.getAll(key);
  next.delete(key);
  for (const v of current) if (v !== value) next.append(key, v);
  if (!current.includes(value)) next.append(key, value);
  next.delete("page");
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function toggleFlagHref(basePath: string, params: URLSearchParams, key: string) {
  const next = new URLSearchParams(params);
  if (next.has(key)) next.delete(key);
  else next.set(key, "1");
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Filters({ basePath, params, facets, counts, total }: Props) {
  const activeCount =
    (facets.finish?.length ?? 0) +
    (facets.capacity?.length ?? 0) +
    (facets.price?.length ?? 0) +
    (facets.onSale ? 1 : 0) +
    (facets.inStock ? 1 : 0);

  return (
    <aside aria-labelledby="filters-heading" className="lg:sticky lg:top-28 lg:self-start">
      <div className="flex items-baseline justify-between">
        <h2 id="filters-heading" className="eyebrow">
          Filter
        </h2>
        {activeCount > 0 ? (
          <Link href={basePath} className="text-xs text-ink-brand underline underline-offset-4">
            Clear all
          </Link>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-ink-muted" role="status">
        {total} {total === 1 ? "product" : "products"}
      </p>

      {activeCount > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {(["finish", "capacity", "price"] as const).flatMap((key) =>
            (facets[key] ?? []).map((value) => {
              const label =
                counts[key].find((c) => c.value === value)?.label ?? value;
              return (
                <li key={`${key}-${value}`}>
                  <Link
                    href={toggleHref(basePath, params, key, value)}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-border-control bg-surface-raised px-3 py-1.5 text-xs text-ink hover:border-ink"
                  >
                    {label}
                    <X size={13} aria-hidden="true" />
                    <span className="sr-only">Remove filter</span>
                  </Link>
                </li>
              );
            }),
          )}
        </ul>
      ) : null}

      <FilterGroup
        heading="Capacity"
        options={counts.capacity}
        selected={facets.capacity ?? []}
        href={(value) => toggleHref(basePath, params, "capacity", value)}
      />
      <FilterGroup
        heading="Finish"
        options={counts.finish}
        selected={facets.finish ?? []}
        href={(value) => toggleHref(basePath, params, "finish", value)}
      />
      <FilterGroup
        heading="Price"
        options={counts.price}
        selected={facets.price ?? []}
        href={(value) => toggleHref(basePath, params, "price", value)}
      />

      <fieldset className="mt-8 border-t border-border pt-6">
        <legend className="eyebrow">Availability</legend>
        <ul className="mt-4 flex flex-col gap-2.5">
          <li>
            <Link
              href={toggleFlagHref(basePath, params, "stock")}
              aria-pressed={!!facets.inStock}
              className="flex items-center gap-3 text-sm text-ink"
            >
              <Box checked={!!facets.inStock} />
              In stock only
            </Link>
          </li>
          <li>
            <Link
              href={toggleFlagHref(basePath, params, "sale")}
              aria-pressed={!!facets.onSale}
              className="flex items-center gap-3 text-sm text-ink"
            >
              <Box checked={!!facets.onSale} />
              On sale
            </Link>
          </li>
        </ul>
      </fieldset>
    </aside>
  );
}

function FilterGroup({
  heading, options, selected, href,
}: {
  heading: string;
  options: FacetGroup;
  selected: string[];
  href: (value: string) => string;
}) {
  const usable = options.filter((o) => o.count > 0 || selected.includes(o.value));
  if (usable.length === 0) return null;

  return (
    <fieldset className="mt-8 border-t border-border pt-6">
      <legend className="eyebrow">{heading}</legend>
      <ul className="mt-4 flex flex-col gap-2.5">
        {usable.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <li key={option.value}>
              <Link
                href={href(option.value)}
                aria-pressed={checked}
                className="flex items-center gap-3 text-sm text-ink"
              >
                <Box checked={checked} />
                <span className="flex-1">{option.label}</span>
                <span className="text-xs tabular-nums text-ink-muted">{option.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/* A checkbox drawn rather than used, because these are links. The pressed
   state is carried by aria-pressed on the link itself, so assistive tech is
   told the truth even though the box is decorative. */
function Box({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-sm border transition-colors " +
        (checked
          ? "border-surface-brand bg-surface-brand text-ink-on-brand"
          : "border-border-control bg-surface-raised")
      }
      style={{ height: "1.125rem", width: "1.125rem" }}
    >
      {checked ? (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 6.5L4.5 9.5L10.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

export function SortLinks({
  basePath, params, current,
}: {
  basePath: string;
  params: URLSearchParams;
  current: SortKey;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="eyebrow">Sort</span>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {SORT_OPTIONS.map((option) => {
          const next = new URLSearchParams(params);
          if (option.value === "featured") next.delete("sort");
          else next.set("sort", option.value);
          const qs = next.toString();
          const active = current === option.value;
          return (
            <li key={option.value}>
              <Link
                href={qs ? `${basePath}?${qs}` : basePath}
                aria-current={active ? "true" : undefined}
                className={
                  "text-sm underline-offset-4 " +
                  (active ? "text-ink underline decoration-2" : "text-ink-muted hover:text-ink hover:underline")
                }
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
