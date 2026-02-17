import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { postService, ReactionType } from "@/lib/services/post.service";
import { z } from "zod";

/**
 * Validation schema for adding a reaction
 */
const addReactionSchema = z.object({
  type: z.enum(["LIKE", "LOVE", "INSIGHTFUL", "CELEBRATE"], {
    message: "Reaction type must be LIKE, LOVE, INSIGHTFUL, or CELEBRATE",
  }),
});

/**
 * @swagger
 * /api/community/posts/{id}/react:
 *   post:
 *     summary: React to a post
 *     description: Add or update a reaction to a community post
 *     tags:
 *       - Community - Posts
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [LIKE, LOVE, INSIGHTFUL, CELEBRATE]
 *                 description: Reaction type
 *                 example: "LIKE"
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Post not found
 */
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;
  const postId = params.id;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = addReactionSchema.parse(body);

  // Add reaction via service
  await postService.reactToPost(postId, userId, validatedData.type as ReactionType);

  return NextResponse.json(
    {
      success: true,
      message: "Reaction added successfully",
    },
    { status: 200 }
  );
});

/**
 * @swagger
 * /api/community/posts/{id}/react:
 *   delete:
 *     summary: Remove reaction from a post
 *     description: Remove user's reaction from a community post
 *     tags:
 *       - Community - Posts
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Reaction not found
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;
  const postId = params.id;

  // Remove reaction via service
  await postService.removeReaction(postId, userId);

  return NextResponse.json(
    {
      success: true,
      message: "Reaction removed successfully",
    },
    { status: 200 }
  );
});
