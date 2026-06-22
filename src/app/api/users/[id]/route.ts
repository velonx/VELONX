import { NextRequest, NextResponse } from "next/server";
import { requireOwnerOrAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, NotFoundError } from "@/lib/utils/errors";
import { userService } from "@/lib/services/user.service";
import { updateUserSchema } from "@/lib/validations/user";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getConnectionStatus,
  getMutualConnections,
  getConnectionCount,
} from "@/lib/services/connection.service";

/**
 * Generate a URL slug from user name
 */
function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores/hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens
}

/**
 * Get a unique URL slug for user profile
 */
async function getUniqueSlug(name: string, userId: string): Promise<string> {
  const baseSlug = generateSlugFromName(name || "user");
  const existingUserWithSlug = await prisma.user.findFirst({
    where: { slug: baseSlug }
  });
  if (!existingUserWithSlug || existingUserWithSlug.id === userId) {
    return baseSlug;
  }
  let uniqueSlug = baseSlug;
  let counter = 1;
  let exists = true;
  while (exists) {
    uniqueSlug = `${baseSlug}-${counter}`;
    const check = await prisma.user.findUnique({
      where: { slug: uniqueSlug }
    });
    if (!check) {
      exists = false;
    } else {
      counter++;
    }
  }
  return uniqueSlug;
}

/**
 * GET /api/users/[id]
 * Get user profile by ID or Slug (optional authentication for public viewing)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    // Optional authentication
    const session = await auth();
    const currentUserId = session?.user?.id;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetUserId);
    let user: any = null;

    const selectQuery = {
      id: true,
      name: true,
      slug: true,
      email: true,
      image: true,
      bio: true,
      xp: true,
      level: true,
      headline: true,
      college: true,
      graduationYear: true,
      skills: true,
      location: true,
      linkedinUrl: true,
      githubUrl: true,
      twitterUrl: true,
      portfolioUrl: true,
      profileComplete: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          communityPosts: true,
          projectsOwned: true,
          badges: true,
          followers: true,
          following: true,
        },
      },
      badges: {
        take: 6,
        orderBy: { earnedAt: "desc" },
        select: {
          earnedAt: true,
          badge: {
            select: {
              name: true,
              description: true,
              imageUrl: true,
              rarity: true,
              category: true,
            },
          },
        },
      },
      projectsOwned: {
        select: {
          id: true,
          title: true,
          description: true,
          techStack: true,
          status: true,
          imageUrl: true,
        }
      },
      projectMembers: {
        select: {
          project: {
            select: {
              id: true,
              title: true,
              description: true,
              techStack: true,
              status: true,
              imageUrl: true,
            }
          }
        }
      }
    };

    if (isObjectId) {
      user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: selectQuery as any,
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({
        where: { slug: targetUserId },
        select: selectQuery as any,
      });
    }

    if (!user) {
      throw new NotFoundError("User");
    }

    // Auto-populate slug if user exists but has no slug
    if (!user.slug && user.name) {
      const uniqueSlug = await getUniqueSlug(user.name, user.id);
      await prisma.user.update({
        where: { id: user.id },
        data: { slug: uniqueSlug }
      });
      user.slug = uniqueSlug;
    }

    const isOwnProfile = currentUserId === user.id;

    // Get connection status, mutual connections, and total connection count
    let connectionStatusData: {
      status: "none" | "pending_sent" | "pending_received" | "connected" | "self";
      connectionId?: string;
    } = { status: "none" };

    let mutualConnectionsData = { count: 0, users: [] as any[] };

    if (isOwnProfile) {
      connectionStatusData = { status: "self" };
    } else if (currentUserId) {
      connectionStatusData = await getConnectionStatus(currentUserId, user.id);
      mutualConnectionsData = await getMutualConnections(currentUserId, user.id);
    }

    const connectionCount = await getConnectionCount(user.id);

    // Format recent badges
    const recentBadges = (user.badges || []).map((b: any) => ({
      name: b.badge.name,
      description: b.badge.description,
      imageUrl: b.badge.imageUrl,
      rarity: b.badge.rarity,
      category: b.badge.category,
      earnedAt: b.earnedAt.toISOString(),
    }));

    // Format projects (owned + members)
    const ownedProjects = user.projectsOwned || [];
    const memberProjects = (user.projectMembers || []).map((m: any) => m.project).filter(Boolean);
    const allProjectsMap = new Map();
    ownedProjects.forEach((p: any) => allProjectsMap.set(p.id, p));
    memberProjects.forEach((p: any) => allProjectsMap.set(p.id, p));
    const projects = Array.from(allProjectsMap.values());

    // Formatted data response matching ProfileData interface
    const responseData = {
      ...user,
      isOwnProfile,
      connectionStatus: connectionStatusData,
      mutualConnections: mutualConnectionsData,
      connectionCount,
      recentBadges,
      projects,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/users/[id]
 * Update user profile (Owner or Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetId } = await params;
    let userId = targetId;

    // Resolve slug to user ID if necessary
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(targetId);
    if (!isObjectId) {
      const user = await prisma.user.findUnique({
        where: { slug: targetId },
        select: { id: true }
      });
      if (user) {
        userId = user.id;
      }
    }

    // Require owner or admin authorization
    const sessionOrResponse = await requireOwnerOrAdmin(userId);
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Update user
    const updatedUser = await userService.updateUser(userId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: "User profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
