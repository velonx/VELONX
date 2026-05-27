import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/services/blog.service";
import { handleError } from "@/lib/utils/errors";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";

/**
 * POST /api/blog/[id]/view
 * Increment blog post view count and award XP for first-time reads
 * Public endpoint (anonymous visitors can trigger views, authenticated get XP)
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch existing blog post to check status
    const existingBlogPost = await blogService.getBlogPostById(id, true);

    // Only increment view counts for PUBLISHED blog posts
    if (existingBlogPost.status === "PUBLISHED") {
      const postId = existingBlogPost.id; // Use actual ObjectID, not the slug from URL

      const updatedPost = await blogService.incrementViews(postId);
      
      let xpAwarded = false;
      let xpResult = null;

      // Try to award XP if user is logged in
      const session = await auth();
      if (session?.user?.id) {
        const userId = session.user.id;
        
        // Check if user already read this post
        const existingRead = await prisma.blogPostRead.findUnique({
          where: {
            userId_postId: {
              userId,
              postId: postId,
            },
          },
        });

        if (!existingRead) {
          try {
            // Create read record
            await prisma.blogPostRead.create({
              data: {
                userId,
                postId: postId,
                xpAwarded: true,
              },
            });

            // Award XP
            xpResult = await awardXP(
              userId,
              XP_REWARDS.BLOG_POST_READ,
              `Read blog post: ${existingBlogPost.title}`
            );
            xpAwarded = true;
          } catch (e: any) {
            // Handle unique constraint or race conditions gracefully
            if (e.code !== "P2002") {
              console.error("Failed to award blog read XP:", e);
            }
          }
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            views: updatedPost.views,
            xpAwarded,
            xpAmount: xpAwarded ? XP_REWARDS.BLOG_POST_READ : 0,
            newXP: xpResult ? xpResult.xp : undefined,
            newLevel: xpResult ? xpResult.level : undefined,
            leveledUp: xpResult ? xpResult.leveledUp : undefined,
          },
          message: xpAwarded
            ? `Earned ${XP_REWARDS.BLOG_POST_READ} XP for reading this article!`
            : "Blog post view tracked successfully",
        },
        { status: 200 }
      );
    }

    // Return the current view count for draft posts without incrementing it or awarding XP
    return NextResponse.json(
      {
        success: true,
        data: {
          views: existingBlogPost.views,
          xpAwarded: false,
          xpAmount: 0,
        },
        message: "Draft post viewed, view count not incremented",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
