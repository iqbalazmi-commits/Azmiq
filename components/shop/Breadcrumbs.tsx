import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* Visible breadcrumbs matching the BreadcrumbList JSON-LD. Google will not
   render a breadcrumb trail from markup that has no on-page counterpart, and
   more importantly it is the fastest way back up for anyone who arrived from
   search rather than the home page. */

export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight size={14} aria-hidden="true" className="text-ink-muted/70" />
              ) : null}
              {isLast ? (
                <span aria-current="page" className="text-ink">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className="underline-offset-4 hover:text-ink hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
