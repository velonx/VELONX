import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { handleError } from "@/lib/utils/errors";
import { hallOfFameQuerySchema } from "@/lib/validations/hall-of-fame";

/**
 * @swagger
 * /api/projects/hall-of-fame:
 *   get:
 *     summary: Get Hall of Fame projects
 *     description: Retrieve completed projects with filtering, search, sorting, and pagination
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in project title and description
 *       - in: query
 *         name: techStack
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by technology stack
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
 *         description: Filter by project difficulty
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [completedAt, title, teamSize]
 *           default: completedAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Hall of Fame projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CompletedProject'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Bad request - Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = hallOfFameQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      techStack: searchParams.getAll("techStack").length > 0 
        ? searchParams.getAll("techStack") 
        : searchParams.get("techStack") || undefined,
      category: searchParams.get("category") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const { search, techStack, category, difficulty, sortBy, sortOrder, page, limit } = queryParams;

    // Build where clause
    const where: Prisma.ProjectWhereInput = {
      status: "COMPLETED", // Only show completed projects
    };

    // Search filter (title or description)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tech stack filter
    if (techStack && techStack.length > 0) {
      where.techStack = {
        hasSome: techStack,
      };
    }

    // Category filter
    if (category) {
      where.category = category as any;
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty as any;
    }

    // Build orderBy clause
    let orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    
    if (sortBy === "completedAt") {
      orderBy = { completedAt: sortOrder };
    } else if (sortBy === "title") {
      orderBy = { title: sortOrder };
    } else if (sortBy === "teamSize") {
      // For team size, we need to order by member count
      orderBy = { members: { _count: sortOrder } };
    }

    // Fetch projects and total count in parallel
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Format response with team size
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      category: project.category,
      difficulty: project.difficulty,
      imageUrl: project.imageUrl,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      completedAt: project.completedAt,
      owner: project.owner,
      members: project.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        image: member.user.image,
        role: member.role,
      })),
      teamSize: project._count.members + 1, // +1 for owner
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          projects: formattedProjects,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
