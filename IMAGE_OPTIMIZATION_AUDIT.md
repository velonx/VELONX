# Image Optimization Audit - Community Components

## Audit Date
Task 5.1 - Website Performance Optimization Spec

## Summary
This audit identifies all community components using standard `<img>` tags that need to be replaced with the optimized `ResponsiveImage` component and its variants (`AvatarImage`, `CardImage`).

## Components Requiring Updates

### 1. PostCard Component
**File**: `src/components/community/PostCard.tsx`
**Current Usage**: Standard `<img>` tags
**Images Found**:
- Line 132-136: Author avatar image
- Line 280-284: Post image thumbnails (in grid)

**Recommended Changes**:
- Replace author avatar with `AvatarImage` component (size: 40px, quality: 80)
- Replace post thumbnails with `CardImage` component (aspect-ratio: 1/1, quality: 75)
- Images are below-the-fold → use `loading="lazy"`

### 2. UserCard Component
**File**: `src/components/community/UserCard.tsx`
**Current Usage**: Standard `<img>` tag
**Images Found**:
- Line 91-95: User avatar image

**Recommended Changes**:
- Replace with `AvatarImage` component (size: 48px, quality: 80)
- Images are below-the-fold → use `loading="lazy"`

### 3. UserProfileHeader Component
**File**: `src/components/community/UserProfileHeader.tsx`
**Current Usage**: Standard `<img>` tag
**Images Found**:
- Line 97-101: Large profile avatar image

**Recommended Changes**:
- Replace with `AvatarImage` component (size: 128px for desktop, 96px for mobile, quality: 80)
- This is above-the-fold → use `priority={true}` or `loading="eager"`

### 4. CommentItem Component
**File**: `src/components/community/CommentItem.tsx`
**Current Usage**: Standard `<img>` tag
**Images Found**:
- Line 35-39: Comment author avatar

**Recommended Changes**:
- Replace with `AvatarImage` component (size: 32px, quality: 80)
- Images are below-the-fold → use `loading="lazy"`

### 5. PostComposer Component
**File**: `src/components/community/PostComposer.tsx`
**Current Usage**: Standard `<img>` tag
**Images Found**:
- Line 242-245: Image preview thumbnails

**Recommended Changes**:
- Replace with `CardImage` component (aspect-ratio: 1/1, quality: 75)
- These are preview images → use `loading="eager"` (user just uploaded them)

## Feed Component
**File**: `src/components/community/Feed.tsx`
**Status**: ✅ No direct image usage - uses PostCard component
**Note**: Once PostCard is updated, Feed will automatically benefit from optimizations

## Image Loading Priority Strategy

### Above-the-Fold (Priority Loading)
- UserProfileHeader avatar: `priority={true}` or `loading="eager"`
- First 2-3 posts in Feed: Consider priority loading

### Below-the-Fold (Lazy Loading)
- PostCard author avatars: `loading="lazy"`
- PostCard image thumbnails: `loading="lazy"`
- UserCard avatars: `loading="lazy"`
- CommentItem avatars: `loading="lazy"`
- Feed posts beyond first 3: `loading="lazy"` (default)

## Quality Settings

### Avatar Images
- Size: 32px-128px depending on context
- Quality: 80 (higher quality for profile pictures)
- Format: Auto (WebP/AVIF with fallback)

### Post Thumbnails
- Aspect Ratio: 1/1 (square)
- Quality: 75 (acceptable for thumbnails)
- Format: Auto (WebP/AVIF with fallback)
- Sizes: `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`

### Preview Images (PostComposer)
- Aspect Ratio: 1/1 (square)
- Quality: 75
- Loading: Eager (user just uploaded)

## Expected Performance Improvements

### Before Optimization
- Standard `<img>` tags load full-resolution images
- No lazy loading
- No modern format support (WebP/AVIF)
- No responsive sizing

### After Optimization
- Lazy loading for below-the-fold images
- Automatic WebP/AVIF format with fallbacks
- Responsive srcset for different screen sizes
- Optimized quality settings per image type
- Expected 40%+ reduction in image payload size

## Implementation Priority
1. ✅ PostCard (highest impact - most visible)
2. ✅ UserCard (high impact - frequently used)
3. ✅ UserProfileHeader (medium impact - above-the-fold)
4. ✅ CommentItem (medium impact - many instances)
5. ✅ PostComposer (low impact - preview only)

## Notes
- All components already have proper alt text
- ResponsiveImage component handles error states
- Intersection Observer is built into ResponsiveImage
- No breaking changes to component APIs
