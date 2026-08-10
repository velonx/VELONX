import { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugifyPost, slugifyResource } from "@/lib/utils";
import { getThreadIndexability } from "@/lib/seo/thread-indexability";
import {
  getProfileIndexability,
  PROFILE_INDEXABILITY_SELECT,
} from "@/lib/seo/profile-indexability";

// Google caps a single sitemap at 50,000 URLs / 50MB. We chunk below that with
// a safety buffer, so the sitemap scales without hitting the hard limit.
export const SITEMAP_CHUNK_SIZE = 45000;

// Stable timestamp for static marketing pages. Bump this when their content
// meaningfully changes, rather than reporting "modified now" on every request.
const STATIC_PAGES_LAST_MODIFIED = new Date("2026-07-31");

/**
 * Base URL for canonical/sitemap URLs. Kept consistent with seo.config.ts so
 * canonical URLs always match the URLs advertised in the sitemap.
 */
export function getSitemapBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://velonx.in"
  );
}

async function buildAllSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSitemapBaseUrl();
  const currentDate = new Date();

  // At build time (e.g. CI) DATABASE_URL is often unset, so the Prisma stub
  // points at a local MongoDB that isn't running. Each query would then hang
  // for the full server-selection timeout before throwing, and across every
  // sitemap chunk + robots.txt that easily exceeds the build worker's 60s
  // limit, failing the build. When there's no DB configured, emit only the
  // static routes and skip the dynamic DB-backed entries entirely. At runtime
  // (production) DATABASE_URL is set, so the full sitemap is generated as
  // usual and refreshed via revalidation.
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  // Static public routes
  const publicRoutes = [
    "",
    "/about",
    "/contact",
    "/career",
    "/blog",
    "/events",
    "/mentors",
    "/projects",
    "/resources",
    "/privacy",
    "/terms",
    "/community-guidelines",
    "/swag",
    "/apply-mentor",
    "/community",
    "/community/groups",
    "/leaderboard",
    "/network",
    "/submit-project",
  ];

  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: STATIC_PAGES_LAST_MODIFIED,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : 0.8,
  }));

  if (!hasDatabase) {
    return staticEntries;
  }

  // Published blog posts
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const publishedPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, updatedAt: true },
    });
    blogEntries = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug || post.id}`,
      lastModified: post.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[Sitemap] Failed to fetch blog posts:", err);
  }

  // Active opportunities
  let careerEntries: MetadataRoute.Sitemap = [];
  try {
    const activeOpportunities = await prisma.opportunity.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, slug: true, updatedAt: true },
    });
    careerEntries = activeOpportunities.map((opp) => ({
      url: `${baseUrl}/career/${opp.slug || opp.id}`,
      lastModified: opp.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap] Failed to fetch active opportunities:", err);
  }

  // Events (exclude cancelled — they're dead pages)
  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await prisma.event.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { id: true, slug: true, updatedAt: true },
    });
    eventEntries = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug || event.id}`,
      lastModified: event.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap] Failed to fetch events:", err);
  }

  // Public community groups
  let groupEntries: MetadataRoute.Sitemap = [];
  try {
    const publicGroups = await prisma.communityGroup.findMany({
      where: { isPrivate: false },
      select: { id: true, updatedAt: true },
    });
    groupEntries = publicGroups.map((group) => ({
      url: `${baseUrl}/community/groups/${group.id}`,
      lastModified: group.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[Sitemap] Failed to fetch community groups:", err);
  }

  // Public community threads that meet the SEO quality bar
  let threadEntries: MetadataRoute.Sitemap = [];
  try {
    const publicPosts = await prisma.communityPost.findMany({
      where: {
        visibility: "PUBLIC",
        OR: [{ group: null }, { group: { isPrivate: false } }],
      },
      select: {
        id: true,
        content: true,
        authorId: true,
        updatedAt: true,
        comments: { select: { authorId: true, content: true } },
      },
    });

    threadEntries = publicPosts
      .filter((post) =>
        getThreadIndexability(post.content, post.authorId, post.comments)
      )
      .map((post) => ({
        url: `${baseUrl}/community/t/${slugifyPost(post.id, post.content)}`,
        lastModified: post.updatedAt || currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
  } catch (err) {
    console.error("[Sitemap] Failed to fetch community threads:", err);
  }

  // Quick Reference resources
  let resourceEntries: MetadataRoute.Sitemap = [];
  try {
    const resources = await prisma.resource.findMany({
      select: { id: true, title: true, updatedAt: true },
    });
    resourceEntries = resources.map((res) => ({
      url: `${baseUrl}/resources/${slugifyResource(res.id, res.title)}`,
      lastModified: res.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap] Failed to fetch resources:", err);
  }

  // Member profiles that clear the quality bar. Advertising every account would
  // bury the index in near-empty pages, so this uses the same gate the profile
  // page's robots metadata applies.
  let profileEntries: MetadataRoute.Sitemap = [];
  try {
    const users = await prisma.user.findMany({
      where: { slug: { not: null } },
      select: { ...PROFILE_INDEXABILITY_SELECT, updatedAt: true },
    });
    profileEntries = users
      .filter((user) => getProfileIndexability(user))
      .map((user) => ({
        url: `${baseUrl}/network/${user.slug}`,
        lastModified: user.updatedAt || currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
  } catch (err) {
    console.error("[Sitemap] Failed to fetch member profiles:", err);
  }

  return [
    ...staticEntries,
    ...blogEntries,
    ...careerEntries,
    ...eventEntries,
    ...groupEntries,
    ...threadEntries,
    ...resourceEntries,
    ...profileEntries,
  ];
}

/**
 * Cached full list of sitemap entries. Wrapped in unstable_cache so the heavy
 * DB work runs at most once per hour and is shared across every sitemap chunk
 * AND robots.ts, instead of re-running on each request.
 */
export const getAllSitemapEntries = unstable_cache(
  buildAllSitemapEntries,
  ["sitemap-entries"],
  { revalidate: 3600 }
);

/** Number of sitemap chunks needed to stay under the 50k-URL limit. */
export async function getSitemapChunkCount(): Promise<number> {
  const entries = await getAllSitemapEntries();
  return Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE));
}
