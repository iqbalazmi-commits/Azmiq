import { cn } from "@/lib/utils";

/* Status colour follows the palette rule: green means good, near-black means
   neutral or in-progress, and red is kept for genuine failure only - a
   cancelled order is a failure, a pending one is not. */

const STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting payment", className: "bg-surface-sunken text-ink" },
  paid: { label: "Paid", className: "bg-surface-wellness text-ink-on-brand" },
  fulfilled: { label: "Shipped", className: "bg-surface-wellness text-ink-on-brand" },
  refunded: { label: "Refunded", className: "bg-surface-inverse text-ink-inverse" },
  partially_refunded: { label: "Part refunded", className: "bg-surface-inverse text-ink-inverse" },
  cancelled: { label: "Cancelled", className: "bg-danger-wash text-danger" },
};

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STYLES[status] ?? { label: status, className: "bg-surface-sunken text-ink" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
