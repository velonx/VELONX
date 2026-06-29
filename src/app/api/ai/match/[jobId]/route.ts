import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";
import { matchUserToJob } from "@/services/aiMatch.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Job ID is required" } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const job = await prisma.opportunity.findUnique({
      where: { id: jobId }
    });

    if (!user || !job) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User profile or job post not found" } },
        { status: 404 }
      );
    }

    const matchResult = await matchUserToJob(user, job);
    return NextResponse.json(matchResult);
  } catch (error) {
    console.error("Error in GET /api/ai/match/[jobId]:", error);
    return NextResponse.json(
      {
        score: 0,
        verdict: "Unable to score",
        strengths: [],
        gaps: [],
        tip: "Please try again in a moment."
      },
      { status: 500 }
    );
  }
}
