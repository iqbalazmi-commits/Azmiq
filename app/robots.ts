import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Personal, transactional or infinite surfaces. Blocking them keeps
        // crawl budget on the catalogue, where it earns something.
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/admin",
          "/api/",
          "/search",
          "/*?*sort=",
          "/*?*finish=",
          "/*?*capacity=",
          "/*?*price=",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
