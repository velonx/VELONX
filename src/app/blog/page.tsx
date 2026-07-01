import { Metadata } from "next";
import BlogClient from "./BlogClient";
import { generatePageMetadata } from "@/lib/seo.config";
import { blogService } from "@/lib/services/blog.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = generatePageMetadata(
  "Velonx Insights | Tech Blog & Community Stories",
  "Explore the latest article publications, community case-studies, technical deep-dives, and career guidance inside the Velonx Insights blog.",
  "/blog"
);

export default async function BlogPage() {
  let initialPosts: any[] = [];
  let initialPagination: any = null;

  try {
    const result = await blogService.listBlogPosts({
      status: "PUBLISHED",
      pageSize: 10,
      page: 1,
    });
    // Serialize Dates to Strings to avoid hydration issues and NextJS warnings
    initialPosts = JSON.parse(JSON.stringify(result.blogPosts));
    initialPagination = JSON.parse(JSON.stringify(result.pagination));
  } catch (error) {
    console.error("Failed to fetch initial blog posts on server:", error);
  }

  return <BlogClient initialPosts={initialPosts} initialPagination={initialPagination} />;
}
