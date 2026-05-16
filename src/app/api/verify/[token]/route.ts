import { NextRequest, NextResponse } from "next/server";
import { verificationService } from "@/lib/services/verification.service";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/verify/[token]
 * Get verification details by token
 * Public
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const verification = await verificationService.getVerificationByToken(token);

    if (!verification) {
      return NextResponse.json(
        { success: false, error: "Invalid verification token" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    return handleError(error);
  }
}
