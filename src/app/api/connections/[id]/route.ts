/**
 * PATCH /api/connections/[id] — Accept or reject a connection request
 * DELETE /api/connections/[id] — Remove/withdraw a connection
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { connectionStatusUpdateSchema } from "@/lib/validations/profile";
import {
  acceptConnection,
  rejectConnection,
  removeConnection,
  withdrawConnection,
} from "@/lib/services/connection.service";

/**
 * PATCH /api/connections/[id]
 * Accept or reject a connection request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = connectionStatusUpdateSchema.parse(body);

    let result;
    if (validated.status === "ACCEPTED") {
      result = await acceptConnection(id, userId);
    } else {
      result = await rejectConnection(id, userId);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "CONNECTION_ERROR", message: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: "connection" in result ? result.connection : null,
      message: validated.status === "ACCEPTED" ? "Connection accepted" : "Connection rejected",
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/connections/[id]
 * Remove an accepted connection or withdraw a pending request
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Try withdraw first (for pending requests), then remove (for accepted)
    let result = await withdrawConnection(id, userId);
    if (!result.success && result.error === "Not authorized to withdraw this request") {
      result = await removeConnection(id, userId);
    }
    if (!result.success && result.error === "Can only withdraw pending requests") {
      result = await removeConnection(id, userId);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "CONNECTION_ERROR", message: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connection removed",
    });
  } catch (error) {
    return handleError(error);
  }
}
