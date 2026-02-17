"use client";

import { useState } from "react";
import { CommunityGroupData } from "@/lib/types/community.types";
import { GroupMember } from "@/lib/hooks/useGroupMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface GroupSettingsProps {
  group: CommunityGroupData;
  members: GroupMember[];
  moderatorIds: string[];
  onUpdateGroup?: (data: UpdateGroupData) => Promise<void>;
  onAssignModerator?: (userId: string) => Promise<void>;
  isOwner?: boolean;
  className?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  imageUrl?: string;
}

/**
 * GroupSettings Component
 * Feature: community-discussion-rooms
 * Requirements: 2.4, 2.6
 * 
 * Allows group owners to edit group details and manage moderators.
 */
export default function GroupSettings({
  group,
  members,
  moderatorIds,
  onUpdateGroup,
  onAssignModerator,
  isOwner = false,
  className
}: GroupSettingsProps) {
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    imageUrl: group.imageUrl || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveChanges = async () => {
    if (!onUpdateGroup) return;

    // Validate
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateGroup({
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || undefined
      });
      toast.success("Group settings updated successfully");
    } catch (error) {
      console.error("Failed to update group:", error);
      // Error toast is handled by the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignModerator = async () => {
    if (!onAssignModerator || !selectedUserId) return;

    setIsAssigning(true);
    try {
      await onAssignModerator(selectedUserId);
      setSelectedUserId("");
      toast.success("Moderator assigned successfully");
    } catch (error) {
      console.error("Failed to assign moderator:", error);
      // Error toast is handled by the hook
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter out owner and existing moderators from the selection
  const eligibleMembers = members.filter(
    member => member.userId !== group.ownerId && !moderatorIds.includes(member.userId)
  );

  if (!isOwner) {
    return (
      <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" aria-hidden="true" />
            Group Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
            <p>Only the group owner can access settings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" aria-hidden="true" />
          Group Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Group Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Group Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="settings-name">Group Name</Label>
            <Input
              id="settings-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-description">Description</Label>
            <Textarea
              id="settings-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={500}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-image">Image URL (Optional)</Label>
            <Input
              id="settings-image"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              disabled={isSaving}
            />
          </div>

          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-bold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Moderators Section */}
        <div className="space-y-4 pt-6 border-t border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Manage Moderators</h3>
          
          {/* Current Moderators */}
          {moderatorIds.length > 0 && (
            <div className="space-y-2">
              <Label>Current Moderators</Label>
              <div className="space-y-2">
                {members
                  .filter(member => moderatorIds.includes(member.userId))
                  .map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={member.user.image || undefined} 
                          alt={member.user.name || "User"} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium flex-1">
                        {member.user.name || "Anonymous User"}
                      </span>
                      <Badge variant="secondary" className="bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20">
                        <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
                        Moderator
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Assign New Moderator */}
          {eligibleMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assign-moderator">Assign New Moderator</Label>
              <div className="flex gap-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1" id="assign-moderator">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleMembers.map(member => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.user.name || member.user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAssignModerator}
                  disabled={!selectedUserId || isAssigning}
                  variant="outline"
                >
                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                      Assign
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {eligibleMembers.length === 0 && moderatorIds.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No members available to assign as moderators
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
