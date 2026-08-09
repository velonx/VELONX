"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarImage } from "@/components/responsive-image";
import { ArrowLeft, MessageSquare, Share2, Check, Lock, ChevronUp, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { CommentSection } from "@/components/community/CommentSection";
import { PostImageGallery } from "@/components/community/PostImageGallery";

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

interface ThreadClientProps {
  post: any;
  initialComments: any[];
  relatedPosts: any[];
  sessionUser: any;
  slug: string;
}

export default function ThreadClient({
  post,
  initialComments,
  relatedPosts,
  sessionUser,
  slug
}: ThreadClientProps) {
  const [localScore, setLocalScore] = useState(post.score !== undefined ? post.score : (post.upvotes - post.downvotes) || 0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [copied, setCopied] = useState(false);

  const authorInitials = getInitials(post.authorName);
  const avatarStyle = getAvatarStyle(post.authorName);

  // Render post content with inline hashtags highlighted in blue.
  const renderContent = (content: string) =>
    content.split(/(#\w+)/g).map((part, i) =>
      /^#\w+$/.test(part)
        ? <span key={i} className="post-hashtag">{part}</span>
        : <span key={i}>{part}</span>
    );

  const handleVote = async () => {
    if (!sessionUser) {
      toast.error("You must be signed in to upvote");
      return;
    }

    const action = isUpvoted ? "remove" : "upvote";
    setIsUpvoted(!isUpvoted);
    setLocalScore((prev: number) => isUpvoted ? prev - 1 : prev + 1);

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
      setIsUpvoted(isUpvoted);
      setLocalScore((prev: number) => isUpvoted ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community/t/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="community-page min-h-screen pt-24 pb-28 bg-background">
      <div className="container max-w-5xl">
        {/* Back Link */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/community" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Discussions
          </Link>
        </div>

        {/* Main Grid: Thread Left, Related Sidebar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Thread Body */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* The Post Card */}
            <Card className="post-card p-6 md:p-8">
              <div className="post-header mb-6">
                <div className="post-author">
                  {post.authorImage ? (
                    <AvatarImage
                      src={post.authorImage}
                      alt={post.authorName}
                      size={48}
                      className="author-avatar object-cover shrink-0"
                    />
                  ) : (
                    <div className="author-avatar size-12 text-lg font-bold" style={{ backgroundColor: avatarStyle.bg, color: avatarStyle.text }}>
                      {authorInitials}
                    </div>
                  )}
                  <div className="author-info">
                    <h3 className="text-base font-extrabold text-foreground">{post.authorName}</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      Student Builder {post.authorCollege ? `from ${post.authorCollege}` : ''}
                    </p>
                  </div>
                </div>
                <div className="post-time text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {post.groupName && (
                <div className="mb-4">
                  <Badge variant="secondary" className="bg-[#226CE0]/10 text-[#226CE0] font-bold text-xs">
                    💬 {post.groupName}
                  </Badge>
                </div>
              )}

              <div className="post-body text-base md:text-lg text-foreground/90 leading-relaxed mb-6 whitespace-pre-wrap">
                {renderContent(post.content)}
              </div>

              {/* Images */}
              {post.imageUrls && post.imageUrls.length > 0 && (
                <div className="mb-6">
                  <PostImageGallery images={post.imageUrls} />
                </div>
              )}

              {/* Links */}
              {post.linkUrls && post.linkUrls.length > 0 && (
                <div className="space-y-2 mt-3 mb-6">
                  {post.linkUrls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors">
                      <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate text-primary font-medium">{url}</span>
                    </a>
                  ))}
                </div>
              )}

              <div className="post-actions pt-4 border-t border-border/50">
                <button className={`post-action-btn gap-2 text-sm ${isUpvoted ? 'active' : ''}`} onClick={handleVote}>
                  <ChevronUp className="size-5" />
                  <span>{isUpvoted ? "Upvoted" : "Upvote"}</span>
                  <span className="upvote-count font-black ml-1">{localScore}</span>
                </button>
                <div className="post-action-btn gap-2 text-sm text-muted-foreground font-bold">
                  <MessageSquare className="size-4" />
                  <span>{post.commentCount} Comments</span>
                </div>
                <button className="post-action-btn gap-2 text-sm ml-auto" onClick={handleShare}>
                  {copied ? (
                    <>
                      <Check className="size-4 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-4" />
                      <span>Share Thread</span>
                    </>
                  )}
                </button>
              </div>
            </Card>

            {/* Comments Gated Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                💬 Discussion ({post.commentCount})
              </h2>

              {sessionUser ? (
                // Full interactive comments section for logged in users
                <div className="bg-card border rounded-3xl p-6 shadow-sm">
                  <CommentSection postId={post.id} />
                </div>
              ) : (
                // Limited comments list for guest users
                <div className="space-y-4">
                  {initialComments.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-xl">
                      <MessageSquare className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">No replies yet. Be the first to join the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {initialComments.map((comment) => {
                        const commentInitials = getInitials(comment.author.name);
                        const commentAvatarStyle = getAvatarStyle(comment.author.name);
                        return (
                          <div key={comment.id} className="p-4 md:p-6 bg-card border border-border rounded-2xl space-y-3">
                            <div className="flex items-center gap-3">
                              {comment.author.image ? (
                                <AvatarImage
                                  src={comment.author.image}
                                  alt={comment.author.name}
                                  size={36}
                                  className="author-avatar object-cover shrink-0"
                                />
                              ) : (
                                <div className="author-avatar size-9 text-xs font-bold" style={{ backgroundColor: commentAvatarStyle.bg, color: commentAvatarStyle.text }}>
                                  {commentInitials}
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-bold text-foreground">{comment.author.name}</h4>
                                <p className="text-[10px] text-muted-foreground">
                                  Student Builder {comment.author.college ? `• ${comment.author.college}` : ''}
                                </p>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap pl-1">
                              {comment.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Blurred Gated CTA for Remaining Comments */}
                  {post.commentCount > initialComments.length && (
                    <div className="relative mt-8 pt-8">
                      <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-transparent z-10 flex flex-col items-center justify-end text-center pb-8 px-4">
                        <div className="backdrop-blur-md bg-card/75 border border-border/80 shadow-2xl p-8 rounded-3xl max-w-md w-full">
                          <Lock className="w-10 h-10 mx-auto mb-4 text-[#F0771A]" />
                          <h3 className="text-xl font-bold mb-2 text-foreground">Sign in to read more</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            There are {post.commentCount - initialComments.length} more replies. Sign in to read them and join the conversation.
                          </p>
                          <Link href={`/auth/login?callbackUrl=/community/t/${slug}`} className="w-full">
                            <Button className="w-full rounded-full bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold py-2.5 shadow-lg shadow-[#F0771A]/20 transition-all">
                              Sign In to Velonx Connect 🚀
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className="opacity-15 select-none blur-xs space-y-4">
                        <div className="p-5 border rounded-2xl bg-card">
                          <div className="w-24 h-4 bg-muted rounded mb-2" />
                          <div className="w-full h-8 bg-muted rounded" />
                        </div>
                        <div className="p-5 border rounded-2xl bg-card">
                          <div className="w-32 h-4 bg-muted rounded mb-2" />
                          <div className="w-full h-12 bg-muted rounded" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Related Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 sticky top-28 shadow-sm">
              <h3 className="text-base font-extrabold text-foreground mb-4 pb-2 border-b border-border/50">
                Related Discussions
              </h3>
              {relatedPosts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No related threads found.</p>
              ) : (
                <ul className="space-y-4">
                  {relatedPosts.map((rPost) => {
                    const rSlug = rPost.slug;
                    return (
                      <li key={rPost.id} className="group">
                        <Link href={`/community/t/${rSlug}`} className="block">
                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {rPost.content.replace(/(?:\s*#\w+)+\s*$/, "").slice(0, 80)}...
                          </h4>
                          <span className="text-[10px] text-muted-foreground mt-1 block">
                            by {rPost.author.name || "Anonymous"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
