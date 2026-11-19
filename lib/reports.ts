import { sql } from "drizzle-orm";
import { db } from "@/db";

/* ===========================================================================
   ADMIN REPORTS

   Sales over time, best sellers, products that have not sold, and the
   customer list. Read-only queries over the order tables.

   Money is reported in GBP only. The shop prices in pounds and almost every
   order is in pounds; adding a euro order to a pound total would produce a
   number that is neither. Orders in other currencies still count as orders
   and units, and the pages say so.

   Days are London days, so an order at 00:30 on a summer morning lands on
   that day rather than the evening before.
   =========================================================================== */

/** Orders that represent a real sale. Fully refunded orders are left out of
    sales; the customer list counts them, because the person still bought. */
const SOLD = sql.raw(`('paid', 'fulfilled', 'partially_refunded')`);
const BOUGHT = sql.raw(`('paid', 'fulfilled', 'partially_refunded', 'refunded')`);

export const PERIODS = [7, 30, 90, 365] as const;
export type Period = (typeof PERIODS)[number];

export function parsePeriod(value: unknown): Period {
  const n = Number(value);
  return (PERIODS as readonly number[]).includes(n) ? (n as Period) : 30;
}

export type SalesPoint = {
  /** ISO date (YYYY-MM-DD) of the day, or of the Monday starting the week. */
  date: string;
  revenue: number;
  orders: number;
};

type Row = Record<string, unknown>;
const rows = async (query: ReturnType<typeof sql>) => {
  const result = await db.execute(query);
  // postgres.js returns an array; PGlite returns { rows }.
  return (Array.isArray(result) ? result : (result as unknown as { rows: Row[] }).rows) as Row[];
};

/** Daily totals (weekly for a year), with empty days filled in as zero so the
    chart shows quiet days rather than skipping them. */
export async function salesOverTime(days: Period): Promise<{ bucket: "day" | "week"; points: SalesPoint[] }> {
  const bucket = days > 90 ? "week" : "day";
  const unit = sql.raw(`'${bucket}'`);
  const data = await rows(sql`
    select
      to_char(date_trunc(${unit}, o.placed_at at time zone 'Europe/London'), 'YYYY-MM-DD') as date,
      coalesce(sum(case when o.currency = 'GBP' then o.grand_total - o.refunded_total else 0 end), 0)::int as revenue,
      count(*)::int as orders
    from orders o
    where o.status in ${SOLD}
      and o.placed_at >= now() - make_interval(days => ${days})
    group by 1
    order by 1
  `);
  const byDate = new Map(data.map((r) => [String(r.date), r]));

  // Walk the calendar in London time so every bucket appears exactly once.
  const london = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(d);
  const points: SalesPoint[] = [];
  const today = new Date(`${london(new Date())}T12:00:00Z`);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  if (bucket === "week") start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  for (let d = start; d <= today; d.setUTCDate(d.getUTCDate() + (bucket === "week" ? 7 : 1))) {
    const key = d.toISOString().slice(0, 10);
    const r = byDate.get(key);
    points.push({ date: key, revenue: Number(r?.revenue ?? 0), orders: Number(r?.orders ?? 0) });
  }
  return { bucket, points };
}

export async function salesSummary(days: Period) {
  const [r] = await rows(sql`
    select
      coalesce(sum(case when o.currency = 'GBP' then o.grand_total - o.refunded_total else 0 end), 0)::int as revenue,
      count(*) filter (where o.currency = 'GBP')::int as gbp_orders,
      count(*)::int as orders
    from orders o
    where o.status in ${SOLD}
      and o.placed_at >= now() - make_interval(days => ${days})
  `);
  const revenue = Number(r?.revenue ?? 0);
  const gbpOrders = Number(r?.gbp_orders ?? 0);
  return {
    revenue,
    orders: Number(r?.orders ?? 0),
    otherCurrencyOrders: Number(r?.orders ?? 0) - gbpOrders,
    averageOrder: gbpOrders ? Math.round(revenue / gbpOrders) : 0,
  };
}

export type BestSeller = { slug: string; title: string; units: number; revenue: number; orders: number };

export async function bestSellers(days: Period, limit = 10): Promise<BestSeller[]> {
  const data = await rows(sql`
    select
      oi.product_slug as slug,
      max(oi.product_title) as title,
      sum(oi.quantity)::int as units,
      coalesce(sum(case when o.currency = 'GBP' then oi.line_total else 0 end), 0)::int as revenue,
      count(distinct o.id)::int as orders
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.status in ${SOLD}
      and o.placed_at >= now() - make_interval(days => ${days})
    group by oi.product_slug
    order by units desc, revenue desc
    limit ${limit}
  `);
  return data.map((r) => ({
    slug: String(r.slug),
    title: String(r.title),
    units: Number(r.units),
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }));
}

/** Live products with no sale in the period - candidates for better photos,
    a price check or a promotion. */
export async function notSelling(days: Period) {
  const data = await rows(sql`
    select p.id, p.slug, p.title
    from products p
    where p.status = 'active'
      and not exists (
        select 1 from order_items oi join orders o on o.id = oi.order_id
        where oi.product_slug = p.slug
          and o.status in ${SOLD}
          and o.placed_at >= now() - make_interval(days => ${days})
      )
    order by p.position, p.title
  `);
  return data.map((r) => ({ id: String(r.id), slug: String(r.slug), title: String(r.title) }));
}

/* --------------------------------------------------------------- CUSTOMERS */

export type CustomerRow = {
  email: string;
  name: string | null;
  orders: number;
  spent: number;
  firstOrder: Date;
  lastOrder: Date;
};

/** Everyone who has bought, one row per email address (case-insensitive). */
export async function customerList(search: string | null, limit = 300): Promise<CustomerRow[]> {
  const term = search?.trim() ? `%${search.trim().toLowerCase()}%` : null;
  const data = await rows(sql`
    select * from (
      select
        lower(o.email) as email,
        (array_agg(o.shipping_address->>'name' order by o.placed_at desc))[1] as name,
        count(*)::int as orders,
        coalesce(sum(case when o.currency = 'GBP' then o.grand_total - o.refunded_total else 0 end), 0)::int as spent,
        min(o.placed_at) as first_order,
        max(o.placed_at) as last_order
      from orders o
      where o.status in ${BOUGHT} and o.placed_at is not null
      group by lower(o.email)
    ) c
    ${term ? sql`where c.email like ${term} or lower(coalesce(c.name, '')) like ${term}` : sql``}
    order by c.last_order desc
    limit ${limit}
  `);
  return data.map((r) => ({
    email: String(r.email),
    name: r.name ? String(r.name) : null,
    orders: Number(r.orders),
    spent: Number(r.spent),
    firstOrder: new Date(String(r.first_order)),
    lastOrder: new Date(String(r.last_order)),
  }));
}

export async function customerTotals() {
  const [r] = await rows(sql`
    select count(*)::int as customers, count(*) filter (where n > 1)::int as repeat
    from (
      select count(*) as n from orders o
      where o.status in ${BOUGHT} and o.placed_at is not null
      group by lower(o.email)
    ) c
  `);
  return { customers: Number(r?.customers ?? 0), repeat: Number(r?.repeat ?? 0) };
}
