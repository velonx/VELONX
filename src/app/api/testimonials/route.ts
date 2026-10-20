import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

// Short shared cache so admin changes appear within a minute
const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

/**
 * GET /api/testimonials
 * Public — visible testimonials in display order
 */
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: { id: true, name: true, quote: true, badge: true, subtitle: true, avatarUrl: true, accent: true },
      take: 30,
    });

    return NextResponse.json({ success: true, data: testimonials }, { status: 200, headers: CACHE_HEADERS });
  } catch (error) {
    return handleError(error);
  }
}
