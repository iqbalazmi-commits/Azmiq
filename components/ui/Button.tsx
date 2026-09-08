import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Buttons carry no colour of their own - every value here is a design token.
   Hover and active states change the token, never the hex. */

type Variant = "primary" | "secondary" | "wellness" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-surface-brand text-ink-on-brand hover:bg-surface-brand-hover active:bg-surface-brand-hover",
  secondary:
    "bg-surface-raised text-ink border border-border-control hover:border-ink hover:bg-surface",
  wellness:
    "bg-surface-wellness text-ink-on-brand hover:bg-surface-wellness-hover",
  ghost:
    "bg-transparent text-ink-brand underline underline-offset-4 decoration-1 hover:decoration-2",
  danger:
    "bg-danger text-ink-on-brand hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  // 44px minimum touch target on every size - WCAG 2.5.5 and, more practically,
  // the difference between a thumb hitting Add to basket and missing it.
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-base",
  lg: "min-h-14 px-8 text-lg",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-wide " +
  "transition-colors duration-200 ease-out-soft select-none " +
  "disabled:opacity-45 disabled:cursor-not-allowed";

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
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
