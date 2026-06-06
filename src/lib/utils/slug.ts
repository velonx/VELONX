import { prisma } from "@/lib/prisma";

/**
 * Convert a blog post title into a URL-safe slug.
 * Example: "Hello World! My Post" → "hello-world-my-post"
 */
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace special characters with a space
    .replace(/[^\w\s-]/g, "")
    // Replace multiple whitespace/hyphens with a single hyphen
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Limit length
    .substring(0, 100);
}

/**
 * Generate a unique slug for a blog post, appending a numeric suffix if
 * the base slug already exists (e.g. "my-post", "my-post-2", "my-post-3").
 *
 * @param title     The post title to derive the slug from
 * @param excludeId Optional post ID to exclude when checking uniqueness (for updates)
 */
export async function generateUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = toSlug(title);

  // Check if base slug is available
  const existing = await prisma.blogPost.findFirst({
    where: {
      slug: base,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  // Find all slugs that start with base + "-" + number
  const siblings = await prisma.blogPost.findMany({
    where: {
      slug: { startsWith: `${base}-` },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const suffixPattern = new RegExp(`^${base}-(\\d+)$`);
  const usedNumbers = siblings
    .map((p) => {
      const match = p.slug?.match(suffixPattern);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);

  const next = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 2;
  return `${base}-${next}`;
}

/**
 * Generate a unique slug for an event, appending a numeric suffix if
 * the base slug already exists (e.g. "my-event", "my-event-2", "my-event-3").
 *
 * @param title     The event title to derive the slug from
 * @param excludeId Optional event ID to exclude when checking uniqueness (for updates)
 */
/**
 * Generate a unique slug for an event.
 */
export async function generateUniqueEventSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = toSlug(title);

  // Check if base slug is available
  const existing = await prisma.event.findFirst({
    where: {
      slug: base,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  // Find all slugs that start with base + "-" + number
  const siblings = await prisma.event.findMany({
    where: {
      slug: { startsWith: `${base}-` },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const suffixPattern = new RegExp(`^${base}-(\\d+)$`);
  const usedNumbers = siblings
    .map((e) => {
      const match = e.slug?.match(suffixPattern);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);

  const next = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 2;
  return `${base}-${next}`;
}

/**
 * Generate a unique slug for an opportunity, appending a numeric suffix if
 * the base slug already exists (e.g. "my-opp", "my-opp-2", "my-opp-3").
 *
 * @param title     The opportunity title to derive the slug from
 * @param excludeId Optional opportunity ID to exclude when checking uniqueness (for updates)
 */
export async function generateUniqueOpportunitySlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const base = toSlug(title);

  // Check if base slug is available
  const existing = await prisma.opportunity.findFirst({
    where: {
      slug: base,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  // Find all slugs that start with base + "-" + number
  const siblings = await prisma.opportunity.findMany({
    where: {
      slug: { startsWith: `${base}-` },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const suffixPattern = new RegExp(`^${base}-(\\d+)$`);
  const usedNumbers = siblings
    .map((o) => {
      const match = o.slug?.match(suffixPattern);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);

  const next = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 2;
  return `${base}-${next}`;
}


