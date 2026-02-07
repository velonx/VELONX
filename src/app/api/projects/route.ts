import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/project.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createProjectSchema, projectQuerySchema } from "@/lib/validations/project";

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
 */
export async function GET(request: NextRequest) {
  try {
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
