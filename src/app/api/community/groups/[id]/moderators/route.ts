import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";
import { z } from "zod";

/**
 * Validation schema for assigning a moderator
 */
const assignModeratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * @swagger
 * /api/community/groups/{id}/moderators:
 *   post:
 *     summary: Assign a moderator to a group
 *     description: Assign moderator permissions to a group member (owner only)
 *     tags:
 *       - Community - Groups
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to assign as moderator
 *     responses:
 *       200:
 *         description: Moderator assigned successfully
 *       400:
 *         description: Bad request - User not a member or already a moderator
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not the group owner
 *       404:
 *         description: Group not found
 */
export const POST = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const ownerId = session.user.id!;
    const { id: groupId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const { userId } = assignModeratorSchema.parse(body);

    // Assign moderator via service
    await communityGroupService.assignModerator(groupId, userId, ownerId);

    return NextResponse.json(
      {
        success: true,
        message: "Moderator assigned successfully",
      },
      { status: 200 }
    );
  }
);
