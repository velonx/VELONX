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
 * Convert opportunity title + company into a clean, number-free URL slug.
 * Removes years (2026, 2027), job codes, and numeric suffixes.
 */
export function toOpportunitySlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove job IDs like "job-id-r0442325" or "job id: 12345"
    .replace(/job\s*id[:\s\-]*[a-z0-9]+/gi, "")
    // Remove all numbers/digits (e.g. 2026, 2027, 1, 2, 3)
    .replace(/\d+/g, "")
    // Replace non-word characters (except hyphens and whitespace) with space
    .replace(/[^\w\s-]/g, "")
    // Collapse spaces and underscores into hyphens
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

/**
 * Generate a unique slug for an opportunity, appending company name to ensure
 * clean, descriptive, and human-friendly URLs (e.g. "software-engineer-google")
 * completely free of numbers.
 *
 * @param title               The opportunity title to derive the slug from
 * @param companyOrExcludeId  Optional company name or opportunity ID to exclude
 * @param excludeId           Optional opportunity ID to exclude when checking uniqueness (for updates)
 */
export async function generateUniqueOpportunitySlug(
  title: string,
  companyOrExcludeId?: string,
  excludeId?: string
): Promise<string> {
  let company: string | undefined;
  let exclude: string | undefined;

  // Support both (title, excludeId) and (title, company, excludeId) signatures
  if (companyOrExcludeId && excludeId !== undefined) {
    company = companyOrExcludeId;
    exclude = excludeId;
  } else if (companyOrExcludeId) {
    // If 2nd arg looks like an ObjectId (24 hex chars) or UUID, treat as excludeId
    if (/^[0-9a-fA-F]{24}$/.test(companyOrExcludeId) || /^[0-9a-f]{8}-[0-9a-f]{4}/.test(companyOrExcludeId)) {
      exclude = companyOrExcludeId;
    } else {
      company = companyOrExcludeId;
    }
  }

  // Base text: combine title + company if company is available and not already in title
  let baseText = title;
  if (company && company.trim()) {
    const trimmedCompany = company.trim();
    const titleLower = title.toLowerCase();
    const companyLower = trimmedCompany.toLowerCase();
    if (!titleLower.includes(companyLower)) {
      baseText = `${title} ${trimmedCompany}`;
    }
  }

  const base = toOpportunitySlug(baseText);

  // Check if base slug is available
  const existing = await prisma.opportunity.findFirst({
    where: {
      slug: base,
      ...(exclude ? { id: { not: exclude } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  // If identical slug exists, disambiguate with clean letter suffixes instead of numbers
  const letterSuffixes = ["b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

  for (const suffix of letterSuffixes) {
    const candidate = `${base}-${suffix}`;
    const found = await prisma.opportunity.findFirst({
      where: {
        slug: candidate,
        ...(exclude ? { id: { not: exclude } } : {}),
      },
      select: { id: true },
    });
    if (!found) {
      return candidate;
    }
  }

  return `${base}-alt`;
}

/**
 * Convert a user name into a URL-safe slug.
 */
export function toUserSlug(name: string): string {
  return (name || "user")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores/hyphens with a single hyphen
    .replace(/^-+|-+$/g, "") // Trim hyphens
    .substring(0, 50);
}

/**
 * Generate a unique slug for a user, appending a numeric suffix if needed.
 */
export async function generateUniqueUserSlug(
  name: string,
  excludeUserId?: string
): Promise<string> {
  const base = toUserSlug(name);

  // Check if base slug is available
  const existing = await prisma.user.findFirst({
    where: {
      slug: base,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return base;

  // Find all slugs that start with base + "-" + number
  const siblings = await prisma.user.findMany({
    where: {
      slug: { startsWith: `${base}-` },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { slug: true },
  });

  const suffixPattern = new RegExp(`^${base}-(\\d+)$`);
  const usedNumbers = siblings
    .map((u) => {
      const match = u.slug?.match(suffixPattern);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);

  const next = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 2;
  return `${base}-${next}`;
}



