import { z } from "zod";

/**
 * Reusable URL validator for social profile links
 */
const socialUrlSchema = z
  .string()
  .max(200, "URL must be less than 200 characters")
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL" }
  )
  .optional()
  .nullable()
  .transform((val) => (val === "" ? null : val));

/**
 * Avatar validator (reused across schemas)
 */
const avatarSchema = z
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
  .nullable();

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
  avatar: avatarSchema,
});

/**
 * Schema for partial profile updates
 * All fields are optional to allow updating individual fields
 * Includes professional/academic profile fields
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
  avatar: avatarSchema,
  coverImage: z
    .string()
    .refine(
      (val) => {
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "Cover image must be a valid URL",
      }
    )
    .optional()
    .nullable(),

  // Professional/Academic Profile fields
  headline: z
    .string()
    .max(120, "Headline must be less than 120 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  college: z
    .string()
    .max(100, "College name must be less than 100 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  graduationYear: z
    .number()
    .int("Graduation year must be a whole number")
    .min(1990, "Graduation year must be 1990 or later")
    .max(2035, "Graduation year must be 2035 or earlier")
    .optional()
    .nullable(),
  skills: z
    .array(
      z
        .string()
        .max(30, "Each skill must be less than 30 characters")
        .trim()
    )
    .max(20, "Maximum 20 skills allowed")
    .optional()
    .nullable()
    .transform((val) => val?.filter((s) => s.length > 0) ?? null),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  linkedinUrl: socialUrlSchema,
  githubUrl: socialUrlSchema,
  twitterUrl: socialUrlSchema,
  portfolioUrl: socialUrlSchema,
});

/**
 * Schema for connection request
 */
export const connectionRequestSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  message: z
    .string()
    .max(300, "Connection message must be less than 300 characters")
    .trim()
    .optional()
    .nullable(),
});

/**
 * Schema for connection status update (accept/reject)
 */
export const connectionStatusUpdateSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"], {
    message: "Status must be either ACCEPTED or REJECTED",
  }),
});

/**
 * Schema for sending a direct message
 */
export const directMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be less than 5000 characters")
    .trim(),
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
export type ConnectionRequestInput = z.infer<typeof connectionRequestSchema>;
export type ConnectionStatusUpdateInput = z.infer<typeof connectionStatusUpdateSchema>;
export type DirectMessageInput = z.infer<typeof directMessageSchema>;
