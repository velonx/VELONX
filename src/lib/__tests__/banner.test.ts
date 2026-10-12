import { describe, it, expect } from "vitest";
import { matchesPath } from "@/lib/utils/banner";
import { createBannerSchema, updateBannerSchema } from "@/lib/validations/banner";

describe("matchesPath", () => {
  it("targets every page when no prefixes are set", () => {
    expect(matchesPath([], "/anything")).toBe(true);
  });

  it("matches the prefix and its sub-paths only", () => {
    expect(matchesPath(["/events"], "/events")).toBe(true);
    expect(matchesPath(["/events/"], "/events/123")).toBe(true);
    expect(matchesPath(["/events"], "/eventsx")).toBe(false);
    expect(matchesPath(["/events"], "/home")).toBe(false);
  });

  it("treats / as the home page only", () => {
    expect(matchesPath(["/"], "/")).toBe(true);
    expect(matchesPath(["/"], "/events")).toBe(false);
  });
});

describe("banner validation", () => {
  it("accepts internal paths and http(s) links", () => {
    expect(createBannerSchema.safeParse({ title: "Hi there", ctaUrl: "/events" }).success).toBe(true);
    expect(createBannerSchema.safeParse({ title: "Hi there", ctaUrl: "https://velonx.in" }).success).toBe(true);
  });

  it("rejects unsafe links", () => {
    expect(createBannerSchema.safeParse({ title: "Hi there", ctaUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(createBannerSchema.safeParse({ title: "Hi there", ctaUrl: "//evil.com" }).success).toBe(false);
  });

  it("rejects an end time before the start time", () => {
    const result = updateBannerSchema.safeParse({
      startsAt: "2026-10-12T10:00:00Z",
      endsAt: "2026-10-11T10:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});
