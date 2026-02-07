import { NextRequest, NextResponse } from "next/server";
import { resourceService } from "@/lib/services/resource.service";
import { handleError } from "@/lib/utils/errors";

/**
 * POST /api/resources/[id]/access
 * Track resource access by incrementing access count
 * Public endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await resourceService.trackResourceAccess(id);
    
    return NextResponse.json({
      success: true,
      data: resource,
      message: "Resource access tracked successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
