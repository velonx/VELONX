"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users, UserPlus, Search, MapPin, GraduationCap, Briefcase,
  MessageSquare, UserCheck, UserX, Clock, Filter, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

// ============================================================
// Types
// ============================================================

interface UserCard {
  id: string;
  name: string | null;
  slug?: string | null;
  image: string | null;
  headline: string | null;
  college: string | null;
  graduationYear: number | null;
  skills: string[];
  location: string | null;
  bio: string | null;
  xp: number;
  level: number;
  connectionStatus?: "none" | "pending_sent" | "pending_received" | "connected";
  connectionId?: string | null;
}

interface ConnectionItem {
  connectionId: string;
  connectedAt: string;
  user: UserCard;
}

interface RequestItem {
  connectionId: string;
  message: string | null;
  createdAt: string;
  user: UserCard;
}

// ============================================================
// Sub-Components
// ============================================================

function UserCardComponent({
  user,
  connectionStatus,
  onConnect,
  onWithdraw,
  loading,
}: {
  user: UserCard;
  connectionStatus?: "none" | "pending_sent" | "pending_received" | "connected";
  onConnect?: (userId: string) => void;
  onWithdraw?: (userId: string) => void;
  loading?: boolean;
}) {
  return (
    <div className="group relative bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <Link href={`/network/${user.slug || user.id}`} className="block">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white font-bold text-lg">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {user.name || "User"}
            </h3>
            {user.headline && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{user.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              {user.college && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {user.college}
                </span>
              )}
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {user.location}
                </span>
              )}
            </div>
          </div>
        </div>
        {user.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {user.skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 px-2 py-0.5"
              >
                {skill}
              </Badge>
            ))}
            {user.skills.length > 4 && (
              <Badge className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5">
                +{user.skills.length - 4}
              </Badge>
            )}
          </div>
        )}
      </Link>
      <div className="mt-4 flex gap-2">
        {connectionStatus === "none" && onConnect && (
          <Button
            size="sm"
            onClick={(e) => { e.preventDefault(); onConnect(user.id); }}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Connect
          </Button>
        )}
        {connectionStatus === "pending_sent" && onWithdraw && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.preventDefault(); onWithdraw(user.id); }}
            disabled={loading}
            className="w-full rounded-xl text-xs font-bold border-amber-200 text-amber-600 hover:bg-amber-50"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Pending
          </Button>
        )}
        {connectionStatus === "connected" && (
          <Link href={`/messages/${user.id}`} className="w-full">
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-xl text-xs font-bold border-green-200 text-green-600 hover:bg-green-50 transition-all duration-300 group/btn"
            >
              <span className="flex items-center justify-center gap-1.5 group-hover/btn:hidden">
                <UserCheck className="w-3.5 h-3.5" />
                Connected
              </span>
              <span className="hidden items-center justify-center gap-1.5 group-hover/btn:flex">
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function ConnectionRequestCard({
  item,
  onAccept,
  onReject,
  loading,
}: {
  item: RequestItem;
  onAccept: (connectionId: string) => void;
  onReject: (connectionId: string) => void;
  loading: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <Link href={`/network/${item.user.slug || item.user.id}`}>
          <Avatar className="w-14 h-14 border-2 border-amber-200">
            <AvatarImage src={item.user.image || ""} />
            <AvatarFallback className="bg-linear-to-br from-amber-400 to-orange-500 text-white font-bold text-lg">
              {item.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/network/${item.user.slug || item.user.id}`}>
            <h3 className="font-bold text-foreground hover:text-primary truncate">
              {item.user.name || "User"}
            </h3>
          </Link>
          {item.user.headline && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.user.headline}</p>
          )}
          {item.message && (
            <p className="text-sm text-muted-foreground/80 mt-2 italic bg-muted/50 rounded-lg px-3 py-2">
              &ldquo;{item.message}&rdquo;
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={() => onAccept(item.connectionId)}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold px-4"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(item.connectionId)}
              disabled={loading}
              className="rounded-xl text-xs font-bold text-muted-foreground hover:text-red-500 hover:border-red-200"
            >
              <UserX className="w-3.5 h-3.5 mr-1" />
              Ignore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInPlaceholder({ title, description }: { title: string; description: string }) {
  const router = useRouter();
  return (
    <div className="text-center py-16 bg-card border border-border rounded-2xl max-w-md mx-auto px-6 shadow-sm">
      <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="text-xl font-extrabold text-foreground tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm mt-2 mb-6 leading-relaxed">
        {description}
      </p>
      <Button
        onClick={() => router.push("/auth/login")}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
      >
        Sign In
      </Button>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function NetworkPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") || "directory";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Directory state
  const [users, setUsers] = useState<UserCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dirPage, setDirPage] = useState(1);
  const [dirTotal, setDirTotal] = useState(0);
  const [dirTotalPages, setDirTotalPages] = useState(1);
  const [dirLoading, setDirLoading] = useState(true);

  // Connections state
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [connLoading, setConnLoading] = useState(true);
  const [connSearch, setConnSearch] = useState("");

  // Requests state
  const [receivedRequests, setReceivedRequests] = useState<RequestItem[]>([]);
  const [sentRequests, setSentRequests] = useState<RequestItem[]>([]);
  const [reqLoading, setReqLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch directory
  const fetchDirectory = useCallback(async () => {
    setDirLoading(true);
    try {
      const params = new URLSearchParams({ page: dirPage.toString(), limit: "20" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await secureFetch(`/api/users/directory?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setDirTotal(data.data.pagination.total);
        setDirTotalPages(data.data.pagination.totalPages);
      }
    } catch {
      toast.error("Failed to load directory");
    } finally {
      setDirLoading(false);
    }
  }, [dirPage, debouncedSearch]);

  // Fetch connections
  const fetchConnections = useCallback(async () => {
    setConnLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (connSearch) params.set("q", connSearch);
      const res = await secureFetch(`/api/connections?${params}`);
      const data = await res.json();
      if (data.success) setConnections(data.data.connections);
    } catch {
      toast.error("Failed to load connections");
    } finally {
      setConnLoading(false);
    }
  }, [connSearch]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setReqLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        secureFetch("/api/connections/requests?type=received"),
        secureFetch("/api/connections/requests?type=sent"),
      ]);
      const [received, sent] = await Promise.all([receivedRes.json(), sentRes.json()]);
      if (received.success) setReceivedRequests(received.data.requests);
      if (sent.success) setSentRequests(sent.data.requests);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setReqLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "directory") {
      fetchDirectory();
    } else if (authStatus === "authenticated") {
      if (activeTab === "connections") fetchConnections();
      if (activeTab === "requests") fetchRequests();
    }
  }, [activeTab, authStatus, fetchDirectory, fetchConnections, fetchRequests]);

  // Actions
  const handleConnect = async (targetUserId: string) => {
    if (authStatus !== "authenticated") {
      toast.error("Please sign in to connect with other users");
      router.push("/auth/login");
      return;
    }
    setActionLoading(true);
    try {
      const res = await secureFetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Connection request sent!");
        fetchDirectory();
      } else {
        toast.error(data.error?.message || "Failed to send request");
      }
    } catch {
      toast.error("Failed to send connection request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async (connectionId: string) => {
    setActionLoading(true);
    try {
      const res = await secureFetch(`/api/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Connection accepted!");
        fetchRequests();
        fetchConnections();
      } else {
        toast.error(data.error?.message || "Failed to accept");
      }
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (connectionId: string) => {
    setActionLoading(true);
    try {
      const res = await secureFetch(`/api/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request ignored");
        fetchRequests();
      }
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (targetUserId: string) => {
    let connectionId: string | undefined;

    const dirUser = users.find((u) => u.id === targetUserId);
    if (dirUser?.connectionId) {
      connectionId = dirUser.connectionId;
    }

    if (!connectionId) {
      const sentReq = sentRequests.find((r) => r.user.id === targetUserId);
      if (sentReq) {
        connectionId = sentReq.connectionId;
      }
    }

    if (!connectionId) {
      toast.error("Connection request not found");
      return;
    }

    setActionLoading(true);
    try {
      const res = await secureFetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Connection request withdrawn");
        fetchDirectory();
        fetchRequests();
        fetchConnections();
      } else {
        toast.error(data.error?.message || "Failed to withdraw request");
      }
    } catch {
      toast.error("Failed to withdraw connection request");
    } finally {
      setActionLoading(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-background pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: "directory", label: "Directory", icon: Search, count: dirTotal },
    { key: "connections", label: "My Connections", icon: Users, count: connections.length },
    { key: "requests", label: "Requests", icon: UserPlus, count: receivedRequests.length },
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Network
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Discover people, grow your connections, and collaborate on projects.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); router.push(`/network?tab=${tab.key}`, { scroll: false }); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "requests" && receivedRequests.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {receivedRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Directory Tab */}
        {activeTab === "directory" && (
          <div>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="directory-search"
                type="text"
                placeholder="Search by name, skills, or college..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setDirPage(1); }}
                className="w-full pl-12 pr-10 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setDirPage(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {dirLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-3 bg-muted rounded w-16" />
                      <div className="h-3 bg-muted rounded w-12" />
                    </div>
                    <div className="h-8 bg-muted rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground">No users found</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {searchQuery ? "Try a different search term" : "No users available yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <UserCardComponent
                      key={user.id}
                      user={user}
                      connectionStatus={user.connectionStatus || "none"}
                      onConnect={handleConnect}
                      onWithdraw={handleWithdraw}
                      loading={actionLoading}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {dirTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDirPage((p) => Math.max(1, p - 1))}
                      disabled={dirPage <= 1}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground font-medium">
                      Page {dirPage} of {dirTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDirPage((p) => Math.min(dirTotalPages, p + 1))}
                      disabled={dirPage >= dirTotalPages}
                      className="rounded-xl"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === "connections" && (
          authStatus !== "authenticated" ? (
            <SignInPlaceholder
              title="View your connections"
              description="Keep track of your professional network and start private chats. Sign in to view and manage your connections."
            />
          ) : (
            <div>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="connections-search"
                  type="text"
                  placeholder="Search your connections..."
                  value={connSearch}
                  onChange={(e) => setConnSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              {connLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground">No connections yet</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Start by browsing the{" "}
                    <button onClick={() => setActiveTab("directory")} className="text-primary font-bold hover:underline">
                      directory
                    </button>{" "}
                    and connecting with people.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((conn) => (
                    <UserCardComponent
                      key={conn.connectionId}
                      user={conn.user}
                      connectionStatus="connected"
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          authStatus !== "authenticated" ? (
            <SignInPlaceholder
              title="Manage requests"
              description="Connect with other developers and view incoming connection invites. Sign in to see your requests."
            />
          ) : (
            <div className="space-y-8">
              {/* Received Requests */}
              <div>
                <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Received ({receivedRequests.length})
                </h2>
                {reqLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                            <div className="flex gap-2 mt-2">
                              <div className="h-8 bg-muted rounded-xl w-20" />
                              <div className="h-8 bg-muted rounded-xl w-20" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : receivedRequests.length === 0 ? (
                  <div className="text-center py-8 bg-card border border-border rounded-2xl">
                    <p className="text-muted-foreground text-sm">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receivedRequests.map((req) => (
                      <ConnectionRequestCard
                        key={req.connectionId}
                        item={req}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Sent ({sentRequests.length})
                </h2>
                {sentRequests.length === 0 ? (
                  <div className="text-center py-8 bg-card border border-border rounded-2xl">
                    <p className="text-muted-foreground text-sm">No sent requests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sentRequests.map((req) => (
                      <UserCardComponent
                        key={req.connectionId}
                        user={req.user}
                        connectionStatus="pending_sent"
                        onWithdraw={handleWithdraw}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
