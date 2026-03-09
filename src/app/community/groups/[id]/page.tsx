"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Lock,
  Globe,
  UserPlus,
  LogOut,
  Settings,
  Shield,
  Clock,
  FileText,
  ImageIcon,
  LinkIcon,
  XIcon,
  Loader2Icon,
} from "lucide-react";
import GroupFeed from "@/components/community/GroupFeed";
import GroupMembers from "@/components/community/GroupMembers";
import GroupSettings from "@/components/community/GroupSettings";
import JoinRequestList from "@/components/community/JoinRequestList";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";
import { useGroupMembers } from "@/lib/hooks/useGroupMembers";
import { useCommunityPosts } from "@/lib/hooks/useCommunityPosts";
import { secureFetch } from "@/lib/utils/csrf";
import toast from "react-hot-toast";

export default function GroupDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  // Composer state
  const [showComposer, setShowComposer] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [linkUrls, setLinkUrls] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;
  const MAX_LINKS = 3;

  const { groups, isLoading, joinGroup, requestJoinGroup, leaveGroup, refetch, memberGroupIds } = useCommunityGroups();
  const group = groups?.find(g => g.id === groupId);

  const {
    members,
    joinRequests,
    isLoading: membersLoading,
    approveRequest,
    rejectRequest
  } = useGroupMembers(groupId);

  const { posts, isLoading: postsLoading, createPost, isCreating, loadMore, hasMore, refetch: refetchPosts } = useCommunityPosts({ groupId });

  const isMember = members?.some(m => m.userId === session?.user?.id) || memberGroupIds?.includes(groupId);
  const isOwner = group?.ownerId === session?.user?.id;
  const isModerator = isOwner;

  // Composer handlers
  const openComposer = () => {
    setShowComposer(true);
    setTimeout(() => composerRef.current?.focus(), 100);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setPostContent("");
    setImageUrls([]);
    setLinkUrls([]);
    setLinkInput("");
    setShowLinkInput(false);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      await createPost({
        content: postContent.trim(),
        groupId,
        visibility: 'GROUP',
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        linkUrls: linkUrls.length > 0 ? linkUrls : undefined,
      });
      setPostContent("");
      setImageUrls([]);
      setLinkUrls([]);
      setLinkInput("");
      setShowLinkInput(false);
      setShowComposer(false);
      refetchPosts();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (imageUrls.length + files.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }
    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} is too large (max 5MB)`);
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });
      });
      const base64Images = await Promise.all(uploadPromises);
      const uploadedUrls: string[] = [];
      for (const base64 of base64Images) {
        const response = await secureFetch('/api/user/profile/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder: 'community-posts' }),
        });
        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        uploadedUrls.push(data.url);
      }
      setImageUrls(prev => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [imageUrls.length]);

  const addLink = useCallback(() => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    if (linkUrls.length >= MAX_LINKS) { toast.error(`Max ${MAX_LINKS} links`); return; }
    try {
      new URL(trimmed);
      setLinkUrls(prev => [...prev, trimmed]);
      setLinkInput("");
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
    }
  }, [linkInput, linkUrls.length]);

  // Group action handlers
  const handleJoinGroup = async () => {
    if (!session) {
      toast.error("Please sign in to join groups");
      router.push("/auth/login");
      return;
    }
    setIsJoining(true);
    try {
      if (group?.isPrivate) {
        await requestJoinGroup(groupId);
        toast.success("Join request sent!");
      } else {
        await joinGroup(groupId);
        toast.success("Joined group successfully!");
      }
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      await leaveGroup(groupId);
      toast.success("Left group successfully");
      router.push("/community/groups");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    } finally {
      setIsLeaving(false);
    }
  };

  if (isLoading || !group) {
    return (
      <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading group...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-28 bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        disabled={isCreating || imageUrls.length >= MAX_IMAGES}
      />

      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link href="/community" className="hover:text-foreground transition-colors">Community</Link></li>
          <li>/</li>
          <li><Link href="/community/groups" className="hover:text-foreground transition-colors">Groups</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium truncate max-w-[200px]">{group.name}</li>
        </ol>
      </nav>

      {/* Group Header */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                <Badge variant={group.isPrivate ? "secondary" : "default"} className="gap-1">
                  {group.isPrivate ? <><Lock className="w-3 h-3" /> Private</> : <><Globe className="w-3 h-3" /> Public</>}
                </Badge>
                {isModerator && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="w-3 h-3" />
                    {isOwner ? "Owner" : "Moderator"}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{group.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{group.postCount} posts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isMember ? (
                <Button onClick={handleJoinGroup} disabled={isJoining} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {isJoining ? "Joining..." : group.isPrivate ? "Request to Join" : "Join Group"}
                </Button>
              ) : (
                <>
                  {!isOwner && (
                    <Button variant="outline" onClick={handleLeaveGroup} disabled={isLeaving} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      {isLeaving ? "Leaving..." : "Leave Group"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {isMember ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
                <TabsTrigger value="feed" className="gap-2">
                  <FileText className="w-4 h-4" /> Feed
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="w-4 h-4" /> Members
                </TabsTrigger>
                {isModerator && (
                  <>
                    <TabsTrigger value="requests" className="gap-2">
                      <Clock className="w-4 h-4" /> Requests
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                      <Settings className="w-4 h-4" /> Settings
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="feed">
                <div className="max-w-3xl mx-auto">
                  <GroupFeed
                    posts={posts}
                    isMember={isMember}
                    isLoading={postsLoading}
                    hasMore={hasMore}
                    onLoadMore={loadMore}
                    currentUserId={session?.user?.id}
                  />
                </div>
              </TabsContent>

              <TabsContent value="members">
                <GroupMembers
                  members={members || []}
                  isLoading={membersLoading}
                  ownerId={group?.ownerId}
                />
              </TabsContent>

              {isModerator && (
                <>
                  <TabsContent value="requests">
                    <JoinRequestList
                      requests={joinRequests || []}
                      isLoading={membersLoading}
                      onApprove={approveRequest}
                      onReject={rejectRequest}
                    />
                  </TabsContent>

                  <TabsContent value="settings">
                    <GroupSettings
                      group={group}
                      members={members || []}
                      moderatorIds={[]}
                      onUpdateGroup={async () => { await refetch(); }}
                      isOwner={isOwner}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">
                  {group.isPrivate ? "Private Group" : "Join to participate"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {group.isPrivate
                    ? "This is a private group. Request to join to view posts and participate."
                    : "Join this group to view posts and participate in discussions."
                  }
                </p>
                <Button onClick={handleJoinGroup} disabled={isJoining} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {isJoining ? "Joining..." : group.isPrivate ? "Request to Join" : "Join Group"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Sticky Bottom Composer — only for members on the feed tab */}
      {isMember && activeTab === "feed" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="container mx-auto px-4 py-3 max-w-3xl">
            {showComposer ? (
              <div className="space-y-3">
                <textarea
                  ref={composerRef}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder={`Share something with ${group.name}...`}
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-border/50 bg-muted/20 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-all"
                  disabled={isCreating}
                />

                {/* Image Previews */}
                {imageUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group size-16 rounded-lg overflow-hidden border border-border/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="size-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link Previews */}
                {linkUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {linkUrls.map((url, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full text-xs border border-border/30">
                        <LinkIcon className="size-3 text-muted-foreground" />
                        <span className="truncate max-w-[200px] text-primary">{url}</span>
                        <button onClick={() => setLinkUrls(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                          <XIcon className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link Input */}
                {showLinkInput && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                      placeholder="https://..."
                      className="flex-1 px-3 py-1.5 text-sm border border-border/50 rounded-full bg-muted/20 focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                    <Button type="button" variant="outline" size="sm" className="rounded-full px-3 text-xs" onClick={addLink} disabled={!linkInput.trim()}>
                      Add
                    </Button>
                  </div>
                )}

                {/* Action bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCreating || isUploadingImage || imageUrls.length >= MAX_IMAGES}
                    >
                      {isUploadingImage ? <Loader2Icon className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                      <span className="text-xs hidden sm:inline">{imageUrls.length > 0 ? `${imageUrls.length}/${MAX_IMAGES}` : "Image"}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full"
                      onClick={() => setShowLinkInput(!showLinkInput)}
                      disabled={linkUrls.length >= MAX_LINKS}
                    >
                      <LinkIcon className="size-4" />
                      <span className="text-xs hidden sm:inline">{linkUrls.length > 0 ? `${linkUrls.length}/${MAX_LINKS}` : "Link"}</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full text-xs" onClick={closeComposer}>Cancel</Button>
                    <Button
                      size="sm"
                      className="rounded-full px-5 font-semibold"
                      disabled={!postContent.trim() || isCreating || isUploadingImage}
                      onClick={handleCreatePost}
                    >
                      {isCreating ? <><Loader2Icon className="size-3.5 animate-spin mr-1" /> Posting...</> : "Post"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 cursor-pointer" onClick={openComposer}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {session?.user?.name?.[0] || "U"}
                </div>
                <div className="flex-1 px-4 py-2.5 rounded-full bg-muted/60 border border-border/40 text-muted-foreground text-sm hover:bg-muted transition-colors">
                  Share something with {group.name}...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
