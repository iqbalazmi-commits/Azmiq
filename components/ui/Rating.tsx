import { cn } from "@/lib/utils";

/* A rating is information, not decoration, so it gets a real text alternative
   and the stars themselves are hidden from assistive technology. Half-stars
   are drawn with a clip rather than a second icon set, which keeps the shape
   identical between filled and empty. */

export function Rating({
  value,
  count,
  size = "md",
  showCount = true,
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}) {
  const rounded = Math.round(value * 10) / 10;
  const dimension = size === "sm" ? 14 : 17;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return <Star key={i} fill={fill} size={dimension} />;
        })}
      </span>
      <span className="sr-only">
        Rated {rounded} out of 5{count ? ` from ${count} reviews` : ""}
      </span>
      {showCount ? (
        <span className="text-sm text-ink-muted tabular-nums" aria-hidden="true">
          {rounded.toFixed(1)}
          {count ? ` (${count})` : ""}
        </span>
      ) : null}
    </div>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  const id = `star-${Math.round(fill * 100)}-${size}`;
  const path =
    "M8 1.3l2.06 4.18 4.61.67-3.34 3.25.79 4.6L8 11.83 3.88 14l.79-4.6L1.33 6.15l4.61-.67z";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" focusable="false">
      <defs>
        <linearGradient id={id}>
          <stop offset={fill} stopColor="var(--color-surface-wellness)" />
          <stop offset={fill} stopColor="transparent" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill={`url(#${id})`} stroke="var(--color-surface-wellness)" strokeWidth="1" />
    </svg>
  );
}
