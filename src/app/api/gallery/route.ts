import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";
import { isGalleryEnabled } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

// Short shared cache so admin changes appear within a minute
const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

/**
 * GET /api/gallery
 * Public — landing-page gallery photos in display order; empty while the admin has the gallery switched off
 */
export async function GET() {
  try {
    if (!(await isGalleryEnabled())) {
      return NextResponse.json({ success: true, data: [] }, { status: 200, headers: CACHE_HEADERS });
    }

    const items = await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: { id: true, imageUrl: true, title: true, caption: true, category: true },
      take: 200,
    });

    return NextResponse.json({ success: true, data: items }, { status: 200, headers: CACHE_HEADERS });
  } catch (error) {
    return handleError(error);
  }
}
