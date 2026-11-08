import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { NewProductForm } from "@/components/admin/NewProductForm";

export const metadata = { title: "Add product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdminPage();

  const categories = await db
    .select({ id: t.categories.id, title: t.categories.title, slug: t.categories.slug })
    .from(t.categories)
    .orderBy(asc(t.categories.position), asc(t.categories.title));

  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-ink-brand underline underline-offset-4">
        ← All products
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Add a product</h1>
      <p className="mt-1.5 text-ink-muted">
        Fill in the basics. Next you add photos, then press Publish. It stays hidden from the shop
        until you do.
      </p>
      <hr className="rule-accent mt-6" />
      <NewProductForm categories={categories} />
    </div>
  );
}
