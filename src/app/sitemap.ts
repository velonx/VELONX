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
    "/auth/login",
    "/auth/signup",
    "/swag",
  ];

  const currentDate = new Date();

  // Static site map entries
  const siteMapEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" ? "daily" : "weekly", // Homepage changes more frequently
    priority: route === "" ? 1.0 : 0.8, // Prioritize homepage
  }));

  // Fetch published blog posts dynamically to index them in search engines
  try {
    const publishedPosts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const dynamicBlogEntries = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: post.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...siteMapEntries, ...dynamicBlogEntries];
  } catch (error) {
    console.error("[Sitemap Generation] Failed to fetch published blog posts:", error);
    return siteMapEntries;
  }
}

