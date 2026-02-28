import { NextRequest, NextResponse } from "next/server";
import { resourceService } from "@/lib/services/resource.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { updateResourceSchema } from "@/lib/validations/resource";
import { deletePDF } from "@/lib/services/pdf-upload.service";

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
    
    // Update resource and get old PDF public ID if exists
    const { resource, oldPdfPublicId } = await resourceService.updateResource(id, validatedData);
    
    // If new PDF is uploaded and old PDF exists, delete old PDF from Cloudinary
    if (validatedData.pdfPublicId && oldPdfPublicId && validatedData.pdfPublicId !== oldPdfPublicId) {
      // Delete old PDF asynchronously (don't block response)
      deletePDF(oldPdfPublicId).catch((error) => {
        console.error('Failed to delete old PDF from Cloudinary:', error);
      });
    }
    
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
    
    // Get resource to check if it has a PDF
    const resource = await resourceService.getResourceById(id);
    
    // If resource has PDF, delete from Cloudinary before deleting database record
    if (resource.pdfPublicId) {
      try {
        await deletePDF(resource.pdfPublicId);
      } catch (error) {
        // Log Cloudinary error but proceed with database deletion
        console.error('Failed to delete PDF from Cloudinary during resource deletion:', error);
      }
    }
    
    // Delete resource from database
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
