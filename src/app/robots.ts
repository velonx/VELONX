import { MetadataRoute } from "next";
import { getSitemapBaseUrl, getSitemapChunkCount } from "@/lib/seo/sitemap-data";

// Match the sitemap's cache window so chunk discovery stays cheap and in sync.
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = getSitemapBaseUrl();

  // The sitemap is chunked via generateSitemaps(), so it's served at
  // /sitemap/[id].xml rather than /sitemap.xml. List every chunk so crawlers
  // discover them all from robots.txt.
  const chunkCount = await getSitemapChunkCount();
  const sitemap = Array.from(
    { length: chunkCount },
    (_, i) => `${baseUrl}/sitemap/${i}.xml`
  );

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
