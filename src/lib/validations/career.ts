import { z } from "zod";

// Mock Interview Validation
export const mockInterviewSchema = z.object({
  email: z.string().email("Invalid email address"),
  preferredDate: z.string().min(1, "Date is required"),
  preferredTime: z.string().min(1, "Time is required"),
  interviewType: z.enum([
    "TECHNICAL_FRONTEND",
    "TECHNICAL_BACKEND",
    "DSA",
    "SYSTEM_DESIGN",
    "BEHAVIORAL",
  ]),
  experienceLevel: z.enum(["INTERN", "JUNIOR", "SENIOR"]),
});

export const updateMockInterviewSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SCHEDULED", "COMPLETED"]).optional(),
  scheduledDate: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  feedback: z.string().optional(),
});

// Opportunity (Internship/Job) Validation
export const opportunitySchema = z.object({
  type: z.enum(["INTERNSHIP", "JOB"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  location: z.string().min(2, "Location is required"),
  salary: z.string().optional(),
  duration: z.string().optional(),
  applyUrl: z.string().url("Must be a valid URL"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "CLOSED", "DRAFT"]).optional(),
});

export const updateOpportunitySchema = opportunitySchema.partial();

export type MockInterviewInput = z.infer<typeof mockInterviewSchema>;
export type UpdateMockInterviewInput = z.infer<typeof updateMockInterviewSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
