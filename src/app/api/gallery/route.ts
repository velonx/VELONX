import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";

export const revalidate = 60;

/**
 * GET /api/gallery
 * Public — visible gallery photos in display order
 */
export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: { id: true, imageUrl: true, title: true, caption: true, category: true },
      take: 200,
    });

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
