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
  badgeName: z.string().optional().nullable().or(z.literal("")),
  badgeImageUrl: z.string().optional().nullable().or(z.literal("")),
  hasCertificate: z.boolean().optional(),
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
    const validatedData = createPathSchema.parse(body);

    const path = await learningPathService.createLearningPath({
      title: validatedData.title,
      description: validatedData.description,
      level: validatedData.level,
      duration: validatedData.duration,
      badgeName: validatedData.badgeName || undefined,
      badgeImageUrl: validatedData.badgeImageUrl || undefined,
      hasCertificate: validatedData.hasCertificate,
    });

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
