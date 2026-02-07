import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/admin.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { requestActionSchema } from "@/lib/validations/admin";

/**
 * PATCH /api/admin/requests/[id]
 * Approve or reject a user request
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    const { id } = await params;
    
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
    const validatedData = requestActionSchema.parse(body);
    
    let result;
    
    if (validatedData.action === "approve") {
      result = await adminService.approveRequest(id, session.user.id);
    } else {
      result = await adminService.rejectRequest(
        id,
        session.user.id,
        validatedData.reason
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        data: result,
        message: `Request ${validatedData.action}d successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
