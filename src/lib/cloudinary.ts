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
