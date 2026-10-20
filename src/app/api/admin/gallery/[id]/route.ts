import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, NotFoundError } from "@/lib/utils/errors";
import { updateGalleryItemSchema } from "@/lib/validations/cms";

/**
 * PUT /api/admin/gallery/[id]
 * Update a Gallery item — admin only
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;
    const body = await request.json();
    const data = updateGalleryItemSchema.parse(body);

    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Gallery item");

    const updated = await prisma.galleryItem.update({ where: { id }, data });

    return NextResponse.json({ success: true, data: updated, message: "Gallery item updated" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/gallery/[id]
 * Permanently delete a Gallery item — admin only
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;

    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Gallery item");

    await prisma.galleryItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Gallery item deleted" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
