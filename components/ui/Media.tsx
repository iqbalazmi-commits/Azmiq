import Image from "next/image";
import { cn } from "@/lib/utils";

/* ===========================================================================
   MEDIA

   Every image on this site declares its intrinsic width and height. That is
   the single largest contributor to CLS on a photography-led store: reserve
   the box before the bytes arrive and the layout never jumps.

   The placeholder artwork is SVG, which gains nothing from AVIF conversion and
   would otherwise need `dangerouslyAllowSVG`. Detecting it here keeps that
   flag off, which matters once merchandisers can upload files themselves.
   =========================================================================== */

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  aspect?: "portrait" | "square" | "wide" | "none";
};

const ASPECT = {
  portrait: "media-portrait",
  square: "media-square",
  wide: "media-wide",
  none: "",
};

export function Media({
  src, alt, width, height, sizes, priority = false,
  className, imgClassName, aspect = "portrait",
}: Props) {
  const isVector = src.endsWith(".svg");
  return (
    <div className={cn("relative overflow-hidden bg-surface-sunken", ASPECT[aspect], className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        // Above-the-fold imagery must not be lazy - it is usually the LCP.
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        unoptimized={isVector}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}

/** Decorative imagery - empty alt so assistive tech skips it rather than
    reading out a filename or a description of pure decoration. */
export function DecorativeMedia(props: Omit<Props, "alt">) {
  return <Media {...props} alt="" />;
}
