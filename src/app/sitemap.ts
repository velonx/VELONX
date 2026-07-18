import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { normalizeStylizedText, slugifyPost } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://velonx.in";

  // List of all static public routes
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
    "/api-docs",
    "/apply-mentor",
    "/community",
    "/community/groups",
    "/leaderboard",
    "/submit-project",
  ];

  const currentDate = new Date();

  // Static site map entries
  const siteMapEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const), // Homepage changes more frequently
    priority: route === "" ? 1.0 : 0.8, // Prioritize homepage
  }));

  // Add dedicated entry for Quick References tab (client-side tab not crawlable otherwise)
  siteMapEntries.push({
    url: `${baseUrl}/resources?tab=references`,
    lastModified: currentDate,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  });

  // Fetch published blog posts dynamically to index them
  let dynamicBlogEntries: MetadataRoute.Sitemap = [];
  try {
    const publishedPosts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    });

    dynamicBlogEntries = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug || post.id}`,
      lastModified: post.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[Sitemap Generation] Failed to fetch blog posts:", err);
  }

  // Fetch active opportunities dynamically to index them
  let dynamicCareerEntries: MetadataRoute.Sitemap = [];
  try {
    const activeOpportunities = await prisma.opportunity.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    });

    dynamicCareerEntries = activeOpportunities.map((opp) => ({
      url: `${baseUrl}/career/${opp.slug || opp.id}`,
      lastModified: opp.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap Generation] Failed to fetch active opportunities:", err);
  }

  // Fetch events dynamically to index them
  let dynamicEventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    });

    dynamicEventEntries = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug || event.id}`,
      lastModified: event.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap Generation] Failed to fetch events:", err);
  }

  // Fetch public community groups dynamically
  let dynamicGroupEntries: MetadataRoute.Sitemap = [];
  try {
    const publicGroups = await prisma.communityGroup.findMany({
      where: {
        isPrivate: false,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    dynamicGroupEntries = publicGroups.map((group) => ({
      url: `${baseUrl}/community/groups/${group.id}`,
      lastModified: group.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[Sitemap Generation] Failed to fetch community groups:", err);
  }

  // Fetch public community posts dynamically to index them
  let dynamicThreadEntries: MetadataRoute.Sitemap = [];
  try {
    const publicPosts = await prisma.communityPost.findMany({
      where: {
        visibility: "PUBLIC",
        OR: [
          { group: null },
          { group: { isPrivate: false } }
        ]
      },
      select: {
        id: true,
        content: true,
        authorId: true,
        updatedAt: true,
        comments: {
          select: {
            authorId: true,
            content: true,
          },
        },
      },
    });

    const indexablePosts = publicPosts.filter((post) => {
      // Replicate getThreadIndexability check
      const normalized = normalizeStylizedText(post.content);
      const postWordCount = normalized.trim().split(/\s+/).filter(Boolean).length;
      
      const externalReplies = post.comments.filter(c => c.authorId !== post.authorId);
      const externalReplyCount = externalReplies.length;
      
      const totalExternalCommentsWordCount = externalReplies.reduce((acc, c) => {
        return acc + c.content.trim().split(/\s+/).filter(Boolean).length;
      }, 0);
      
      const totalWordCount = postWordCount + totalExternalCommentsWordCount;
      
      return postWordCount >= 40 || (externalReplyCount > 0 && totalWordCount >= 35) || externalReplyCount >= 2;
    });

    dynamicThreadEntries = indexablePosts.map((post) => ({
      url: `${baseUrl}/community/t/${slugifyPost(post.id, post.content)}`,
      lastModified: post.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch (err) {
    console.error("[Sitemap Generation] Failed to fetch community threads:", err);
  }

  // Fetch Quick Reference resources dynamically to index them
  let dynamicResourceEntries: MetadataRoute.Sitemap = [];
  try {
    const resources = await prisma.resource.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    dynamicResourceEntries = resources.map((res) => ({
      url: `${baseUrl}/resources?id=${res.id}`,
      lastModified: res.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("[Sitemap Generation] Failed to fetch resources:", err);
  }

  return [
    ...siteMapEntries,
    ...dynamicBlogEntries,
    ...dynamicCareerEntries,
    ...dynamicEventEntries,
    ...dynamicGroupEntries,
    ...dynamicThreadEntries,
    ...dynamicResourceEntries,
  ];
}
