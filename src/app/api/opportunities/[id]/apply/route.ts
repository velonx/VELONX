import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { BadgeService } from "@/lib/services/badge.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User session invalid" } },
        { status: 401 }
      );
    }

    const { id: opportunityId } = await params;

    // Check if opportunity exists
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true, title: true }
    });

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Opportunity not found" } },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existing = await prisma.opportunityApplication.findUnique({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId
        }
      }
    });

    if (!existing) {
      // Create application record
      await prisma.opportunityApplication.create({
        data: {
          userId,
          opportunityId
        }
      });

      // Record audit log for security and tracking
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'OPPORTUNITY_APPLY',
          resource: 'OPPORTUNITY',
          ipAddress: 'system',
          userAgent: 'system',
          result: 'success',
          metadata: {
            opportunityId,
            opportunityTitle: opportunity.title,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Trigger Badge Check for CAREER category (job applications)
      try {
        await BadgeService.evaluateAndAwardBadges(userId, 'CAREER');
      } catch (badgeErr) {
        console.error("Failed to evaluate career badges on application:", badgeErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Application registered successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("POST /api/opportunities/[id]/apply error:", error);
    return handleError(error);
  }
}
