import Link from "next/link";
import { AlertTriangle, Check, CreditCard, ExternalLink, X } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { stripe } from "@/lib/stripe";
import { bankDetails, bankTransferConfigured } from "@/lib/bank-transfer";
import { emailTransport } from "@/lib/email";
import { SITE } from "@/lib/site";

export const metadata = { title: "Payments" };

/* ===========================================================================
   PAYMENTS SETUP

   Everything the shop needs to take money is already written. What it cannot
   supply is the Stripe account itself: that is a regulated financial account
   tied to a real identity and a real bank account, so only the owner can open
   it. This page exists so the remaining work is "read three lines and paste
   three keys" rather than "go and read the Stripe docs".

   Every check below is live - the keys are actually used against Stripe, so a
   tick here means it genuinely works, not that a string is non-empty.
   =========================================================================== */

type AccountState =
  | { ok: true; name: string | null; country: string | null; currency: string | null;
      chargesEnabled: boolean; payoutsEnabled: boolean; detailsSubmitted: boolean }
  | { ok: false; error: string };

async function checkAccount(): Promise<AccountState | null> {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    const account = await stripe().accounts.retrieve();
    return {
      ok: true,
      name: account.business_profile?.name ?? account.settings?.dashboard?.display_name ?? null,
      country: account.country ?? null,
      currency: account.default_currency?.toUpperCase() ?? null,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export default async function AdminPaymentsPage() {
  await requireAdminPage();

  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const alertEmail = process.env.ORDER_ALERT_EMAIL || process.env.ADMIN_EMAIL || "";
  const transport = emailTransport();

  const account = await checkAccount();
  const live = secretKey.startsWith("sk_live_");
  const testMode = secretKey.startsWith("sk_test_");
  const keysMatch =
    !secretKey ||
    !publishableKey ||
    (live && publishableKey.startsWith("pk_live_")) ||
    (testMode && publishableKey.startsWith("pk_test_"));

  const webhookUrl = `${SITE.url}/api/webhooks/stripe`;

  const cardReady =
    account?.ok === true && account.chargesEnabled && !!publishableKey && !!webhookSecret && keysMatch;
  const bankReady = bankTransferConfigured();
  const bank = bankDetails();
  const canTakeMoney = cardReady || bankReady;
  const moneyReachesBank = account?.ok === true && account.payoutsEnabled;

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl text-ink">Payments</h1>
      <p className="mt-1.5 text-ink-muted">
        Whether this shop can take a card payment right now, and what is left to do.
      </p>
      <hr className="rule-accent mt-6" />

      {/* ------------------------------------------------------------ verdict */}
      <div
        className={
          "mt-8 flex items-start gap-4 rounded-lg border p-5 " +
          (canTakeMoney
            ? "border-[var(--color-success)] bg-success-wash"
            : "border-border-control bg-surface-sunken")
        }
      >
        <span className="mt-0.5 shrink-0">
          {canTakeMoney ? (
            <Check size={22} className="text-success" aria-hidden="true" />
          ) : (
            <AlertTriangle size={22} className="text-ink-muted" aria-hidden="true" />
          )}
        </span>
        <div>
          <p className="font-medium text-ink">
            {!canTakeMoney
              ? "Not taking payments yet."
              : cardReady && bankReady
                ? `Cards${live ? " (live)" : " (test mode)"} and bank transfer are both on.`
                : cardReady
                  ? live
                    ? "Live — this shop is taking card payments."
                    : "Test mode — cards work, but with test cards only."
                  : "Bank transfer only — free, but every order is confirmed by hand."}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {!canTakeMoney
              ? "Customers can browse, add to basket and reach checkout, but there is no way to pay. Set up either method below — bank transfer is free and needs no account anywhere."
              : cardReady
                ? moneyReachesBank
                  ? "Charges and payouts are both enabled, so card money reaches your bank on Stripe's normal schedule."
                  : "Charges work, but payouts are not enabled yet — Stripe is holding the money until you finish your account details."
                : "Orders will arrive as “awaiting bank transfer”. Check your bank, then press “Mark as paid” on the order — that is what reduces stock and sends the customer their receipt."}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------- bank transfer */}
      <h2 className="mt-12 font-serif text-2xl text-ink">Bank transfer — free</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        The customer pays you straight from their banking app. No processor, so no fee, ever. The
        cost is your time: nothing tells the shop the money arrived, so you confirm each one.
      </p>
      <ul className="mt-5 divide-y divide-border rounded-lg border border-border bg-surface-raised">
        <Row
          done={bankReady}
          label="Account details"
          detail={
            bank
              ? `${bank.accountName} · ${bank.sortCode} · ${bank.accountNumber}${bank.bankName ? ` · ${bank.bankName}` : ""}`
              : "Set BANK_ACCOUNT_NAME, BANK_SORT_CODE and BANK_ACCOUNT_NUMBER in .env.local to offer this at checkout."
          }
        />
        <Row
          done={!bankReady || !!bank?.iban}
          label="Overseas payments (optional)"
          detail={
            bank?.iban
              ? `IBAN ${bank.iban}${bank.bic ? ` · BIC ${bank.bic}` : ""}`
              : "No IBAN set. UK buyers are fine without it; overseas buyers may need it. BANK_IBAN and BANK_BIC."
          }
        />
      </ul>
      {bankReady ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          These details are shown only to the customer who placed the order and to staff — never on
          a public page. Each order gets a reference like <Code>AZMIQ-1043</Code> so you can match a
          payment to an order on your bank statement at a glance.
        </p>
      ) : null}

      {/* ----------------------------------------------------------- checklist */}
      <h2 className="mt-12 font-serif text-2xl text-ink">Cards — via Stripe</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Roughly 1.5% + 20p per UK sale, and completely automatic: the order marks itself paid, stock
        adjusts, and the receipt sends itself.
      </p>
      <ul className="mt-5 divide-y divide-border rounded-lg border border-border bg-surface-raised">
        <Row
          done={!!secretKey}
          label="Secret key"
          detail={
            secretKey
              ? `${live ? "Live" : testMode ? "Test" : "Unrecognised"} key ending ${secretKey.slice(-4)}`
              : "STRIPE_SECRET_KEY is not set"
          }
        />
        <Row
          done={!!publishableKey && keysMatch}
          label="Publishable key"
          detail={
            !publishableKey
              ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set"
              : keysMatch
                ? `Matches your ${live ? "live" : "test"} secret key`
                : "Mixed keys — one is live and the other is test. They must be the same mode."
          }
        />
        <Row
          done={account?.ok === true}
          label="Stripe account reachable"
          detail={
            !account
              ? "No secret key to check with"
              : account.ok
                ? [account.name, account.country, account.currency].filter(Boolean).join(" · ") ||
                  "Connected"
                : account.error
          }
        />
        <Row
          done={account?.ok === true && account.chargesEnabled}
          label="Charges enabled"
          detail={
            account?.ok
              ? account.chargesEnabled
                ? "Stripe will accept card payments on this account"
                : "Stripe has not enabled charges yet — finish your account details in the Stripe dashboard"
              : "Unknown until the account is reachable"
          }
        />
        <Row
          done={account?.ok === true && account.payoutsEnabled}
          label="Payouts enabled (money reaches your bank)"
          detail={
            account?.ok
              ? account.payoutsEnabled
                ? "Stripe will pay out to your bank account"
                : "Add your bank account and finish identity verification in Stripe"
              : "Unknown until the account is reachable"
          }
        />
        <Row
          done={!!webhookSecret}
          label="Webhook signing secret"
          detail={
            webhookSecret
              ? "Set — orders will be marked paid automatically"
              : "STRIPE_WEBHOOK_SECRET is not set. Without it an order never becomes 'paid', even after a successful payment."
          }
        />
        <Row
          done={transport !== "none"}
          label="Email sending"
          detail={
            transport === "resend"
              ? `Resend connected — order alerts go to ${alertEmail || "ADMIN_EMAIL"}`
              : transport === "smtp"
                ? `Sending as ${process.env.SMTP_USER} via ${process.env.SMTP_HOST} — order alerts go to ${alertEmail || "ADMIN_EMAIL"}`
                : transport === "gmail"
                  ? `Sending through ${process.env.GMAIL_USER} — order alerts go to ${alertEmail || "ADMIN_EMAIL"}`
                  : "No email is being sent. Use your domain mailbox (SMTP_HOST / SMTP_USER / SMTP_PASSWORD), a Gmail App Password, or a RESEND_API_KEY. Until then the customer receipt and your new-order alert only reach the server log."
          }
        />
      </ul>

      {/* --------------------------------------------------------------- steps */}
      <h2 className="mt-12 font-serif text-2xl text-ink">How to switch cards on</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Only you can do step 1 — Stripe has to verify your identity and your bank details by law,
        so no one can open the account on your behalf. Everything after it is copy and paste. (Bank
        transfer needs none of this: put your account details in <Code>.env.local</Code> and it is on.)
      </p>

      <ol className="mt-6 flex flex-col gap-5">
        <Step n={1} title="Create your Stripe account">
          Go to <A href="https://dashboard.stripe.com/register">dashboard.stripe.com/register</A> and
          sign up as a UK business. Stripe will ask for your name and address, what you sell, and the
          bank account you want to be paid into. There is no monthly fee — Stripe takes roughly
          1.5% + 20p from each UK card sale.
        </Step>

        <Step n={2} title="Copy your two API keys">
          In Stripe, open{" "}
          <A href="https://dashboard.stripe.com/test/apikeys">Developers → API keys</A>. Copy the{" "}
          <Code>Publishable key</Code> (<Code>pk_…</Code>) and the <Code>Secret key</Code> (
          <Code>sk_…</Code>). Keep the <strong>Test mode</strong> toggle on while you try it out —
          test keys let you place fake orders with card <Code>4242 4242 4242 4242</Code>, any future
          expiry and any CVC.
        </Step>

        <Step n={3} title="Add a webhook so orders get marked paid">
          In Stripe, open <A href="https://dashboard.stripe.com/test/webhooks">Developers → Webhooks</A>{" "}
          → <em>Add endpoint</em>. Paste this as the endpoint URL:
          <Pre>{webhookUrl}</Pre>
          Subscribe it to these three events, then copy the <Code>Signing secret</Code> (
          <Code>whsec_…</Code>) it shows you:
          <ul className="mt-2 flex flex-wrap gap-2">
            {["payment_intent.succeeded", "payment_intent.payment_failed", "charge.refunded"].map(
              (e) => (
                <li key={e}>
                  <Code>{e}</Code>
                </li>
              ),
            )}
          </ul>
          <p className="mt-3 text-ink-muted">
            Testing on this machine instead? Run{" "}
            <Code>stripe listen --forward-to localhost:3100/api/webhooks/stripe</Code> and it prints
            the same secret.
          </p>
        </Step>

        <Step n={4} title="Paste the three values in">
          Open <Code>.env.local</Code> in the project folder and fill these in, then restart the
          server:
          <Pre>{`STRIPE_SECRET_KEY=sk_test_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…`}</Pre>
          Come back to this page — every line above should turn green.
        </Step>

        <Step n={5} title="Go live when you are happy">
          Flip Stripe out of test mode, repeat steps 2 and 3 to get the <Code>sk_live_…</Code>,{" "}
          <Code>pk_live_…</Code> and a fresh webhook secret for your real domain, and put those in
          your production environment. Never put live keys in <Code>.env.local</Code> on your laptop.
        </Step>
      </ol>

      {/* ------------------------------------------------------------- context */}
      <h2 className="mt-12 font-serif text-2xl text-ink">What happens when someone pays</h2>
      <ol className="mt-5 flex flex-col gap-3 rounded-lg border border-border bg-surface-raised p-6 text-sm leading-relaxed text-ink-muted">
        <li>
          <strong className="text-ink">1.</strong> The customer enters their card in Stripe&apos;s own
          form. Card numbers never touch this server.
        </li>
        <li>
          <strong className="text-ink">2.</strong> Stripe takes the money and calls{" "}
          <Code>{webhookUrl}</Code>.
        </li>
        <li>
          <strong className="text-ink">3.</strong> The order is marked <strong>paid</strong>, stock is
          reduced, and the basket is emptied — all in one transaction, and only once even if Stripe
          sends the event twice.
        </li>
        <li>
          <strong className="text-ink">4.</strong> The customer gets a receipt, and{" "}
          <strong className="text-ink">you get a &ldquo;new order&rdquo; email</strong> with the
          delivery address and what to pack.
        </li>
        <li>
          <strong className="text-ink">5.</strong> It appears in{" "}
          <Link href="/admin/orders" className="text-ink-brand underline underline-offset-4">
            Orders
          </Link>{" "}
          under &ldquo;to ship&rdquo;, and Stripe pays out to your bank on its normal schedule.
        </li>
      </ol>

      <p className="mt-8 flex items-center gap-2 text-sm text-ink-muted">
        <CreditCard size={16} aria-hidden="true" />
        Apple Pay and Google Pay switch themselves on once your domain is verified in Stripe — there
        is nothing to build for them.
      </p>
    </div>
  );
}

function Row({ done, label, detail }: { done: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-4 p-4">
      <span
        className={
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-pill " +
          (done ? "bg-success-wash text-success" : "bg-danger-wash text-danger")
        }
      >
        {done ? <Check size={13} aria-hidden="true" /> : <X size={13} aria-hidden="true" />}
        <span className="sr-only">{done ? "Done" : "Not done"}</span>
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-ink">{label}</span>
        <span className="mt-0.5 block break-words text-sm text-ink-muted">{detail}</span>
      </span>
    </li>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-lg border border-border bg-surface-raised p-6">
      <div className="flex items-baseline gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-surface-brand text-sm font-semibold tabular-nums text-ink-on-brand">
          {n}
        </span>
        <h3 className="font-serif text-lg text-ink">{title}</h3>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </li>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-ink-brand underline underline-offset-4"
    >
      {children}
      <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="break-all rounded-sm bg-surface-sunken px-1.5 py-0.5 text-[0.85em] text-ink">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-md border border-border-control bg-surface-sunken p-3 text-xs leading-relaxed text-ink">
      {children}
    </pre>
  );
}
