import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://velonx.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/", // Private student and admin dashboards
        "/settings/", // Private settings
        "/admin/",     // Admin routes
        "/auth/",      // Auth flow pages (login, signup, forgot password, etc.)
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
