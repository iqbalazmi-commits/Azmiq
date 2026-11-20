import Image from "next/image";
import { SITE } from "@/lib/site";

/* ===========================================================================
   AZMIQ LOGO

   The black AZMIQ wordmark (public/brand/azmiq-wordmark.png), cut out of the
   supplied artwork with a transparent background so it sits straight on the
   page. It is drawn for light grounds; every place it appears is light.
   The browser-tab icon (app/icon.png) is the "AZ" from the same artwork.
   =========================================================================== */

const WORDMARK_SRC = "/brand/azmiq-wordmark.png";
/** The artwork's own proportions, so the logo never stretches. */
const WORDMARK_RATIO = 1148 / 307;

/** The wordmark at a given height, in pixels. */
export function Wordmark({ height = 26, className, decorative = false }: { height?: number; className?: string; decorative?: boolean }) {
  return (
    <Image
      src={WORDMARK_SRC}
      alt={decorative ? "" : `${SITE.name}`}
      aria-hidden={decorative ? true : undefined}
      width={Math.round(height * WORDMARK_RATIO)}
      height={height}
      priority
      className={className}
    />
  );
}

/** The logo, optionally with the tagline beneath it. */
export function Logo({
  withTagline = false,
  className,
}: {
  /** Kept for existing callers; the wordmark is made for light grounds. */
  on?: "brand" | "footer" | "light";
  withTagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex flex-col items-start gap-2.5 ${className ?? ""}`}>
      <Wordmark height={withTagline ? 30 : 26} className="h-[22px] w-auto sm:h-[26px]" />
      {withTagline ? (
        <span className="text-2xs uppercase tracking-widest text-ink-muted">{SITE.tagline}</span>
      ) : null}
    </span>
  );
}
