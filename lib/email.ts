import { formatMoney, type Currency } from "./money";
import { SITE } from "./site";
import type { Order, OrderItem } from "@/db/schema";

/* ===========================================================================
   TRANSACTIONAL EMAIL

   Order confirmations, magic links and return notices. Deliberately separate
   from Klaviyo: a customer who has opted out of marketing must still receive
   the receipt for something they paid for.

   With no RESEND_API_KEY set, messages are logged to the server console rather
   than silently dropped - so local checkout still shows you the magic link.
   =========================================================================== */

type Message = { to: string; subject: string; html: string; text: string };

async function send(message: Message): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${SITE.name} <orders@azmiq.com>`;

  if (!key) {
    console.log(
      `\n--- EMAIL (not sent: RESEND_API_KEY unset) ---\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n---\n`,
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!response.ok) {
      console.error("[email] send failed", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send threw", error);
    return false;
  }
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
