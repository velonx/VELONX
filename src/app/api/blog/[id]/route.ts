import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/services/blog.service";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, AuthorizationError } from "@/lib/utils/errors";
import { updateBlogPostSchema } from "@/lib/validations/blog";

/**
 * GET /api/blog/[id]
 * Get blog post details by ID
 * Public endpoint - only shows published posts unless user is admin or author
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user is authenticated (optional)
    const sessionOrResponse = await requireAuth();
    const isAdmin = !(sessionOrResponse instanceof NextResponse) && sessionOrResponse.user.role === "ADMIN";
    
    // Get blog post
    const blogPost = await blogService.getBlogPostById(id, isAdmin);
    
    // If not admin, check if user is the author (for draft access)
    if (!isAdmin && blogPost.status === "DRAFT") {
      if (sessionOrResponse instanceof NextResponse || sessionOrResponse.user.id !== blogPost.authorId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Blog post not found",
            },
          },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        data: blogPost,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/blog/[id]
 * Update a blog post
 * Author or Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    const { id } = await params;
    
    // Get existing blog post to check ownership
    const existingBlogPost = await blogService.getBlogPostById(id, true);
    
    // Check if user is author or admin
    const isAuthor = existingBlogPost.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isAuthor && !isAdmin) {
      throw new AuthorizationError("You can only edit your own blog posts");
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateBlogPostSchema.parse(body);
    
    // Update blog post
    const blogPost = await blogService.updateBlogPost(id, validatedData);
    
    return NextResponse.json(
      {
        success: true,
        data: blogPost,
        message: "Blog post updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/blog/[id]
 * Delete a blog post
 * Author or Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    const { id } = await params;
    
    // Get existing blog post to check ownership
    const existingBlogPost = await blogService.getBlogPostById(id, true);
    
    // Check if user is author or admin
    const isAuthor = existingBlogPost.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isAuthor && !isAdmin) {
      throw new AuthorizationError("You can only delete your own blog posts");
    }
    
    // Delete blog post
    await blogService.deleteBlogPost(id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Blog post deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
