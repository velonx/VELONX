import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

const orderSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(10).default(1),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(7).max(15),
  address: z.string().min(5).max(300),
  city: z.string().min(2).max(100),
  pincode: z.string().min(4).max(10),
  notes: z.string().max(500).optional(),
});

/**
 * POST /api/swag/orders
 * Place an order — deducts XP atomically
 */
export async function POST(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;
    const userId = sessionOrResponse.user.id!;

    const body = await request.json();
    const data = orderSchema.parse(body);

    // Fetch item
    const item = await prisma.swagItem.findUnique({ where: { id: data.itemId } });
    if (!item || !item.isActive) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Item not found or unavailable" } },
        { status: 404 }
      );
    }

    // Check stock
    if (item.stock !== -1 && item.stock < data.quantity) {
      return NextResponse.json(
        { success: false, error: { code: "OUT_OF_STOCK", message: "Insufficient stock for this item" } },
        { status: 400 }
      );
    }

    const totalXp = item.xpCost * data.quantity;

    // Fetch user XP
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
    if (!user || user.xp < totalXp) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_XP",
            message: `You need ${totalXp} XP to redeem this item. You have ${user?.xp ?? 0} XP.`,
          },
        },
        { status: 400 }
      );
    }

    // Atomic transaction: create order + deduct XP + log transaction + decrement stock
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.swagOrder.create({
        data: {
          userId,
          itemId: data.itemId,
          quantity: data.quantity,
          xpSpent: totalXp,
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          pincode: data.pincode,
          notes: data.notes,
        },
        include: { item: true },
      });

      // Deduct XP from user
      await tx.user.update({
        where: { id: userId },
        data: { xp: { decrement: totalXp } },
      });

      // Log XP transaction
      await tx.xPTransaction.create({
        data: {
          userId,
          amount: -totalXp,
          reason: `Swag redemption: ${item.name} x${data.quantity}`,
          source: "SWAG_REDEMPTION",
          metadata: JSON.stringify({ itemId: item.id, orderId: newOrder.id }),
        },
      });

      // Decrement stock if finite
      if (item.stock !== -1) {
        await tx.swagItem.update({
          where: { id: item.id },
          data: { stock: { decrement: data.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      { success: true, data: order, message: "Order placed successfully!" },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
