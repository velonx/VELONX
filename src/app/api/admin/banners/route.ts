import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createBannerSchema } from "@/lib/validations/banner";

/**
 * GET /api/admin/banners
 * List all banners (including inactive) — admin only
 */
export async function GET() {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const banners = await prisma.banner.findMany({
      orderBy: [{ isActive: "desc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: banners }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/banners
 * Create a new pop-up banner — admin only
 */
export async function POST(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const body = await request.json();
    const data = createBannerSchema.parse(body);

    const banner = await prisma.banner.create({
      data: { ...data, createdById: sessionOrResponse.user.id },
    });

    return NextResponse.json(
      { success: true, data: banner, message: "Banner created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
