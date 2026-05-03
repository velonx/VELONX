import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

const rewardSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  iconType: z.enum(["trophy", "star", "gift", "certificate", "medal", "zap"]).default("trophy"),
  rankRequired: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive().optional().nullable(),
  order: z.number().int().default(0),
});

/**
 * GET /api/events/[id]/rewards
 * Get all rewards for an event (public)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rewards = await prisma.eventReward.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: rewards });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/events/[id]/rewards
 * Create a new reward for an event (admin only)
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
    const data = rewardSchema.parse(body);

    const reward = await prisma.eventReward.create({
      data: { ...data, eventId: id },
    });

    return NextResponse.json({ success: true, data: reward }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
