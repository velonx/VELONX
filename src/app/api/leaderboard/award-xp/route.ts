import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "@/lib/services/leaderboard.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

// Award XP request validation schema
const awardXPSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.number().int().positive("Amount must be a positive integer"),
  reason: z.string().min(1, "Reason is required").max(200, "Reason must not exceed 200 characters"),
});

/**
 * POST /api/leaderboard/award-xp
 * Award XP to a user
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = awardXPSchema.parse(body);
    
    // Award XP to user
    const result = await leaderboardService.awardXP(
      validatedData.userId,
      validatedData.amount,
      validatedData.reason
    );
    
    return NextResponse.json(
      {
        success: true,
        data: result,
        message: `Successfully awarded ${validatedData.amount} XP to user`,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
