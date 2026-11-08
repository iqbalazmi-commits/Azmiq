import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { Media } from "@/components/ui/Media";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { deleteProductImage, setMainProductImage, setProductStatus } from "@/lib/actions/admin";

export const metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function AdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const { created } = await searchParams;

  const [product, categories] = await Promise.all([
    db.query.products.findFirst({
      where: eq(t.products.id, id),
      with: {
        variants: { orderBy: [asc(t.variants.position)] },
        images: { orderBy: [asc(t.productImages.position)] },
        categories: true,
      },
    }),
    db
      .select({ id: t.categories.id, title: t.categories.title, slug: t.categories.slug })
      .from(t.categories)
      .orderBy(asc(t.categories.position), asc(t.categories.title)),
  ]);
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

      {product.status !== "active" ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface-raised p-5">
          <p className="text-sm text-ink">
            {created ? "Product created. " : null}
            <strong>This product is hidden from the shop.</strong>{" "}
            {product.images.length === 0
              ? "Add at least one photo below, then publish it."
              : "Publish it when you are happy with it."}
          </p>
          <form action={setProductStatus}>
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="status" value="active" />
            <button
              type="submit"
              disabled={product.images.length === 0}
              className="min-h-11 rounded-md bg-surface-brand px-5 text-sm font-medium text-ink-on-brand hover:bg-surface-brand-hover disabled:opacity-40"
            >
              Publish
            </button>
          </form>
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">Photos</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The first photo is used on product cards, in search and in Google. Use “Make main” to
          change it. Portrait photos (taller than wide) look best.
        </p>
        <ul className="mt-4 flex flex-wrap gap-4">
          {product.images.map((image, index) => (
            <li key={image.id} className="w-32">
              <Media
                src={image.url}
                alt={image.alt}
                width={200}
                height={250}
                sizes="128px"
                aspect="portrait"
                className="rounded-md border border-border"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {index === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-wellness">
                    <Star size={12} aria-hidden="true" />
                    Main
                  </span>
                ) : (
                  <form action={setMainProductImage}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <button type="submit" className="min-h-9 rounded-md border border-border-control px-2 text-xs text-ink hover:border-ink">
                      Make main
                    </button>
                  </form>
                )}
                <form action={deleteProductImage}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <button
                    type="submit"
                    aria-label={`Delete photo ${index + 1}`}
                    className="inline-flex min-h-9 items-center rounded-md border border-border-control px-2 text-xs text-danger hover:border-danger"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
        <PhotoUploader productId={product.id} />
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
          categories={categories}
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
            categoryIds: product.categories.map((pc) => pc.categoryId),
          }}
        />
      </section>
    </div>
  );
}
