/**
 * GET /api/connections/status/[userId] — Check connection status with a specific user
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { getConnectionStatus, getMutualConnections } from "@/lib/services/connection.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const currentUserId = sessionOrResponse.user.id;
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const { userId: targetUserId } = await params;

    const [status, mutual] = await Promise.all([
      getConnectionStatus(currentUserId, targetUserId),
      getMutualConnections(currentUserId, targetUserId, 3),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        mutualConnections: mutual,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
