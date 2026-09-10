import Image from "next/image";
import { SITE } from "@/lib/site";

/* ===========================================================================
   AZMIQ LOGO

   The brand logo, used exactly as supplied (public/brand/azmiq-logo.png).
   It ships with its own background, so it is shown in a rounded tile with a
   hairline edge — framed deliberately rather than floated on the surface.
   =========================================================================== */

const LOGO_SRC = "/brand/azmiq-logo.png";

export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={LOGO_SRC}
      alt=""
      width={size}
      height={size}
      priority
      className={`rounded-lg ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

/** Logo tile, optionally with the tagline. `on` picks the surrounding ground. */
export function Logo({
  on = "brand",
  withTagline = false,
  className,
}: {
  on?: "brand" | "footer" | "light";
  withTagline?: boolean;
  className?: string;
}) {
  const ring =
    on === "light"
      ? "ring-[color-mix(in_srgb,var(--color-accent-gold)_45%,transparent)]"
      : "ring-white/15";
  const taglineColour =
    on === "light" ? "text-ink-muted" : "text-ink-on-inverse-muted";
  const size = withTagline ? 50 : 46;

  return (
    <span className={`flex items-center gap-3 ${className ?? ""}`}>
      <Image
        src={LOGO_SRC}
        alt={`${SITE.name} logo`}
        width={size}
        height={size}
        priority
        className={`rounded-lg ring-1 ${ring}`}
      />
      {withTagline ? (
        <span className={`text-2xs uppercase tracking-widest ${taglineColour}`}>
          {SITE.tagline}
        </span>
      ) : null}
    </span>
  );
}
