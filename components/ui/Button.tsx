import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Buttons carry no colour of their own - every value here is a design token.
   Hover and active states change the token, never the hex. */

type Variant = "primary" | "secondary" | "secondary-inverse" | "wellness" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-surface-brand text-ink-on-brand hover:bg-surface-brand-hover active:bg-surface-brand-hover",
  secondary:
    "bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink/[0.03]",
  "secondary-inverse":
    "bg-transparent text-ink-inverse border border-white/30 hover:border-white hover:bg-white/10",
  wellness:
    "bg-surface-wellness text-ink-on-brand hover:bg-surface-wellness-hover",
  ghost:
    "bg-transparent px-0 min-h-0 text-sm normal-case tracking-normal text-ink-brand " +
    "underline underline-offset-[6px] decoration-1 hover:decoration-2",
  danger:
    "bg-danger text-ink-on-brand hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  // 44px minimum touch target on every size - WCAG 2.5.5 and, more practically,
  // the difference between a thumb hitting Add to basket and missing it.
  sm: "min-h-11 px-5 text-2xs uppercase tracking-widest",
  md: "min-h-12 px-7 text-xs uppercase tracking-widest",
  lg: "min-h-[3.25rem] px-9 text-xs uppercase tracking-widest",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium " +
  "transition-colors duration-200 ease-out-soft select-none " +
  "disabled:opacity-45 disabled:cursor-not-allowed";

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  // SIZES first so a variant (notably `ghost`) can override the size defaults.
  return cn(BASE, SIZES[size], VARIANTS[variant], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonStyles(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", size = "md", className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonStyles(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
