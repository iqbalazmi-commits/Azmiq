/* ===========================================================================
   COOKIE CONSENT

   "Blocks scripts until accepted" has to mean it. No analytics or marketing
   tag is present in the document at all until a choice is stored - they are
   injected afterwards, at runtime, by AnalyticsScripts. Nothing is loaded and
   then told not to fire, because a loaded tag has already made its request.

   PECR and the UK GDPR both require that refusing is as easy as accepting, so
   the banner has a Reject button of equal prominence and no pre-ticked boxes.
   =========================================================================== */

export const CONSENT_COOKIE = "azmiq_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "azmiq:consent";

export type ConsentState = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  at: string;
};

export const DENY_ALL: ConsentState = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  at: "",
};

export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>;
    // A version bump invalidates old consent - which is the correct behaviour
    // when the set of vendors changes, not merely a cache-busting trick.
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      at: typeof parsed.at === "string" ? parsed.at : "",
    };
  } catch {
    return null;
  }
}

export function readConsentFromDocument(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(match?.slice(CONSENT_COOKIE.length + 1));
}

export function writeConsentToDocument(state: Omit<ConsentState, "version" | "necessary" | "at">) {
  const value: ConsentState = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: state.analytics,
    marketing: state.marketing,
    at: new Date().toISOString(),
  };
  const maxAge = 60 * 60 * 24 * 182; // six months, then ask again
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${maxAge}; samesite=lax` +
    (location.protocol === "https:" ? "; secure" : "");
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return value;
}
