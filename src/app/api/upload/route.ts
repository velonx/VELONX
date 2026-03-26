import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { auth } from '@/auth';
import { validateCSRFToken } from '@/lib/middleware/csrf.middleware';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(request);
    if (!isValidCSRF) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CSRF', message: 'Invalid or missing CSRF token. Please refresh the page and try again.' } },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    let base64Image: string;
    let folder: string = 'velonx/general';

    if (contentType.includes('application/json')) {
      // JSON body: { image: 'data:image/...;base64,...', folder: '...' }
      const body = await request.json();
      if (!body.image) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_FILE', message: 'Image data is required' } },
          { status: 400 }
        );
      }
      base64Image = body.image;
      folder = body.folder || folder;

      // Derive MIME type from data URL prefix
      const mimeMatch = base64Image.match(/^data:(image\/[^;]+);base64,/);
      if (!mimeMatch) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' } },
          { status: 400 }
        );
      }
      const mimeType = mimeMatch[1];
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(mimeType)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' } },
          { status: 400 }
        );
      }

      // Validate file size from base64 (approx)
      const base64Data = base64Image.split(',')[1] || '';
      const approxBytes = (base64Data.length * 3) / 4;
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (approxBytes > maxSize) {
        return NextResponse.json(
          { success: false, error: { code: 'FILE_TOO_LARGE', message: 'File size must be less than 5MB' } },
          { status: 400 }
        );
      }
    } else {
      // FormData body
      const formData = await request.formData();
      const file = formData.get('file') as File;
      folder = (formData.get('folder') as string) || folder;

      if (!file) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_FILE', message: 'File is required' } },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' } },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: { code: 'FILE_TOO_LARGE', message: 'File size must be less than 5MB' } },
          { status: 400 }
        );
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImageToCloudinary(base64Image, folder);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      // Also expose as data.url for components that read data.url
      data: { url: imageUrl },
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error.message || 'Failed to upload image'
        }
      },
      { status: 500 }
    );
  }
}
