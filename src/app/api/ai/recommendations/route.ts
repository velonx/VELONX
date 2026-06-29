import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";
import { getRecommendedJobs } from "@/services/aiMatch.service";

export async function GET(req: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User profile not found" } },
        { status: 404 }
      );
    }

    const filter: any = {
      status: "ACTIVE"
    };

    if (user.lookingFor) {
      const lf = user.lookingFor.toUpperCase();
      if (lf === "INTERNSHIP") {
        filter.type = "INTERNSHIP";
      } else if (lf === "JOB") {
        filter.type = "JOB";
      }
    }

    // Fetch active jobs up to 50
    const jobs = await prisma.opportunity.findMany({
      where: filter,
      take: 50,
      orderBy: {
        createdAt: "desc"
      }
    });

    const recommended = await getRecommendedJobs(user, jobs);
    return NextResponse.json(recommended);
  } catch (error) {
    console.error("Error in GET /api/ai/recommendations:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch recommendations" } },
      { status: 500 }
    );
  }
}
