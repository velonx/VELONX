import { z } from "zod";

/**
 * Common pagination schema for query parameters
 */
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

/**
 * MongoDB ObjectId validation
 */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

/**
 * Common query parameters
 */
export const commonQuerySchema = paginationSchema.extend({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
});

/**
 * Type exports for TypeScript
 */
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CommonQueryInput = z.infer<typeof commonQuerySchema>;
