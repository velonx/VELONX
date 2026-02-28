"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getCSRFToken } from "@/lib/utils/csrf";

/**
 * PDF Metadata Interface
 * Contains all information about an uploaded PDF file
 */
export interface PDFMetadata {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
}

/**
 * PDFUploadField Component Props
 */
interface PDFUploadFieldProps {
  onUploadComplete: (metadata: PDFMetadata) => void;
  onUploadError: (error: string) => void;
  existingPDF?: PDFMetadata;
  disabled?: boolean;
}

/**
 * PDFUploadField Component
 * 
 * A reusable component for uploading PDF files to Cloudinary.
 * Features:
 * - Client-side validation (file type and size)
 * - Upload progress indicator
 * - PDF preview (file name, size)
 * - Remove/replace functionality
 * - Error handling and display
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4
 */
export default function PDFUploadField({
  onUploadComplete,
  onUploadError,
  existingPDF,
  disabled = false,
}: PDFUploadFieldProps) {
  const [uploadedPDF, setUploadedPDF] = useState<PDFMetadata | undefined>(existingPDF);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const MAX_FILE_SIZE = 10485760; // 10MB in bytes
  const ALLOWED_MIME_TYPE = "application/pdf";

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  /**
   * Validate PDF file (client-side)
   * Checks file type and size
   */
  const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
    // Check MIME type
    if (file.type !== ALLOWED_MIME_TYPE) {
      return {
        valid: false,
        error: "Only PDF files are accepted. Please select a PDF file.",
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: "File size exceeds 10MB limit. Please select a smaller file.",
      };
    }

    return { valid: true };
  };

  /**
   * Convert file to base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handle file selection and upload
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setError(null);

    // Validate file
    const validation = validatePDFFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      onUploadError(validation.error || "Invalid file");
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Start upload process
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      setUploadProgress(20);
      const base64File = await fileToBase64(file);

      // Upload to API
      setUploadProgress(40);
      const csrfToken = await getCSRFToken();

      const response = await fetch("/api/resources/upload-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          file: base64File,
          fileName: file.name,
        }),
      });

      setUploadProgress(80);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setUploadProgress(100);
        const metadata: PDFMetadata = {
          url: data.data.url,
          publicId: data.data.publicId,
          fileName: data.data.fileName,
          fileSize: data.data.fileSize,
        };
        setUploadedPDF(metadata);
        onUploadComplete(metadata);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Upload failed. Please try again later.";
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Handle remove/replace PDF
   */
  const handleRemovePDF = () => {
    setUploadedPDF(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
        PDF File
      </label>

      <div className="bg-gray-50 rounded-[32px] p-6 space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Uploading PDF...</span>
              <span className="text-[#219EBC] font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#219EBC] transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Uploaded PDF Preview */}
        {uploadedPDF && !isUploading && (
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-start gap-4">
              {/* PDF Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>

              {/* PDF Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#023047] truncate">
                      {uploadedPDF.fileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(uploadedPDF.fileSize)}
                    </p>
                  </div>

                  {/* Success Icon */}
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={disabled || isUploading}
                    className="text-xs font-bold text-[#219EBC] hover:text-[#1a7a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Replace
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleRemovePDF}
                    disabled={disabled || isUploading}
                    className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button (shown when no PDF uploaded) */}
        {!uploadedPDF && !isUploading && (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={disabled}
            className="w-full h-32 bg-white border-2 border-dashed border-gray-300 hover:border-[#219EBC] rounded-2xl cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#219EBC]/10 rounded-xl flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#219EBC] transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600 group-hover:text-[#219EBC] transition-colors">
                  Click to upload PDF
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Error Message */}
        {error && !isUploading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-600">Upload Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Help Text */}
        {!uploadedPDF && !isUploading && !error && (
          <p className="text-xs text-gray-500 text-center">
            Upload a PDF file (cheatsheet, roadmap, guide, etc.) for this resource
          </p>
        )}
      </div>
    </div>
  );
}
