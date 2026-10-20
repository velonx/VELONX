import { z } from "zod";

export const TESTIMONIAL_ACCENTS = ["blue", "orange", "emerald", "amber", "purple", "rose"] as const;

const imageUrlSchema = z
  .string()
  .trim()
  .url()
  .max(1000)
  .refine((v) => /^https?:\/\//i.test(v), { message: "Must be an http(s) URL" });

const testimonialFields = {
  name: z.string().trim().min(2).max(80),
  quote: z.string().trim().min(10).max(600),
  badge: z.string().trim().max(80).nullable().optional(),
  subtitle: z.string().trim().max(120).nullable().optional(),
  avatarUrl: imageUrlSchema.nullable().optional(),
  accent: z.enum(TESTIMONIAL_ACCENTS).optional(),
  order: z.number().int().min(-1000).max(1000).optional(),
  isActive: z.boolean().optional(),
};

export const createTestimonialSchema = z.object(testimonialFields);
export const updateTestimonialSchema = z.object(testimonialFields).partial();

const galleryFields = {
  imageUrl: imageUrlSchema,
  title: z.string().trim().max(120).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().max(40).nullable().optional(),
  order: z.number().int().min(-1000).max(1000).optional(),
  isActive: z.boolean().optional(),
};

export const createGalleryItemSchema = z.object(galleryFields);
export const updateGalleryItemSchema = z.object(galleryFields).partial();

export type TestimonialAccent = (typeof TESTIMONIAL_ACCENTS)[number];
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;

export const gallerySettingsSchema = z.object({ enabled: z.boolean() });
