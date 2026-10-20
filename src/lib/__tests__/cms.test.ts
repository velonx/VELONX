import { describe, it, expect } from "vitest";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  createGalleryItemSchema,
  updateGalleryItemSchema,
} from "@/lib/validations/cms";

describe("testimonial validation", () => {
  it("accepts a minimal testimonial", () => {
    const r = createTestimonialSchema.safeParse({ name: "Rishi Pandey", quote: "Found my team on Velonx." });
    expect(r.success).toBe(true);
  });

  it("rejects an unknown accent colour and a non-URL avatar", () => {
    expect(createTestimonialSchema.safeParse({ name: "Ab", quote: "Long enough quote", accent: "neon" }).success).toBe(false);
    expect(createTestimonialSchema.safeParse({ name: "Ab", quote: "Long enough quote", avatarUrl: "javascript:alert(1)" }).success).toBe(false);
  });

  it("allows partial updates", () => {
    expect(updateTestimonialSchema.safeParse({ isActive: false }).success).toBe(true);
  });
});

describe("gallery validation", () => {
  it("requires an image URL", () => {
    expect(createGalleryItemSchema.safeParse({ title: "Hackathon" }).success).toBe(false);
    expect(createGalleryItemSchema.safeParse({ imageUrl: "https://res.cloudinary.com/x/y.jpg", category: null }).success).toBe(true);
  });

  it("allows partial updates", () => {
    expect(updateGalleryItemSchema.safeParse({ order: 3 }).success).toBe(true);
    expect(updateGalleryItemSchema.safeParse({ imageUrl: "not a url" }).success).toBe(false);
  });
});
