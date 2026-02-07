import { z } from "zod";

/**
 * Schema for creating a new event
 */
export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["HACKATHON", "WORKSHOP", "WEBINAR"], {
    message: "Type must be HACKATHON, WORKSHOP, or WEBINAR",
  }),
  date: z.string().datetime("Invalid date format, must be ISO 8601"),
  endDate: z.string().datetime("Invalid end date format, must be ISO 8601").optional().nullable().transform((val) => val ?? undefined),
  location: z.string().max(200, "Location must not exceed 200 characters").optional().nullable().transform((val) => val ?? undefined),
  imageUrl: z.string().url("Invalid image URL").optional().nullable().transform((val) => val ?? undefined),
  maxSeats: z.number().int("Max seats must be an integer").positive("Max seats must be positive"),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
}).refine(
  (data) => {
    // Validate that date is in the future
    const eventDate = new Date(data.date);
    return eventDate > new Date();
  },
  {
    message: "Event date must be in the future",
    path: ["date"],
  }
).refine(
  (data) => {
    // Validate that endDate is after date if provided
    if (data.endDate) {
      const startDate = new Date(data.date);
      const endDate = new Date(data.endDate);
      return endDate > startDate;
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

/**
 * Schema for updating an event
 */
export const updateEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  type: z.enum(["HACKATHON", "WORKSHOP", "WEBINAR"]).optional(),
  date: z.string().datetime("Invalid date format, must be ISO 8601").optional(),
  endDate: z.string().datetime("Invalid end date format, must be ISO 8601").optional().nullable().transform((val) => val ?? undefined),
  location: z.string().max(200, "Location must not exceed 200 characters").optional().nullable().transform((val) => val ?? undefined),
  imageUrl: z.string().url("Invalid image URL").optional().nullable().transform((val) => val ?? undefined),
  maxSeats: z.number().int("Max seats must be an integer").positive("Max seats must be positive").optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

/**
 * Schema for event query parameters (filtering)
 */
export const eventQuerySchema = z.object({
  page: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  type: z.enum(["HACKATHON", "WORKSHOP", "WEBINAR"]).nullable().optional().transform((val) => val ?? undefined),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).nullable().optional().transform((val) => val ?? undefined),
  startDate: z.string().datetime().nullable().optional().transform((val) => val ?? undefined),
  endDate: z.string().datetime().nullable().optional().transform((val) => val ?? undefined),
});

/**
 * Type exports for TypeScript
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
