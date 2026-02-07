import { NextRequest, NextResponse } from "next/server";
import { mentorSessionService } from "@/lib/services/mentor-session.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { submitReviewSchema } from "@/lib/validations/mentor-session";

/**
 * POST /api/mentor-sessions/[id]/review
 * Submit a review for a completed session
 * Requires authentication (student only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    
    // Ensure user ID exists
    if (!session.user.id) {
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
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = submitReviewSchema.parse(body);
    
    // Submit review
    const review = await mentorSessionService.submitReview({
      sessionId: id,
      studentId: session.user.id,
      rating: validatedData.rating,
      comment: validatedData.comment,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: review,
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
