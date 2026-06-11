import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

const createPathSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  duration: z.string(),
  badgeName: z.string().min(3),
  badgeImageUrl: z.string().url(),
});

/**
 * GET /api/learning-paths
 * List all learning paths (public or user-annotated)
 */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const paths = await learningPathService.listLearningPaths(userId);

    return NextResponse.json({
      success: true,
      data: paths,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/learning-paths
 * Create a new learning path (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const validatedData = {
      title: body.title,
      description: body.description,
      level: body.level,
      duration: body.duration,
      badgeName: body.badgeName,
      badgeImageUrl: body.badgeImageUrl,
    };

    const path = await learningPathService.createLearningPath(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: path,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
