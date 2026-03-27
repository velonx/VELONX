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
    console.log('[Cloudinary] Config check:', {
      hasCloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
    
    const result = await cloudinary.uploader.upload(base64PDF, {
      folder,
      resource_type: 'raw',
      // Ensure the public_id retains the .pdf extension to set the correct MIME type
      public_id: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
      use_filename: true,
      unique_filename: true,
    });
    
    console.log('[Cloudinary] Upload successful:', {
      publicId: result.public_id,
      url: result.secure_url,
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('[Cloudinary] PDF upload error:', error);
    console.error('[Cloudinary] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });
    throw new Error('Failed to upload PDF to Cloudinary');
  }
}

// Helper function to delete PDF from Cloudinary
export async function deletePDFFromCloudinary(
  publicId: string
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });
  } catch (error) {
    // Log error but don't throw - graceful degradation
    console.error('Cloudinary PDF deletion error:', error);
    // We log but don't throw to prevent blocking resource deletion
    // Orphaned files can be cleaned up by a background job
  }
}

// Helper function to generate signed URL for secure PDF access
export function generateSignedCloudinaryUrl(
  publicId: string,
  expiresIn: number = 3600
): string {
  try {
    // Assets are currently stored as 'upload' delivery type.
    // 'private_download_url' only works for 'authenticated' types.
    // We generate a secure URL with signature for validation.
    const signedUrl = cloudinary.utils.url(publicId, {
      secure: true,
      resource_type: 'raw',
      sign_url: true, // Generate signature
    });

    return signedUrl;
  } catch (error) {
    console.error('Cloudinary signed URL generation error:', error);
    throw new Error('Failed to generate signed URL for PDF access');
  }
}
