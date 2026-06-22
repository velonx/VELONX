/**
 * GET /api/users/directory — Search and filter users for the network directory (publicly accessible)
 */

import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("q")?.trim() || "";
    const skillsFilter = searchParams.get("skills")?.split(",").filter(Boolean) || [];
    const collegeFilter = searchParams.get("college")?.trim() || "";
    const locationFilter = searchParams.get("location")?.trim() || "";
    const skip = (page - 1) * limit;

    // Get blocked user IDs (in both directions) to exclude
    const blockedIds = new Set<string>();
    if (userId) {
      const blocks = await prisma.userBlock.findMany({
        where: {
          OR: [{ blockerId: userId }, { blockedId: userId }],
        },
        select: { blockerId: true, blockedId: true },
      });

      blocks.forEach((b) => {
        blockedIds.add(b.blockerId);
        blockedIds.add(b.blockedId);
      });
      blockedIds.delete(userId); // Don't block yourself
    }

    // Build filter conditions
    const whereConditions: any[] = [];

    if (userId) {
      whereConditions.push({ id: { not: userId } }); // Exclude self
      if (blockedIds.size > 0) {
        whereConditions.push({ id: { notIn: Array.from(blockedIds) } });
      }
    }

    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { headline: { contains: search, mode: "insensitive" } },
          { college: { contains: search, mode: "insensitive" } },
          { skills: { hasSome: [search] } },
        ],
      });
    }

    if (skillsFilter.length > 0) {
      whereConditions.push({ skills: { hasSome: skillsFilter } });
    }

    if (collegeFilter) {
      whereConditions.push({ college: { contains: collegeFilter, mode: "insensitive" } });
    }

    if (locationFilter) {
      whereConditions.push({ location: { contains: locationFilter, mode: "insensitive" } });
    }

    const whereClause = { AND: whereConditions };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          headline: true,
          college: true,
          graduationYear: true,
          skills: true,
          location: true,
          bio: true,
          xp: true,
          level: true,
        } as any,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
