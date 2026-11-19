import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Orders as a CSV spreadsheet, for the accountant: one month (UK time) or
   every order ever. Only real sales are included - paid, shipped, partly or
   fully refunded - never abandoned checkouts. Amounts are in the order's own
   currency, in major units (12.50, not 1250), with that currency in a column.

   Admin-only. The file holds customers' names and addresses, so it is never
   cached anywhere along the way. */

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const HEADERS = [
  "Order", "Date", "Status", "Payment", "Payment method", "Email", "Name", "Address", "City",
  "Postcode", "Country", "Items", "Currency", "Subtotal", "Discount", "Discount code",
  "Delivery", "VAT included", "Total", "Refunded", "Net", "Tracking number",
];

/** Quote for CSV, and stop a cell that starts with = + - @ from being run as a
    formula when the file is opened in Excel or Sheets. */
function cell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const money = (minor: unknown) => (Number(minor ?? 0) / 100).toFixed(2);

export async function GET(request: Request) {
  if (!(await getCurrentAdmin())) return new Response("Unauthorised", { status: 401 });

  const month = new URL(request.url).searchParams.get("month") ?? "all";
  if (month !== "all" && !MONTH.test(month)) return new Response("Bad month", { status: 400 });

  const result = await db.execute(sql`
    select
      o.number, o.placed_at, o.status, o.payment_status, o.payment_method, o.email,
      o.shipping_address->>'name' as name,
      concat_ws(', ', o.shipping_address->>'line1', nullif(o.shipping_address->>'line2', '')) as address,
      o.shipping_address->>'city' as city,
      o.shipping_address->>'postcode' as postcode,
      o.shipping_address->>'country' as country,
      (
        select string_agg(
          oi.product_title
            || case when oi.variant_title <> '' then ' (' || oi.variant_title || ')' else '' end
            || ' x ' || oi.quantity,
          '; ' order by oi.product_title
        )
        from order_items oi where oi.order_id = o.id
      ) as items,
      o.currency, o.subtotal, o.discount_total, o.discount_code, o.shipping_total, o.tax_total,
      o.grand_total, o.refunded_total, o.tracking_number
    from orders o
    where o.status in ('paid', 'fulfilled', 'partially_refunded', 'refunded')
      and o.placed_at is not null
      ${month === "all" ? sql`` : sql`and to_char(o.placed_at at time zone 'Europe/London', 'YYYY-MM') = ${month}`}
    order by o.placed_at, o.number
  `);
  const rows = (Array.isArray(result) ? result : (result as unknown as { rows: Record<string, unknown>[] }).rows) as Record<
    string,
    unknown
  >[];

  const ukDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const lines = [HEADERS.map(cell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.number,
        r.placed_at ? ukDate.format(new Date(String(r.placed_at))) : "",
        r.status, r.payment_status, r.payment_method, r.email, r.name, r.address, r.city,
        r.postcode, r.country, r.items, r.currency,
        money(r.subtotal), money(r.discount_total), r.discount_code, money(r.shipping_total),
        money(r.tax_total), money(r.grand_total), money(r.refunded_total),
        money(Number(r.grand_total ?? 0) - Number(r.refunded_total ?? 0)),
        r.tracking_number,
      ]
        .map(cell)
        .join(","),
    );
  }

  // The byte-order mark tells Excel the file is UTF-8, so names with accents
  // and the "·" in product names come through intact.
  const body = "﻿" + lines.join("\r\n") + "\r\n";
  const filename = `azmiq-orders-${month === "all" ? "all" : month}.csv`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, private",
    },
  });
}
