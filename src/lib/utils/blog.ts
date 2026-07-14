/**
 * Shared blog utility functions
 */

/**
 * Calculate estimated reading time for blog post content.
 * Uses an average reading speed of 200 words per minute.
 */
export function calculateReadTime(content: string): number {
  if (!content) return 1;
  const wordCount = content
    .replace(/<[^>]*>/g, " ") // strip HTML tags before counting
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Derive a sorted, deduplicated list of unique tags from an array of blog posts.
 */
export function deriveCategories(
  posts: Array<{ tags: string[] }>,
  prefix: string[] = ["All Posts"]
): string[] {
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return [...prefix, ...Array.from(tagSet).sort()];
}

/**
 * Generate a clean excerpt from post content or existing excerpt, 
 * truncating at the last full word before the limit.
 */
export function getSafeExcerpt(post: any, length: number = 150): string {
  let sourceText = post.excerpt || "";
  
  if (!sourceText && post.content) {
    sourceText = post.content;
  }
  
  if (!sourceText) {
    return "Read this article on Velonx Insights.";
  }

  // Ensure sourceText is a string (legacy DB records might have malformed object excerpts)
  if (typeof sourceText !== "string") {
    try {
      sourceText = JSON.stringify(sourceText);
    } catch {
      sourceText = "Read this article on Velonx Insights.";
    }
  }

  // Clean HTML if present
  sourceText = sourceText.replace(/<[^>]*>/g, "").trim();
  
  if (sourceText.length <= length) return sourceText;
  
  const truncated = sourceText.substring(0, length);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

