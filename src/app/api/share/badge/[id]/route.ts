import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/lib/utils/errors";
import { BadgeService } from "@/lib/services/badge.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const details = await BadgeService.getShareableBadgeDetails(id);

    if (!details) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Badge not found or not shareable" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: details,
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/share/badge/[id] error:", error);
    return handleError(error);
  }
}
