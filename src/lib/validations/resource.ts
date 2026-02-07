import { z } from "zod";

/**
 * Schema for creating a new resource
 */
export const createResourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(
    ["PROGRAMMING", "DESIGN", "BUSINESS", "DATA_SCIENCE", "DEVOPS", "MOBILE", "WEB", "OTHER"],
    {
      message: "Invalid category",
    }
  ),
  type: z.enum(
    ["ARTICLE", "VIDEO", "COURSE", "BOOK", "TOOL", "DOCUMENTATION"],
    {
      message: "Invalid resource type",
    }
  ),
  url: z.string().url("Invalid URL format"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  accessCount: z.number().int("Access count must be an integer").min(0, "Access count must be non-negative").optional(),
});

/**
 * Schema for updating a resource
 */
export const updateResourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  category: z.enum(
    ["PROGRAMMING", "DESIGN", "BUSINESS", "DATA_SCIENCE", "DEVOPS", "MOBILE", "WEB", "OTHER"]
  ).optional(),
  type: z.enum(
    ["ARTICLE", "VIDEO", "COURSE", "BOOK", "TOOL", "DOCUMENTATION"]
  ).optional(),
  url: z.string().url("Invalid URL format").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  accessCount: z.number().int("Access count must be an integer").min(0, "Access count must be non-negative").optional(),
});

/**
 * Schema for resource query parameters (filtering)
 */
export const resourceQuerySchema = z.object({
  page: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  category: z.enum(
    ["PROGRAMMING", "DESIGN", "BUSINESS", "DATA_SCIENCE", "DEVOPS", "MOBILE", "WEB", "OTHER"]
  ).nullable().optional(),
  type: z.enum(
    ["ARTICLE", "VIDEO", "COURSE", "BOOK", "TOOL", "DOCUMENTATION"]
  ).nullable().optional(),
  search: z.string().nullable().optional(),
});

/**
 * Type exports for TypeScript
 */
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
