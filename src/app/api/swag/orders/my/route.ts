import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/swag/orders/my
 * Get current user's order history
 */
export async function GET(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;
    const userId = sessionOrResponse.user.id!;

    const orders = await prisma.swagOrder.findMany({
      where: { userId },
      include: {
        item: { select: { id: true, name: true, imageUrl: true, category: true, xpCost: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
