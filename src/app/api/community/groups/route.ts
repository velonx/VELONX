import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";
import { z } from "zod";

/**
 * Validation schema for creating a community group
 */
const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name must be 100 characters or less"),
  description: z.string().min(1, "Group description is required").max(500, "Group description must be 500 characters or less"),
  isPrivate: z.boolean(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

/**
 * @swagger
 * /api/community/groups:
 *   post:
 *     summary: Create a community group
 *     description: Create a new community group with the authenticated user as owner and moderator
 *     tags:
 *       - Community - Groups
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - isPrivate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Group name
 *                 example: "Web Development Study Group"
 *               description:
 *                 type: string
 *                 description: Group description
 *                 example: "A group for students learning web development"
 *               isPrivate:
 *                 type: boolean
 *                 description: Whether the group is private
 *                 example: false
 *               imageUrl:
 *                 type: string
 *                 description: Optional group image URL
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createGroupSchema.parse(body);

  // Create group via service
  const group = await communityGroupService.createGroup(validatedData, userId);

  return NextResponse.json(
    {
      success: true,
      data: group,
      message: "Community group created successfully",
    },
    { status: 201 }
  );
});

/**
 * @swagger
 * /api/community/groups:
 *   get:
 *     summary: List community groups
 *     description: Retrieve all community groups with pagination
 *     tags:
 *       - Community - Groups
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
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  // Calculate skip for pagination
  const skip = (page - 1) * pageSize;

  // Get groups from database with pagination
  const { prisma } = await import("@/lib/prisma");
  
  const [groups, total] = await Promise.all([
    prisma.communityGroup.findMany({
      skip,
      take: pageSize,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.communityGroup.count(),
  ]);

  // Format response with member and post counts
  const formattedGroups = groups.map((group) => ({
    ...group,
    memberCount: group._count.members,
    postCount: group._count.posts,
    _count: undefined,
  }));

  return NextResponse.json(
    {
      success: true,
      data: formattedGroups,
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
