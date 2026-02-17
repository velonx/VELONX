import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";

/**
 * @swagger
 * /api/community/groups/{id}/members:
 *   get:
 *     summary: Get group members
 *     description: Retrieve all members of a community group with pagination
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
 *         description: Members retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
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

    const { id: groupId } = await params;

    // Check if group exists
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;

    // Get members with pagination
    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: { groupId },
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
        orderBy: { joinedAt: "desc" },
      }),
      prisma.groupMember.count({
        where: { groupId },
      }),
    ]);

    // Check if each member is a moderator
    const memberIds = members.map((m) => m.userId);
    const moderators = await prisma.groupModerator.findMany({
      where: {
        groupId,
        userId: { in: memberIds },
      },
      select: { userId: true },
    });

    const moderatorIds = new Set(moderators.map((m) => m.userId));

    // Format response
    const formattedMembers = members.map((member) => ({
      ...member.user,
      joinedAt: member.joinedAt,
      isModerator: moderatorIds.has(member.userId),
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedMembers,
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
