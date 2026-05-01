import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/referral/code
 * Get current user's referral code and formatted link
 * Requires authentication
 * 
 * @returns {Object} { code: string, link: string }
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

    // Fetch user's referral code from database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          referralCode: true,
        },
      });
    } catch (dbError) {
      console.error("Database error while fetching referral code:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to retrieve referral code. Please try again later.",
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

    if (!user.referralCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_REFERRAL_CODE",
            message: "Referral code not found for user",
          },
        },
        { status: 404 }
      );
    }

    // Format referral link
    const referralLink = `https://velonx.in/register?ref=${user.referralCode}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          code: user.referralCode,
          link: referralLink,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in GET /api/referral/code:", error);
    return handleError(error);
  }
}
