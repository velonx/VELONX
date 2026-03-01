/**
 * PDF Access Proxy Route
 * Feature: resource-pdf-upload
 * 
 * Provides authenticated access to PDF resources stored on Cloudinary.
 * Verifies user authentication before generating signed URLs.
 * 
 * Requirements:
 * - 6.4: Verify request is from authenticated user before serving PDF
 * - 5.4: Serve files securely from Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateSignedPDFUrl } from '@/lib/services/pdf-upload.service';
import { handleError } from '@/lib/utils/errors';

/**
 * GET /api/resources/pdf/[publicId]
 * Generate signed URL for authenticated PDF access
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required to access PDF resources',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    const { publicId } = await params;

    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'PDF public ID is required',
            code: 'INVALID_REQUEST',
          },
        },
        { status: 400 }
      );
    }

    // Decode the public ID (it may be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    // Generate signed URL with 1 hour expiration
    const signedUrl = generateSignedPDFUrl(decodedPublicId, 3600);

    // Return the signed URL
    return NextResponse.json({
      success: true,
      data: {
        url: signedUrl,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    console.error('PDF access error:', error);
    return handleError(error);
  }
}
