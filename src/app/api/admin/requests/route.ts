import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/admin.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { adminRequestQuerySchema } from "@/lib/validations/admin";

/**
 * GET /api/admin/requests
 * List user requests with pagination and filtering
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = adminRequestQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      type: searchParams.get("type"),
      status: searchParams.get("status"),
    });
    
    const result = await adminService.listUserRequests(queryParams);
    
    return NextResponse.json(
      {
        success: true,
        data: result.requests,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
