import { z } from "zod";

/**
 * Schema for PDF file upload
 */
export const pdfUploadSchema = z.object({
  file: z.string().min(1, "PDF file is required"),
  fileName: z.string().min(1, "File name is required"),
});

/**
 * Schema for PDF file deletion
 */
export const pdfDeleteSchema = z.object({
  publicId: z.string().min(1, "Public ID is required"),
});

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
  url: z.string().url("Invalid URL format").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  accessCount: z.number().int("Access count must be an integer").min(0, "Access count must be non-negative").optional(),
  // PDF fields
  pdfUrl: z.string().url("Invalid PDF URL").optional(),
  pdfPublicId: z.string().optional(),
  pdfFileName: z.string().optional(),
  pdfFileSize: z.number().int("File size must be an integer").positive("File size must be positive").optional(),
}).refine(
  (data) => data.url || data.pdfUrl,
  {
    message: "Either URL or PDF must be provided",
    path: ["url"],
  }
);

/**
 * Schema for updating a resource
 */
export const updateResourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  category: z.enum(
    ["PROGRAMMING", "DESIGN", "BUSINESS", "DATA_SCIENCE", "DEVOPS", "MOBILE", "WEB", "OTHER"],
    {
      message: "Invalid category",
    }
  ).optional(),
  type: z.enum(
    ["ARTICLE", "VIDEO", "COURSE", "BOOK", "TOOL", "DOCUMENTATION"],
    {
      message: "Invalid resource type",
    }
  ).optional(),
  url: z.string().url("Invalid URL format").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  accessCount: z.number().int("Access count must be an integer").min(0, "Access count must be non-negative").optional(),
  // PDF fields
  pdfUrl: z.string().url("Invalid PDF URL").optional(),
  pdfPublicId: z.string().optional(),
  pdfFileName: z.string().optional(),
  pdfFileSize: z.number().int("File size must be an integer").positive("File size must be positive").optional(),
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
export type PDFUploadInput = z.infer<typeof pdfUploadSchema>;
export type PDFDeleteInput = z.infer<typeof pdfDeleteSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
