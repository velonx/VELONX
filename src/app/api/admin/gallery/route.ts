import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createGalleryItemSchema } from "@/lib/validations/cms";

/**
 * GET /api/admin/gallery
 * List all gallery items (including hidden) — admin only
 */
export async function GET() {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const items = await prisma.galleryItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/gallery
 * Create a Gallery item — admin only
 */
export async function POST(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const body = await request.json();
    const data = createGalleryItemSchema.parse(body);

    const item = await prisma.galleryItem.create({
      data: { ...data, createdById: sessionOrResponse.user.id },
    });

    return NextResponse.json(
      { success: true, data: item, message: "Gallery item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
