import { getSitemapBaseUrl, getSitemapChunkCount } from "@/lib/seo/sitemap-data";

// Match the sitemap/robots cache window so index generation stays cheap and in
// sync with the chunk count they advertise.
export const revalidate = 3600;

/**
 * Sitemap index — exposed at /sitemap.xml via a rewrite in next.config.ts.
 *
 * Next's generateSitemaps() only serves the individual chunks at
 * /sitemap/[id].xml and leaves /sitemap.xml as a 404. The metadata convention
 * also reserves the /sitemap.xml slug, so a route file can't live there. We
 * serve the index from this non-reserved path instead and rewrite /sitemap.xml
 * onto it, giving crawlers the classic single entry point that Search Console
 * and most SEO tools expect. It scales automatically as chunks grow.
 */
export async function GET() {
  const baseUrl = getSitemapBaseUrl();
  const chunkCount = await getSitemapChunkCount();
  const lastmod = new Date().toISOString();

  const sitemaps = Array.from(
    { length: chunkCount },
    (_, i) =>
      `  <sitemap>\n` +
      `    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `  </sitemap>`
  ).join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${sitemaps}\n` +
    `</sitemapindex>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
