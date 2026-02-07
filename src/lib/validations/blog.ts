import { z } from "zod";

/**
 * Blog post validation schemas
 */

export const createBlogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().max(500, "Excerpt must not exceed 500 characters").optional(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable().transform((val) => val ?? undefined),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  publishedAt: z.string().datetime("Invalid date format").optional(),
});

export const updateBlogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters").optional(),
  excerpt: z.string().max(500, "Excerpt must not exceed 500 characters").optional(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable().transform((val) => val ?? undefined),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  publishedAt: z.string().datetime("Invalid date format").optional(),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
