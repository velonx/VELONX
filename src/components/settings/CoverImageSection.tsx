"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { useDragAndDrop } from "@/lib/hooks/useDragAndDrop";

interface CoverImageSectionProps {
  currentCover: string | null;
  onCoverChange: (cover: string | null) => void;
  onImageUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export default function CoverImageSection({
  currentCover,
  onCoverChange,
  onImageUpload,
  isLoading,
}: CoverImageSectionProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragging, dragHandlers } = useDragAndDrop((files) => {
    if (isLoading || isUploading) return;
    const file = files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (10MB limit)
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setUploadError(
        `File size exceeds maximum allowed size of 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please use a smaller image.`
      );
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      await onImageUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setUploadError("Network error occurred. Please check your connection and try again.");
        } else if (errorMessage.includes("timeout")) {
          setUploadError("Upload timed out. Please try again with a smaller image.");
        } else if (errorMessage.includes("large") || errorMessage.includes("size")) {
          setUploadError("File size exceeds maximum allowed size of 10MB. Please use a smaller image.");
        } else {
          setUploadError(error.message || "Failed to upload image. Please try again.");
        }
      } else {
        setUploadError("Failed to upload image. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveCover = () => {
    setUploadError(null);
    onCoverChange(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground/90 mb-2 block">
          Cover Image / Profile Banner
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Personalize your profile header with a cover image (recommended size: 1200x400)
        </p>
      </div>

      {/* Banner Preview Area */}
      <div
        className={`group relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
          isDragging
            ? "border-cyan-400 bg-cyan-400/10"
            : currentCover
            ? "border-border hover:border-muted-foreground/30"
            : "border-dashed border-border hover:border-primary/40 bg-muted/20"
        }`}
        {...dragHandlers}
        onClick={handleUploadClick}
      >
        {/* Loading overlay */}
        {(isLoading || isUploading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 transition-opacity">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-cyan-400 font-medium">Uploading banner...</p>
            </div>
          </div>
        )}

        {/* Dragging Overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/15 backdrop-blur-xs z-10 pointer-events-none">
            <p className="text-sm text-cyan-400 font-black tracking-wide">Drop cover image here</p>
          </div>
        )}

        {currentCover ? (
          /* Custom Cover Banner */
          <img
            src={currentCover}
            alt="Cover banner preview"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        ) : (
          /* Default Gradient Banner */
          <div className="w-full h-full bg-linear-to-r from-primary/80 via-primary/50 to-primary/30 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 select-none">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs font-semibold">Using default banner</span>
            </div>
          </div>
        )}

        {/* Hover overlay with action indicator */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-full border border-white/10 shadow-lg">
            <Upload className="w-4 h-4" />
            Change Cover Image
          </div>
        </div>
      </div>

      {/* Buttons and controls */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={isLoading || isUploading}
          className="rounded-xl border-border text-foreground hover:bg-muted font-bold"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </Button>

        {currentCover && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemoveCover}
            disabled={isLoading || isUploading}
            className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Custom Cover
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading || isUploading}
        />
      </div>

      {/* Upload Error Message */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 font-medium">{uploadError}</p>
        </div>
      )}
    </div>
  );
}
