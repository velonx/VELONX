"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import AvatarSelector from "@/components/avatar-selector";
import { Upload, Loader2, User } from "lucide-react";

interface AvatarSectionProps {
  currentAvatar: string | null;
  onAvatarChange: (avatar: string) => void;
  onImageUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export default function AvatarSection({
  currentAvatar,
  onAvatarChange,
  onImageUpload,
  isLoading,
}: AvatarSectionProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      setUploadError(
        `File size exceeds maximum allowed size of 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please use a smaller image.`
      );
      return;
    }

    // Clear previous errors
    setUploadError(null);
    setIsUploading(true);

    try {
      await onImageUpload(file);
      // Clear the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      // Handle different error types
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Network errors
        if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          setUploadError(
            "Network error occurred. Please check your internet connection and try again."
          );
        }
        // Timeout errors
        else if (errorMessage.includes("timeout")) {
          setUploadError(
            "Upload timed out. Please check your connection and try again with a smaller image."
          );
        }
        // File size errors
        else if (errorMessage.includes("large") || errorMessage.includes("size")) {
          setUploadError(
            "File size exceeds maximum allowed size of 10MB. Please use a smaller image."
          );
        }
        // Generic error
        else {
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

  const handleAvatarSelect = (avatarSrc: string) => {
    setUploadError(null);
    onAvatarChange(avatarSrc);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Profile Picture
        </label>
        <p className="text-sm text-gray-400 mb-4">
          Choose a predefined avatar or upload your own image
        </p>
      </div>

      {/* Avatar Preview */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-white/10">
            <AvatarImage src={currentAvatar || undefined} alt="Profile avatar" />
            <AvatarFallback className="bg-white/5 text-gray-400">
              <User className="w-12 h-12" />
            </AvatarFallback>
          </Avatar>
          {(isLoading || isUploading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {/* Avatar Selector */}
          <AvatarSelector
            currentAvatar={currentAvatar || undefined}
            onSelectAvatar={handleAvatarSelect}
            trigger={
              <Button
                variant="outline"
                className="rounded-full border-white/20 text-gray-300 hover:bg-white/5"
                disabled={isLoading || isUploading}
              >
                Choose Avatar
              </Button>
            }
          />

          {/* Custom Upload Button */}
          <Button
            variant="outline"
            onClick={handleUploadClick}
            disabled={isLoading || isUploading}
            className="rounded-full border-white/20 text-gray-300 hover:bg-white/5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Custom
              </>
            )}
          </Button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading || isUploading}
          />
        </div>
      </div>

      {/* Upload Error Message */}
      {uploadError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <p className="text-sm text-cyan-400">Uploading your image...</p>
          </div>
        </div>
      )}
    </div>
  );
}
