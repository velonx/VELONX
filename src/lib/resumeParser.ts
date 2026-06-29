/**
 * Resume PDF text extractor
 * Converts a base64-encoded PDF into extracted plain text using pdf-parse.
 * The text is stored in the DB and passed to Gemini for accurate AI matching.
 */

/**
 * Strips the data URL prefix from a base64 string.
 * e.g. "data:application/pdf;base64,JVBERi0..." → "JVBERi0..."
 */
function stripBase64Prefix(base64: string): string {
  const commaIndex = base64.indexOf(",");
  if (commaIndex !== -1) {
    return base64.slice(commaIndex + 1);
  }
  return base64;
}

/**
 * Extracts plain text from a base64-encoded PDF string.
 * Returns the extracted text, or null if extraction fails.
 *
 * @param base64PDF - Full data URL or raw base64 string for a PDF
 * @returns Extracted plain text or null on failure
 */
export async function extractTextFromPDFBase64(base64PDF: string): Promise<string | null> {
  try {
    // Dynamically import pdf-parse to avoid Next.js server/client bundle issues
    const pdfParse = (await import("pdf-parse")).default;

    const rawBase64 = stripBase64Prefix(base64PDF);
    const pdfBuffer = Buffer.from(rawBase64, "base64");

    const data = await pdfParse(pdfBuffer, {
      // Limit to first 10 pages to avoid extremely large texts hitting Gemini token limits
      max: 10,
    });

    // Clean up extracted text:
    // - Collapse multiple blank lines into single newline
    // - Trim leading/trailing whitespace
    const cleaned = data.text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Return null if nothing meaningful was extracted
    if (!cleaned || cleaned.length < 20) {
      return null;
    }

    // Cap to 6000 characters to keep Gemini prompt within reasonable token limits
    // (~6000 chars ≈ 1500 tokens, well within Gemini Flash context)
    return cleaned.slice(0, 6000);
  } catch (err) {
    console.error("[resumeParser] Failed to extract text from PDF:", err);
    return null;
  }
}
