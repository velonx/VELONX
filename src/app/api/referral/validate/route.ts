import { NextRequest, NextResponse } from "next/server";
import { validateReferralCode } from "@/lib/services/referral.service";
import { handleError } from "@/lib/utils/errors";

/**
 * POST /api/referral/validate
 * Validate a referral code
 * No authentication required (public endpoint)
 * 
 * Request body: { code: string }
 * Response: { valid: boolean, referrerId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Invalid JSON in request body",
          },
        },
        { status: 400 }
      );
    }

    const { code } = body;

    // Validate input
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Referral code is required and must be a string",
          },
        },
        { status: 400 }
      );
    }

    // Validate referral code using service
    const validationResult = await validateReferralCode(code);

    // Return validation result
    return NextResponse.json(
      {
        success: true,
        data: {
          valid: validationResult.valid,
          referrerId: validationResult.referrerId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/referral/validate:", error);
    return handleError(error);
  }
}
