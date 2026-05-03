import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

const updateRewardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(300).optional(),
  iconType: z.enum(["trophy", "star", "gift", "certificate", "medal", "zap"]).optional(),
  rankRequired: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive().optional().nullable(),
  order: z.number().int().optional(),
});

/**
 * PATCH /api/events/[id]/rewards/[rewardId]
 * Update a reward (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rewardId: string }> }
) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id, rewardId } = await params;
    const body = await request.json();
    const data = updateRewardSchema.parse(body);

    const reward = await prisma.eventReward.updateMany({
      where: { id: rewardId, eventId: id },
      data,
    });

    if (reward.count === 0) {
      return NextResponse.json({ success: false, error: "Reward not found" }, { status: 404 });
    }

    const updated = await prisma.eventReward.findUnique({ where: { id: rewardId } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/events/[id]/rewards/[rewardId]
 * Delete a reward (admin only)
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; rewardId: string }> }
) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { id, rewardId } = await params;

    await prisma.eventReward.deleteMany({
      where: { id: rewardId, eventId: id },
    });

    return NextResponse.json({ success: true, message: "Reward deleted" });
  } catch (error) {
    return handleError(error);
  }
}
