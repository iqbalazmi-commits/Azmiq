import Link from "next/link";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { FOOTER_LINKS, SITE } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";
import { Logo } from "./Logo";

const COLUMNS: [string, readonly { title: string; href: string }[]][] = [
  ["Shop", FOOTER_LINKS.shop],
  ["Help", FOOTER_LINKS.help],
  ["About", FOOTER_LINKS.about],
  ["Legal", FOOTER_LINKS.legal],
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface-footer text-ink">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo on="light" withTagline />
            <hr className="rule-accent my-6" />
            <p className="text-sm leading-relaxed text-ink-muted">
              Leather, pure copper drinkware and home essentials — made by artisans who have worked
              their material for generations. Priced fairly and openly.
            </p>

            <ul className="mt-6 flex flex-col gap-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2.5 text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  <Mail size={15} aria-hidden="true" className="shrink-0" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone}`}
                  className="inline-flex items-center gap-2.5 text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  <Phone size={15} aria-hidden="true" className="shrink-0" />
                  {SITE.phoneDisplay}
                </a>
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-2">
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label="AZMIQ on Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-md text-ink-muted ring-1 ring-border transition-colors hover:text-ink hover:ring-border-strong"
              >
                <Instagram size={18} aria-hidden="true" />
              </a>
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label="AZMIQ on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-md text-ink-muted ring-1 ring-border transition-colors hover:text-ink hover:ring-border-strong"
              >
                <Facebook size={18} aria-hidden="true" />
              </a>
            </div>

            <NewsletterForm />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map(([heading, links]) => (
              <nav key={heading} aria-label={heading}>
                <h2 className="eyebrow text-ink-muted">{heading}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE.name}. Registered in England &amp; Wales.
            VAT GB 000 0000 00.
          </p>
          <p className="flex items-center gap-3">
            <span>Secure payment by Stripe</span>
            <span aria-hidden="true">&middot;</span>
            <span>Apple Pay &amp; Google Pay accepted</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
