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
import { Loader2 } from "lucide-react";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom: (data: CreateRoomFormData) => Promise<void>;
}

export interface CreateRoomFormData {
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl?: string;
}

/**
 * CreateRoomDialog Component
 * Feature: community-discussion-rooms
 * Requirements: 1.1, 1.4
 * 
 * Dialog for creating a new discussion room with form validation.
 * Follows existing VELONX dialog patterns.
 */
export default function CreateRoomDialog({
  open,
  onOpenChange,
  onCreateRoom
}: CreateRoomDialogProps) {
  const [formData, setFormData] = useState<CreateRoomFormData>({
    name: "",
    description: "",
    isPrivate: false,
    imageUrl: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateRoomFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRoomFormData, string>> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Room name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Room name must be at least 3 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Room name must be less than 100 characters";
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
      await onCreateRoom({
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
      console.error("Failed to create room:", error);
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
          <DialogTitle>Create Discussion Room</DialogTitle>
          <DialogDescription>
            Create a new discussion room for your community. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="room-name">
              Room Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="room-name"
              placeholder="e.g., Web Development Chat"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
              maxLength={100}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "room-name-error" : undefined}
            />
            {errors.name && (
              <p id="room-name-error" className="text-sm text-red-500" role="alert">
                {errors.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="room-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="room-description"
              placeholder="Describe what this room is about..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? "border-red-500" : ""}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "room-description-error" : undefined}
            />
            {errors.description && (
              <p id="room-description-error" className="text-sm text-red-500" role="alert">
                {errors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="room-image">Image URL (Optional)</Label>
            <Input
              id="room-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className={errors.imageUrl ? "border-red-500" : ""}
              disabled={isSubmitting}
              aria-invalid={!!errors.imageUrl}
              aria-describedby={errors.imageUrl ? "room-image-error" : undefined}
            />
            {errors.imageUrl && (
              <p id="room-image-error" className="text-sm text-red-500" role="alert">
                {errors.imageUrl}
              </p>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="room-private"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isPrivate: checked === true })
              }
              disabled={isSubmitting}
            />
            <Label
              htmlFor="room-private"
              className="text-sm font-normal cursor-pointer"
            >
              Make this room private (requires approval to join)
            </Label>
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
                "Create Room"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
