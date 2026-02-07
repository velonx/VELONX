import { NextRequest, NextResponse } from "next/server";
import { blogService } from "@/lib/services/blog.service";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createBlogPostSchema } from "@/lib/validations/blog";
import { z } from "zod";

// Query parameters validation schema
const blogQuerySchema = z.object({
  page: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().nullable().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  authorId: z.string().nullable().optional().transform((val) => val ?? undefined),
  status: z.enum(["DRAFT", "PUBLISHED"]).nullable().optional().transform((val) => val ?? undefined),
  tag: z.string().nullable().optional().transform((val) => val ?? undefined),
  search: z.string().nullable().optional().transform((val) => val ?? undefined),
});

/**
 * GET /api/blog
 * List blog posts with pagination and filtering
 * Public endpoint - only shows published posts unless user is admin
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated (optional)
    const sessionOrResponse = await requireAuth();
    const isAdmin = !(sessionOrResponse instanceof NextResponse) && sessionOrResponse.user.role === "ADMIN";
    
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = blogQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      authorId: searchParams.get("authorId"),
      status: searchParams.get("status"),
      tag: searchParams.get("tag"),
      search: searchParams.get("search"),
    });
    
    // Include drafts only if user is admin
    const result = await blogService.listBlogPosts({
      ...queryParams,
      includesDrafts: isAdmin,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: result.blogPosts,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/blog
 * Create a new blog post
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    
    // Ensure user ID exists
    if (!session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SESSION",
            message: "User ID not found in session",
          },
        },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createBlogPostSchema.parse(body);
    
    // Create blog post
    const blogPost = await blogService.createBlogPost({
      ...validatedData,
      authorId: session.user.id,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: blogPost,
        message: "Blog post created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
