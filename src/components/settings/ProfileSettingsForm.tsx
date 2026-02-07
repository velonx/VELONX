"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AvatarSection from "@/components/settings/AvatarSection";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ProfileSettingsFormProps {
  initialData: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    bio: string | null;
  };
}

interface FormState {
  name: string;
  bio: string;
  avatar: string | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  // Get session update function
  const { update: updateSession } = useSession();
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    name: initialData.name || "",
    bio: initialData.bio || "",
    avatar: initialData.image,
    isLoading: false,
    error: null,
    success: false,
  });

  // Track original values for cancel/revert
  const [originalValues, setOriginalValues] = useState({
    name: initialData.name || "",
    bio: initialData.bio || "",
    avatar: initialData.image,
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    bio?: string;
  }>({});

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => {
        setFormState((prev) => ({ ...prev, success: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  // Real-time input validation
  const validateName = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "Name is required";
    }
    if (value.length > 100) {
      return "Name must be less than 100 characters";
    }
    return undefined;
  };

  const validateBio = (value: string): string | undefined => {
    if (value.length > 500) {
      return "Bio must be less than 500 characters";
    }
    return undefined;
  };

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Prevent input beyond character limit
    if (value.length > 100) {
      return;
    }

    setFormState((prev) => ({ ...prev, name: value }));
    
    // Real-time validation
    const error = validateName(value);
    setValidationErrors((prev) => ({ ...prev, name: error }));
  };

  // Handle bio input change
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Prevent input beyond character limit
    if (value.length > 500) {
      return;
    }

    setFormState((prev) => ({ ...prev, bio: value }));
    
    // Real-time validation
    const error = validateBio(value);
    setValidationErrors((prev) => ({ ...prev, bio: error }));
  };

  // Handle avatar selection
  const handleAvatarChange = (avatar: string) => {
    setFormState((prev) => ({ ...prev, avatar }));
  };

  // Handle custom image upload
  const handleImageUpload = async (file: File) => {
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file. Please try again."));
        reader.readAsDataURL(file);
      });

      // Upload to Cloudinary via API
      const response = await fetch("/api/user/profile/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      const result = await response.json();

      if (!result.success) {
        // Extract error message from API response
        const errorMessage = result.error?.message || "Failed to upload image";
        throw new Error(errorMessage);
      }

      // Update avatar with Cloudinary URL
      setFormState((prev) => ({ ...prev, avatar: result.data.url }));
    } catch (error) {
      // Re-throw to be handled by AvatarSection
      throw error;
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const nameError = validateName(formState.name);
    const bioError = validateBio(formState.bio);

    setValidationErrors({
      name: nameError,
      bio: bioError,
    });

    return !nameError && !bioError;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set loading state
    setFormState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      success: false,
    }));

    try {
      // Sanitize inputs (basic XSS prevention)
      const sanitizedName = formState.name.trim();
      const sanitizedBio = formState.bio.trim();

      // Submit to API
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sanitizedName,
          bio: sanitizedBio || null,
          avatar: formState.avatar,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        // Extract error details from API response
        const errorCode = result.error?.code;
        const errorMessage = result.error?.message || "Failed to update profile";
        
        // Provide user-friendly error messages based on error code
        let userMessage = errorMessage;
        
        if (errorCode === "DATABASE_ERROR" || errorCode === "DATABASE_CONNECTION_ERROR") {
          userMessage = "Unable to save changes due to a database error. Please try again in a moment.";
        } else if (errorCode === "DATABASE_TIMEOUT") {
          userMessage = "The request timed out. Please check your connection and try again.";
        } else if (errorCode === "NETWORK_ERROR") {
          userMessage = "Network error. Please check your internet connection and try again.";
        } else if (errorCode === "VALIDATION_ERROR") {
          userMessage = "Invalid data provided. Please check your entries and try again.";
        }
        
        throw new Error(userMessage);
      }

      // Update NextAuth session with new user data
      // This ensures the session reflects the updated name and avatar immediately
      if (updateSession) {
        try {
          await updateSession({
            name: result.data.name,
            image: result.data.image,
          });
        } catch (sessionError) {
          console.error("Failed to update session:", sessionError);
          // Don't fail the entire operation if session update fails
          // The profile was saved successfully
        }
      }

      // Update original values to reflect saved state
      setOriginalValues({
        name: sanitizedName,
        bio: sanitizedBio,
        avatar: formState.avatar,
      });

      // Show success message
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        error: null,
      }));
    } catch (error) {
      console.error("Profile update error:", error);
      
      // Handle different error types
      let errorMessage = "An error occurred while updating your profile.";
      
      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();
        
        // Network errors
        if (errMsg.includes("network") || errMsg.includes("fetch") || errMsg.includes("failed to fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        }
        // Timeout errors
        else if (errMsg.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        }
        // Use the error message if it's user-friendly
        else if (error.message && error.message.length < 200) {
          errorMessage = error.message;
        }
      }
      
      // Show error message
      setFormState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        success: false,
      }));
    }
  };

  // Handle cancel/revert
  const handleCancel = () => {
    setFormState((prev) => ({
      ...prev,
      name: originalValues.name,
      bio: originalValues.bio,
      avatar: originalValues.avatar,
      error: null,
      success: false,
    }));
    setValidationErrors({});
  };

  // Check if form has changes
  const hasChanges =
    formState.name !== originalValues.name ||
    formState.bio !== originalValues.bio ||
    formState.avatar !== originalValues.avatar;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar Section */}
      <AvatarSection
        currentAvatar={formState.avatar}
        onAvatarChange={handleAvatarChange}
        onImageUpload={handleImageUpload}
        isLoading={formState.isLoading}
      />

      {/* Email Field (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={initialData.email}
          disabled
          className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500">Email cannot be changed</p>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Display Name
          <span className="text-red-400 ml-1">*</span>
        </Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            value={formState.name}
            onChange={handleNameChange}
            disabled={formState.isLoading}
            maxLength={100}
            className={`bg-white/5 border-white/10 text-gray-100 ${
              validationErrors.name ? "border-red-500" : ""
            }`}
            placeholder="Enter your display name"
            aria-invalid={!!validationErrors.name}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {formState.name.length}/100
          </div>
        </div>
        {validationErrors.name && (
          <p className="text-xs text-red-400">{validationErrors.name}</p>
        )}
      </div>

      {/* Bio Field */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-gray-300">
          Bio
        </Label>
        <div className="relative">
          <Textarea
            id="bio"
            value={formState.bio}
            onChange={handleBioChange}
            disabled={formState.isLoading}
            maxLength={500}
            className={`bg-white/5 border-white/10 text-gray-100 min-h-24 ${
              validationErrors.bio ? "border-red-500" : ""
            }`}
            placeholder="Tell us about yourself..."
            aria-invalid={!!validationErrors.bio}
          />
          <div className="absolute right-3 bottom-3 text-xs text-gray-500">
            {formState.bio.length}/500
          </div>
        </div>
        {validationErrors.bio && (
          <p className="text-xs text-red-400">{validationErrors.bio}</p>
        )}
      </div>

      {/* Success Message */}
      {formState.success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {formState.error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{formState.error}</p>
              {(formState.error.toLowerCase().includes("network") || 
                formState.error.toLowerCase().includes("timeout") ||
                formState.error.toLowerCase().includes("connection")) && (
                <p className="text-xs text-red-300 mt-2">
                  Tip: Check your internet connection and try saving again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={formState.isLoading || !hasChanges || !!validationErrors.name || !!validationErrors.bio}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          {formState.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={formState.isLoading || !hasChanges}
          className="border-white/20 text-gray-300 hover:bg-white/5"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
