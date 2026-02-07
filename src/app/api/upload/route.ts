import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { image, folder } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_IMAGE', message: 'Image data is required' } },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImageToCloudinary(image, folder || 'velonx');

    return NextResponse.json({
      success: true,
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
