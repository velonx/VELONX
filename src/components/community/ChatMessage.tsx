"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageData } from "@/lib/types/community.types";
import { cn } from "@/lib/utils";
import { Edit2, Trash2, Check, X } from "lucide-react";
import Image from "next/image";

interface ChatMessageProps {
  message: ChatMessageData;
  isOwnMessage: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

/**
 * ChatMessage Component
 * Feature: community-discussion-rooms
 * Requirements: 3.1, 3.2, 3.3
 * 
 * Displays an individual chat message with edit/delete functionality.
 */
export default function ChatMessage({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
  className
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Don't render deleted messages
  if (message.isDeleted) {
    return (
      <div className={cn("flex items-center gap-2 py-2 px-3 opacity-50", className)}>
        <p className="text-xs italic text-muted-foreground">Message deleted</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 py-2 px-3 rounded-lg transition-colors",
        isHovered && "bg-muted/50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          {message.authorImage ? (
            <Image
              src={message.authorImage}
              alt={message.authorName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-sm">
              {message.authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Author and Timestamp */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm text-foreground">
            {message.authorName}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground italic">(edited)</span>
          )}
        </div>

        {/* Message Text or Edit Input */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-8 text-sm"
              autoFocus
              maxLength={2000}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveEdit}
              className="h-8 w-8 p-0"
              aria-label="Save edit"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-8 w-8 p-0"
              aria-label="Cancel edit"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-foreground break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>

      {/* Action Buttons (only for own messages) */}
      {isOwnMessage && !isEditing && isHovered && (
        <div className="flex items-start gap-1 flex-shrink-0">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 p-0 hover:bg-primary/10"
              aria-label="Edit message"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(message.id)}
              className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-600"
              aria-label="Delete message"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
