import { describe, it, expect } from "vitest";
import { cloudinaryThumb } from "../cloudinary-url";

describe("cloudinaryThumb", () => {
  it("returns undefined when url is null, undefined, or empty", () => {
    expect(cloudinaryThumb(null)).toBeUndefined();
    expect(cloudinaryThumb(undefined)).toBeUndefined();
    expect(cloudinaryThumb("")).toBeUndefined();
  });

  it("adds transformation parameters to a valid Cloudinary upload URL", () => {
    const original = "https://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg";
    const expected = "https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_96,h_96,q_auto,f_auto/v12345678/sample.jpg";
    expect(cloudinaryThumb(original, 96)).toBe(expected);
  });

  it("supports custom size parameter", () => {
    const original = "https://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg";
    const expected = "https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_150,h_150,q_auto,f_auto/v12345678/sample.jpg";
    expect(cloudinaryThumb(original, 150)).toBe(expected);
  });

  it("returns the original URL if already transformed", () => {
    const transformed = "https://res.cloudinary.com/demo/image/upload/c_fill,w_96/v12345678/sample.jpg";
    expect(cloudinaryThumb(transformed, 96)).toBe(transformed);
  });

  it("returns non-Cloudinary URLs unchanged", () => {
    const googleAvatar = "https://lh3.googleusercontent.com/a/default-avatar=s96-c";
    expect(cloudinaryThumb(googleAvatar)).toBe(googleAvatar);
  });
});
