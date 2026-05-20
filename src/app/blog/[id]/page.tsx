import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { generatePageMetadata } from "@/lib/seo.config";
import { blogService } from "@/lib/services/blog.service";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await blogService.getBlogPostById(id, false);
    return generatePageMetadata(
      `${post.title} | Velonx Insights`,
      post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..." : "Read this article on Velonx Insights."),
      `/blog/${id}`,
      post.imageUrl || undefined
    );
  } catch (err) {
    return generatePageMetadata(
      "Blog Article | Velonx Insights",
      "Read the latest tech articles and community stories on Velonx Insights.",
      `/blog/${id}`
    );
  }
}

export default function BlogPostPage({ params }: Props) {
  return <BlogPostClient params={params} />;
}
