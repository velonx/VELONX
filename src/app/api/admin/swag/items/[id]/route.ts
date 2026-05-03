import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, NotFoundError } from "@/lib/utils/errors";
import { z } from "zod";

const updateItemSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(500).optional(),
  imageUrl: z.string().url().nullable().optional(),
  category: z.enum(["NOTEBOOK", "DIARY", "BOTTLE", "BAG", "PLANT", "LAMP", "STATIONERY", "APPAREL", "OTHER"]).optional(),
  xpCost: z.number().int().min(1).optional(),
  stock: z.number().int().min(-1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/admin/swag/items/[id]
 * Update a swag item — admin only
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;
    const body = await request.json();
    const data = updateItemSchema.parse(body);

    const existing = await prisma.swagItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Swag item");

    const updated = await prisma.swagItem.update({ where: { id }, data });

    return NextResponse.json({ success: true, data: updated, message: "Item updated" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/swag/items/[id]
 * Soft-delete (deactivate) a swag item — admin only
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;

    const existing = await prisma.swagItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Swag item");

    const updated = await prisma.swagItem.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: updated, message: "Item deactivated" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
