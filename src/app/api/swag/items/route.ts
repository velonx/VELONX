import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/swag/items
 * List all active swag items — public (no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = { isActive: true };
    if (category && category !== "ALL") {
      where.category = category;
    }

    const items = await prisma.swagItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
