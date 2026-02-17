'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, LinkIcon, XIcon, Loader2Icon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CreatePostData } from '@/lib/hooks/useCommunityPosts';

/**
 * Post Composer Props Interface
 */
export interface PostComposerProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  groupId?: string;
  visibility?: 'PUBLIC' | 'FOLLOWERS' | 'GROUP';
  placeholder?: string;
  isSubmitting?: boolean;
}

/**
 * PostComposer Component
 * 
 * Rich text editor for creating community posts with image upload and link preview support.
 * 
 * Features:
 * - Multi-line text input with character counter
 * - Image upload with preview (up to 5 images)
 * - Link URL input with validation
 * - Optimistic UI updates
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <PostComposer
 *   onSubmit={createPost}
 *   visibility="PUBLIC"
 *   placeholder="Share your thoughts..."
 * />
 * ```
 */
export function PostComposer({
  onSubmit,
  groupId,
  visibility = 'PUBLIC',
  placeholder = 'Share your thoughts with the community...',
  isSubmitting = false,
}: PostComposerProps) {
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [linkUrls, setLinkUrls] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CONTENT_LENGTH = 5000;
  const MAX_IMAGES = 5;
  const MAX_LINKS = 3;

  /**
   * Handle image file selection and upload
   */
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    setIsUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        // Convert to base64
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(uploadPromises);
      
      // Upload to Cloudinary via API
      const uploadedUrls: string[] = [];
      for (const base64 of base64Images) {
        const response = await fetch('/api/user/profile/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder: 'community-posts' }),
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      setImageUrls(prev => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      console.error('[PostComposer] Image upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [imageUrls.length]);

  /**
   * Remove an uploaded image
   */
  const removeImage = useCallback((index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Add a link URL
   */
  const addLink = useCallback(() => {
    const trimmedLink = linkInput.trim();
    
    if (!trimmedLink) return;

    if (linkUrls.length >= MAX_LINKS) {
      toast.error(`You can only add up to ${MAX_LINKS} links`);
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmedLink);
      setLinkUrls(prev => [...prev, trimmedLink]);
      setLinkInput('');
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
    }
  }, [linkInput, linkUrls.length]);

  /**
   * Remove a link URL
   */
  const removeLink = useCallback((index: number) => {
    setLinkUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      toast.error('Post content cannot be empty');
      textareaRef.current?.focus();
      return;
    }

    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      toast.error(`Post content is too long (max ${MAX_CONTENT_LENGTH} characters)`);
      return;
    }

    try {
      await onSubmit({
        content: trimmedContent,
        groupId,
        visibility,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        linkUrls: linkUrls.length > 0 ? linkUrls : undefined,
      });

      // Clear form on success
      setContent('');
      setImageUrls([]);
      setLinkUrls([]);
      setLinkInput('');
    } catch (error) {
      // Error handling is done in the hook
      console.error('[PostComposer] Submit error:', error);
    }
  }, [content, imageUrls, linkUrls, groupId, visibility, onSubmit]);

  const remainingChars = MAX_CONTENT_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting && !isUploadingImage;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Input */}
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-24 resize-none"
              disabled={isSubmitting}
              aria-label="Post content"
              aria-describedby="char-counter"
            />
            <div
              id="char-counter"
              className={`text-xs text-right ${
                isOverLimit ? 'text-destructive' : 'text-muted-foreground'
              }`}
              aria-live="polite"
            >
              {remainingChars} characters remaining
            </div>
          </div>

          {/* Image Previews */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Link Input */}
          {linkUrls.length < MAX_LINKS && (
            <div className="flex gap-2">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
                placeholder="Add a link (https://...)"
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSubmitting}
                aria-label="Link URL"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLink}
                disabled={!linkInput.trim() || isSubmitting}
              >
                Add Link
              </Button>
            </div>
          )}

          {/* Link Previews */}
          {linkUrls.length > 0 && (
            <div className="space-y-2">
              {linkUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm"
                >
                  <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-primary hover:underline"
                  >
                    {url}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="p-1 hover:bg-background rounded"
                    aria-label={`Remove link ${index + 1}`}
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              {/* Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting || imageUrls.length >= MAX_IMAGES}
                aria-label="Upload images"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploadingImage || imageUrls.length >= MAX_IMAGES}
                aria-label="Add images"
              >
                {isUploadingImage ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <ImageIcon />
                )}
                <span className="hidden sm:inline">
                  Images ({imageUrls.length}/{MAX_IMAGES})
                </span>
              </Button>

              {/* Link Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={linkUrls.length >= MAX_LINKS}
                aria-label="Add links"
                onClick={() => {
                  // Focus is handled by the input field
                }}
              >
                <LinkIcon />
                <span className="hidden sm:inline">
                  Links ({linkUrls.length}/{MAX_LINKS})
                </span>
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!canSubmit}
              aria-label="Post"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
