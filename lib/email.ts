import { formatMoney, type Currency } from "./money";
import { SITE } from "./site";
import { transferReference, type BankDetails } from "./bank-transfer";
import type { Order, OrderItem } from "@/db/schema";

/* ===========================================================================
   TRANSACTIONAL EMAIL

   Order confirmations, magic links and return notices. Deliberately separate
   from Klaviyo: a customer who has opted out of marketing must still receive
   the receipt for something they paid for.

   Three ways to actually send, tried in order:

     1. RESEND_API_KEY  - a proper transactional provider. Best deliverability,
                          needs a signup and a verified domain.
     2. SMTP_HOST + SMTP_USER + SMTP_PASSWORD - any ordinary mailbox, including
                          the one that comes with the shop's own domain. This is
                          how you send as shop@azmiq.com without signing up to
                          anything: the mail host already exists, it just needs
                          its own credentials.
     3. GMAIL_USER + GMAIL_APP_PASSWORD - the same idea, preconfigured for
                          Gmail. Google caps it around 500 messages a day, and
                          it must be an App Password: a normal Gmail password is
                          rejected, and pasting one in would be a bad idea.

   With none set, messages are logged to the server console rather than
   silently dropped - so local checkout still shows you the magic link.
   =========================================================================== */

type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** So the owner can hit reply on an order alert and reach the customer. */
  replyTo?: string;
};

export function emailTransport(): "resend" | "smtp" | "gmail" | "none" {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) return "smtp";
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return "gmail";
  return "none";
}

async function send(message: Message): Promise<boolean> {
  const transport = emailTransport();
  // A mail server will not let you forge a From it does not own, so for the
  // SMTP routes the authenticated account wins - claiming otherwise gets the
  // header rewritten at best and the message rejected at worst. EMAIL_FROM is
  // still honoured for SMTP, because there the address usually IS the domain.
  const from =
    transport === "gmail"
      ? `${SITE.name} <${process.env.GMAIL_USER}>`
      : (process.env.EMAIL_FROM ?? `${SITE.name} <${process.env.SMTP_USER ?? "shop@azmiq.com"}>`);

  if (transport === "none") {
    console.log(
      `\n--- EMAIL (not sent: no RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD) ---\n` +
        `To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n---\n`,
    );
    return false;
  }

  try {
    if (transport === "gmail") return await sendViaGmail(message, from);
    if (transport === "smtp") return await sendViaSmtp(message, from);
    return await sendViaResend(message, from);
  } catch (error) {
    console.error("[email] send threw", error);
    return false;
  }
}

async function sendViaResend(message: Message, from: string): Promise<boolean> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!response.ok) {
    console.error("[email] resend failed", response.status, await response.text());
    return false;
  }
  return true;
}

/* Any ordinary mailbox - the one attached to the shop's own domain, most
   likely. Port 465 is implicit TLS; everything else (587, 25) starts in the
   clear and upgrades with STARTTLS, which nodemailer does automatically when
   `secure` is false. Defaulting the port to 587 rather than 465 is deliberate:
   it is what almost every host documents. */
async function sendViaSmtp(message: Message, from: string): Promise<boolean> {
  const { createTransport } = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
  return true;
}

/* Imported lazily so nodemailer is only pulled into the bundle for shops that
   actually use it, and so a missing module can never break a Resend setup. */
async function sendViaGmail(message: Message, from: string): Promise<boolean> {
  const { createTransport } = await import("nodemailer");
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
  return true;
}

/* Inline styles only - email clients strip <style> blocks, and the brand
   colours are repeated here as literals because an email cannot read our CSS
   custom properties. This is the one place hex values are permitted. */
const TEAL = "#0E3B43";
const INK = "#14181A";
const WARM = "#FAF8F5";
const MUTED = "#55666B";
const COPPER = "#B87333";

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:${WARM};font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${WARM};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:${TEAL};padding:28px 32px;">
          <div style="font-size:22px;letter-spacing:6px;color:#ffffff;">AZMIQ</div>
          <div style="font-size:11px;letter-spacing:3px;color:#8FA99B;margin-top:6px;">DRINK WELL, LIVE WELL</div>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:24px 32px;background:${WARM};font-size:12px;color:${MUTED};">
          <p style="margin:0 0 8px;">Questions? Reply to this email and a person will answer.</p>
          <p style="margin:0;">${SITE.name} &middot; ${SITE.url}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendOrderConfirmation(order: Order, items: OrderItem[]): Promise<boolean> {
  const currency = order.currency as Currency;
  const address = order.shippingAddress as Record<string, string> | null;

  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #E3DED6;">
          <div style="color:${INK};">${escapeHtml(item.productTitle)}</div>
          <div style="font-size:13px;color:${MUTED};">${escapeHtml(item.variantTitle)} &middot; qty ${item.quantity}</div>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #E3DED6;white-space:nowrap;">
          ${formatMoney(item.lineTotal, currency)}
        </td>
      </tr>`,
    )
    .join("");

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:400;">Thank you — your order is confirmed</h1>
    <div style="width:48px;height:1px;background:${COPPER};margin:16px 0 20px;"></div>
    <p style="margin:0 0 24px;color:${MUTED};line-height:1.7;">
      Order <strong style="color:${INK};">#${order.number}</strong>. We will email you again the
      moment it ships, with tracking.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${rows}
      <tr><td style="padding:12px 0;color:${MUTED};">Subtotal</td>
          <td align="right" style="padding:12px 0;">${formatMoney(order.subtotal, currency)}</td></tr>
      ${order.discountTotal > 0 ? `<tr><td style="padding:4px 0;color:${MUTED};">Discount</td><td align="right" style="padding:4px 0;">-${formatMoney(order.discountTotal, currency)}</td></tr>` : ""}
      <tr><td style="padding:4px 0;color:${MUTED};">Delivery</td>
          <td align="right" style="padding:4px 0;">${order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal, currency)}</td></tr>
      <tr><td style="padding:12px 0;font-size:16px;border-top:1px solid #E3DED6;">Total</td>
          <td align="right" style="padding:12px 0;font-size:16px;border-top:1px solid #E3DED6;">${formatMoney(order.grandTotal, currency)}</td></tr>
      ${order.taxTotal > 0 ? `<tr><td colspan="2" style="padding-top:4px;font-size:12px;color:${MUTED};">Includes ${formatMoney(order.taxTotal, currency)} VAT</td></tr>` : ""}
    </table>
    ${
      address
        ? `<h2 style="margin:32px 0 8px;font-size:15px;font-weight:600;">Delivering to</h2>
           <p style="margin:0;color:${MUTED};line-height:1.7;font-size:14px;">
             ${escapeHtml(address.name)}<br>${escapeHtml(address.line1)}<br>
             ${address.line2 ? escapeHtml(address.line2) + "<br>" : ""}
             ${escapeHtml(address.city)}<br>${escapeHtml(address.postcode)}<br>${escapeHtml(address.country)}
           </p>`
        : ""
    }
    <h2 style="margin:32px 0 8px;font-size:15px;font-weight:600;">Looking after your copper</h2>
    <p style="margin:0;color:${MUTED};line-height:1.7;font-size:14px;">
      Hand wash only, never the dishwasher. Copper darkens as it ages — that patina is a sign of
      authenticity. Lemon and salt brings the shine back in a minute.
    </p>`;

  const text = `Thank you - your order is confirmed.

Order #${order.number}

${items.map((i) => `${i.productTitle} (${i.variantTitle}) x${i.quantity}  ${formatMoney(i.lineTotal, currency)}`).join("\n")}

Subtotal: ${formatMoney(order.subtotal, currency)}
Delivery: ${order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal, currency)}
Total: ${formatMoney(order.grandTotal, currency)}

We will email you again when it ships.`;

  return send({
    to: order.email,
    subject: `Your AZMIQ order #${order.number}`,
    html: shell(`Order #${order.number}`, body),
    text,
  });
}

/* ---------------------------------------------------------------------------
   BANK TRANSFER INSTRUCTIONS

   Sent the moment a bank-transfer order is placed. The customer has not paid
   yet, so this is not a receipt - it is an invoice. Everything they need to
   complete the payment has to be in it, because they will act on this email
   inside their banking app with the shop nowhere in sight.
   --------------------------------------------------------------------------- */
export async function sendBankTransferInstructions(
  order: Order,
  items: OrderItem[],
  bank: BankDetails,
): Promise<boolean> {
  const currency = order.currency as Currency;
  const reference = transferReference(order.number);
  const total = formatMoney(order.grandTotal, currency);

  const line = (label: string, value: string) => `<tr>
      <td style="padding:8px 0;color:${MUTED};font-size:14px;white-space:nowrap;">${label}</td>
      <td style="padding:8px 0 8px 20px;color:${INK};font-size:15px;font-weight:600;">${escapeHtml(value)}</td>
    </tr>`;

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:400;">Your order is reserved</h1>
    <div style="width:48px;height:1px;background:${COPPER};margin:16px 0 20px;"></div>
    <p style="margin:0 0 22px;color:${MUTED};line-height:1.7;">
      Order <strong style="color:${INK};">#${order.number}</strong> is held for you. To complete it,
      transfer <strong style="color:${INK};">${total}</strong> using the details below. We post it as
      soon as the payment lands — usually the same working day.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background:${WARM};border-radius:6px;padding:4px 16px;">
      ${line("Amount", total)}
      ${line("Reference", reference)}
      ${line("Account name", bank.accountName)}
      ${line("Sort code", bank.sortCode)}
      ${line("Account number", bank.accountNumber)}
      ${bank.bankName ? line("Bank", bank.bankName) : ""}
      ${bank.iban ? line("IBAN", bank.iban) : ""}
      ${bank.bic ? line("BIC/SWIFT", bank.bic) : ""}
    </table>

    <p style="margin:20px 0 0;color:${MUTED};line-height:1.7;font-size:14px;">
      <strong style="color:${INK};">Please quote ${escapeHtml(reference)} as the payment reference.</strong>
      It is how we match your money to your order. Without it there may be a delay while we find you.
    </p>
    <p style="margin:14px 0 0;color:${MUTED};line-height:1.7;font-size:14px;">
      Nothing is charged automatically and no card details are held. If you change your mind, simply
      do not send the transfer and the order lapses.
    </p>

    <h2 style="margin:32px 0 8px;font-size:15px;font-weight:600;">What you ordered</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${items
        .map(
          (item) => `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #E3DED6;">
              <div style="color:${INK};">${escapeHtml(item.productTitle)}</div>
              <div style="font-size:13px;color:${MUTED};">${escapeHtml(item.variantTitle)} &middot; qty ${item.quantity}</div>
            </td>
            <td align="right" style="padding:10px 0;border-bottom:1px solid #E3DED6;white-space:nowrap;">
              ${formatMoney(item.lineTotal, currency)}
            </td>
          </tr>`,
        )
        .join("")}
      <tr><td style="padding:12px 0;font-size:16px;">Total to transfer</td>
          <td align="right" style="padding:12px 0;font-size:16px;">${total}</td></tr>
      ${order.taxTotal > 0 ? `<tr><td colspan="2" style="font-size:12px;color:${MUTED};">Includes ${formatMoney(order.taxTotal, currency)} VAT</td></tr>` : ""}
    </table>`;

  const text = `Your order is reserved.

Order #${order.number}. To complete it, transfer ${total} using these details:

Amount:         ${total}
Reference:      ${reference}
Account name:   ${bank.accountName}
Sort code:      ${bank.sortCode}
Account number: ${bank.accountNumber}${bank.bankName ? `\nBank:           ${bank.bankName}` : ""}${bank.iban ? `\nIBAN:           ${bank.iban}` : ""}${bank.bic ? `\nBIC/SWIFT:      ${bank.bic}` : ""}

Please quote ${reference} as the payment reference — it is how we match your money to your order.

${items.map((i) => `${i.productTitle} (${i.variantTitle}) x${i.quantity}  ${formatMoney(i.lineTotal, currency)}`).join("\n")}

Total to transfer: ${total}

We post your order as soon as the payment lands. Nothing is charged automatically.`;

  return send({
    to: order.email,
    subject: `Order #${order.number} — please transfer ${total} (ref ${reference})`,
    html: shell(`Order #${order.number}`, body),
    text,
  });
}

/* ---------------------------------------------------------------------------
   OWNER ALERT

   Sent to you, not the customer, the moment an order is paid: who ordered,
   where it ships, what they bought, and the total. Reply-to is set to the
   customer so you can answer them directly from the alert.

   Destination: ORDER_ALERT_EMAIL, falling back to ADMIN_EMAIL. With neither
   set (or no RESEND_API_KEY) the alert is logged to the server console.
   --------------------------------------------------------------------------- */
export async function sendNewOrderAlert(order: Order, items: OrderItem[]): Promise<boolean> {
  const to = process.env.ORDER_ALERT_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) {
    console.log(`[email] new order #${order.number} — no ORDER_ALERT_EMAIL/ADMIN_EMAIL, alert skipped`);
    return false;
  }

  const currency = order.currency as Currency;
  const a = order.shippingAddress as Record<string, string> | null;
  const countryName = a?.country ? regionName(a.country) : null;
  const origin = a
    ? [a.city, a.region, countryName].filter(Boolean).join(", ")
    : "address not provided";
  const adminUrl = `${SITE.url}/admin/orders/${order.id}`;
  // A bank transfer is a promise, not a payment. Say so loudly, or something
  // gets packed and posted before the money has actually arrived.
  const awaitingTransfer = order.paymentMethod === "bank_transfer" && order.status === "pending";

  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E3DED6;">
          <div style="color:${INK};">${escapeHtml(item.productTitle)}</div>
          <div style="font-size:13px;color:${MUTED};">${escapeHtml(item.variantTitle)} &middot; ${escapeHtml(item.sku)} &middot; qty ${item.quantity}</div>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #E3DED6;white-space:nowrap;">
          ${formatMoney(item.lineTotal, currency)}
        </td>
      </tr>`,
    )
    .join("");

  const addressLines = a
    ? [a.name, a.line1, a.line2, a.city, a.region, a.postcode, countryName ?? a.country]
        .filter(Boolean)
        .map(escapeHtml)
        .join("<br>")
    : "No shipping address on the order.";

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:400;">New order #${order.number}</h1>
    <div style="width:48px;height:1px;background:${COPPER};margin:14px 0 18px;"></div>
    <p style="margin:0 0 18px;color:${MUTED};line-height:1.7;">
      <strong style="color:${INK};">${escapeHtml(a?.name ?? order.email)}</strong> ordered from
      <strong style="color:${INK};">${escapeHtml(origin)}</strong> —
      total <strong style="color:${INK};">${formatMoney(order.grandTotal, currency)}</strong>.
    </p>
    ${
      awaitingTransfer
        ? `<p style="margin:0 0 22px;padding:14px 16px;background:${WARM};border-left:3px solid ${COPPER};border-radius:4px;color:${INK};line-height:1.6;font-size:14px;">
             <strong>Awaiting bank transfer — do not post yet.</strong><br>
             <span style="color:${MUTED};">They will send ${formatMoney(order.grandTotal, currency)} quoting
             reference <strong style="color:${INK};">${escapeHtml(transferReference(order.number))}</strong>.
             When it appears in your account, open the order and press “Mark as paid” — that reserves the
             stock and sends their receipt.</span>
           </p>`
        : `<p style="margin:0 0 22px;color:${MUTED};font-size:14px;">Paid by card — the money is on its way to your bank.</p>`
    }

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${rows}
      <tr><td style="padding:10px 0;color:${MUTED};">Subtotal</td>
          <td align="right" style="padding:10px 0;">${formatMoney(order.subtotal, currency)}</td></tr>
      ${order.discountTotal > 0 ? `<tr><td style="padding:2px 0;color:${MUTED};">Discount${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ""}</td><td align="right" style="padding:2px 0;">-${formatMoney(order.discountTotal, currency)}</td></tr>` : ""}
      <tr><td style="padding:2px 0;color:${MUTED};">Delivery${order.shippingMethod ? ` — ${escapeHtml(order.shippingMethod)}` : ""}</td>
          <td align="right" style="padding:2px 0;">${order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal, currency)}</td></tr>
      <tr><td style="padding:10px 0;font-size:16px;border-top:1px solid #E3DED6;">Total</td>
          <td align="right" style="padding:10px 0;font-size:16px;border-top:1px solid #E3DED6;">${formatMoney(order.grandTotal, currency)}</td></tr>
      ${order.taxTotal > 0 ? `<tr><td colspan="2" style="padding-top:2px;font-size:12px;color:${MUTED};">Includes ${formatMoney(order.taxTotal, currency)} VAT</td></tr>` : ""}
    </table>

    <h2 style="margin:28px 0 8px;font-size:15px;font-weight:600;">Ship to</h2>
    <p style="margin:0;color:${MUTED};line-height:1.7;font-size:14px;">${addressLines}</p>

    <h2 style="margin:28px 0 8px;font-size:15px;font-weight:600;">Contact</h2>
    <p style="margin:0;color:${MUTED};line-height:1.7;font-size:14px;">
      ${escapeHtml(order.email)}${a?.phone ? `<br>${escapeHtml(a.phone)}` : ""}
    </p>

    <p style="margin:28px 0 0;">
      <a href="${adminUrl}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;">Open in admin</a>
    </p>`;

  const text = `New order #${order.number}

${a?.name ?? order.email} ordered from ${origin} — total ${formatMoney(order.grandTotal, currency)}.
${
  awaitingTransfer
    ? `\n*** AWAITING BANK TRANSFER — DO NOT POST YET ***
They will send ${formatMoney(order.grandTotal, currency)} quoting reference ${transferReference(order.number)}.
When it lands in your account, open the order and press "Mark as paid".\n`
    : "\nPaid by card.\n"
}
${items.map((i) => `${i.productTitle} (${i.variantTitle}) x${i.quantity}  ${formatMoney(i.lineTotal, currency)}`).join("\n")}

Subtotal: ${formatMoney(order.subtotal, currency)}
Delivery${order.shippingMethod ? ` (${order.shippingMethod})` : ""}: ${order.shippingTotal === 0 ? "Free" : formatMoney(order.shippingTotal, currency)}
Total: ${formatMoney(order.grandTotal, currency)}${order.taxTotal > 0 ? ` (incl. ${formatMoney(order.taxTotal, currency)} VAT)` : ""}

Ship to:
${a ? [a.name, a.line1, a.line2, a.city, a.region, a.postcode, countryName ?? a.country].filter(Boolean).join("\n") : "No shipping address on the order."}

Contact: ${order.email}${a?.phone ? ` / ${a.phone}` : ""}

Open in admin: ${adminUrl}`;

  return send({
    to,
    replyTo: order.email,
    subject: `${awaitingTransfer ? "Bank transfer pending" : "New order"} #${order.number} — ${origin} — ${formatMoney(order.grandTotal, currency)}`,
    html: shell(`New order #${order.number}`, body),
    text,
  });
}

export async function sendMagicLink(email: string, url: string): Promise<boolean> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:400;">Sign in to AZMIQ</h1>
    <div style="width:48px;height:1px;background:${COPPER};margin:16px 0 20px;"></div>
    <p style="margin:0 0 24px;color:${MUTED};line-height:1.7;">
      Click below to sign in. The link works once and expires in 20 minutes.
    </p>
    <a href="${url}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:4px;">Sign in</a>
    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};line-height:1.7;">
      If you did not request this, you can safely ignore it — nobody can sign in without the link.
    </p>`;

  return send({
    to: email,
    subject: "Your AZMIQ sign-in link",
    html: shell("Sign in to AZMIQ", body),
    text: `Sign in to AZMIQ:\n\n${url}\n\nThe link works once and expires in 20 minutes.`,
  });
}

export async function sendReturnReceived(email: string, rma: string, orderNumber: number): Promise<boolean> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:400;">We have your return request</h1>
    <div style="width:48px;height:1px;background:${COPPER};margin:16px 0 20px;"></div>
    <p style="margin:0 0 16px;color:${MUTED};line-height:1.7;">
      Return <strong style="color:${INK};">${rma}</strong> for order #${orderNumber}.
      We will review it within one working day and email you a prepaid label.
    </p>`;

  return send({
    to: email,
    subject: `Return ${rma} received`,
    html: shell("Return received", body),
    text: `We have your return request ${rma} for order #${orderNumber}. We will email a prepaid label within one working day.`,
  });
}

function escapeHtml(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** ISO country code to a readable name — "GB" -> "United Kingdom". Falls back
    to the raw code if the runtime has no ICU data. */
function regionName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
