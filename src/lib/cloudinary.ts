import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Note: These credentials should NEVER be exposed to the client
// API_KEY and API_SECRET must remain server-side only
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate configuration in development only
if (process.env.NODE_ENV === 'development') {
  const hasCloudName = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
  const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
  
  if (!hasCloudName || !hasApiKey || !hasApiSecret) {
    console.warn('⚠️ Cloudinary configuration incomplete:', {
      cloud_name: hasCloudName ? '✅' : '❌',
      api_key: hasApiKey ? '✅' : '❌',
      api_secret: hasApiSecret ? '✅' : '❌',
    });
  }
}

export default cloudinary;

// Helper function to upload image from base64
export async function uploadImageToCloudinary(
  base64Image: string,
  folder: string = 'velonx'
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 630, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

// Helper function to upload PDF from base64
export async function uploadPDFToCloudinary(
  base64PDF: string,
  fileName: string,
  folder: string = 'velonx/resources/pdfs'
): Promise<{ url: string; publicId: string }> {
  try {
    console.log('[Cloudinary] Starting PDF upload...');
    
    // Remove .pdf extension for public_id as image delivery appends it automatically
    const basePublicId = fileName.replace(/\.pdf$/i, '');
    
    const result = await cloudinary.uploader.upload(base64PDF, {
      folder,
      resource_type: 'image', // Use image resource type for PDFs to bypass strict raw delivery blocks
      public_id: basePublicId,
      use_filename: true,
      unique_filename: true,
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('[Cloudinary] PDF upload error:', error);
    throw new Error('Failed to upload PDF to Cloudinary');
  }
}

// Helper function to delete PDF from Cloudinary
export async function deletePDFFromCloudinary(
  publicId: string
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image', // Match the upload resource type
    });
  } catch (error) {
    console.error('Cloudinary PDF deletion error:', error);
  }
}

// Helper function to generate signed URL for secure PDF access
export function generateSignedCloudinaryUrl(
  publicId: string,
  expiresIn: number = 3600
): string {
  try {
    const signedUrl = cloudinary.utils.url(publicId, {
      secure: true,
      resource_type: 'image', // Match the upload resource type
      format: 'pdf', // Explicitly request PDF format
      sign_url: true, // Generate signature
      analytics: false, // Disable analytics to prevent _a parameter from breaking the signature
    });

    return signedUrl;
  } catch (error) {
    console.error('Cloudinary signed URL generation error:', error);
    throw new Error('Failed to generate signed URL for PDF access');
  }
}

// Helper function to upload a video from base64
export async function uploadVideoToCloudinary(
  base64Video: string,
  folder: string = 'velonx/reports/videos'
): Promise<{ url: string; publicId: string; duration?: number }> {
  try {
    const result = await cloudinary.uploader.upload(base64Video, {
      folder,
      resource_type: 'video',
      chunk_size: 6_000_000, // 6MB chunks for large files
      eager: [
        { width: 1280, height: 720, crop: 'limit', format: 'mp4', quality: 'auto' }
      ],
      eager_async: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    };
  } catch (error) {
    console.error('[Cloudinary] Video upload error:', error);
    throw new Error('Failed to upload video to Cloudinary');
  }
}

// Helper function to delete a video from Cloudinary
export async function deleteVideoFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('[Cloudinary] Video deletion error:', error);
  }
}
