"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsentFromDocument, type ConsentState } from "@/lib/consent";

/* The blocking mechanism. Until consent exists, this renders nothing at all -
   no script tag, no preconnect, no pixel. React only mounts <Script> once the
   corresponding permission is true, so the network request cannot happen
   before the customer has agreed to it.

   Withdrawing consent removes the tag on the next navigation and, for GA, the
   denied consent signal is sent immediately. */

export function AnalyticsScripts() {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsent(readConsentFromDocument());
    const onChange = (event: Event) => setConsent((event as CustomEvent<ConsentState>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  const ga = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const klaviyo = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID;

  return (
    <>
      {consent?.analytics && ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('consent', 'default', {
                ad_storage: '${consent.marketing ? "granted" : "denied"}',
                ad_user_data: '${consent.marketing ? "granted" : "denied"}',
                ad_personalization: '${consent.marketing ? "granted" : "denied"}',
                analytics_storage: 'granted'
              });
              gtag('config', '${ga}', { send_page_view: true, anonymize_ip: true });
              window.dispatchEvent(new Event('azmiq:analytics-ready'));
            `}
          </Script>
        </>
      ) : null}

      {consent?.marketing && klaviyo ? (
        <Script
          src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${klaviyo}`}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
