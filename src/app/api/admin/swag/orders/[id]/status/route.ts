import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, NotFoundError } from "@/lib/utils/errors";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

/**
 * PUT /api/admin/swag/orders/[id]/status
 * Update order fulfillment status — admin only
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

    const existing = await prisma.swagOrder.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Swag order");

    // If cancelling, refund XP
    if (status === "CANCELLED" && existing.status !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        await tx.swagOrder.update({ where: { id }, data: { status } });
        await tx.user.update({
          where: { id: existing.userId },
          data: { xp: { increment: existing.xpSpent } },
        });
        await tx.xPTransaction.create({
          data: {
            userId: existing.userId,
            amount: existing.xpSpent,
            reason: `Swag order cancelled — XP refunded`,
            source: "MANUAL",
            metadata: JSON.stringify({ orderId: id }),
          },
        });
      });
    } else {
      await prisma.swagOrder.update({ where: { id }, data: { status } });
    }

    const updated = await prisma.swagOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        item: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Order status updated" });
  } catch (error) {
    return handleError(error);
  }
}
