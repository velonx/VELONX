import { z } from "zod";

/**
 * Schema for admin request query parameters
 */
export const adminRequestQuerySchema = z.object({
  page: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  type: z.string().nullable().optional().transform((val) => val ?? undefined),
  status: z.string().nullable().optional().transform((val) => val ?? undefined),
});

/**
 * Schema for approving a request
 */
export const approveRequestSchema = z.object({
  action: z.literal("approve"),
});

/**
 * Schema for rejecting a request
 */
export const rejectRequestSchema = z.object({
  action: z.literal("reject"),
  reason: z.string().optional(),
});

/**
 * Schema for request action (approve or reject)
 */
export const requestActionSchema = z.discriminatedUnion("action", [
  approveRequestSchema,
  rejectRequestSchema,
]);
