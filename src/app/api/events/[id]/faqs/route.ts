import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(1000),
  order: z.number().int().default(0),
});

/**
 * GET /api/events/[id]/faqs
 * Get all FAQs for an event (public)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faqs = await prisma.eventFAQ.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/events/[id]/faqs
 * Create a new FAQ for an event (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id } = await params;

    // Check event exists
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = faqSchema.parse(body);

    const faq = await prisma.eventFAQ.create({
      data: { ...data, eventId: id },
    });

    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
