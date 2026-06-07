"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";
import { useCommunityPosts } from "@/lib/hooks/useCommunityPosts";
import { CommentSection } from "@/components/community/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommunityPostData } from "@/lib/types/community.types";
import { Loader2Icon, MessageSquare, ChevronUpIcon, ChevronDownIcon, Share2, Check } from "lucide-react";
import toast from "react-hot-toast";

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
    const url = `${window.location.origin}/community?postId=${post.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar" style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}>
            {authorInitials}
          </div>
          <div className="author-info">
            <h3>{post.authorName}</h3>
            <p>Student Builder</p>
          </div>
        </div>
        <div className="post-time">
          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div className="post-body">
        {displayContent}
      </div>
      
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

// Main page component
export default function CommunityPage() {
  const { data: session } = useSession();

  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  // Database hooks
  const { groups, isLoading: groupsLoading } = useCommunityGroups();
  const {
    posts,
    isLoading: postsLoading,
    createPost,
    isCreating,
    refetch
  } = useCommunityPosts({
    groupId: activeGroupId !== "all" ? activeGroupId : undefined,
    limit: 30
  });

  // Sum total post counts for "All Discussions"
  const totalDiscussionsCount = groups ? groups.reduce((acc, g) => acc + (g.postCount || 0), 0) : 0;

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
    <div className="min-h-screen pt-24 pb-28">
      {/* Scope Style */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --font-heading: var(--font-outfit), 'Inter', -apple-system, sans-serif;
          --font-body: var(--font-outfit), 'DM Sans', -apple-system, sans-serif;
          --font-mono: var(--font-geist-mono), 'JetBrains Mono', monospace;
          --transition-bounce: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
          --gradient-hero: transparent;
          --nav-height: 72px;
          --bg-primary: var(--background);
          --accent: #F0771A;
          --violet: #7C3AED;
          --violet-light: #A78BFA;
          --violet-dim: rgba(124, 58, 237, 0.15);
          --cyan: #06B6D4;
          --cyan-light: #67E8F9;
          --cyan-dim: rgba(6, 182, 212, 0.15);

          --bg-card: var(--card);
          --border-default: var(--border);
          --border-subtle: rgba(34, 108, 224, 0.08);
          --bg-secondary: var(--muted);
          --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          --glass-blur: blur(20px);
          --shadow-card: 0 12px 32px rgba(51, 77, 175, 0.07);
          --text-muted: var(--muted-foreground);
          --text-secondary: var(--muted-foreground);
          --text-primary: var(--foreground);
          --space-xs: 0.25rem;
          --space-sm: 0.5rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --space-xl: 2rem;
          --space-4xl: 6rem;
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 24px;
        }

        body, html {
          font-family: var(--font-body);
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
          color: var(--text-primary);
        }

        /* ============ TYPOGRAPHY & HEADER ============ */
        .display-1 {
          font-size: clamp(2.5rem, 6vw, 5.5rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.05;
        }

        .display-2 {
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .heading-1 {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 700;
        }

        .gradient-text {
          color: #f97316;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-xl);
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: var(--space-md);
          padding: 6px 14px;
          background: rgba(240, 119, 26, 0.08);
          border: 1px solid rgba(240, 119, 26, 0.25);
          border-radius: var(--radius-full);
        }

        /* ============ PAGE HEADER / HERO ============ */
        .page-hero {
          padding-top: calc(var(--nav-height) + var(--space-4xl));
          padding-bottom: var(--space-4xl);
          text-align: center;
          position: relative;
        }

        .page-hero-bg {
          position: absolute;
          inset: 0;
          background: var(--gradient-hero);
          pointer-events: none;
        }

        /* ============ BUTTONS ============ */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 12px 28px;
          border-radius: var(--radius-full);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          transition: all var(--transition-bounce);
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background var(--transition-fast);
        }

        .btn:hover::after { background: rgba(255,255,255,0.06); }
        .btn:active { transform: scale(0.98); }

        .btn-primary {
          background: #F0771A;
          color: white;
          box-shadow: 0 4px 14px rgba(240, 119, 26, 0.2);
        }

        .btn-primary:hover {
          background: #e0650d;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(240, 119, 26, 0.35);
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-default);
        }

        .btn-secondary:hover {
          border-color: var(--border-accent);
          background: var(--violet-dim);
          color: var(--violet-light);
        }

        .btn-sm {
          padding: 8px 18px;
          font-size: 0.8125rem;
        }

        /* ============ BADGES / PILLS ============ */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font-heading);
        }

        .badge-violet { background: var(--violet-dim); color: var(--violet); border: 1px solid rgba(51, 77, 175, 0.2); }
        .badge-cyan { background: var(--cyan-dim); color: var(--cyan); border: 1px solid rgba(34, 108, 224, 0.2); }
        .badge-green { background: rgba(13, 148, 136, 0.08); color: #0F766E; border: 1px solid rgba(13, 148, 136, 0.2); }
        .badge-amber { background: rgba(240, 119, 26, 0.08); color: #C2410C; border: 1px solid rgba(240, 119, 26, 0.2); }
        .badge-pink { background: rgba(240, 119, 26, 0.08); color: #EA580C; border: 1px solid rgba(240, 119, 26, 0.2); }

        /* ============ TAGS ============ */
        .tag {
          display: inline-block;
          padding: 4px 10px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          transition: all var(--transition-fast);
        }

        .tag:hover {
          border-color: var(--border-accent);
          color: var(--violet-light);
        }

        /* ===== COMMUNITY GRID LAYOUT ===== */
        .community-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: var(--space-xl);
          align-items: start;
          margin-bottom: var(--space-4xl);
        }

        @media (max-width: 768px) {
          .community-layout {
            grid-template-columns: 1fr;
          }
          .groups-sidebar {
            display: none;
          }
        }

        /* ===== GROUPS SIDEBAR ===== */
        .groups-sidebar {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          position: sticky;
          top: 100px;
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          box-shadow: var(--shadow-card);
        }

        .sidebar-title {
          font-size: 0.8125rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: var(--space-sm);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: var(--space-xs);
          text-align: left;
        }

        .group-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all var(--transition-normal);
          cursor: pointer;
          border: 1px solid transparent;
        }

        .group-item:hover, .group-item.active {
          background: var(--violet-dim);
          color: var(--violet);
          border-color: rgba(34, 108, 224, 0.12);
        }

        .group-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(34, 108, 224, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: var(--font-mono);
        }

        /* ===== POST FEED ===== */
        .feed-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .create-post-card {
          background: var(--bg-card);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-card);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
        }

        .create-post-textarea {
          width: 100%;
          min-height: 90px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          color: var(--text-primary);
          resize: none;
          outline: none;
          transition: all var(--transition-normal);
          margin-bottom: var(--space-md);
        }

        .create-post-textarea:focus {
          border-color: var(--violet);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 3px rgba(34, 108, 224, 0.1);
        }

        .create-post-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .tag-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          font-size: 0.8125rem;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          outline: none;
          width: 180px;
        }

        .tag-input:focus {
          border-color: var(--violet);
          background: rgba(255, 255, 255, 0.1);
        }

        /* ===== POST CARD ===== */
        .post-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-card);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          transition: all var(--transition-normal);
          text-align: left;
        }

        .post-card:hover {
          box-shadow: var(--shadow-md);
          border-color: rgba(34, 108, 224, 0.22);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .post-author {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--violet-dim);
          border: 1.5px solid var(--border-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--violet);
          font-size: 1rem;
          box-shadow: var(--shadow-sm);
        }

        .author-info h3 {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          text-align: left;
        }

        .author-info p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 2px 0 0 0;
          text-align: left;
        }

        .post-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .post-body {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
          white-space: pre-wrap;
          text-align: left;
        }

        .post-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: var(--space-lg);
        }

        .post-actions {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-md);
        }

        .post-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
          background: none;
        }

        .post-action-btn:hover {
          color: var(--violet);
        }

        .post-action-btn.active {
          color: var(--accent);
        }

        .post-action-btn.comment-btn-active {
          color: var(--violet);
        }

        /* ===== COMMENTS ===== */
        .comments-wrapper {
          margin-top: var(--space-md);
          padding-top: var(--space-md);
          border-top: 1px dotted var(--border-default);
          display: none;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .comments-wrapper.open {
          display: flex;
        }
      ` }} />

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
                // Skeletons for groups
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="group-item pointer-events-none">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-6" />
                  </div>
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
