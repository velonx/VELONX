"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";
import { useCommunityPosts } from "@/lib/hooks/useCommunityPosts";
import { CommentSection } from "@/components/community/CommentSection";
import { CommunityGroupItemSkeleton } from "@/components/boneyard";
import type { CommunityPostData, CommunityGroupData } from "@/lib/types/community.types";
import { AvatarImage } from "@/components/responsive-image";
import { Loader2Icon, MessageSquare, ChevronUpIcon, ChevronDownIcon, Share2, Check, ImageIcon, Link as LinkIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useCallback } from "react";

// Stable colors for initials avatars
const getAvatarStyle = (name: string) => {
  const colors = [
    { bg: "rgba(34, 108, 224, 0.12)", text: "#226CE0" },
    { bg: "rgba(240, 119, 26, 0.12)", text: "#F0771A" },
    { bg: "rgba(124, 58, 237, 0.12)", text: "#7C3AED" },
    { bg: "rgba(13, 148, 136, 0.12)", text: "#0D9488" },
    { bg: "rgba(219, 39, 119, 0.12)", text: "#DB2777" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
};

// Local component for post card
function CommunityPostCard({
  post,
  currentUserId
}: {
  post: CommunityPostData;
  currentUserId?: string;
}) {
  const [showComments, setShowComments] = useState(false);
  const [localScore, setLocalScore] = useState(post.score !== undefined ? post.score : (post.upvotes - post.downvotes) || 0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [copied, setCopied] = useState(false);

  const authorInitials = getInitials(post.authorName);
  const avatarStyle = getAvatarStyle(post.authorName);

  // Extract hashtags from content
  const extractHashtags = (content: string) => {
    const matches = content.match(/#\w+/g) || [];
    return matches.map(tag => tag.toUpperCase());
  };

  const hashtags = extractHashtags(post.content);

  // Clean trailing hashtags from the text body to prevent duplicate rendering
  const displayContent = post.content.replace(/(?:\s*#\w+)+\s*$/, "");

  const handleVote = async () => {
    if (!currentUserId) {
      toast.error("You must be signed in to upvote");
      return;
    }

    const action = isUpvoted ? "remove" : "upvote";
    // Optimistic update
    setIsUpvoted(!isUpvoted);
    setLocalScore(prev => isUpvoted ? prev - 1 : prev + 1);

    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();
      const res = await fetch(`/api/community/posts/${post.id}/vote`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || "Failed to vote");

      if (data.data?.score !== undefined) {
        setLocalScore(data.data.score);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to vote");
      // Revert optimistic update
      setIsUpvoted(isUpvoted);
      setLocalScore(prev => isUpvoted ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Generate SEO friendly thread slug
    const slug = post.slug;

    const url = `${window.location.origin}/community/t/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          {post.authorImage ? (
            <AvatarImage
              src={post.authorImage}
              alt={post.authorName}
              size={44}
              className="author-avatar object-cover shrink-0"
            />
          ) : (
            <div className="author-avatar" style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}>
              {authorInitials}
            </div>
          )}
          <div className="author-info">
            <h3>{post.authorName}</h3>
            <p>Student Builder {post.authorCollege ? `from ${post.authorCollege}` : ''}</p>
          </div>
        </div>
        <div className="post-time">
          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>
      
      {/* Clickable link to the thread page for SEO discovery */}
      <Link href={`/community/t/${post.slug}`} className="block group">
        <div className="post-body group-hover:text-primary transition-colors cursor-pointer">
          {displayContent}
        </div>
      </Link>

      {/* Images */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className={`grid gap-2 mt-3 mb-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' : post.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {post.imageUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer rounded-lg overflow-hidden block border bg-muted aspect-video">
              <img src={url} alt={`Post image ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </a>
          ))}
        </div>
      )}

      {/* Links */}
      {post.linkUrls && post.linkUrls.length > 0 && (
        <div className="space-y-2 mt-3 mb-4">
          {post.linkUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors">
              <LinkIcon className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate text-primary font-medium">{url}</span>
            </a>
          ))}
        </div>
      )}
      
      {hashtags.length > 0 && (
        <div className="post-tags">
          {hashtags.map((tag, i) => (
            <span key={i} className="badge badge-violet">{tag}</span>
          ))}
        </div>
      )}

      <div className="post-actions">
        <button className={`post-action-btn ${isUpvoted ? 'active' : ''}`} onClick={handleVote}>
          <span>{isUpvoted ? "▲ Upvoted" : "▲ Upvote"}</span>
          <span className="upvote-count">{localScore}</span>
        </button>
        <button className={`post-action-btn ${showComments ? 'comment-btn-active' : ''}`} onClick={() => setShowComments(!showComments)}>
          <span>💬 Comments</span>
          <span>({post.commentCount || 0})</span>
        </button>
        <button className="post-action-btn" onClick={handleShare} style={{ marginLeft: "auto" }}>
          {copied ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="size-3" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {showComments && (
        <div className="comments-wrapper open">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}

interface CommunityClientProps {
  initialPosts: CommunityPostData[];
  initialGroups: CommunityGroupData[];
  totalPostsCount: number;
}

export default function CommunityClient({ initialPosts, initialGroups, totalPostsCount }: CommunityClientProps) {
  const { data: session } = useSession();

  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [linkUrls, setLinkUrls] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;
  const MAX_LINKS = 3;

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

      const { secureFetch } = await import("@/lib/utils/csrf");
      const uploadRequests = base64Images.map(async (base64) => {
        const response = await secureFetch('/api/user/profile/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder: 'community-posts' }),
        });
        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadRequests);

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

  // Database hooks initialized with pre-fetched SSR data
  const { groups, isLoading: groupsLoading } = useCommunityGroups(initialGroups);
  const {
    posts,
    isLoading: postsLoading,
    createPost,
    isCreating,
    refetch
  } = useCommunityPosts({
    groupId: activeGroupId !== "all" ? activeGroupId : undefined,
    limit: 30,
    initialPosts: activeGroupId === "all" ? initialPosts : undefined
  });

  const totalDiscussionsCount = totalPostsCount;

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    const contentWithTags = newPostTags.trim()
      ? `${newPostContent.trim()}\n\n${newPostTags.trim()}`
      : newPostContent.trim();

    try {
      const created = await createPost({
        content: contentWithTags,
        visibility: activeGroupId !== "all" ? "GROUP" : "PUBLIC",
        groupId: activeGroupId !== "all" ? activeGroupId : undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        linkUrls: linkUrls.length > 0 ? linkUrls : undefined
      });

      if (created) {
        setNewPostContent("");
        setNewPostTags("");
        setImageUrls([]);
        setLinkUrls([]);
        setLinkInput("");
        setShowLinkInput(false);
        refetch();
      }
    } catch (e) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="community-page min-h-screen pt-24 pb-28 bg-background">
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

      {/* Page Hero */}
      <header className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
            {/* Copy */}
            <div className="flex-1 min-w-0 max-w-2xl">
              <span className="section-label">COMMUNITY ENGINE</span>
              <h1 className="display-1">Connect &amp; <span className="gradient-text">Co-Build</span></h1>
              <p className="text-secondary" style={{ maxWidth: "600px", marginTop: "var(--space-md)" }}>
                Ask questions, join custom study groups, find hackathon teammates, and learn out loud alongside 15,000+ tech students.
              </p>
            </div>

            {/* Illustration */}
            <div className="relative shrink-0 hidden lg:block lg:ml-auto w-[340px] xl:w-[400px]">
              <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
                <div className="absolute -top-6 -right-6 w-28 h-28 opacity-25 [background-image:radial-gradient(#F0771A_1.5px,transparent_1.5px)] [background-size:14px_14px]" />
                <span className="absolute top-6 -left-6 w-3 h-3 rotate-45 rounded-[2px] bg-[#226CE0]/50" />
                <span className="absolute bottom-10 -left-9 w-2.5 h-2.5 rotate-45 rounded-[2px] bg-[#7C3AED]/45" />
              </div>

              <Image
                src="https://res.cloudinary.com/dypbafujn/image/upload/e_trim/v1785299616/community_sgnfdl.png"
                alt=""
                width={1328}
                height={871}
                quality={85}
                priority
                sizes="(min-width: 1280px) 400px, 340px"
                className="w-full h-auto select-none pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="community-layout">
            
            {/* Left Sidebar: Specialized Groups */}
            <aside className="groups-sidebar">
              <div className="sidebar-title">Specialized Groups</div>
              
              <div 
                className={`group-item ${activeGroupId === "all" ? "active" : ""}`}
                onClick={() => setActiveGroupId("all")}
              >
                <span>🌐 All Discussions</span>
                <span className="group-count">{groupsLoading ? "..." : totalDiscussionsCount}</span>
              </div>

              {groupsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <CommunityGroupItemSkeleton key={i} />
                ))
              ) : (
                groups && groups.map(group => (
                  <div 
                    key={group.id}
                    className={`group-item ${activeGroupId === group.id ? "active" : ""}`}
                    onClick={() => setActiveGroupId(group.id)}
                  >
                    <span>💬 {group.name}</span>
                    <span className="group-count">{group.postCount || 0}</span>
                  </div>
                ))
              )}

              {/* Actions Divider */}
              <div style={{ height: "1px", background: "var(--border-subtle)", margin: "8px 0" }} />

              {/* Redirect Action Links */}
              <Link href="/community/groups" className="group-item" style={{ color: "var(--violet)", fontWeight: 700 }}>
                <span>🌐 Join a Group</span>
                <span>➜</span>
              </Link>
              
              {session ? (
                <Link href="/community/groups?create=true" className="group-item" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  <span>➕ Create a Group</span>
                  <span>➜</span>
                </Link>
              ) : (
                <Link href="/auth/login?callbackUrl=/community/groups?create=true" className="group-item" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  <span>➕ Create a Group</span>
                  <span>➜</span>
                </Link>
              )}
            </aside>

            {/* Center Column: Post Feed */}
            <main className="feed-container">
              
              {/* Create Post Card */}
              {session ? (
                <div className="create-post-card">
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "var(--space-md)", color: "var(--text-primary)" }}>
                    Share with the Community
                  </h2>
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="create-post-textarea"
                    placeholder="Share a recent win, drop a project Github link, or ask a question..."
                    disabled={isCreating}
                  />

                  {/* Image Previews */}
                  {imageUrls.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3 mt-3">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative group size-16 rounded-lg overflow-hidden border border-border/50">
                          <Image src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" width={64} height={64} />
                          <button
                            type="button"
                            onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-white rounded-full opacity-100 transition-opacity"
                          >
                            <X className="size-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link Previews */}
                  {linkUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 mt-3">
                      {linkUrls.map((url, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full text-xs border border-border/30">
                          <LinkIcon className="size-3 text-muted-foreground" />
                          <span className="truncate max-w-50 text-primary">{url}</span>
                          <button onClick={() => setLinkUrls(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link Input */}
                  {showLinkInput && (
                    <div className="flex gap-2 mb-3 mt-3">
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 text-sm border border-border/50 rounded-full bg-muted/20 focus:outline-none focus:ring-1 focus:ring-ring"
                        autoFocus
                      />
                      <button type="button" className="btn btn-outline btn-sm rounded-full px-3 text-xs" onClick={addLink} disabled={!linkInput.trim()}>
                        Add
                      </button>
                    </div>
                  )}

                  {/* Composer actions bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/30 mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCreating || isUploadingImage || imageUrls.length >= MAX_IMAGES}
                        title="Upload images (Max size: 5MB each, any aspect ratio)"
                      >
                        {isUploadingImage ? <Loader2Icon className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                        <span className="text-xs">{imageUrls.length > 0 ? `${imageUrls.length}/${MAX_IMAGES}` : "Image"}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full"
                        onClick={() => setShowLinkInput(!showLinkInput)}
                        disabled={linkUrls.length >= MAX_LINKS}
                      >
                        <LinkIcon className="size-4" />
                        <span className="text-xs">{linkUrls.length > 0 ? `${linkUrls.length}/${MAX_LINKS}` : "Link"}</span>
                      </button>
                    </div>
                    <div className="create-post-actions flex flex-1 sm:flex-none justify-end gap-2">
                      <input 
                        type="text"
                        value={newPostTags}
                        onChange={(e) => setNewPostTags(e.target.value)}
                        className="tag-input"
                        placeholder="Tags (e.g. #Web3 #React)"
                        disabled={isCreating}
                      />
                      <button 
                        onClick={handleCreatePost}
                        className="btn btn-primary btn-sm"
                        disabled={isCreating || isUploadingImage || !newPostContent.trim()}
                      >
                        {isCreating ? "Sharing..." : "Share Post 🚀"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="create-post-card flex flex-col items-center justify-center text-center p-6 gap-3">
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Share with the Community
                  </h2>
                  <p className="text-sm text-secondary">
                    Sign in to share a win, ask questions, or comment on discussions.
                  </p>
                  <Link href="/auth/login">
                    <button className="btn btn-primary btn-sm">Sign In to Share 🚀</button>
                  </Link>
                </div>
              )}

              {/* Feed Posts Dynamic Container */}
              <div className="feed-container">
                {postsLoading && posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2Icon className="animate-spin size-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading discussions...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 bg-card border border-border rounded-xl">
                    <MessageSquare className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No discussions found in this group yet.</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      currentUserId={session?.user?.id}
                    />
                  ))
                )}
              </div>
            </main>

          </div>
        </div>
      </section>
    </div>
  );
}
