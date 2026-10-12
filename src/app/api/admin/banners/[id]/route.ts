import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, NotFoundError } from "@/lib/utils/errors";
import { updateBannerSchema } from "@/lib/validations/banner";

/**
 * PUT /api/admin/banners/[id]
 * Update a banner — admin only
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;
    const body = await request.json();
    const data = updateBannerSchema.parse(body);

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Banner");

    const startsAt = data.startsAt !== undefined ? data.startsAt : existing.startsAt;
    const endsAt = data.endsAt !== undefined ? data.endsAt : existing.endsAt;
    if (startsAt && endsAt && endsAt <= startsAt) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "End time must be after start time" } },
        { status: 400 }
      );
    }

    const updated = await prisma.banner.update({ where: { id }, data });

    return NextResponse.json({ success: true, data: updated, message: "Banner updated" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/banners/[id]
 * Permanently delete a banner — admin only
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Banner");

    await prisma.banner.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Banner deleted" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
