import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth.middleware';
import { handleError } from '@/lib/utils/errors';
import { pdfDeleteSchema } from '@/lib/validations/resource';
import { deletePDF } from '@/lib/services/pdf-upload.service';
import { ZodError } from 'zod';

/**
 * DELETE /api/resources/delete-pdf
 * Delete a PDF file from Cloudinary
 * Admin only
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin role
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    // Parse request body
    const body = await request.json();

    // Validate request body using pdfDeleteSchema
    let validatedData;
    try {
      validatedData = pdfDeleteSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: error.issues,
            },
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Call PDF upload service to delete file from Cloudinary
    await deletePDF(validatedData.publicId);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'PDF deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    // Comprehensive error handling
    console.error('PDF deletion error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Cloudinary deletion error
      if (error.message.includes('Cloudinary')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DELETE_FAILED',
              message: 'Failed to delete PDF from storage service',
            },
          },
          { status: 500 }
        );
      }
    }

    // Generic error handling
    return handleError(error);
  }
}
