import { MetadataRoute } from "next";
import { getSitemapBaseUrl } from "@/lib/seo/sitemap-data";

// Match the sitemap's cache window so discovery stays cheap and in sync.
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = getSitemapBaseUrl();

  // The sitemap is chunked via generateSitemaps() and served at
  // /sitemap/[id].xml, with a <sitemapindex> at /sitemap.xml listing every
  // chunk. Point crawlers at the index so they discover all chunks from one
  // URL and it scales automatically as chunks grow.
  const sitemap = `${baseUrl}/sitemap.xml`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/", // Private student and admin dashboards
        "/settings/", // Private settings
        "/admin/",    // Admin routes
        "/auth/",     // Auth flow pages (login, signup, forgot password, etc.)
      ],
    },
    sitemap,
  };
}
