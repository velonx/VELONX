import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary, uploadVideoToCloudinary } from '@/lib/cloudinary';
import { auth } from '@/auth';
import { validateCSRFToken } from '@/lib/middleware/csrf.middleware';

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;   // 5 MB
const VIDEO_SIZE_LIMIT = 50 * 1024 * 1024;  // 50 MB

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
    let mimeType = '';
    let base64Data = '';
    let folder = 'velonx/general';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const raw: string = body.image || body.video || '';
      if (!raw) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_FILE', message: 'File data is required' } },
          { status: 400 }
        );
      }
      const mimeMatch = raw.match(/^data:([^;]+);base64,/);
      if (!mimeMatch) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Invalid file format' } },
          { status: 400 }
        );
      }
      mimeType = mimeMatch[1];
      base64Data = raw;
      folder = body.folder || folder;

      const approxBytes = ((raw.split(',')[1] || '').length * 3) / 4;
      const limit = VIDEO_TYPES.includes(mimeType) ? VIDEO_SIZE_LIMIT : IMAGE_SIZE_LIMIT;
      if (approxBytes > limit) {
        const limitMb = limit / (1024 * 1024);
        return NextResponse.json(
          { success: false, error: { code: 'FILE_TOO_LARGE', message: `File size must be less than ${limitMb}MB` } },
          { status: 400 }
        );
      }
    } else {
      // FormData body
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      folder = (formData.get('folder') as string) || folder;

      if (!file) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_FILE', message: 'File is required' } },
          { status: 400 }
        );
      }

      mimeType = file.type;
      const isImage = IMAGE_TYPES.includes(mimeType);
      const isVideo = VIDEO_TYPES.includes(mimeType);

      if (!isImage && !isVideo) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only image (JPEG, PNG, WebP, GIF) or video (MP4, MOV, WebM) files are allowed' } },
          { status: 400 }
        );
      }

      const limit = isVideo ? VIDEO_SIZE_LIMIT : IMAGE_SIZE_LIMIT;
      if (file.size > limit) {
        const limitMb = limit / (1024 * 1024);
        return NextResponse.json(
          { success: false, error: { code: 'FILE_TOO_LARGE', message: `File size must be less than ${limitMb}MB` } },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    const isVideo = VIDEO_TYPES.includes(mimeType);
    const isImage = IMAGE_TYPES.includes(mimeType);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only image or video files are allowed' } },
        { status: 400 }
      );
    }

    if (isVideo) {
      const videoFolder = folder === 'velonx/general' ? 'velonx/reports/videos' : folder;
      const result = await uploadVideoToCloudinary(base64Data, videoFolder);
      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        duration: result.duration,
        data: { url: result.url },
        message: 'Video uploaded successfully',
        type: 'video',
      });
    } else {
      const imageUrl = await uploadImageToCloudinary(base64Data, folder);
      return NextResponse.json({
        success: true,
        url: imageUrl,
        data: { url: imageUrl },
        message: 'Image uploaded successfully',
        type: 'image',
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_FAILED', message: error.message || 'Failed to upload file' } },
      { status: 500 }
    );
  }
}
