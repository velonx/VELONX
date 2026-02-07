import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/admin.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/admin/stats
 * Get platform statistics
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const stats = await adminService.getPlatformStats();
    
    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
