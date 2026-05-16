import { NextRequest, NextResponse } from "next/server";
import { verificationService } from "@/lib/services/verification.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { VerificationType } from "@prisma/client"; 

/**
 * GET /api/admin/verifications
 * Get all verifications
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const verifications = await verificationService.getAllVerifications();

    return NextResponse.json({
      success: true,
      data: verifications,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/verifications
 * Create a new verification
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const body = await request.json();

    const { userId, type, title, description, issuedAt, expiryDate, metadata } = body;

    if (!userId || !type || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User ID missing from session" },
        { status: 401 }
      );
    }

    const verification = await verificationService.createVerification({
      userId,
      type: type as VerificationType,
      title,
      description,
      issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      issuerId: session.user.id,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    return handleError(error);
  }
}
