/**
 * Helper utilities for optimizing Cloudinary image URLs.
 */

/**
 * Transforms a Cloudinary image URL to request a thumbnail with specified dimensions,
 * automatic quality, automatic format, and face gravity cropping.
 * If the URL is not a Cloudinary upload URL, returns the original URL (or undefined if falsy).
 *
 * @param url The image URL or null/undefined
 * @param size Target square dimension in pixels (default: 96)
 * @returns Transformed URL or undefined
 */
export function cloudinaryThumb(
  url: string | null | undefined,
  size: number = 96
): string | undefined {
  if (!url) return undefined;

  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Avoid double transformation if already transformed
    if (/\/upload\/c_|\/upload\/w_/.test(url)) {
      return url;
    }
    const transformation = `c_fill,g_face,w_${size},h_${size},q_auto,f_auto`;
    return url.replace("/upload/", `/upload/${transformation}/`);
  }

  return url;
}
