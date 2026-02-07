/**
 * Image Optimization Utilities
 * Provides helper functions for image optimization and responsive images
 */

/**
 * Generate srcset string for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map((width) => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: { maxWidth: string; size: string }[]): string {
  return breakpoints
    .map((bp, index) => {
      if (index === breakpoints.length - 1) {
        return bp.size;
      }
      return `(max-width: ${bp.maxWidth}) ${bp.size}`;
    })
    .join(', ');
}

/**
 * Get optimized image URL with Cloudinary transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured');
    return publicId;
  }

  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  transformations.push(`c_${crop}`);
  
  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Get responsive image sizes for common layouts
 */
export const RESPONSIVE_SIZES = {
  // Full width on mobile, half on tablet, third on desktop
  grid3: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  // Full width on mobile, half on desktop
  grid2: '(max-width: 768px) 100vw, 50vw',
  // Full width on mobile, quarter on desktop
  grid4: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  // Always full width
  full: '100vw',
  // Hero images
  hero: '100vw',
  // Avatar/profile images
  avatar: '(max-width: 640px) 48px, 64px',
  // Card thumbnails
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
} as const;

/**
 * Standard image widths for srcset
 */
export const IMAGE_WIDTHS = {
  mobile: [320, 420, 640],
  tablet: [768, 1024],
  desktop: [1280, 1536, 1920],
  all: [320, 420, 640, 768, 1024, 1280, 1536, 1920],
} as const;

/**
 * Check if image should be lazy loaded
 */
export function shouldLazyLoad(priority?: boolean, loading?: 'lazy' | 'eager'): boolean {
  if (priority) return false;
  if (loading === 'eager') return false;
  return true;
}

/**
 * Get image quality based on device pixel ratio
 */
export function getImageQuality(dpr: number = 1): number {
  if (dpr >= 3) return 60; // High DPR devices can use lower quality
  if (dpr >= 2) return 70;
  return 80;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Get image dimensions from URL or file
 */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = src;
  });
}

/**
 * Convert image to WebP format (client-side)
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.8
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e5e7eb');
  gradient.addColorStop(1, '#d1d5db');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}
