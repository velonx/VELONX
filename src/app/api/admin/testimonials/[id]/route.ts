import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, NotFoundError } from "@/lib/utils/errors";
import { updateTestimonialSchema } from "@/lib/validations/cms";

/**
 * PUT /api/admin/testimonials/[id]
 * Update a Testimonial — admin only
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;
    const body = await request.json();
    const data = updateTestimonialSchema.parse(body);

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Testimonial");

    const updated = await prisma.testimonial.update({ where: { id }, data });

    return NextResponse.json({ success: true, data: updated, message: "Testimonial updated" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/testimonials/[id]
 * Permanently delete a Testimonial — admin only
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Testimonial");

    await prisma.testimonial.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Testimonial deleted" }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
