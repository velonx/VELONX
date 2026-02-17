"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import OnlineMembersList from "./OnlineMembersList";
import { ChatMessageData } from "@/lib/types/community.types";
import { cn } from "@/lib/utils";
import { Menu, X, Loader2 } from "lucide-react";

interface RoomChatProps {
  roomId: string;
  messages: ChatMessageData[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onTyping?: (isTyping: boolean) => void;
  typingUsers?: string[];
  onlineMembers?: Array<{
    id: string;
    name: string;
    image?: string;
    isOnline: boolean;
  }>;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * RoomChat Component
 * Feature: community-discussion-rooms
 * Requirements: 3.1, 3.2, 3.3, 3.7
 * 
 * Main chat container with message list, input, and online members sidebar.
 * Implements virtual scrolling for performance with large message lists.
 */
export default function RoomChat({
  roomId,
  messages,
  currentUserId,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onTyping,
  typingUsers = [],
  onlineMembers = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className
}: RoomChatProps) {
  const [showMembersList, setShowMembersList] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Auto-scroll to bottom when new messages arrive (if already at bottom)
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [roomId]); // Only on room change

  // Handle scroll to detect if user is at bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const threshold = 100; // pixels from bottom
    const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;
    setIsAtBottom(atBottom);

    // Load more messages when scrolling to top
    if (target.scrollTop === 0 && hasMore && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true);
      onLoadMore();
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  };

  // Toggle members list on mobile
  const toggleMembersList = () => {
    setShowMembersList(!showMembersList);
  };

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">
              Chat
            </h2>
            <p className="text-xs text-muted-foreground">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </p>
          </div>

          {/* Toggle Members List Button (Mobile) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMembersList}
            className="lg:hidden"
            aria-label={showMembersList ? "Hide members list" : "Show members list"}
          >
            {showMembersList ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-2 sm:p-4"
          onScroll={handleScroll}
        >
          {/* Load More Indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Loading State */}
          {isLoading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Be the first to start the conversation!
              </p>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.authorId === currentUserId}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator userNames={typingUsers} />
          )}
        </ScrollArea>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          placeholder="Type a message..."
        />
      </div>

      {/* Online Members Sidebar */}
      {showMembersList && onlineMembers.length > 0 && (
        <div className={cn(
          "w-full lg:w-64 flex-shrink-0",
          "absolute lg:relative inset-y-0 right-0 z-10 lg:z-0",
          "lg:block"
        )}>
          <OnlineMembersList members={onlineMembers} />
        </div>
      )}
    </div>
  );
}
