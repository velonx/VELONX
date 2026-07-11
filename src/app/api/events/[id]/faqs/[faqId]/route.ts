import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

const updateFaqSchema = z.object({
  question: z.string().min(1).max(300).optional(),
  answer: z.string().min(1).max(1000).optional(),
  order: z.number().int().optional(),
});

/**
 * PATCH /api/events/[id]/faqs/[faqId]
 * Update an FAQ (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id, faqId } = await params;
    const body = await request.json();
    const data = updateFaqSchema.parse(body);

    const faq = await prisma.eventFAQ.updateMany({
      where: { id: faqId, eventId: id },
      data,
    });

    if (faq.count === 0) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    const updated = await prisma.eventFAQ.findUnique({ where: { id: faqId } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/events/[id]/faqs/[faqId]
 * Delete an FAQ (admin only)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; faqId: string }> }
) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id, faqId } = await params;

    await prisma.eventFAQ.deleteMany({
      where: { id: faqId, eventId: id },
    });

    return NextResponse.json({ success: true, message: "FAQ deleted" });
  } catch (error) {
    return handleError(error);
  }
}
