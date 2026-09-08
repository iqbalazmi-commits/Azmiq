import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

const COLUMNS: [string, readonly { title: string; href: string }[]][] = [
  ["Shop", FOOTER_LINKS.shop],
  ["Help", FOOTER_LINKS.help],
  ["About", FOOTER_LINKS.about],
  ["Legal", FOOTER_LINKS.legal],
];

export function Footer() {
  return (
    <footer className="mt-24 bg-surface-brand text-ink-on-brand">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <p className="font-serif text-2xl tracking-[0.28em]">AZMIQ</p>
            <p className="mt-2 text-sm tracking-widest text-ink-on-inverse-muted">{SITE.tagline}</p>
            <hr className="rule-accent my-6" />
            <p className="text-sm leading-relaxed text-ink-on-brand/85">
              Handcrafted copper drinkware, made by artisans who have worked the metal for
              generations. Luxury-grade quality, priced fairly and openly.
            </p>
            <NewsletterForm />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map(([heading, links]) => (
              <nav key={heading} aria-label={heading}>
                <h2 className="eyebrow text-ink-on-inverse-muted">{heading}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-on-brand/85 underline-offset-4 hover:text-ink-on-brand hover:underline"
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

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 text-xs text-ink-on-brand/70 sm:flex-row sm:items-center sm:justify-between">
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
