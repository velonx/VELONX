import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { getReferralHistory } from "@/lib/services/referral.service";

/**
 * GET /api/referral/history
 * Get referral history for the authenticated user with pagination and filtering
 * Requires authentication
 * 
 * Query Parameters:
 * - page: number (default: 1) - Page number for pagination
 * - limit: number (default: 20, max: 100) - Number of items per page
 * - milestoneType: "signup" | "profile" | "activity" | "all" (default: "all") - Filter by milestone type
 * 
 * Returns:
 * - referrals: Array of referral records with referee details and milestone status
 * - pagination: Pagination metadata (page, limit, total, totalPages)
 */
export async function GET(request: NextRequest) {
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

    // Extract and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const milestoneType = searchParams.get("milestoneType") as 'signup' | 'profile' | 'activity' | 'all' | null;

    // Validate parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PARAMETER",
            message: "Page must be a positive integer",
          },
        },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PARAMETER",
            message: "Limit must be between 1 and 100",
          },
        },
        { status: 400 }
      );
    }

    // Validate milestone type if provided
    const validMilestoneTypes = ['signup', 'profile', 'activity', 'all'];
    if (milestoneType && !validMilestoneTypes.includes(milestoneType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PARAMETER",
            message: "Milestone type must be one of: signup, profile, activity, all",
          },
        },
        { status: 400 }
      );
    }

    // Get referral history
    let history;
    try {
      history = await getReferralHistory(userId, {
        page,
        limit,
        milestoneType: milestoneType || 'all'
      });
    } catch (dbError) {
      console.error("Database error while fetching referral history:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to retrieve referral history. Please try again later.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: history,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in GET /api/referral/history:", error);
    return handleError(error);
  }
}
