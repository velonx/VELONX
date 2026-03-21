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
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
