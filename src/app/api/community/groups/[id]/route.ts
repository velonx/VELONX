import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";
import { z } from "zod";

/**
 * Validation schema for updating a group
 */
const updateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name must be 100 characters or less").optional(),
  description: z.string().min(1, "Group description is required").max(500, "Group description must be 500 characters or less").optional(),
  isPrivate: z.boolean().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
});

/**
 * @swagger
 * /api/community/groups/{id}:
 *   get:
 *     summary: Get community group details
 *     description: Retrieve details of a specific community group
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
 *     responses:
 *       200:
 *         description: Group details retrieved successfully
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

    // Get group details
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
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
            messages: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Format response
    const formattedGroup = {
      ...group,
      memberCount: group._count.members,
      postCount: group._count.posts,
      messageCount: group._count.messages,
      _count: undefined,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedGroup,
      },
      { status: 200 }
    );
  }
);

/**
 * @swagger
 * /api/community/groups/{id}:
 *   patch:
 *     summary: Update community group
 *     description: Update group details (owner only)
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Group name
 *               description:
 *                 type: string
 *                 description: Group description
 *               isPrivate:
 *                 type: boolean
 *                 description: Whether the group is private
 *               imageUrl:
 *                 type: string
 *                 description: Group image URL
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not the group owner
 *       404:
 *         description: Group not found
 */
export const PATCH = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;
    const { id: groupId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateGroupSchema.parse(body);

    // Delegate to service (ownership + validation inside service)
    const updatedGroup = await communityGroupService.updateGroup(groupId, validatedData, userId);

    return NextResponse.json(
      {
        success: true,
        data: updatedGroup,
        message: "Group updated successfully",
      },
      { status: 200 }
    );
  }
);

/**
 * @swagger
 * /api/community/groups/{id}:
 *   delete:
 *     summary: Delete community group
 *     description: Delete a group (owner only)
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
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not the group owner
 *       404:
 *         description: Group not found
 */
export const DELETE = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;
    const { id: groupId } = await params;

    // Delegate to service (ownership check + cascading delete inside service)
    await communityGroupService.deleteGroup(groupId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Group deleted successfully",
      },
      { status: 200 }
    );
  }
);
