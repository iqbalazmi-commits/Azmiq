import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { ImportListings } from "@/components/admin/ImportListings";

export const metadata = { title: "Import products" };
export const dynamic = "force-dynamic";

export default async function ImportProductsPage() {
  await requireAdminPage();

  const categories = await db
    .select({ id: t.categories.id, title: t.categories.title })
    .from(t.categories)
    .orderBy(asc(t.categories.position), asc(t.categories.title));

  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="text-sm text-ink-brand underline underline-offset-4">
        ← All products
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Import products from a file</h1>
      <p className="mt-1.5 text-ink-muted">
        Bring in your Amazon listings, with their descriptions, prices and photos, in one go. To add a single product
        by hand, use{" "}
        <Link href="/admin/products/new" className="text-ink-brand underline underline-offset-4">
          Add product
        </Link>{" "}
        instead.
      </p>
      <hr className="rule-accent mt-6" />
      <ImportListings categories={categories} />
    </div>
  );
}
