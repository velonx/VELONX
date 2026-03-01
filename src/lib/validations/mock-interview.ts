import { z } from "zod";

/**
 * Mock Interview validation schemas
 */

export const mockInterviewSchema = z.object({
  email: z.string().email("Invalid email format"),
  preferredDate: z.string().datetime("Invalid date format, must be ISO 8601"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  interviewType: z.enum([
    "TECHNICAL_FRONTEND",
    "TECHNICAL_BACKEND",
    "DSA",
    "SYSTEM_DESIGN",
    "BEHAVIORAL",
  ], {
    message: "Invalid interview type",
  }),
  experienceLevel: z.enum(["INTERN", "JUNIOR", "SENIOR"], {
    message: "Invalid experience level",
  }),
}).refine(
  (data) => {
    // Validate that preferredDate is in the future
    const interviewDate = new Date(data.preferredDate);
    return interviewDate > new Date();
  },
  {
    message: "Preferred date must be in the future",
    path: ["preferredDate"],
  }
);

export const interviewApprovalSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    message: "Action must be either 'approve' or 'reject'",
  }),
  feedback: z.string().optional(),
}).refine(
  (data) => data.action !== 'reject' || (data.feedback && data.feedback.trim().length >= 10),
  {
    message: "Rejection feedback must be at least 10 characters",
    path: ["feedback"],
  }
);

export type MockInterviewInput = z.infer<typeof mockInterviewSchema>;
export type InterviewApprovalInput = z.infer<typeof interviewApprovalSchema>;
