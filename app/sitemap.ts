import type { MetadataRoute } from "next";
import { getCatalogue, getCategories } from "@/lib/data";
import { POLICY_SLUGS } from "@/lib/content";
import { SITE } from "@/lib/site";

// Regenerated hourly alongside the catalogue, so a new product appears in the
// sitemap without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getCatalogue(), getCategories()]);
  const now = new Date();

  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/collections/all", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/ayurveda", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/fair-pricing", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/copper-care", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/returns", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/accessibility", priority: 0.3, changeFrequency: "yearly" as const },
    ...POLICY_SLUGS.map((slug) => ({
      path: `/policies/${slug}`,
      priority: 0.3,
      changeFrequency: "yearly" as const,
    })),
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${SITE.url}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...categories.map((category) => ({
      url: `${SITE.url}/collections/${category.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE.url}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
