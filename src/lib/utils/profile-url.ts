/**
 * Build the canonical link to a member's public profile.
 *
 * Profiles live at /network/[userId], which resolves either a slug or an
 * ObjectId. Always prefer the slug: it's the URL the profile page canonicalises
 * to, so linking to it internally keeps crawl signals on one URL instead of
 * splitting them across the ObjectId duplicate.
 */
export function getProfileUrl(id: string, slug?: string | null): string {
  return `/network/${slug?.trim() || id}`;
}
