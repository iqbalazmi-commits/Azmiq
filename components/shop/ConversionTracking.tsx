"use client";

import { useEffect } from "react";
import { readConsentFromDocument } from "@/lib/consent";

/* GOOGLE ADS CONVERSION

   Google Ads has no server-side import that is worth the complexity at this
   size, so this one event stays in the browser. It is rendered ONLY for an
   order that is actually paid - a bank transfer awaiting payment must never
   report a conversion.

   Guarded twice: marketing consent, and a per-order flag so refreshing the
   confirmation page cannot report the same sale again. */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function ConversionTracking({
  transactionId,
  value,
  currency,
}: {
  transactionId: string;
  value: number;
  currency: string;
}) {
  useEffect(() => {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL;
    if (!adsId || !label) return;
    if (!readConsentFromDocument()?.marketing) return;

    const key = "azmiq:conversion:" + transactionId;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode can refuse storage. Reporting once more is better than
      // never reporting at all, so carry on.
    }

    window.gtag?.("event", "conversion", {
      send_to: adsId + "/" + label,
      transaction_id: transactionId,
      value,
      currency,
    });
  }, [transactionId, value, currency]);

  return null;
}
