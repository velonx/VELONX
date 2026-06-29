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

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || !q.trim()) {
      return NextResponse.json(
        { error: "Search query required" },
        { status: 400 }
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

    // Fetch active jobs
    const jobs = await prisma.opportunity.findMany({
      where: filter
    });

    // Filter jobs by query string case-insensitively on title or requirements
    const queryLower = q.toLowerCase();
    const matchingJobs = jobs.filter((job) => {
      const titleMatch = job.title?.toLowerCase().includes(queryLower);
      const requirementsMatch = Array.isArray(job.requirements) && job.requirements.some((req) => req.toLowerCase().includes(queryLower));
      return titleMatch || requirementsMatch;
    });

    const recommended = await getRecommendedJobs(user, matchingJobs);
    return NextResponse.json(recommended);
  } catch (error) {
    console.error("Error in GET /api/ai/search:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to perform AI search" } },
      { status: 500 }
    );
  }
}
