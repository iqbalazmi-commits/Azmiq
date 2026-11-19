"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import type { SalesPoint } from "@/lib/reports";

/* Revenue over time as thin columns, one per day (or week). One series, so
   no legend: the heading says what is plotted. Hover or keyboard focus on a
   column shows its date, takings and order count; the same numbers are in the
   table underneath, so nothing depends on hovering. */

const W = 760;
const H = 240;
const PAD = { top: 16, right: 8, bottom: 28, left: 56 };
const BAR_MAX = 24;
const GAP = 2;

/** A round step so the four gridlines land on clean amounts (£0, £50, £100...). */
function niceStep(value: number): number {
  const pounds = Math.max(value, 10000) / 100 / 4; // at least a £100 axis
  const mag = 10 ** Math.floor(Math.log10(pounds));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= pounds) ?? pounds;
  return Math.round(step * 100);
}

/** "£1,200" in full, "£12K" past ten thousand, one style per axis. */
function axisLabel(minor: number, compact: boolean): string {
  const pounds = minor / 100;
  return compact ? `£${Math.round(pounds / 1000)}K` : `£${pounds.toLocaleString("en-GB")}`;
}

function dateLabel(iso: string, bucket: "day" | "week", style: "short" | "long"): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const opts: Intl.DateTimeFormatOptions =
    style === "short" ? { day: "numeric", month: "short" } : { weekday: "short", day: "numeric", month: "long", year: "numeric" };
  const text = new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(d);
  return bucket === "week" && style === "long" ? `Week of ${text}` : text;
}

export function SalesChart({ points, bucket }: { points: SalesPoint[]; bucket: "day" | "week" }) {
  const [active, setActive] = useState<number | null>(null);

  const step = niceStep(Math.max(0, ...points.map((p) => p.revenue)));
  const max = step * 4;
  const compact = max >= 1000000;
  const ticks = [0, 1, 2, 3, 4].map((k) => k * step);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const band = plotW / Math.max(points.length, 1);
  const barW = Math.max(1, Math.min(BAR_MAX, band - GAP));
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

  // Label about six dates along the bottom, never one per bar.
  const every = Math.max(1, Math.ceil(points.length / 6));
  const hovered = active === null ? null : points[active];

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Takings over time">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--color-border)" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(v)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--color-ink-muted)">
                {axisLabel(v, compact)}
              </text>
            </g>
          ))}

          {points.map((p, i) => {
            const x = PAD.left + i * band + (band - barW) / 2;
            const top = y(p.revenue);
            const h = PAD.top + plotH - top;
            const r = Math.min(4, barW / 2, h);
            const base = PAD.top + plotH;
            return (
              <g
                key={p.date}
                tabIndex={0}
                role="button"
                aria-label={`${dateLabel(p.date, bucket, "long")}: ${formatMoney(p.revenue, "GBP")}, ${p.orders} orders`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none"
              >
                {/* The hit target is the whole column, not just the painted bar. */}
                <rect x={PAD.left + i * band} y={PAD.top} width={band} height={plotH} fill="transparent" />
                {h > 0 ? (
                  <path
                    d={`M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${base} Z`}
                    fill="var(--color-surface-brand-hover)"
                    opacity={active === null || active === i ? 1 : 0.45}
                  />
                ) : null}
                {i % every === 0 ? (
                  <text x={PAD.left + i * band + band / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--color-ink-muted)">
                    {dateLabel(p.date, bucket, "short")}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {hovered && active !== null ? (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-md"
            style={{ left: `${((PAD.left + active * band + band / 2) / W) * 100}%` }}
          >
            <p className="font-medium tabular-nums text-ink">{formatMoney(hovered.revenue, "GBP")}</p>
            <p className="whitespace-nowrap text-xs text-ink-muted">
              {dateLabel(hovered.date, bucket, "long")} &middot; {hovered.orders}{" "}
              {hovered.orders === 1 ? "order" : "orders"}
            </p>
          </div>
        ) : null}
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-brand underline-offset-4 hover:underline">Show as a table</summary>
        <div className="mt-3 max-h-72 overflow-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface-sunken text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{bucket === "week" ? "Week of" : "Day"}</th>
                <th className="px-3 py-2 text-right font-medium">Takings</th>
                <th className="px-3 py-2 text-right font-medium">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...points].reverse().map((p) => (
                <tr key={p.date}>
                  <td className="px-3 py-2 text-ink">{dateLabel(p.date, bucket, "short")}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink">{formatMoney(p.revenue, "GBP")}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-muted">{p.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
