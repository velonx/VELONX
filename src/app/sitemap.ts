import { MetadataRoute } from "next";
import {
  getAllSitemapEntries,
  getSitemapChunkCount,
  SITEMAP_CHUNK_SIZE,
} from "@/lib/seo/sitemap-data";

// Cache the generated sitemap and regenerate at most once per hour instead of
// re-running every DB query on every request (crawlers hit the sitemap often).
export const revalidate = 3600;

// Split the sitemap into 50k-URL chunks served at /sitemap/[id].xml so it scales
// past Google's single-file limit as community threads/resources grow.
export async function generateSitemaps() {
  const chunkCount = await getSitemapChunkCount();
  return Array.from({ length: chunkCount }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const entries = await getAllSitemapEntries();
  // Next 16 passes `id` as a promise resolving to the chunk id as a string,
  // so await + coerce it before using it for arithmetic.
  const chunkId = Number(await id);
  const start = chunkId * SITEMAP_CHUNK_SIZE;
  return entries.slice(start, start + SITEMAP_CHUNK_SIZE);
}
