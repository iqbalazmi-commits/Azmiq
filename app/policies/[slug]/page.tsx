import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialPage } from "@/components/shop/EditorialPage";
import { CONTENT, POLICY_SLUGS, type PolicySlug } from "@/lib/content";

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = CONTENT[slug];
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/policies/${slug}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!POLICY_SLUGS.includes(slug as PolicySlug)) notFound();
  const page = CONTENT[slug];
  if (!page) notFound();

  return (
    <EditorialPage
      page={page}
      path={`/policies/${slug}`}
      parent={{ name: "Policies", path: "/policies/terms" }}
    />
  );
}
