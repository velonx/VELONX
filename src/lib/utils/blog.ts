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
