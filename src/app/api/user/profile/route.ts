import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { partialProfileUpdateSchema } from "@/lib/validations/profile";
import { prisma } from "@/lib/prisma";

/**
 * Sanitize text input to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags and attributes
 */
function sanitizeText(text: string): string {
  if (!text) return text;
  
  // Remove script tags and their content
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, "");
  
  // Remove HTML tags (convert to plain text)
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities to prevent double encoding attacks
  sanitized = sanitized
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
  
  // Re-apply the removals after decoding
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  
  return sanitized.trim();
}

/**
 * GET /api/user/profile
 * Get current user profile data
 * Requires authentication
 */
export async function GET() {
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

    // Fetch user profile from database with error handling
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      });
    } catch (dbError) {
      console.error("Database error while fetching user:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to retrieve profile data. Please try again later.",
          },
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in GET /api/user/profile:", error);
    return handleError(error);
  }
}

/**
 * PATCH /api/user/profile
 * Update user profile (name, bio, avatar)
 * Requires authentication
 */
export async function PATCH(request: NextRequest) {
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

    // Parse and validate request body with error handling
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

    // Validate data with Zod schema
    let validatedData;
    try {
      validatedData = partialProfileUpdateSchema.parse(body);
    } catch (validationError) {
      // Zod errors are handled by handleError, but we can add specific logging
      console.error("Validation failed:", validationError);
      throw validationError;
    }

    // Sanitize text inputs to prevent XSS attacks
    const updateData: {
      name?: string;
      bio?: string | null;
      image?: string | null;
    } = {};

    if (validatedData.name !== undefined) {
      updateData.name = sanitizeText(validatedData.name);
      
      // Additional validation after sanitization
      if (!updateData.name || updateData.name.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Name cannot be empty after sanitization",
            },
          },
          { status: 400 }
        );
      }
    }

    if (validatedData.bio !== undefined) {
      updateData.bio = validatedData.bio ? sanitizeText(validatedData.bio) : null;
    }

    if (validatedData.avatar !== undefined) {
      updateData.image = validatedData.avatar;
    }

    // Update user profile in database with error handling
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      });
    } catch (dbError) {
      console.error("Database error while updating user:", dbError);
      
      // Check for specific database errors
      if (dbError instanceof Error) {
        const errorMessage = dbError.message.toLowerCase();
        
        if (errorMessage.includes("timeout")) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "DATABASE_TIMEOUT",
                message: "Database operation timed out. Please try again.",
              },
            },
            { status: 504 }
          );
        }
        
        if (errorMessage.includes("connection")) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "DATABASE_CONNECTION_ERROR",
                message: "Unable to connect to database. Please try again later.",
              },
            },
            { status: 503 }
          );
        }
      }
      
      // Generic database error
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to update profile. Please try again later.",
          },
        },
        { status: 500 }
      );
    }

    // Return updated user data with session update flag
    // The client will use this to trigger a session refresh
    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: "Profile updated successfully",
        sessionUpdate: {
          name: updatedUser.name,
          image: updatedUser.image,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in PATCH /api/user/profile:", error);
    return handleError(error);
  }
}
