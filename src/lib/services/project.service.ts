import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";

/**
 * Service class for managing projects
 */
export class ProjectService {
  /**
   * List projects with pagination and filtering
   */
  async listProjects(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    techStack?: string;
    memberId?: string;
    category?: string;
    difficulty?: string;
  }) {
    const { page = 1, pageSize = 10, status, techStack, memberId, category, difficulty } = params;

    const where: Prisma.ProjectWhereInput = {};

    // Filter by status
    if (status) {
      where.status = status as any;
    }

    // Filter by category
    if (category) {
      where.category = category as any;
    }

    // Filter by difficulty
    if (difficulty) {
      where.difficulty = difficulty as any;
    }

    // Filter by tech stack (contains any of the specified technologies)
    if (techStack) {
      const techArray = techStack.split(",").map((t) => t.trim());
      where.techStack = {
        hasSome: techArray,
      };
    }

    // Filter by member
    if (memberId) {
      where.OR = [
        { ownerId: memberId },
        {
          members: {
            some: {
              userId: memberId,
            },
          },
        },
      ];
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  email: true,
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
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get a single project by ID
   */
  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
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
    });

    if (!project) {
      throw new NotFoundError("Project");
    }

    return project;
  }

  /**
   * Create a new project
   */
  async createProject(data: {
    title: string;
    description: string;
    techStack: string[];
    status?: string;
    category?: string;
    difficulty?: string;
    imageUrl?: string;
    githubUrl?: string;
    liveUrl?: string;
    outcomes?: string;
    ownerId: string;
  }) {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        techStack: data.techStack,
        status: (data.status as any) || "PLANNING",
        category: (data.category as any) || "OTHER",
        difficulty: (data.difficulty as any) || "BEGINNER",
        imageUrl: data.imageUrl,
        githubUrl: data.githubUrl,
        liveUrl: data.liveUrl,
        outcomes: data.outcomes,
        ownerId: data.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return project;
  }

  /**
   * Update a project
   */
  async updateProject(
    id: string,
    data: {
      title?: string;
      description?: string;
      techStack?: string[];
      status?: string;
      category?: string;
      difficulty?: string;
      imageUrl?: string;
      githubUrl?: string;
      liveUrl?: string;
      outcomes?: string;
    }
  ) {
    // Check if project exists
    await this.getProjectById(id);

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.techStack && { techStack: data.techStack }),
        ...(data.status && { status: data.status as any }),
        ...(data.category && { category: data.category as any }),
        ...(data.difficulty && { difficulty: data.difficulty as any }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
        ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl }),
        ...(data.outcomes !== undefined && { outcomes: data.outcomes }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return project;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string) {
    // Check if project exists
    await this.getProjectById(id);

    await prisma.project.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Add a member to a project
   */
  async addProjectMember(projectId: string, userId: string, role?: string) {
    // Check if project exists
    await this.getProjectById(projectId);

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this project");
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    return member;
  }

  /**
   * Remove a member from a project
   */
  async removeProjectMember(projectId: string, userId: string) {
    // Check if project exists
    await this.getProjectById(projectId);

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError("Project member");
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Check if a user is the owner or a member of a project
   */
  async isProjectOwnerOrMember(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
        members: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!project) {
      return false;
    }

    return project.ownerId === userId || project.members.length > 0;
  }

  /**
   * Check if a user is the owner of a project
   */
  async isProjectOwner(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        ownerId: true,
      },
    });

    if (!project) {
      return false;
    }

    return project.ownerId === userId;
  }
}

export const projectService = new ProjectService();
