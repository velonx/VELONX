import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/project.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createProjectSchema, projectQuerySchema } from "@/lib/validations/project";
import { cacheService, CacheKeys, CacheTTL } from "@/lib/services/cache.service";
import { createInMemoryRateLimiter } from "@/lib/services/in-memory-rate-limiter.service";
import { getClientIp } from "@/lib/middleware/rate-limit.middleware";

// Rate limiter: 100 requests per IP per minute
const projectsRateLimiter = createInMemoryRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List projects
 *     description: Retrieve projects with pagination and filtering options
 *     tags:
 *       - Projects
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PLANNING, IN_PROGRESS, COMPLETED, ARCHIVED]
 *         description: Filter by project status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [WEB_DEV, MOBILE, AI_ML, DATA_SCIENCE, DEVOPS, DESIGN, OTHER]
 *         description: Filter by project category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         description: Filter by project difficulty level
 *       - in: query
 *         name: techStack
 *         schema:
 *           type: string
 *         description: Filter by technology stack (comma-separated)
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: Filter by team member ID
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded - Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting: 100 requests per IP per minute
    const clientIp = getClientIp(request);
    const rateLimitResult = await projectsRateLimiter.checkRateLimit(
      clientIp,
      "/api/projects"
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = projectQuerySchema.parse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      status: searchParams.get("status") || undefined,
      techStack: searchParams.get("techStack") || undefined,
      memberId: searchParams.get("memberId") || undefined,
      category: searchParams.get("category") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
    });

    // Use caching for COMPLETED status queries
    if (queryParams.status === 'COMPLETED') {
      // Generate cache key from query parameters
      const cacheKey = CacheKeys.project.completed({
        page: queryParams.page,
        pageSize: queryParams.pageSize,
        techStack: queryParams.techStack,
        category: queryParams.category,
        difficulty: queryParams.difficulty,
        memberId: queryParams.memberId,
      });

      // Try to get from cache, or fetch and cache if not found
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => {
          return await projectService.listProjects(queryParams);
        },
        CacheTTL.PROJECT_COMPLETED
      );

      return NextResponse.json(
        {
          success: true,
          data: result.projects,
          pagination: result.pagination,
        },
        { status: 200 }
      );
    }

    // For non-completed projects, fetch without caching
    const result = await projectService.listProjects(queryParams);

    return NextResponse.json(
      {
        success: true,
        data: result.projects,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a project
 *     description: Create a new project with the authenticated user as owner
 *     tags:
 *       - Projects
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - techStack
 *             properties:
 *               title:
 *                 type: string
 *                 description: Project title
 *                 example: "E-commerce Platform"
 *               description:
 *                 type: string
 *                 description: Project description
 *                 example: "A full-stack e-commerce platform with React and Node.js"
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Technologies used
 *                 example: ["React", "Node.js", "MongoDB", "Tailwind CSS"]
 *               category:
 *                 type: string
 *                 enum: [WEB_DEV, MOBILE, AI_ML, DATA_SCIENCE, DEVOPS, DESIGN, OTHER]
 *                 description: Project category
 *                 example: "WEB_DEV"
 *               difficulty:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *                 description: Project difficulty level
 *                 example: "INTERMEDIATE"
 *               githubUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *                 example: "https://github.com/user/project"
 *               liveUrl:
 *                 type: string
 *                 description: Live demo URL
 *                 example: "https://project.vercel.app"
 *               imageUrl:
 *                 type: string
 *                 description: Project screenshot URL
 *               lookingForMembers:
 *                 type: boolean
 *                 description: Whether looking for team members
 *                 example: true
 *               maxMembers:
 *                 type: integer
 *                 description: Maximum team size
 *                 example: 4
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *                   example: "Project created successfully"
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    
    // Validate request body
    const validatedData = createProjectSchema.parse(body);

    // Create project with the authenticated user as owner
    const project = await projectService.createProject({
      ...validatedData,
      ownerId: session.user.id!,
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: "Project created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
