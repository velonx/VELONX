import { z } from "zod";

/**
 * Schema for creating a new meeting
 */
export const createMeetingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format, must be ISO 8601"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  platform: z.string().min(1, "Platform is required").max(100, "Platform must not exceed 100 characters"),
  meetingLink: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

/**
 * Schema for updating a meeting
 */
export const updateMeetingSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  platform: z.string().min(1).max(100).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
});

/**
 * Schema for meeting query parameters
 */
export const meetingQuerySchema = z.object({
  page: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  startDate: z.string().nullable().optional().transform((val) => val ?? undefined),
  endDate: z.string().nullable().optional().transform((val) => val ?? undefined),
  userId: z.string().nullable().optional().transform((val) => val ?? undefined),
});

/**
 * Schema for updating attendee status
 */
export const updateAttendeeStatusSchema = z.object({
  status: z.enum(["INVITED", "ACCEPTED", "DECLINED", "ATTENDED"], {
    message: "Status must be one of: INVITED, ACCEPTED, DECLINED, ATTENDED",
  }),
});
