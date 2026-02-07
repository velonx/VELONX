import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

/**
 * Validate if the uploaded file is a valid image format
 * Accepts: JPEG, PNG, GIF, WebP
 */
function validateImageFormat(base64Image: string): boolean {
  // Check if the base64 string has a valid image data URI prefix
  const validPrefixes = [
    "data:image/jpeg;base64,",
    "data:image/jpg;base64,",
    "data:image/png;base64,",
    "data:image/gif;base64,",
    "data:image/webp;base64,",
  ];

  return validPrefixes.some((prefix) =>
    base64Image.toLowerCase().startsWith(prefix)
  );
}

/**
 * POST /api/user/profile/upload
 * Upload custom profile image to Cloudinary
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

    const { image } = body;

    // Validate that image is provided
    if (!image || typeof image !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Image data is required",
          },
        },
        { status: 400 }
      );
    }

    // Check file size (base64 string length approximation)
    // Base64 is ~33% larger than original, so 10MB file = ~13.3MB base64
    const maxBase64Size = 14 * 1024 * 1024; // ~14MB base64 = ~10MB file
    if (image.length > maxBase64Size) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "File size exceeds maximum allowed size of 10MB. Please use a smaller image.",
          },
        },
        { status: 413 }
      );
    }

    // Validate image format
    if (!validateImageFormat(image)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_IMAGE",
            message:
              "Invalid image format. Only JPEG, PNG, GIF, and WebP are supported.",
          },
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary with transformations
    // The uploadImageToCloudinary helper already applies:
    // - 1200x630 dimension limit
    // - quality: auto
    // - fetch_format: auto
    let cloudinaryUrl;
    try {
      cloudinaryUrl = await uploadImageToCloudinary(
        image,
        "velonx/profile-images"
      );
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      
      // Check for specific Cloudinary errors
      if (uploadError instanceof Error) {
        const errorMessage = uploadError.message.toLowerCase();
        
        if (errorMessage.includes("timeout")) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "UPLOAD_TIMEOUT",
                message: "Upload timed out. Please check your connection and try again.",
              },
            },
            { status: 504 }
          );
        }
        
        if (errorMessage.includes("invalid") || errorMessage.includes("format")) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "INVALID_IMAGE",
                message: "The image file appears to be corrupted or invalid. Please try a different image.",
              },
            },
            { status: 400 }
          );
        }
      }
      
      // Generic upload error
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPLOAD_FAILED",
            message:
              "Failed to upload image. Please try again or use a different image.",
            details: uploadError instanceof Error ? uploadError.message : "Unknown error",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          url: cloudinaryUrl,
        },
        message: "Image uploaded successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle any unexpected errors
    console.error("Unexpected error in upload endpoint:", error);
    return handleError(error);
  }
}
