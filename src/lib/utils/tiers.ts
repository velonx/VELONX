export type BuilderTier = "elite" | "builder" | "rising";

/**
 * Classifies a user's tier based on their XP amount.
 * @param xp - The user's current XP
 * @returns "elite" | "builder" | "rising"
 */
export function getTier(xp: number): BuilderTier {
  if (xp >= 3500) return "elite";
  if (xp >= 1500) return "builder";
  return "rising";
}

/**
 * Returns a user-friendly label for a given tier.
 * @param tier - The tier identifier
 * @returns The friendly display name
 */
export function getTierLabel(tier: BuilderTier | string): string {
  const labels: Record<string, string> = {
    elite: "Elite Builder",
    builder: "Core Builder",
    rising: "Rising Star",
  };
  return labels[tier] || "Rising Star";
}
