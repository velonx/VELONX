import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { ProjectCompletionService } from "@/lib/services/project-completion.service";
import { createInMemoryRateLimiter } from "@/lib/services/in-memory-rate-limiter.service";

// Rate limiter: 10 completions per user per hour
const completionRateLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
});

/**
 * POST /api/projects/[id]/complete
 * Mark a project as completed
 * 
 * Requirements: 2.1, 2.2, 2.4, 2.6
 * Security: Rate limiting - 10 completions per user per hour
 * 
 * Authorization: Project owner only
 * 
 * Response:
 * - 200: Project completed successfully with XP and notification data
 * - 400: Validation error (invalid status, already completed, project not found)
 * - 401: Authentication required
 * - 403: Unauthorized (non-owner attempting completion)
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Requirement 2.1: Authentication check
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    // Get user ID from session
    const userId = session.user.id!;

    // Apply rate limiting: 10 completions per user per hour
    const rateLimitResult = await completionRateLimiter.checkRateLimit(
      userId,
      "/api/projects/complete"
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many project completions. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "3600",
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Extract project ID from URL params
    const { id: projectId } = await params;

    // Initialize completion service
    const completionService = new ProjectCompletionService();

    // Call ProjectCompletionService.completeProject
    // This handles:
    // - Validation (Requirements 2.4, 8.1, 8.2, 8.3)
    // - Status update (Requirement 2.2)
    // - Timestamp recording (Requirement 2.3)
    // - XP awards (Requirements 3.1-3.6)
    // - Notifications (Requirements 7.1-7.5)
    // - Audit logging (Requirements 10.1-10.5)
    const result = await completionService.completeProject(projectId, userId);

    // Requirement 2.6: Return success response with project and XP data
    return NextResponse.json(
      {
        success: true,
        data: {
          project: {
            id: result.project.id,
            title: result.project.title,
            status: result.project.status,
            completedAt: result.project.completedAt,
            completedBy: result.project.completedBy,
            xpAwarded: result.xpAwarded,
          },
          notificationsSent: result.notificationsSent,
          auditLogId: result.auditLogId,
        },
        message: "Project completed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors with appropriate status codes and messages
    // The handleError utility maps error types to HTTP status codes:
    // - ValidationError -> 400
    // - AuthorizationError -> 403
    // - NotFoundError -> 404
    // - Generic errors -> 500
    return handleError(error);
  }
}
