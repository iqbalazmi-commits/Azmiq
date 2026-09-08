# AZMIQ

Production e-commerce storefront. Next.js 16 (App Router) + TypeScript +
Tailwind 4 + PostgreSQL + Stripe.

---

## Run it

**Node 20.9 or newer is required.** Next 16 refuses to start on anything older.

```bash
npm install
cp .env.example .env.local
npm run setup      # generates artwork, migrates the database, seeds the catalogue
npm run dev
```

Open <http://localhost:3000>. The admin panel is at `/admin` — sign in with the
`ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.local`.

No database server is needed for development. With `DATABASE_URL` empty the app
runs on **PGlite** — real PostgreSQL compiled to WebAssembly — stored in
`./.pgdata`. Set `DATABASE_URL` and the same schema, the same migrations and the
same queries run against a real server. Production always uses a real server.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:contrast` | Asserts every colour pair against WCAG AA — **run this in CI** |
| `npm run db:generate` | Regenerate SQL migrations after editing `db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load the starting catalogue (destructive — truncates catalogue tables) |
| `npm run art:generate` | Regenerate the placeholder product artwork |

---

## The decisions worth knowing

### Money is never a float

Every amount is an integer in the currency's minor unit, everywhere: schema,
pricing engine, Stripe calls. `lib/money.ts` is the only place a number becomes
a string for display.

The browser sends **variant ids and quantities only**. It never sends a price,
so it cannot forge one. `lib/pricing.ts` recomputes the entire order from the
database when the cart renders, and again immediately before the PaymentIntent
is created.

### VAT is removed for exports, not merely not added

Displayed prices are VAT-inclusive, as UK and EU consumer law requires. A sale
to a customer outside the UK and EU is zero-rated, so the 20% element is
*stripped* at checkout. Skipping that would quietly overcharge every
international customer and leave AZMIQ holding money that is not its own.

Stripe Tax is authoritative at checkout; the rate table in `lib/pricing.ts`
exists so the cart can show an honest figure before that call.

### Multi-currency is hand-set, not converted

Prices per currency live in `variant_prices`. £29 becomes €35, never €33.87.
Rounded prices look deliberate; converted ones look like a spreadsheet leaked
onto the storefront. GBP, EUR, USD, CAD and AUD are wired up; adding another is
a row in a table, not a code change.

### Webhooks are the source of truth for order status

`app/api/webhooks/stripe/route.ts`. The browser redirect after payment is a
convenience — a customer can close the tab and the payment still succeeded, so
nothing marks an order paid except the webhook.

**Idempotency:** every Stripe event id is inserted into `webhook_events`, whose
primary key rejects the second insert. A duplicate is detected *before* any side
effect runs, so inventory is decremented once, the confirmation email is sent
once, and the discount is counted once — no matter how many times Stripe
retries.

### Card data never touches this server

Stripe Payment Element renders the card fields inside Stripe's own iframes. This
application is therefore in PCI-DSS **SAQ A** scope, not SAQ A-EP. Apple Pay and
Google Pay are not a separate integration — they appear inside Payment Element
once the domain is verified in the Stripe dashboard.

### Guest checkout is the default path

Not a link hidden under a sign-in form: an equally weighted panel, and the only
identity required is an email address to send the receipt to. Returns work for
guests too — order number plus the email it was placed with — because most
orders on this store will not have an account behind them.

### Cookie consent actually blocks

`components/shop/AnalyticsScripts.tsx` renders *nothing at all* until a choice
is stored — no script tag, no preconnect, no pixel. Scripts are mounted after
consent, so the network request cannot happen before the customer agrees to it.
Rejecting is one click, the same size as accepting, with nothing pre-ticked.

The `purchase` event is sent **server-side** from the Stripe webhook, so revenue
data survives a declined banner, an ad blocker, and a closed tab.

### Redirects never point at the homepage

Renaming a product writes a redirect from its old URL automatically — nobody has
to remember. `lib/redirects.ts` refuses a target of `/`, and so does the admin
form: sending a dead product URL to the homepage throws away the ranking that
URL earned and tells the visitor nothing. Unmatched paths resolve to a 404 that
lists real alternatives.

> One caveat, stated plainly: retired URLs return **404**, not 410. Both remove
> the page from the index; 410 is marginally faster. Serving a true 410 needs
> Node-runtime middleware, which is a small addition if you want it.

---

## Accessibility

Built to WCAG 2.1 AA — a legal requirement for UK and EU e-commerce, not a
nice-to-have.

`npm run test:contrast` reads the real values out of `styles/tokens.css` and
asserts 23 colour pairings. All pass. Two findings shaped the design system:

- **Copper is 3.58:1 on warm white — it fails AA as body text.** So copper never
  carries small text. Sale badges are a copper *background* with near-black text
  (4.71:1); elsewhere copper is confined to hairlines, icon strokes and borders,
  where 3:1 is the bar. This is also what keeps it under 2% of any screen.
- **Sage is 2.38:1 on warm white — background and divider only.** Never text or
  an icon on a light ground. On near-black it reaches 7.08:1, so it is free to
  be text inside the dark editorial sections.

Also enforced: full keyboard operation with a visible 3px focus ring, real
`<label>` elements on every field, errors announced via `aria-describedby` and
`aria-invalid` rather than shown only in red, 44px minimum touch targets, alt
text on every image, pinch-zoom never disabled, and `prefers-reduced-motion`
respected.

The filter UI is built from links rather than JavaScript, so it works before
hydration and without JS at all.

---

## Core Web Vitals

- Product content is server-rendered; the only client components are the
  gallery switcher, the add-to-basket panel, checkout, and the consent banner.
- Fonts are self-hosted by `next/font` with generated fallback metrics, so no
  request leaves for Google and there is no layout shift on font swap.
- Every image declares intrinsic width and height and sits in a reserved
  aspect-ratio box. The hero and the first row of product cards are `priority`.
- `scrollbar-gutter: stable` stops a scrollbar appearing and shifting layout.
- Collection and product pages revalidate hourly, so they serve from cache.

---

## Design tokens

`styles/tokens.css` is the single source of truth, surfaced to Tailwind through
`@theme`. Components reference semantic tokens — `bg-surface`, `text-ink`,
`ring-focus` — never a hex literal.

The one deliberate exception is `lib/email.ts`: email clients cannot read CSS
custom properties, so the brand colours are repeated there as literals.

Proportions: roughly 70% white and warm white, 20% near-black and teal, 10%
green, copper under 2%. The interface recedes so the photography carries.

---

## Before launch

- [ ] **Photography.** `public/images` holds generated illustrations, not
      photographs. They follow the art direction — copper on warm linen, side
      light, a macro shot showing the hammered facets — so the layout can be
      judged on real proportions. Replace them and rewrite the alt text.
- [ ] **Legal review.** `lib/content.ts` has complete, UK-specific policy copy
      with bracketed placeholders for company number, registered address, VAT
      number and ICO registration. A solicitor should read the terms and privacy
      pages.
- [ ] **Stripe.** Live keys, webhook endpoint at `/api/webhooks/stripe`, and
      domain verification for Apple Pay.
- [ ] **Stripe Tax.** The code is ready; the VAT, OSS/IOSS and US nexus
      registrations are a business task with lead times.
- [ ] **Klaviyo.** Set `KLAVIYO_PRIVATE_API_KEY` and `KLAVIYO_LIST_ID`. The
      server emits `Started Checkout` and `Placed Order`; point your flows at
      those two metrics.
- [ ] **Change the admin password.** The seed sets whatever is in `.env.local`.
- [ ] **Run `npm run test:contrast` and `npm run typecheck` in CI.**

---

## Layout

```
app/
  page.tsx                     home
  collections/[slug]/          category pages with link-based faceted filtering
  products/[slug]/             PDP - gallery, specs, care, Ayurveda, reviews
  cart/  checkout/             basket, guest checkout, confirmation
  account/  returns/           order history, self-service returns (guests too)
  policies/[slug]/             privacy, terms, refunds, shipping, cookies
  admin/                       products, stock, orders, refunds, discounts,
                               reviews, returns, redirects
  api/checkout/                creates the PaymentIntent from server-side totals
  api/webhooks/stripe/         idempotent - the source of truth for orders
  [...slug]/                   redirect catch-all for renamed URLs
db/
  schema.ts                    one schema, two drivers
lib/
  money.ts pricing.ts          integers only; totals computed server-side
  data.ts                      catalogue reads, faceting, search
  cart.ts auth.ts              server cart, opaque sessions, magic links
  consent.ts analytics*.ts     consent gate; server-side purchase event
  seo.tsx                      Product, Breadcrumb, Organization JSON-LD
  content.ts                   all long-form and policy copy
scripts/
  catalogue.ts seed.ts         the starting catalogue
  generate-art.ts              placeholder product artwork
  check-contrast.ts            the accessibility test that runs in CI
```
