import { SITE } from "./site";

/* ===========================================================================
   PAY BY BANK TRANSFER

   The only genuinely free way to be paid: the customer pushes the money from
   their own banking app straight into the shop's account. No processor sits in
   the middle, so no processor takes a cut.

   The trade is manual reconciliation - nothing tells us the money arrived, so
   an order placed this way sits at "awaiting_transfer" until someone confirms
   it in the admin. That confirmation, not this file, is what decrements stock
   and sends the receipt.

   Account details live in the environment, never in the database and never in
   source control, and are only ever rendered to the person who placed the
   order (or to staff). They are the same details that would appear on any
   invoice, but there is no reason to publish them on an open page.
   =========================================================================== */

export type BankDetails = {
  accountName: string;
  sortCode: string;
  accountNumber: string;
  bankName: string | null;
  /** For customers paying from outside the UK. */
  iban: string | null;
  bic: string | null;
};

function read(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** A UK transfer needs, at minimum, a name to pay and a sort code + account
    number to pay it into. Anything less and the option stays hidden. */
export function bankTransferConfigured(): boolean {
  return !!read("BANK_ACCOUNT_NAME") && !!read("BANK_SORT_CODE") && !!read("BANK_ACCOUNT_NUMBER");
}

export function bankDetails(): BankDetails | null {
  if (!bankTransferConfigured()) return null;
  return {
    accountName: read("BANK_ACCOUNT_NAME"),
    sortCode: formatSortCode(read("BANK_SORT_CODE")),
    accountNumber: read("BANK_ACCOUNT_NUMBER"),
    bankName: read("BANK_NAME") || null,
    iban: read("BANK_IBAN") || null,
    bic: read("BANK_BIC") || null,
  };
}

/** "123456" and "12-34-56" both render as "12-34-56". Banking apps accept
    either, but the hyphenated form is what people expect to read. */
function formatSortCode(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 6) return raw;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
}

/** The reference the customer must quote. Short, unambiguous, and derived from
    the order number so it can be matched against a bank statement by eye. */
export function transferReference(orderNumber: number): string {
  return `${SITE.name.toUpperCase()}-${orderNumber}`;
}
