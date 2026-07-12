const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all blog posts...");
  const posts = await prisma.blogPost.findMany({
    include: {
      author: true
    }
  });

  console.log(`Found ${posts.length} posts.`);
  for (const post of posts) {
    console.log(`\n--- Post ID: ${post.id} ---`);
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug}`);
    console.log(`Status: ${post.status}`);
    console.log(`PublishedAt: ${post.publishedAt} (${typeof post.publishedAt})`);
    console.log(`CreatedAt: ${post.createdAt} (${typeof post.createdAt})`);
    console.log(`UpdatedAt: ${post.updatedAt} (${typeof post.updatedAt})`);
    console.log(`Author ID: ${post.authorId}`);
    console.log(`Author Name: ${post.author ? post.author.name : 'NULL (No author relation!)'}`);
    
    try {
      const siteUrl = "https://velonx.in";
      const postSlugOrId = post.slug || post.id;
      
      const contentImage = post.content ? (post.content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null) : null;
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

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt || post.content?.replace(/<[^>]*>/g, "").substring(0, 150),
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
      
      console.log("JSON-LD generation: SUCCESS");
    } catch (e) {
      console.error("JSON-LD generation: FAILED", e.message);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
