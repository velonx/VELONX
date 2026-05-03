import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/admin/swag/orders
 * List all swag orders with delivery details — admin only
 */
export async function GET(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;

    const [orders, total] = await Promise.all([
      prisma.swagOrder.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          item: { select: { id: true, name: true, imageUrl: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.swagOrder.count({ where }),
    ]);

    // Stats
    const [pending, processing, shipped, delivered, totalXpRedeemed] = await Promise.all([
      prisma.swagOrder.count({ where: { status: "PENDING" } }),
      prisma.swagOrder.count({ where: { status: "PROCESSING" } }),
      prisma.swagOrder.count({ where: { status: "SHIPPED" } }),
      prisma.swagOrder.count({ where: { status: "DELIVERED" } }),
      prisma.swagOrder.aggregate({ _sum: { xpSpent: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        stats: {
          pending,
          processing,
          shipped,
          delivered,
          totalXpRedeemed: totalXpRedeemed._sum.xpSpent ?? 0,
          total,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
