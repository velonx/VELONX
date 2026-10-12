import { z } from "zod";

// Internal path ("/events") or absolute http(s) URL — never javascript: or protocol-relative
const linkSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => (v.startsWith("/") && !v.startsWith("//")) || /^https?:\/\//i.test(v),
    { message: "Must be a path starting with / or an http(s) URL" }
  );

const pathPrefixSchema = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v.startsWith("/") && !v.startsWith("//"), {
    message: "Path must start with /",
  });

const bannerFields = {
  title: z.string().trim().min(2).max(120),
  message: z.string().trim().max(1000).nullable().optional(),
  imageUrl: z.string().trim().url().max(1000).nullable().optional(),
  ctaText: z.string().trim().max(40).nullable().optional(),
  ctaUrl: linkSchema.nullable().optional(),
  isActive: z.boolean().optional(),
  audience: z.enum(["ALL", "GUESTS", "LOGGED_IN"]).optional(),
  frequency: z.enum(["ONCE", "EVERY_SESSION", "EVERY_VISIT"]).optional(),
  pathPrefixes: z.array(pathPrefixSchema).max(20).optional(),
  delaySeconds: z.number().int().min(0).max(120).optional(),
  closeOnBackdrop: z.boolean().optional(),
  priority: z.number().int().min(-100).max(100).optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
};

const scheduleIsValid = (d: { startsAt?: Date | null; endsAt?: Date | null }) =>
  !d.startsAt || !d.endsAt || d.endsAt > d.startsAt;

const scheduleError = { message: "End time must be after start time", path: ["endsAt"] };

export const createBannerSchema = z.object(bannerFields).refine(scheduleIsValid, scheduleError);

export const updateBannerSchema = z
  .object(bannerFields)
  .partial()
  .refine(scheduleIsValid, scheduleError);

export const trackBannerSchema = z.object({
  event: z.enum(["view", "click"]),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
