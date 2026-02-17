"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * ChatInput Component
 * Feature: community-discussion-rooms
 * Requirements: 3.1, 3.7
 * 
 * Message input with emoji picker and keyboard shortcuts.
 * - Enter to send
 * - Shift+Enter for newline
 */
export default function ChatInput({
  onSendMessage,
  onTyping,
  placeholder = "Type a message...",
  disabled = false,
  className
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing indicator
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage("");
      setIsTyping(false);
      onTyping?.(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = () => {
    // Simple emoji insertion - in production, you'd use a proper emoji picker library
    const emojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '💯', '👏'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage(prev => prev + randomEmoji);
    textareaRef.current?.focus();
  };

  return (
    <div className={cn("flex items-end gap-2 p-3 sm:p-4 border-t border-border bg-card", className)}>
      {/* Emoji Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleEmojiClick}
        disabled={disabled}
        className="h-9 w-9 p-0 flex-shrink-0"
        aria-label="Add emoji"
      >
        <Smile className="h-5 w-5" />
      </Button>

      {/* Message Input */}
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[40px] max-h-[120px] resize-none py-2 text-sm"
        rows={1}
        maxLength={2000}
        aria-label="Message input"
      />

      {/* Send Button */}
      <Button
        type="button"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={cn(
          "h-9 w-9 p-0 flex-shrink-0 rounded-full",
          message.trim()
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white shadow-lg shadow-purple-600/20"
            : "bg-muted text-muted-foreground"
        )}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
