import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/services/blog.service";
import { getSafeExcerpt } from "@/lib/utils/blog";

/**
 * Diagnostic endpoint to test blog post rendering pipeline
 * GET /api/debug-blog?slug=xxx
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing ?slug= parameter" }, { status: 400 });
  }

  const errors: string[] = [];
  const steps: string[] = [];

  try {
    // Step 1: Fetch
    steps.push("1. Fetching post...");
    const post = await blogService.getBlogPostById(slug, false);
    steps.push(`1. OK - title="${post.title}", tags type=${typeof post.tags}, Array.isArray=${Array.isArray(post.tags)}`);

    // Step 2: getSafeExcerpt
    steps.push("2. Testing getSafeExcerpt...");
    const excerpt = getSafeExcerpt(post);
    steps.push(`2. OK - excerpt="${excerpt.substring(0, 50)}..."`);

    // Step 3: Tags
    steps.push("3. Testing tags...");
    const safeTags = Array.isArray(post.tags) ? post.tags : [];
    const keywords = safeTags.length ? safeTags.join(", ") : undefined;
    steps.push(`3. OK - safeTags=${JSON.stringify(safeTags)}, keywords=${keywords}`);

    // Step 4: toSafeISOString
    steps.push("4. Testing date conversion...");
    const publishedAt = post.publishedAt;
    const createdAt = post.createdAt;
    const updatedAt = post.updatedAt;
    steps.push(`4. OK - publishedAt=${publishedAt}, createdAt=${createdAt}, updatedAt=${updatedAt}`);

    // Step 5: JSON serialization
    steps.push("5. Testing JSON serialization...");
    const serialized = JSON.parse(JSON.stringify(post));
    steps.push(`5. OK - serialized keys: ${Object.keys(serialized).join(", ")}`);

    // Step 6: Check for non-serializable fields
    steps.push("6. Checking for Prisma Date objects...");
    for (const [key, value] of Object.entries(post)) {
      if (value instanceof Date) {
        steps.push(`6. WARNING: ${key} is a Date object (${value.toISOString()})`);
      }
      if (value !== null && typeof value === "object" && !(value instanceof Date) && !Array.isArray(value)) {
        steps.push(`6. INFO: ${key} is an object with keys: ${Object.keys(value).join(", ")}`);
      }
    }
    steps.push("6. Done");

    // Step 7: Check related posts
    steps.push("7. Fetching related posts...");
    const trending = await blogService.listBlogPosts({
      status: "PUBLISHED",
      pageSize: 4,
      sortBy: "views",
    });
    steps.push(`7. OK - ${trending.blogPosts.length} posts returned`);

    for (const p of trending.blogPosts) {
      try {
        getSafeExcerpt(p);
      } catch (e: any) {
        errors.push(`getSafeExcerpt failed on post ${p.id}: ${e.message}`);
      }
    }

    return NextResponse.json({ ok: true, steps, errors });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, steps, errors, crash: e.message, stack: e.stack },
      { status: 500 }
    );
  }
}
