import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { z } from "zod";

const voteSchema = z.object({
    action: z.enum(["upvote", "downvote", "remove"]),
});

export const POST = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id: postId } = await params;

    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
        return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;

    // Parse and validate request body
    const body = await request.json();
    const { action } = voteSchema.parse(body);

    const { prisma } = await import("@/lib/prisma");

    // Run the vote action transaction
    const result = await prisma.$transaction(async (tx) => {
        // Check for existing vote reaction
        const existingVote = await tx.postReaction.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                }
            }
        });

        let incrementUp = 0;
        let incrementDown = 0;

        let currentAction = 'none';
        if (existingVote) {
            if (existingVote.type === 'LIKE') currentAction = 'upvote';
            if (existingVote.type === 'CELEBRATE') currentAction = 'downvote';
        }

        if (action === 'upvote') {
            if (currentAction === 'upvote') return { message: 'Already upvoted' };
            if (currentAction === 'downvote') {
                incrementDown = -1;
                incrementUp = 1;
                await tx.postReaction.update({ where: { id: existingVote!.id }, data: { type: 'LIKE' } });
            } else {
                incrementUp = 1;
                if (existingVote) {
                    await tx.postReaction.update({ where: { id: existingVote.id }, data: { type: 'LIKE' } });
                } else {
                    await tx.postReaction.create({ data: { postId, userId, type: 'LIKE' } });
                }
            }
        } else if (action === 'downvote') {
            if (currentAction === 'downvote') return { message: 'Already downvoted' };
            if (currentAction === 'upvote') {
                incrementUp = -1;
                incrementDown = 1;
                await tx.postReaction.update({ where: { id: existingVote!.id }, data: { type: 'CELEBRATE' } });
            } else {
                incrementDown = 1;
                if (existingVote) {
                    await tx.postReaction.update({ where: { id: existingVote.id }, data: { type: 'CELEBRATE' } });
                } else {
                    await tx.postReaction.create({ data: { postId, userId, type: 'CELEBRATE' } });
                }
            }
        } else if (action === 'remove') {
            if (currentAction === 'upvote') incrementUp = -1;
            if (currentAction === 'downvote') incrementDown = -1;
            if (existingVote) {
                await tx.postReaction.delete({ where: { id: existingVote.id } });
            }
        }

        // Update post counts
        if (incrementUp !== 0 || incrementDown !== 0) {
            await tx.communityPost.update({
                where: { id: postId },
                data: {
                    upvotes: { increment: incrementUp },
                    downvotes: { increment: incrementDown }
                }
            });
        }

        return await tx.communityPost.findUnique({ where: { id: postId } });
    });

    return NextResponse.json(
        {
            success: true,
            data: result,
            message: "Vote toggled successfully",
        },
        { status: 200 }
    );
});
