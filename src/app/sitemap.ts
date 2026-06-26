import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

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

  return [
    ...siteMapEntries,
    ...dynamicBlogEntries,
    ...dynamicCareerEntries,
    ...dynamicEventEntries,
  ];
}
