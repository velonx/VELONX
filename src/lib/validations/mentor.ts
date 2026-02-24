import { z } from "zod";

/**
 * URL validation patterns for social profiles
 */
export const URL_PATTERNS = {
  github: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
} as const;

/**
 * Validates a GitHub profile URL
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidGitHubUrl(url: string | null | undefined): boolean {
  if (!url) return true; // Empty is valid (optional field)
  return URL_PATTERNS.github.test(url);
}

/**
 * Validates a Twitter profile URL (supports both twitter.com and x.com)
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidTwitterUrl(url: string | null | undefined): boolean {
  if (!url) return true; // Empty is valid (optional field)
  return URL_PATTERNS.twitter.test(url);
}

/**
 * Validates a LinkedIn profile URL
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidLinkedInUrl(url: string | null | undefined): boolean {
  if (!url) return true; // Empty is valid (optional field)
  return URL_PATTERNS.linkedin.test(url);
}

/**
 * Custom Zod refinement for GitHub URLs
 */
const githubUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (url) => isValidGitHubUrl(url),
    {
      message: "Please enter a valid GitHub URL (e.g., https://github.com/username)",
    }
  );

/**
 * Custom Zod refinement for Twitter URLs
 */
const twitterUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (url) => isValidTwitterUrl(url),
    {
      message: "Please enter a valid Twitter URL (e.g., https://twitter.com/username or https://x.com/username)",
    }
  );

/**
 * Custom Zod refinement for LinkedIn URLs
 */
const linkedinUrlSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (url) => isValidLinkedInUrl(url),
    {
      message: "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)",
    }
  );

/**
 * Schema for creating a new mentor
 */
export const createMentorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  email: z.string().email("Invalid email format"),
  expertise: z.array(z.string()).min(1, "At least one expertise area is required").max(20, "Expertise cannot exceed 20 items"),
  company: z.string().min(2, "Company must be at least 2 characters").max(200, "Company must not exceed 200 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  rating: z.number().min(0, "Rating must be at least 0").max(5, "Rating must not exceed 5").optional(),
  totalSessions: z.number().int("Total sessions must be an integer").min(0, "Total sessions must be non-negative").optional(),
  available: z.boolean().optional(),
  linkedinUrl: linkedinUrlSchema,
  githubUrl: githubUrlSchema,
  twitterUrl: twitterUrlSchema,
});

/**
 * Schema for updating a mentor
 */
export const updateMentorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  expertise: z.array(z.string()).min(1, "At least one expertise area is required").max(20, "Expertise cannot exceed 20 items").optional(),
  company: z.string().min(2, "Company must be at least 2 characters").max(200, "Company must not exceed 200 characters").optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  rating: z.number().min(0, "Rating must be at least 0").max(5, "Rating must not exceed 5").optional(),
  totalSessions: z.number().int("Total sessions must be an integer").min(0, "Total sessions must be non-negative").optional(),
  available: z.boolean().optional(),
  linkedinUrl: linkedinUrlSchema,
  githubUrl: githubUrlSchema,
  twitterUrl: twitterUrlSchema,
});

/**
 * Schema for mentor query parameters (filtering)
 */
export const mentorQuerySchema = z.object({
  page: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  expertise: z.string().nullable().optional().transform((val) => val ?? undefined),
  company: z.string().nullable().optional().transform((val) => val ?? undefined),
  available: z.string().nullable().optional().transform((val) => val === "true" ? true : val === "false" ? false : undefined),
});

/**
 * Type exports for TypeScript
 */
export type CreateMentorInput = z.infer<typeof createMentorSchema>;
export type UpdateMentorInput = z.infer<typeof updateMentorSchema>;
export type MentorQueryInput = z.infer<typeof mentorQuerySchema>;
