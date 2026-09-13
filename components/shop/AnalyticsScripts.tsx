"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsentFromDocument, type ConsentState } from "@/lib/consent";

/* The blocking mechanism. Until consent exists, this renders nothing at all -
   no script tag, no preconnect, no pixel. React only mounts <Script> once the
   corresponding permission is true, so the network request cannot happen
   before the customer has agreed to it.

   Withdrawing consent removes the tag on the next navigation and, for GA, the
   denied consent signal is sent immediately.

   Google Analytics and Google Ads share one gtag loader, so the tag is fetched
   once whether one or both are configured. Meta is a separate script and is
   marketing-only: it exists to measure advertising, so analytics consent alone
   is not enough to load it. */

export function AnalyticsScripts() {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsent(readConsentFromDocument());
    const onChange = (event: Event) => setConsent((event as CustomEvent<ConsentState>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  const ga = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const ads = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const klaviyo = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID;
  const metaPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Ads measurement is marketing, so Google Ads needs marketing consent even
  // though it rides on the same loader as analytics.
  const wantsGoogle = (consent?.analytics && ga) || (consent?.marketing && ads);
  const grant = consent?.marketing ? "granted" : "denied";

  return (
    <>
      {wantsGoogle ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga || ads}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('consent', 'default', {
                ad_storage: '${grant}',
                ad_user_data: '${grant}',
                ad_personalization: '${grant}',
                analytics_storage: '${consent?.analytics ? "granted" : "denied"}'
              });
              ${consent?.analytics && ga ? `gtag('config', '${ga}', { send_page_view: true, anonymize_ip: true });` : ""}
              ${consent?.marketing && ads ? `gtag('config', '${ads}');` : ""}
              window.dispatchEvent(new Event('azmiq:analytics-ready'));
            `}
          </Script>
        </>
      ) : null}

      {consent?.marketing && metaPixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
            t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixel}');
            fbq('track', 'PageView');
          `}
        </Script>
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
