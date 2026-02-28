import { uploadPDFToCloudinary, deletePDFFromCloudinary, generateSignedCloudinaryUrl } from '../cloudinary';

/**
 * PDF Upload Service
 * Handles PDF file validation, upload, deletion, and secure access operations
 */

export interface PDFValidationResult {
  valid: boolean;
  error?: string;
}

export interface PDFMetadata {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
}

export interface UploadPDFOptions {
  file: string;        // Base64 encoded PDF
  fileName: string;
  folder?: string;
}

// Maximum file size: 10MB in bytes
const MAX_FILE_SIZE = 10485760;
const ALLOWED_MIME_TYPE = 'application/pdf';

/**
 * Validate PDF file type and size
 * @param file - File object to validate
 * @returns Validation result with error message if invalid
 */
export function validatePDFFile(file: File): PDFValidationResult {
  // Check MIME type
  if (file.type !== ALLOWED_MIME_TYPE) {
    return {
      valid: false,
      error: 'Only PDF files are accepted. Please select a PDF file.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please select a smaller file.',
    };
  }

  return { valid: true };
}

/**
 * Calculate file size from base64 string
 * @param base64String - Base64 encoded file string
 * @returns File size in bytes
 */
export function calculateFileSize(base64String: string): number {
  // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
  const base64Data = base64String.split(',')[1] || base64String;
  
  // Calculate size: base64 encoding increases size by ~33%
  // Actual size = (base64 length * 3) / 4
  // Account for padding characters (=)
  const padding = (base64Data.match(/=/g) || []).length;
  const size = (base64Data.length * 3) / 4 - padding;
  
  return Math.floor(size);
}

/**
 * Upload PDF file to Cloudinary
 * @param options - Upload options including file data and metadata
 * @returns PDF metadata including URL and public ID
 */
export async function uploadPDF(
  options: UploadPDFOptions
): Promise<PDFMetadata> {
  const { file, fileName, folder } = options;

  try {
    // Calculate file size from base64
    const fileSize = calculateFileSize(file);

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Upload to Cloudinary
    const result = await uploadPDFToCloudinary(file, fileName, folder);

    return {
      url: result.url,
      publicId: result.publicId,
      fileName,
      fileSize,
    };
  } catch (error) {
    console.error('PDF upload error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload PDF'
    );
  }
}

/**
 * Delete PDF file from Cloudinary
 * @param publicId - Cloudinary public ID of the file to delete
 */
export async function deletePDF(publicId: string): Promise<void> {
  try {
    await deletePDFFromCloudinary(publicId);
  } catch (error) {
    console.error('PDF deletion error:', error);
    // Don't throw - graceful degradation
    // Errors are logged in deletePDFFromCloudinary
  }
}

/**
 * Generate signed URL for secure PDF access
 * @param publicId - Cloudinary public ID of the PDF
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL with expiration
 */
export function generateSignedPDFUrl(
  publicId: string,
  expiresIn: number = 3600
): string {
  return generateSignedCloudinaryUrl(publicId, expiresIn);
}
