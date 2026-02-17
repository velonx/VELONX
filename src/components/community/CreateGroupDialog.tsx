"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lock, Globe } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (data: CreateGroupFormData) => Promise<void>;
}

export interface CreateGroupFormData {
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl?: string;
}

/**
 * CreateGroupDialog Component
 * Feature: community-discussion-rooms
 * Requirements: 2.1, 2.2
 * 
 * Dialog for creating a new community group with privacy settings.
 * Follows existing VELONX dialog patterns.
 */
export default function CreateGroupDialog({
  open,
  onOpenChange,
  onCreateGroup
}: CreateGroupDialogProps) {
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: "",
    description: "",
    isPrivate: false,
    imageUrl: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateGroupFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateGroupFormData, string>> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Group name must be less than 100 characters";
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Validate image URL if provided
    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateGroup({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl?.trim() || undefined
      });

      // Reset form on success
      setFormData({
        name: "",
        description: "",
        isPrivate: false,
        imageUrl: ""
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setFormData({
          name: "",
          description: "",
          isPrivate: false,
          imageUrl: ""
        });
        setErrors({});
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Community Group</DialogTitle>
          <DialogDescription>
            Create a new community group to bring people together around shared interests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name">
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="group-name"
              placeholder="e.g., Web Development Enthusiasts"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
              maxLength={100}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "group-name-error" : undefined}
            />
            {errors.name && (
              <p id="group-name-error" className="text-sm text-red-500" role="alert">
                {errors.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="group-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="group-description"
              placeholder="Describe what this group is about and who should join..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? "border-red-500" : ""}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "group-description-error" : undefined}
            />
            {errors.description && (
              <p id="group-description-error" className="text-sm text-red-500" role="alert">
                {errors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="group-image">Image URL (Optional)</Label>
            <Input
              id="group-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className={errors.imageUrl ? "border-red-500" : ""}
              disabled={isSubmitting}
              aria-invalid={!!errors.imageUrl}
              aria-describedby={errors.imageUrl ? "group-image-error" : undefined}
            />
            {errors.imageUrl && (
              <p id="group-image-error" className="text-sm text-red-500" role="alert">
                {errors.imageUrl}
              </p>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="group-private"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isPrivate: checked === true })
                }
                disabled={isSubmitting}
              />
              <Label
                htmlFor="group-private"
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                {formData.isPrivate ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    Private Group
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Public Group
                  </>
                )}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {formData.isPrivate 
                ? "Members must request to join and be approved by moderators"
                : "Anyone can join this group immediately"
              }
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
