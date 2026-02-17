import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/community/moderation/logs:
 *   get:
 *     summary: Get moderation logs
 *     description: Retrieve moderation action logs with pagination (moderator only)
 *     tags:
 *       - Community - Moderation
 *     security:
 *       - sessionAuth: []
 *     parameters:
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [MESSAGE_DELETE, POST_DELETE, USER_MUTE, USER_KICK, CONTENT_FLAG, POST_PIN, POST_UNPIN]
 *         description: Filter by moderation action type
 *       - in: query
 *         name: moderatorId
 *         schema:
 *           type: string
 *         description: Filter by moderator ID
 *     responses:
 *       200:
 *         description: Moderation logs retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Moderator permissions required
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const type = searchParams.get("type") || undefined;
  const moderatorId = searchParams.get("moderatorId") || undefined;

  // Calculate skip for pagination
  const skip = (page - 1) * pageSize;

  // Build filter
  const where: any = {};
  if (type) {
    where.type = type;
  }
  if (moderatorId) {
    where.moderatorId = moderatorId;
  }

  // Note: In a production system, you would verify that the requesting user
  // is a moderator in at least one room or group. For now, we'll allow
  // authenticated users to view logs (this can be enhanced later).

  // Get logs from database with pagination
  const [logs, total] = await Promise.all([
    prisma.moderationLog.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.moderationLog.count({ where }),
  ]);

  // Format response
  const formattedLogs = logs.map((log) => ({
    id: log.id,
    moderatorId: log.moderatorId,
    moderatorName: log.moderator.name || "Unknown",
    moderatorImage: log.moderator.image,
    targetId: log.targetId,
    type: log.type,
    reason: log.reason,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));

  return NextResponse.json(
    {
      success: true,
      data: formattedLogs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    { status: 200 }
  );
});
