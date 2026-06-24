import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { blogService } from "@/lib/services/blog.service";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await blogService.getBlogPostById(id, false);
    const excerpt =
      post.excerpt ||
      (post.content
        ? post.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
        : "Read this article on Velonx Insights.");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";
    const postSlugOrId = post.slug || id;
    const postUrl = `${siteUrl}/blog/${postSlugOrId}`;

    return {
      title: `${post.title} | Velonx Insights`,
      description: excerpt,
      alternates: { canonical: postUrl },
      openGraph: {
        type: "article",
        url: postUrl,
        title: post.title,
        description: excerpt,
        publishedTime: post.publishedAt
          ? new Date(post.publishedAt).toISOString()
          : undefined,
        modifiedTime: new Date(post.updatedAt).toISOString(),
        authors: post.author?.name ? [post.author.name] : ["Velonx Team"],
        tags: post.tags,
        images: post.imageUrl
          ? [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: excerpt,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Blog Article | Velonx Insights",
      description:
        "Read the latest tech articles and community stories on Velonx Insights.",
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;

  // Fetch the current post and related posts in parallel (server-side)
  let jsonLd: object | null = null;
  let post: any = null;
  let relatedPosts: Array<{
    id: string;
    slug: string | null;
    title: string;
    excerpt: string | null;
    imageUrl: string | null;
    tags: string[];
    publishedAt: string | null;
    createdAt: string;
    views: number;
    content: string;
    author?: { name: string | null; image: string | null } | null;
  }> = [];

  try {
    post = await blogService.getBlogPostById(id, false);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";
    const postSlugOrId = post.slug || id;

    // Build JSON-LD structured data
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description:
        post.excerpt ||
        post.content?.replace(/<[^>]*>/g, "").substring(0, 150),
      url: `${siteUrl}/blog/${postSlugOrId}`,
      datePublished: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : new Date(post.createdAt).toISOString(),
      dateModified: new Date(post.updatedAt).toISOString(),
      author: {
        "@type": "Person",
        name: post.author?.name || "Velonx Team",
      },
      publisher: {
        "@type": "Organization",
        name: "Velonx",
        url: siteUrl,
      },
      image: post.imageUrl || undefined,
      keywords: post.tags?.join(", "),
    };

    // Fetch related posts by first tag, exclude current post
    if (post.tags && post.tags.length > 0) {
      try {
        const related = await blogService.listBlogPosts({
          tag: post.tags[0],
          status: "PUBLISHED",
          pageSize: 4,
        });
        relatedPosts = related.blogPosts
          .filter((p) => p.id !== id)
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            imageUrl: p.imageUrl,
            tags: p.tags,
            publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
            createdAt: p.createdAt.toISOString(),
            views: p.views,
            content: p.content,
            author: p.author
              ? { name: p.author.name, image: p.author.image }
              : null,
          }));
      } catch {
        // Related posts are non-critical — fail silently
      }
    }

    // If no tag-based related posts found, fetch latest posts instead
    if (relatedPosts.length === 0) {
      try {
        const latest = await blogService.listBlogPosts({
          status: "PUBLISHED",
          pageSize: 4,
        });
        relatedPosts = latest.blogPosts
          .filter((p) => p.id !== id)
          .slice(0, 3)
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            imageUrl: p.imageUrl,
            tags: p.tags,
            publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
            createdAt: p.createdAt.toISOString(),
            views: p.views,
            content: p.content,
            author: p.author
              ? { name: p.author.name, image: p.author.image }
              : null,
          }));
      } catch {
        // Non-critical
      }
    }
  } catch {
    // If post not found, JSON-LD is omitted — 404 handled client-side
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <BlogPostClient params={params} initialPost={post} relatedPosts={relatedPosts} />
    </>
  );
}
