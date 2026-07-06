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
import { Loader2Icon, MessageSquare, ChevronUpIcon, ChevronDownIcon, Share2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { slugifyPost } from "@/lib/utils";

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
    const slug = slugifyPost(post.id, displayContent);

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
      <Link href={`/community/t/${slugifyPost(post.id, displayContent)}`} className="block group">
        <div className="post-body group-hover:text-primary transition-colors cursor-pointer">
          {displayContent}
        </div>
      </Link>
      
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
        groupId: activeGroupId !== "all" ? activeGroupId : undefined
      });

      if (created) {
        setNewPostContent("");
        setNewPostTags("");
        refetch();
      }
    } catch (e) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="community-page min-h-screen pt-24 pb-28 bg-background">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Community</li>
        </ol>
      </nav>

      {/* Page Hero */}
      <header className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container text-center">
          <span className="section-label">COMMUNITY ENGINE</span>
          <h1 className="display-1">Connect &amp; <span className="gradient-text">Co-Build</span></h1>
          <p className="text-secondary" style={{ maxWidth: "600px", margin: "var(--space-md) auto 0 auto" }}>
            Ask questions, join custom study groups, find hackathon teammates, and learn out loud alongside 15,000+ tech students.
          </p>
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
                  <div className="create-post-actions">
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
                      disabled={isCreating || !newPostContent.trim()}
                    >
                      {isCreating ? "Sharing..." : "Share Post 🚀"}
                    </button>
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
