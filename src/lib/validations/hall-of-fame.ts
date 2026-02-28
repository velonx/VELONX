import { z } from "zod";

/**
 * Schema for Hall of Fame query parameters
 * Validates search, filters, sort, and pagination for completed projects
 */
export const hallOfFameQuerySchema = z.object({
  // Search
  search: z.string().optional(),

  // Tech stack filter (array of technologies)
  techStack: z
    .union([
      z.string().transform((val) => [val]), // Single value
      z.array(z.string()), // Array of values
    ])
    .optional(),

  // Category filter
  category: z
    .enum(["WEB_DEV", "MOBILE", "AI_ML", "DATA_SCIENCE", "DEVOPS", "DESIGN", "OTHER"])
    .optional(),

  // Difficulty filter
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),

  // Sort options
  sortBy: z.enum(["completedAt", "title", "teamSize"]).default("completedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

/**
 * Type export for TypeScript
 */
export type HallOfFameQueryInput = z.infer<typeof hallOfFameQuerySchema>;
