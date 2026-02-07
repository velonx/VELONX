import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";
import { NotFoundError } from "@/lib/utils/errors";

/**
 * POST /api/resources/[id]/visit
 * Track resource visit and award XP for first-time visits
 * Authenticated users only
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resourceId } = await params;
    
    // Verify user authentication
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;
    
    // Ensure user ID exists
    if (!session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User ID not found in session",
          },
        },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Validate resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, title: true },
    });
    
    if (!resource) {
      throw new NotFoundError("Resource");
    }
    
    // Check for existing ResourceVisit record
    const existingVisit = await prisma.resourceVisit.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });
    
    // If duplicate visit, return success without awarding XP
    if (existingVisit) {
      return NextResponse.json({
        success: true,
        data: {
          alreadyVisited: true,
          xpAwarded: false,
          message: "Resource already visited",
        },
      });
    }
    
    // First visit: create ResourceVisit record, award XP, increment accessCount
    try {
      // Create visit record
      await prisma.resourceVisit.create({
        data: {
          userId,
          resourceId,
          xpAwarded: true,
        },
      });
      
      // Award XP
      const xpResult = await awardXP(
        userId,
        XP_REWARDS.RESOURCE_VISIT,
        `Visited resource: ${resource.title}`
      );
      
      // Increment access count
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          accessCount: { increment: 1 },
        },
      });
      
      return NextResponse.json({
        success: true,
        data: {
          alreadyVisited: false,
          xpAwarded: true,
          xpAmount: XP_REWARDS.RESOURCE_VISIT,
          newXP: xpResult.xp,
          newLevel: xpResult.level,
          leveledUp: xpResult.leveledUp,
          message: `Earned ${XP_REWARDS.RESOURCE_VISIT} XP for visiting ${resource.title}`,
        },
      });
    } catch (error: any) {
      // Handle unique constraint violations gracefully
      if (error.code === "P2002") {
        // Race condition: another request created the visit record
        return NextResponse.json({
          success: true,
          data: {
            alreadyVisited: true,
            xpAwarded: false,
            message: "Resource already visited",
          },
        });
      }
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
}
