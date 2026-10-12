import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";
import { trackBannerSchema } from "@/lib/validations/banner";

/**
 * POST /api/banners/[id]/track
 * Public — records a view or CTA click for a live banner
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id)) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Banner not found" } }, { status: 404 });
    }

    const { event } = trackBannerSchema.parse(await request.json());

    const result = await prisma.banner.updateMany({
      where: { id, isActive: true },
      data: event === "view" ? { views: { increment: 1 } } : { clicks: { increment: 1 } },
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Banner not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
