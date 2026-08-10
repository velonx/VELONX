/**
 * Single source of truth for whether a user profile meets the SEO indexing
 * quality bar. Used by both the sitemap (which URLs to advertise) and the
 * profile page's `robots` metadata (whether to set index:true). Keep these in
 * sync by importing this helper in both places — never re-implement the rule
 * inline.
 *
 * Indexing every account would flood the index with near-empty pages and drag
 * down sitewide quality, so a profile is indexable only if:
 *   1. It has a name and a slug (so it has a stable, readable canonical URL), AND
 *   2. It carries real content — a headline, a substantial bio (>= 15 words),
 *      or at least three listed skills.
 */
export interface ProfileIndexabilityInput {
  name: string | null;
  slug: string | null;
  headline: string | null;
  bio: string | null;
  skills: string[];
}

export function getProfileIndexability(profile: ProfileIndexabilityInput): boolean {
  if (!profile.name?.trim() || !profile.slug?.trim()) return false;

  const hasHeadline = Boolean(profile.headline?.trim());
  const bioWordCount = (profile.bio || "").trim().split(/\s+/).filter(Boolean).length;
  const skillCount = profile.skills?.length ?? 0;

  return hasHeadline || bioWordCount >= 15 || skillCount >= 3;
}

/** Fields the indexability check needs — reuse so callers can't drift. */
export const PROFILE_INDEXABILITY_SELECT = {
  name: true,
  slug: true,
  headline: true,
  bio: true,
  skills: true,
} as const;
