import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { NotFoundError, AuthorizationError } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";

/**
 * @swagger
 * /api/community/groups/{id}/requests:
 *   get:
 *     summary: Get pending join requests for a group
 *     description: Retrieve all pending join requests for a group (moderators only)
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Join requests retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not a moderator
 *       404:
 *         description: Group not found
 */
export const GET = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;
    const { id: groupId } = await params;

    // Check if group exists
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Check if user is a moderator
    const isModerator = await communityGroupService.isUserModerator(groupId, userId);
    if (!isModerator) {
      throw new AuthorizationError("You do not have moderator permissions for this group");
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;

    // Get pending join requests with pagination
    const [requests, total] = await Promise.all([
      prisma.groupJoinRequest.findMany({
        where: {
          groupId,
          status: "PENDING",
        },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.groupJoinRequest.count({
        where: {
          groupId,
          status: "PENDING",
        },
      }),
    ]);

    // Format response
    const formattedRequests = requests.map((request) => ({
      id: request.id,
      user: request.user,
      createdAt: request.createdAt,
      status: request.status,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedRequests,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { status: 200 }
    );
  }
);
