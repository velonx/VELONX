import { z } from "zod";

/**
 * Schema for updating user profile
 * Validates profile updates including name, bio, and avatar
 */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .refine((val) => val.length > 0, {
      message: "Name cannot be empty or only whitespace",
    }),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  avatar: z
    .string()
    .refine(
      (val) => {
        // Accept predefined avatar paths starting with /avatars/
        if (val.startsWith("/avatars/")) {
          return true;
        }
        // Accept valid URLs (for Cloudinary uploads)
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "Avatar must be a valid URL or a predefined avatar path starting with /avatars/",
      }
    )
    .optional()
    .nullable(),
});

/**
 * Schema for partial profile updates
 * All fields are optional to allow updating individual fields
 */
export const partialProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .refine((val) => val.length > 0, {
      message: "Name cannot be empty or only whitespace",
    })
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  avatar: z
    .string()
    .refine(
      (val) => {
        // Accept predefined avatar paths starting with /avatars/
        if (val.startsWith("/avatars/")) {
          return true;
        }
        // Accept valid URLs (for Cloudinary uploads)
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "Avatar must be a valid URL or a predefined avatar path starting with /avatars/",
      }
    )
    .optional()
    .nullable(),
});

/**
 * Schema for image upload
 * Validates base64 encoded image data
 */
export const imageUploadSchema = z.object({
  image: z.string().min(1, "Image data is required"),
});

/**
 * Type exports for TypeScript
 */
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PartialProfileUpdateInput = z.infer<typeof partialProfileUpdateSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
