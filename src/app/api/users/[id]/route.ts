import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireOwnerOrAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { userService } from "@/lib/services/user.service";
import { updateUserSchema } from "@/lib/validations/user";

/**
 * GET /api/users/[id]
 * Get user profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const { id: userId } = await params;

    // Get user from service
    const user = await userService.getUserById(userId);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/users/[id]
 * Update user profile (Owner or Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Require owner or admin authorization
    const sessionOrResponse = await requireOwnerOrAdmin(userId);
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Update user
    const updatedUser = await userService.updateUser(userId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: "User profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
