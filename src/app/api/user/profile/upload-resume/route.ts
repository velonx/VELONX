import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { uploadPDFToCloudinary } from "@/lib/cloudinary";
import { extractTextFromPDFBase64 } from "@/lib/resumeParser";
import { prisma } from "@/lib/prisma";

/**
 * Validate if the uploaded file is a valid PDF format
 */
function validatePDFFormat(base64PDF: string): boolean {
  return base64PDF.toLowerCase().startsWith("data:application/pdf;base64,");
}

/**
 * POST /api/user/profile/upload-resume
 * Upload custom resume PDF to Cloudinary
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SESSION",
            message: "User ID not found in session",
          },
        },
        { status: 401 }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Invalid request format. Please ensure you're sending valid JSON.",
          },
        },
        { status: 400 }
      );
    }

    const { resume, fileName } = body;

    // Validate that resume is provided
    if (!resume || typeof resume !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Resume data (base64 string) is required",
          },
        },
        { status: 400 }
      );
    }

    const nameOfFile = fileName || "resume.pdf";

    // Check file size (base64 string length approximation)
    // Base64 is ~33% larger than original, so 10MB file = ~13.3MB base64
    const maxBase64Size = 14 * 1024 * 1024; // ~14MB base64 = ~10MB file
    if (resume.length > maxBase64Size) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "File size exceeds maximum allowed size of 10MB. Please use a smaller PDF.",
          },
        },
        { status: 413 }
      );
    }

    // Validate PDF format
    if (!validatePDFFormat(resume)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FORMAT",
            message: "Invalid file format. Only PDF files are supported.",
          },
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    try {
      const result = await uploadPDFToCloudinary(
        resume,
        nameOfFile,
        "velonx/resumes"
      );

      // Extract plain text from the PDF for AI scoring
      // This happens in the background after upload; failure is non-fatal
      let extractedText: string | null = null;
      try {
        extractedText = await extractTextFromPDFBase64(resume);
      } catch (parseError) {
        console.warn("[upload-resume] PDF text extraction failed (non-fatal):", parseError);
      }

      // Persist resumeUrl and resumeText to the user's profile
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            resumeUrl: result.url,
            ...(extractedText ? { resumeText: extractedText } : {}),
          },
        });
      } catch (dbError) {
        console.error("[upload-resume] Failed to persist resume data to DB:", dbError);
        // Still return success — the URL was uploaded; client can PATCH separately
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            url: result.url,
            textExtracted: !!extractedText,
          },
          message: "Resume uploaded successfully",
        },
        { status: 200 }
      );
    } catch (uploadError) {
      console.error("Cloudinary resume upload failed:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPLOAD_FAILED",
            message: "Failed to upload resume to Cloudinary. Please try again.",
            details: uploadError instanceof Error ? uploadError.message : "Unknown error",
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in resume upload endpoint:", error);
    return handleError(error);
  }
}
