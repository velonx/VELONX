import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";

export const revalidate = 60;

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

    return NextResponse.json({ success: true, data: testimonials }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
