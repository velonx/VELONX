import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const siteMapEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" ? "daily" : "weekly", // Homepage changes more frequently
    priority: route === "" ? 1.0 : 0.8, // Prioritize homepage
  }));

  return siteMapEntries;
}
