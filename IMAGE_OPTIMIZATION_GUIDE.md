# Image Optimization Guide

This guide covers best practices for image optimization in the Velonx platform to ensure fast loading times and optimal mobile performance.

## Overview

The platform implements comprehensive image optimization including:
- Responsive images with srcset
- Lazy loading
- Modern image formats (WebP, AVIF)
- Image compression
- Proper sizing for different viewports

## Components

### ResponsiveImage Component

Use the `ResponsiveImage` component for all images in the application:

```tsx
import { ResponsiveImage } from "@/components/responsive-image";

<ResponsiveImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={75}
  loading="lazy"
/>
```

### Specialized Image Components

#### AvatarImage
For profile pictures and avatars:
```tsx
import { AvatarImage } from "@/components/responsive-image";

<AvatarImage
  src="/avatar.jpg"
  alt="User name"
  size={64}
/>
```

#### HeroImage
For large hero section images:
```tsx
import { HeroImage } from "@/components/responsive-image";

<HeroImage
  src="/hero.jpg"
  alt="Hero image"
  priority={true}
/>
```

#### CardImage
For card thumbnails with aspect ratio:
```tsx
import { CardImage } from "@/components/responsive-image";

<CardImage
  src="/thumbnail.jpg"
  alt="Card thumbnail"
  aspectRatio="16/9"
/>
```

## Image Optimization Utilities

### Generate Srcset

```tsx
import { generateSrcSet, IMAGE_WIDTHS } from "@/lib/utils/image-optimization";

const srcset = generateSrcSet("/image.jpg", IMAGE_WIDTHS.all);
```

### Cloudinary Integration

```tsx
import { getOptimizedImageUrl } from "@/lib/utils/image-optimization";

const optimizedUrl = getOptimizedImageUrl("my-image", {
  width: 800,
  height: 600,
  quality: 80,
  format: 'auto',
  crop: 'fill',
});
```

### Image Compression

```tsx
import { compressImage } from "@/lib/utils/image-optimization";

const compressedBlob = await compressImage(
  file,
  1920, // maxWidth
  1080, // maxHeight
  0.8   // quality
);
```

## Best Practices

### 1. Always Specify Dimensions

Prevent layout shift by always specifying width and height:

```tsx
<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

### 2. Use Appropriate Quality Settings

- Hero images: 85%
- Regular images: 75%
- Thumbnails: 70%
- Avatars: 80%

### 3. Implement Lazy Loading

Use lazy loading for images below the fold:

```tsx
<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  loading="lazy"
/>
```

### 4. Prioritize Critical Images

Mark above-the-fold images as priority:

```tsx
<ResponsiveImage
  src="/hero.jpg"
  alt="Hero"
  priority={true}
/>
```

### 5. Use Responsive Sizes

Provide appropriate sizes attribute:

```tsx
import { RESPONSIVE_SIZES } from "@/lib/utils/image-optimization";

<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  sizes={RESPONSIVE_SIZES.grid3}
/>
```

### 6. Optimize Before Upload

Always compress images before uploading:

```tsx
const compressedImage = await compressImage(file, 1920, 1080, 0.8);
// Upload compressedImage instead of original file
```

### 7. Use Modern Formats

The platform automatically serves WebP and AVIF when supported by the browser through Next.js Image optimization.

## Responsive Breakpoints

Standard breakpoints used in the platform:

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px - 1920px
- Large Desktop: 1921px+

## Image Sizes by Use Case

### Hero Images
- Mobile: 640px width
- Tablet: 1024px width
- Desktop: 1920px width

### Card Thumbnails
- Mobile: 100vw (full width)
- Tablet: 50vw (half width)
- Desktop: 33vw (third width)

### Avatars
- Small: 32px × 32px
- Medium: 48px × 48px
- Large: 64px × 64px
- Extra Large: 96px × 96px

### Blog/Article Images
- Mobile: 640px width
- Tablet: 768px width
- Desktop: 1200px width

## Performance Metrics

Target metrics for image loading:

- Largest Contentful Paint (LCP): < 2.5s
- First Contentful Paint (FCP): < 1.8s
- Cumulative Layout Shift (CLS): < 0.1

## Testing

### Test Responsive Images

1. Open DevTools
2. Switch to Network tab
3. Filter by "Img"
4. Resize viewport
5. Verify correct image sizes are loaded

### Test Lazy Loading

1. Open DevTools
2. Switch to Network tab
3. Scroll down the page
4. Verify images load as they enter viewport

### Test Image Formats

1. Open DevTools
2. Switch to Network tab
3. Check image responses
4. Verify WebP/AVIF is served when supported

## Common Issues

### Layout Shift

**Problem**: Images cause layout shift when loading

**Solution**: Always specify width and height attributes

### Slow Loading

**Problem**: Images take too long to load

**Solution**: 
- Reduce image quality
- Use appropriate image sizes
- Enable lazy loading
- Compress images before upload

### Wrong Image Size

**Problem**: Desktop-sized images loading on mobile

**Solution**: Use responsive images with proper srcset and sizes attributes

## Migration Guide

### Converting Existing Images

Replace standard `<img>` tags:

```tsx
// Before
<img src="/image.jpg" alt="Description" />

// After
<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

### Converting Next.js Image

Replace Next.js `<Image>` with our component:

```tsx
// Before
import Image from "next/image";
<Image src="/image.jpg" alt="Description" width={800} height={600} />

// After
import { ResponsiveImage } from "@/components/responsive-image";
<ResponsiveImage src="/image.jpg" alt="Description" width={800} height={600} />
```

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [WebP Format](https://developers.google.com/speed/webp)
- [AVIF Format](https://jakearchibald.com/2020/avif-has-landed/)
