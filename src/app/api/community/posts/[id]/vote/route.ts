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

    // Run the vote action transaction — always returns the final post score
    let post;
    let retries = 3;
    
    while (retries > 0) {
        try {
            post = await prisma.$transaction(async (tx) => {
                // Check for existing vote reaction
                const existingVote = await tx.postReaction.findUnique({
                    where: { postId_userId: { postId, userId } },
                });

                let incrementUp = 0;
                let incrementDown = 0;

                const currentAction = existingVote
                    ? existingVote.type === "LIKE" ? "upvote" : "downvote"
                    : "none";

                if (action === "upvote") {
                    if (currentAction !== "upvote") {
                        // Switch from downvote → upvote, or new upvote
                        incrementUp = 1;
                        if (currentAction === "downvote") incrementDown = -1;

                        if (existingVote) {
                            await tx.postReaction.update({ where: { id: existingVote.id }, data: { type: "LIKE" } });
                        } else {
                            await tx.postReaction.create({ data: { postId, userId, type: "LIKE" } });
                        }
                    }
                    // If already upvoted, no change — fall through, no increments
                } else if (action === "downvote") {
                    if (currentAction !== "downvote") {
                        // Switch from upvote → downvote, or new downvote
                        incrementDown = 1;
                        if (currentAction === "upvote") incrementUp = -1;

                        if (existingVote) {
                            await tx.postReaction.update({ where: { id: existingVote.id }, data: { type: "CELEBRATE" } });
                        } else {
                            await tx.postReaction.create({ data: { postId, userId, type: "CELEBRATE" } });
                        }
                    }
                    // If already downvoted, no change — fall through
                } else if (action === "remove") {
                    if (currentAction === "upvote") incrementUp = -1;
                    if (currentAction === "downvote") incrementDown = -1;
                    if (existingVote) {
                        await tx.postReaction.delete({ where: { id: existingVote.id } });
                    }
                }

                // Always update post counts if something changed
                if (incrementUp !== 0 || incrementDown !== 0) {
                    await tx.communityPost.update({
                        where: { id: postId },
                        data: {
                            upvotes: { increment: incrementUp },
                            downvotes: { increment: incrementDown },
                        },
                    });
                }

                // Always return the authoritative score
                return tx.communityPost.findUnique({
                    where: { id: postId },
                    select: { id: true, upvotes: true, downvotes: true },
                });
            }, {
                maxWait: 5000,
                timeout: 10000,
            });
            break; // Success, exit retry loop
        } catch (error: any) {
            if (error.code === 'P2034' || (error.message && error.message.includes('conflict'))) {
                retries--;
                if (retries === 0) throw error;
                // Add jitter to avoid thundering herd on write locks
                await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 50));
            } else {
                throw error;
            }
        }
    }

    const upvotes = post?.upvotes ?? 0;
    const downvotes = post?.downvotes ?? 0;

    return NextResponse.json(
        {
            success: true,
            data: {
                id: post?.id,
                upvotes,
                downvotes,
                score: upvotes - downvotes,
            },
            message: "Vote processed successfully",
        },
        { status: 200 }
    );
});
