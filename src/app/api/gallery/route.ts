import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";
import { isGalleryEnabled } from "@/lib/site-settings";

export const revalidate = 60;

/**
 * GET /api/gallery
 * Public — landing-page gallery photos in display order; empty while the admin has the gallery switched off
 */
export async function GET() {
  try {
    if (!(await isGalleryEnabled())) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

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
