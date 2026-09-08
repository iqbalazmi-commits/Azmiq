import { Breadcrumbs } from "./Breadcrumbs";
import type { ContentPage } from "@/lib/content";

/* One renderer for every long-form page. Narrow measure, generous leading,
   and no decoration - the restraint that makes the product photography feel
   expensive works the same way on a page of text. */

export function EditorialPage({
  page,
  path,
  parent,
}: {
  page: ContentPage;
  path: string;
  parent?: { name: string; path: string };
}) {
  return (
    <div className="container-page py-8 pb-24">
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          ...(parent ? [parent] : []),
          { name: page.title, path },
        ]}
      />

      <article className="mt-10 max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight text-ink">{page.title}</h1>
        {page.subtitle ? <p className="mt-3 text-lg text-ink-muted">{page.subtitle}</p> : null}
        <hr className="rule-accent mt-7" />

        {page.updated ? (
          <p className="mt-6 text-sm text-ink-muted">Last updated {page.updated}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-10">
          {page.sections.map((section, index) => (
            <section key={section.heading ?? index}>
              {section.heading ? (
                <h2 className="font-serif text-2xl text-ink">{section.heading}</h2>
              ) : null}

              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-4 leading-relaxed text-ink-muted first:mt-4"
                >
                  {paragraph}
                </p>
              ))}

              {section.list ? (
                <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-ink-muted">
                  {section.list.map((item) => (
                    <li key={item.slice(0, 40)}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
