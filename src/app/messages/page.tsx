"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare, Send, ArrowLeft, Search, X, ChevronDown,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

interface ConversationItem {
  conversationId: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
    headline: string | null;
    isOnline?: boolean;
  };
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  isEdited: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function shouldShowDateSeparator(current: string, previous: string | null): boolean {
  if (!previous) return true;
  const cur = new Date(current).toDateString();
  const prev = new Date(previous).toDateString();
  return cur !== prev;
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (date.toDateString() === today) return "Today";
  if (date.toDateString() === yesterday) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// ============================================================
// Conversation Sidebar
// ============================================================

function ConversationList({
  conversations,
  connections = [],
  activeUserId,
  onSelect,
  loading,
}: {
  conversations: ConversationItem[];
  connections?: any[];
  activeUserId: string | null;
  onSelect: (userId: string) => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? conversations.filter((c) =>
        c.otherUser.name?.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  // Filter connections: matches search, and doesn't already have an active conversation
  const matchedConnections = search
    ? connections.filter((conn) => {
        const alreadyHasConv = conversations.some(
          (conv) => conv.otherUser.id === conn.user.id
        );
        const nameMatches = conn.user.name?.toLowerCase().includes(search.toLowerCase());
        const headlineMatches = conn.user.headline?.toLowerCase().includes(search.toLowerCase());
        return !alreadyHasConv && (nameMatches || headlineMatches);
      })
    : [];

  const hasResults = filtered.length > 0 || matchedConnections.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-black text-foreground mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="msg-search"
            type="text"
            placeholder="Search conversations or connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasResults ? (
          search ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No results found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                We couldn't find any conversations or connections matching "{search}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center justify-center text-center p-6 border-b border-border">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No messages yet</p>
                {connections.length > 0 ? (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Choose a connection below to start a conversation:
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Connect with people in the network directory to start chatting
                  </p>
                )}
              </div>
              {connections.length > 0 && (
                <div className="p-2 space-y-0.5">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Your Connections
                  </div>
                  {connections.map((conn) => (
                    <button
                      key={conn.connectionId}
                      onClick={() => {
                        setSearch("");
                        onSelect(conn.user.id);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        activeUserId === conn.user.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conn.user.image || ""} />
                          <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white font-bold">
                            {conn.user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {conn.user.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{conn.user.name}</p>
                        {conn.user.headline && (
                          <p className="text-xs text-muted-foreground truncate">{conn.user.headline}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="p-2 space-y-0.5">
            {/* Conversations Section */}
            {search && filtered.length > 0 && (
              <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Conversations
              </div>
            )}
            {filtered.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => {
                  setSearch("");
                  onSelect(conv.otherUser.id);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  activeUserId === conv.otherUser.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conv.otherUser.image || ""} />
                    <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white font-bold">
                      {conv.otherUser.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {conv.otherUser.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${conv.unreadCount > 0 ? "font-black text-foreground" : "font-semibold text-foreground"}`}>
                      {conv.otherUser.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-2 whitespace-nowrap">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className={`text-xs truncate ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {conv.lastMessagePreview || "Start a conversation"}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-black rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1 ml-2">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Connections Section */}
            {search && matchedConnections.length > 0 && (
              <>
                <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4">
                  Connections (Start Chat)
                </div>
                {matchedConnections.map((conn) => (
                  <button
                    key={conn.connectionId}
                    onClick={() => {
                      setSearch("");
                      onSelect(conn.user.id);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      activeUserId === conn.user.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conn.user.image || ""} />
                        <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white font-bold">
                          {conn.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {conn.user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{conn.user.name}</p>
                      {conn.user.headline ? (
                        <p className="text-xs text-muted-foreground truncate">{conn.user.headline}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/70 truncate">Start a conversation</p>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Chat Thread
// ============================================================

function ChatThread({
  userId,
  currentUserId,
  onBack,
  onMessageSent,
}: {
  userId: string;
  currentUserId: string;
  onBack: () => void;
  onMessageSent?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<{ name: string | null; image: string | null; headline: string | null; isOnline?: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  // Fetch messages
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      try {
        const [msgRes, userRes] = await Promise.all([
          secureFetch(`/api/messages/${userId}?limit=50`),
          secureFetch(`/api/users/${userId}`),
        ]);
        const [msgData, userData] = await Promise.all([msgRes.json(), userRes.json()]);
        if (msgData.success) setMessages(msgData.data.messages);
        if (userData.success) {
          setOtherUser({
            name: userData.data.name,
            image: userData.data.image,
            headline: userData.data.headline,
            isOnline: userData.data.isOnline,
          });
        }
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
    // Mark as read
    secureFetch(`/api/messages/${userId}/read`, { method: "POST" }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, loading, scrollToBottom]);

  // Poll for new messages (simple polling, WebSocket is also available)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await secureFetch(`/api/messages/${userId}?limit=50`);
        const data = await res.json();
        if (data.success) {
          // Update online status in the chat header
          if (data.data.isOnline !== undefined) {
            setOtherUser((prev) => prev ? { ...prev, isOnline: data.data.isOnline } : null);
          }

          const hasUpdates = data.data.messages.length !== messages.length ||
            data.data.messages.some((newMsg: Message, idx: number) => {
              const oldMsg = messages[idx];
              return !oldMsg || oldMsg.id !== newMsg.id || oldMsg.isRead !== newMsg.isRead;
            });

          if (hasUpdates) {
            setMessages(data.data.messages);
            secureFetch(`/api/messages/${userId}/read`, { method: "POST" }).catch(() => {});
          }
        }
      } catch {
        // Silently fail
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await secureFetch(`/api/messages/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setInput("");
        inputRef.current?.focus();
        if (onMessageSent) onMessageSent();
        setTimeout(scrollToBottom, 50);
      } else {
        toast.error(data.error?.message || "Failed to send");
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <button onClick={onBack} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {otherUser && (
          <Link href={`/network/${userId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser.image || ""} />
                <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white font-bold">
                  {otherUser.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {otherUser.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground text-sm">{otherUser.name}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  otherUser.isOnline 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {otherUser.isOnline ? "Active" : "Offline"}
                </span>
              </div>
              {otherUser.headline && (
                <p className="text-xs text-muted-foreground line-clamp-1">{otherUser.headline}</p>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground font-medium">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isOwn = msg.senderId === currentUserId;
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const showDate = shouldShowDateSeparator(msg.createdAt, prevMsg?.createdAt || null);

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap wrap-break-word">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        <span className={`text-[10px] ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          <span className="text-[10px] text-primary-foreground/60 font-medium">
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            id="message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none bg-muted/50 border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
            style={{ minHeight: "44px" }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 w-11 p-0 shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Messages Page
// ============================================================

function MessagesContent() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const fetchedTempUsers = useRef<Set<string>>(new Set());

  const fetchConversations = useCallback(async () => {
    try {
      const res = await secureFetch("/api/messages/conversations");
      const data = await res.json();
      if (data.success) setConversations(data.data.conversations);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await secureFetch("/api/connections?limit=50");
      const data = await res.json();
      if (data.success) setConnections(data.data.connections);
    } catch (err) {
      console.error("Failed to load connections in messages page", err);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchConversations();
      fetchConnections();
    }
  }, [authStatus, fetchConversations, fetchConnections]);

  // Handle initializing active user from query parameter
  useEffect(() => {
    if (userParam) {
      setActiveUserId(userParam);
    }
  }, [userParam]);

  // Handle adding temporary conversation item for first-time chats
  useEffect(() => {
    if (loading || !activeUserId) return;

    const exists = conversations.some((c) => c.otherUser.id === activeUserId);
    if (!exists && !fetchedTempUsers.current.has(activeUserId)) {
      fetchedTempUsers.current.add(activeUserId);
      let isMounted = true;
      secureFetch(`/api/users/${activeUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && data.data) {
            const resolvedId = data.data.id;
            
            // If the activeUserId was a slug, update it
            if (activeUserId !== resolvedId) {
              setActiveUserId(resolvedId);
              fetchedTempUsers.current.add(resolvedId);
            }

            const tempConv: ConversationItem = {
              conversationId: `temp-${resolvedId}`,
              otherUser: {
                id: resolvedId,
                name: data.data.name,
                image: data.data.image,
                headline: data.data.headline,
              },
              lastMessageAt: new Date().toISOString(),
              lastMessagePreview: "Start a conversation",
              unreadCount: 0,
            };
            setConversations((prev) => {
              if (prev.some((c) => c.otherUser.id === resolvedId)) return prev;
              return [tempConv, ...prev];
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch temp user details", err);
          fetchedTempUsers.current.delete(activeUserId);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [activeUserId, conversations, loading]);

  // Refresh conversations when returning from a chat
  useEffect(() => {
    if (!activeUserId) fetchConversations();
  }, [activeUserId, fetchConversations]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-background pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authStatus !== "authenticated") {
    router.push("/auth/login");
    return null;
  }

  const currentUserId = session?.user?.id || "";

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex border border-border rounded-t-3xl overflow-hidden bg-card shadow-sm">
        {/* Sidebar */}
        <div
          className={`w-full lg:w-90 lg:border-r border-border shrink-0 ${
            activeUserId ? "hidden lg:flex lg:flex-col" : "flex flex-col"
          }`}
        >
          <ConversationList
            conversations={conversations}
            connections={connections}
            activeUserId={activeUserId}
            onSelect={(userId) => {
              // If selecting a connection that doesn't have a conversation yet,
              // add a temporary conversation item immediately using connection info
              const exists = conversations.some((c) => c.otherUser.id === userId);
              if (!exists) {
                const conn = connections.find((c) => c.user.id === userId);
                if (conn) {
                  const tempConv: ConversationItem = {
                    conversationId: `temp-${userId}`,
                    otherUser: {
                      id: conn.user.id,
                      name: conn.user.name,
                      image: conn.user.image,
                      headline: conn.user.headline,
                    },
                    lastMessageAt: new Date().toISOString(),
                    lastMessagePreview: "Start a conversation",
                    unreadCount: 0,
                  };
                  setConversations((prev) => [tempConv, ...prev]);
                }
              }
              setActiveUserId(userId);
            }}
            loading={loading}
          />
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 ${
            activeUserId ? "flex flex-col" : "hidden lg:flex lg:flex-col"
          }`}
        >
          {activeUserId ? (
            <ChatThread
              userId={activeUserId}
              currentUserId={currentUserId}
              onBack={() => setActiveUserId(null)}
              onMessageSent={fetchConversations}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-xl font-black text-foreground">Your Messages</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-sm">
                Select a conversation to start chatting, or connect with people from the{" "}
                <Link href="/network" className="text-primary font-bold hover:underline">
                  network directory
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background pt-28 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
