import { z } from "zod";

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
