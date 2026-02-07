import { z } from "zod";

/**
 * Mentor Session validation schemas
 */

export const createSessionSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format, must be ISO 8601"),
  duration: z.number().int().positive("Duration must be a positive integer").min(15, "Minimum duration is 15 minutes").max(180, "Maximum duration is 180 minutes"),
}).refine(
  (data) => {
    // Validate that date is in the future
    const sessionDate = new Date(data.date);
    return sessionDate > new Date();
  },
  {
    message: "Session date must be in the future",
    path: ["date"],
  }
);

export const updateSessionSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  date: z.string().datetime("Invalid date format, must be ISO 8601").optional(),
  duration: z.number().int().positive().optional(),
  meetingLink: z.string().url("Invalid URL format").optional(),
  notes: z.string().optional(),
});

export const sessionQuerySchema = z.object({
  page: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  mentorId: z.string().nullable().optional().transform((val) => val ?? undefined),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).nullable().optional().transform((val) => val ?? undefined),
});

export const submitReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
  comment: z.string().max(1000, "Comment must not exceed 1000 characters").optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionQueryInput = z.infer<typeof sessionQuerySchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
