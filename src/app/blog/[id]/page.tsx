import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";
import { blogService } from "@/lib/services/blog.service";
import { NotFoundError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function extractFirstImageUrl(content: string): string | null {
  if (!content) return null;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  try {
    const post = await blogService.getBlogPostById(decodedId, false);
    if (!post) {
      console.warn(`[SEO generateMetadata] Blog post not found for ID/slug: ${decodedId}`);
      return {
        title: "Blog Article | Velonx Insights",
        description: "Read the latest tech articles and community stories on Velonx Insights.",
      };
    }
    const excerpt =
      post.excerpt ||
      (post.content
        ? post.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
        : "Read this article on Velonx Insights.");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";
    const postSlugOrId = post.slug || decodedId;
    const postUrl = `${siteUrl}/blog/${postSlugOrId}`;
    const authorName = post.author?.name || "Velonx Team";
    const tags = post.tags || [];

    // Ensure image URL is absolute (relative URLs are not parsed by social media crawlers)
    const contentImage = extractFirstImageUrl(post.content || "");
    const rawImageUrl = (post.imageUrl || contentImage || "").trim();
    let finalImageUrl = `${siteUrl}/og/default.png`; // Default fallback
    if (rawImageUrl && rawImageUrl !== "null" && rawImageUrl !== "undefined") {
      if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
        finalImageUrl = rawImageUrl;
      } else {
        const normalizedPath = rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
        finalImageUrl = `${siteUrl}${normalizedPath}`;
      }
    }

    return {
      metadataBase: new URL(siteUrl),
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
        modifiedTime: post.updatedAt
          ? new Date(post.updatedAt).toISOString()
          : new Date().toISOString(),
        authors: [authorName],
        tags: tags,
        images: [
          {
            url: finalImageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: excerpt,
        images: [finalImageUrl],
      },
    };
  } catch (err) {
    console.error(`[SEO generateMetadata] Failed to generate blog metadata for ID/slug: ${decodedId}`, err);
    return {
      title: "Blog Article | Velonx Insights",
      description:
        "Read the latest tech articles and community stories on Velonx Insights.",
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

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
    post = await blogService.getBlogPostById(decodedId, false);
  } catch (err) {
    // If the post doesn't exist, trigger Next.js 404 (renders not-found.tsx)
    if (err instanceof NotFoundError) {
      notFound();
    }
    // For other errors (DB issues, etc.), let the error boundary catch them
    throw err;
  }

  // Defensive check — should not happen since getBlogPostById throws on miss
  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";
  const postSlugOrId = post.slug || decodedId;

  // Ensure absolute image URL for structured data
  const contentImage = extractFirstImageUrl(post.content || "");
  const rawImageUrl = (post.imageUrl || contentImage || "").trim();
  let finalImageUrl = `${siteUrl}/og/default.png`;
  if (rawImageUrl && rawImageUrl !== "null" && rawImageUrl !== "undefined") {
    if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
      finalImageUrl = rawImageUrl;
    } else {
      const normalizedPath = rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
      finalImageUrl = `${siteUrl}${normalizedPath}`;
    }
  }

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
    image: finalImageUrl,
    keywords: post.tags?.join(", "),
  };

  // Fetch trending posts by views, excluding the current post
  try {
    const trending = await blogService.listBlogPosts({
      status: "PUBLISHED",
      pageSize: 4,
      sortBy: "views",
    });
    relatedPosts = trending.blogPosts
      .filter((p: any) => p.id !== post.id)
      .slice(0, 3)
      .map((p: any) => ({
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
    // Non-critical — fail silently
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
