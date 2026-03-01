import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth.middleware';
import { handleError } from '@/lib/utils/errors';
import { pdfUploadSchema } from '@/lib/validations/resource';
import { uploadPDF } from '@/lib/services/pdf-upload.service';
import { ZodError } from 'zod';

/**
 * POST /api/resources/upload-pdf
 * Upload a PDF file to Cloudinary
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[PDF Upload] Starting upload process...');
    
    // Verify user is authenticated and has admin role
    console.log('[PDF Upload] Checking admin authentication...');
    const session = await requireAdmin();
    if (session instanceof NextResponse) {
      console.log('[PDF Upload] Authentication failed');
      return session;
    }
    console.log('[PDF Upload] Authentication successful');

    // Parse request body
    console.log('[PDF Upload] Parsing request body...');
    const body = await request.json();
    console.log('[PDF Upload] Request body parsed, fileName:', body.fileName);

    // Validate request body using pdfUploadSchema
    console.log('[PDF Upload] Validating request data...');
    let validatedData;
    try {
      validatedData = pdfUploadSchema.parse(body);
      console.log('[PDF Upload] Validation successful');
    } catch (error) {
      if (error instanceof ZodError) {
        console.log('[PDF Upload] Validation failed:', error.issues);
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

    // Call PDF upload service to upload file
    console.log('[PDF Upload] Uploading to Cloudinary...');
    const pdfMetadata = await uploadPDF({
      file: validatedData.file,
      fileName: validatedData.fileName,
      folder: 'velonx/resources/pdfs',
    });
    console.log('[PDF Upload] Upload successful, publicId:', pdfMetadata.publicId);

    // Return success response with PDF metadata
    return NextResponse.json(
      {
        success: true,
        data: {
          url: pdfMetadata.url,
          publicId: pdfMetadata.publicId,
          fileName: pdfMetadata.fileName,
          fileSize: pdfMetadata.fileSize,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Comprehensive error handling
    console.error('[PDF Upload] Error occurred:', error);
    console.error('[PDF Upload] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Handle specific error types
    if (error instanceof Error) {
      // File size validation error
      if (error.message.includes('10MB')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: error.message,
            },
          },
          { status: 400 }
        );
      }

      // Cloudinary upload error
      if (error.message.includes('Cloudinary')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UPLOAD_FAILED',
              message: 'Failed to upload PDF to storage service',
              details: error.message,
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
