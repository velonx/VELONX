import { NextRequest, NextResponse } from "next/server";
import { resourceService } from "@/lib/services/resource.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { updateResourceSchema } from "@/lib/validations/resource";

/**
 * GET /api/resources/[id]
 * Get resource details by ID
 * Public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await resourceService.getResourceById(id);
    
    return NextResponse.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/resources/[id]
 * Update resource details
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin authentication
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateResourceSchema.parse(body);
    
    const resource = await resourceService.updateResource(id, validatedData);
    
    return NextResponse.json({
      success: true,
      data: resource,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/resources/[id]
 * Delete a resource
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin authentication
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;
    
    await resourceService.deleteResource(id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Resource deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
