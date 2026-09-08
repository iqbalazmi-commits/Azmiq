import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { Media } from "@/components/ui/Media";

export const metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const product = await db.query.products.findFirst({
    where: eq(t.products.id, id),
    with: {
      variants: { orderBy: [asc(t.variants.position)] },
      images: { orderBy: [asc(t.productImages.position)] },
    },
  });
  if (!product) notFound();

  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="text-sm text-ink-brand underline underline-offset-4">
        ← All products
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-ink">{product.title}</h1>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-ink-brand underline underline-offset-4"
        >
          View on the shop
          <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </div>
      <hr className="rule-accent mt-6" />

      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">Images</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The first image is used on product cards and in search results. The macro shot is what
          sells the hammered texture — keep one in every product.
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {product.images.map((image) => (
            <li key={image.id} className="w-28">
              <Media
                src={image.url}
                alt={image.alt}
                width={200}
                height={250}
                sizes="112px"
                aspect="portrait"
                className="rounded-md border border-border"
              />
              <p className="mt-1.5 text-xs text-ink-muted">{image.kind}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl text-ink">Price and stock</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Prices are in pounds. A previous price must be higher than the current one — the shop
          works out the percentage saved from these two numbers.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          {product.variants.map((variant) => (
            <VariantEditor
              key={variant.id}
              variant={{
                id: variant.id,
                sku: variant.sku,
                title: variant.title,
                priceGbp: variant.priceGbp,
                compareAtGbp: variant.compareAtGbp,
                inventory: variant.inventory,
              }}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl text-ink">Details</h2>
        <ProductEditor
          product={{
            id: product.id,
            title: product.title,
            slug: product.slug,
            subtitle: product.subtitle ?? "",
            summary: product.summary,
            description: product.description,
            wellnessStory: product.wellnessStory ?? "",
            careInstructions: product.careInstructions ?? "",
            finish: product.finish ?? "",
            dimensions: product.dimensions ?? "",
            status: product.status,
            featured: product.featured,
            seoTitle: product.seoTitle ?? "",
            seoDescription: product.seoDescription ?? "",
          }}
        />
      </section>
    </div>
  );
}
