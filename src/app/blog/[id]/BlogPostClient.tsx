"use client";

import { use, useState, useEffect } from "react";
import { blogApi } from "@/lib/api/client";
import { motion, useScroll, useSpring } from "framer-motion";
import DOMPurify from "isomorphic-dompurify";
import { Calendar, Clock, ArrowLeft, Share2, Check, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogPostSkeleton } from "@/components/boneyard";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { calculateReadTime } from "@/lib/utils/blog";
import { analytics } from "@/components/analytics";

interface RelatedPost {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  views: number;
  content: string;
  author?: { name: string | null; image: string | null } | null;
}

interface Props {
  params: Promise<{ id: string }>;
  initialPost?: any;
  relatedPosts?: RelatedPost[];
}

export default function BlogPostClient({ params, initialPost, relatedPosts = [] }: Props) {
    const { id } = use(params);
    
    const post = initialPost;
    const loading = !post;
    const error = null;
    
    const [copied, setCopied] = useState(false);
    const [clientViews, setClientViews] = useState<number | null>(null);
    const views = clientViews !== null ? clientViews : (post?.views ?? null);

    // Track blog post view on client side (once per session)
    useEffect(() => {
        if (!post || post.status !== "PUBLISHED") return;
        analytics.blogView(post.id, post.title);

        const sessionKey = `viewed_post_${id}`;
        const hasViewed = sessionStorage.getItem(sessionKey);

        if (!hasViewed) {
            blogApi.trackView(id)
                .then((res) => {
                    sessionStorage.setItem(sessionKey, "true");

                    const responseData = res as any;

                    // Instantly update local views count
                    if (responseData?.data?.views !== undefined) {
                        setClientViews(responseData.data.views);
                    } else {
                        setClientViews(prev => (prev !== null ? prev + 1 : (post.views || 0) + 1));
                    }

                    if (responseData?.data?.xpAwarded) {
                        toast.success(`🎉 You earned ${responseData.data.xpAmount} XP for reading this article!`, {
                            duration: 5000,
                            position: "bottom-right",
                            style: {
                                background: "#1A234A",
                                color: "#fff",
                                borderRadius: "20px",
                                border: "1px solid rgba(34, 108, 224, 0.3)",
                                fontSize: "12px",
                                fontWeight: "bold",
                            }
                        });
                    }
                })
                .catch((err) => {
                    console.error("Failed to track blog view:", err);
                });
        }
    }, [id, post]);

    // Reading Progress Bar
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const handleShare = async () => {
        if (!post) return;
        analytics.blogShare(post.id, post.title);
        const url = window.location.href;
        const shareData = {
            title: post.title,
            text: `Check out this article: ${post.title}`,
            url,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return <BlogPostSkeleton />;
    }

    if (error || !post) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-background">
                <h2 className="text-2xl font-bold text-foreground mb-4">Post not found</h2>
                <Link href="/blog" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>
            </div>
        );
    }

    const readTime = calculateReadTime(post.content || "");

    const getBadgeClass = (tag: string) => {
        const t = tag.toUpperCase();
        if (t.includes("PLACEMENT") || t.includes("DSA") || t.includes("PREP") || t.includes("SHEET")) {
            return "badge-violet";
        }
        if (t.includes("CAREER") || t.includes("STACK") || t.includes("TECH") || t.includes("WEB")) {
            return "badge-cyan";
        }
        if (t.includes("STUDENT") || t.includes("PATH") || t.includes("GUIDE")) {
            return "badge-green";
        }
        if (t.includes("SYSTEM") || t.includes("API") || t.includes("HIGH-LOAD") || t.includes("BACKEND")) {
            return "badge-amber";
        }
        return "badge-pink";
    };

    const getBookSessionLink = () => {
        if (!post.author?.name) return "/mentors";
        const authorLower = post.author.name.toLowerCase();
        if (authorLower.includes("staff") || authorLower.includes("team") || authorLower.includes("editorial")) {
            return "/mentors";
        }
        return `/mentors?mentor=${post.author.name.toLowerCase().replace(/\s+/g, '-')}`;
    };

    return (
        <div className="min-h-screen pt-24 bg-background pb-20 selection:bg-primary/30">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-100 origin-left"
                style={{ scaleX }}
                aria-hidden="true"
            />

            {/* Top Navigation */}
            <div className="relative z-40 w-full border-b border-border/10 mb-8 mt-4">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Articles
                    </Link>
                    <button
                        onClick={handleShare}
                        className="btn-redesign btn-redesign-primary btn-redesign-sm flex items-center gap-2"
                        type="button"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />}
                        {copied ? 'Copied' : 'Share'}
                    </button>
                </div>
            </div>

            {/* 2-Column Detail Container */}
            <div className="container mx-auto px-4 max-w-6xl p-detail-container">
                
                {/* Left Column: Article Body */}
                <motion.main 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="min-w-0"
                >
                    <header className="p-article-header text-left">
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag: string, idx: number) => (
                                    <span 
                                        key={idx} 
                                        className={`badge ${getBadgeClass(tag)} font-bold text-[9px] uppercase tracking-widest`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h1 className="p-article-title">{post.title}</h1>
                        
                        <div className="p-article-meta-row text-left">
                            <div className="p-author-info">
                                {post.author?.image ? (
                                    <Image
                                        src={post.author.image}
                                        alt={post.author.name || "Author"}
                                        width={44}
                                        height={44}
                                        className="rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                ) : (
                                    <div className="p-author-avatar">
                                        {(post.author?.name || "V").split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="font-bold text-foreground text-sm">{post.author?.name || "Velonx Team"}</div>
                                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Author</div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 ml-auto text-xs font-bold text-muted-foreground uppercase tracking-widest items-center">
                                <span>📅 {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                <span>⏱️ {readTime} min read</span>
                                <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-primary" /> {(views !== null ? views : (post.views || 0)).toLocaleString()} views</span>
                            </div>
                        </div>
                    </header>

                    {/* Cover image banner */}
                    {post.imageUrl && (
                        <div className="w-full rounded-2xl overflow-hidden mb-12 border border-border/10 relative aspect-video bg-linear-to-br from-primary/10 to-primary/5">
                            <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 768px"
                                className="object-cover"
                            />
                        </div>
                    )}

                    {/* Content text */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-2xl prose-blockquote:py-1 px-4 md:px-0 rich-text-content p-article-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                    />
                    <style jsx global>{`
                        .rich-text-content table {
                            border-collapse: collapse;
                            table-layout: fixed;
                            width: 100%;
                            margin: 1.5rem 0;
                            overflow: hidden;
                        }
                        .rich-text-content table td,
                        .rich-text-content table th {
                            min-width: 1em;
                            border: 2px solid var(--border);
                            padding: 8px;
                            vertical-align: top;
                            box-sizing: border-box;
                            position: relative;
                        }
                        .rich-text-content table th {
                            font-weight: bold;
                            text-align: left;
                            background-color: var(--card);
                        }
                        .rich-text-content ul[data-type="taskList"] {
                            list-style: none;
                            padding: 0;
                        }
                        .rich-text-content ul[data-type="taskList"] li {
                            display: flex;
                            align-items: center;
                            margin-bottom: 0.25rem;
                        }
                        .rich-text-content ul[data-type="taskList"] li > label {
                            margin-right: 0.5rem;
                            user-select: none;
                        }
                        .rich-text-content ul[data-type="taskList"] li > div {
                            flex: 1;
                        }
                    `}</style>

                    <footer className="mt-12 pt-8 border-t border-border/50 flex flex-col items-center gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                href="/blog"
                                className="btn-redesign btn-redesign-primary text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full flex items-center gap-2"
                            >
                                Return to Insights
                            </Link>
                            <button
                                onClick={handleShare}
                                className="text-muted-foreground hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                type="button"
                            >
                                <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> Share this article
                            </button>
                        </div>
                    </footer>
                </motion.main>

                {/* Right Column: Sidebar Panel */}
                <motion.aside 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="w-full"
                >
                    
                    {/* Widget 1: About the Author */}
                    {post.author && (
                        <div className="p-sidebar-widget text-left">
                            <h3 className="p-widget-title">The Author</h3>
                            <div className="flex items-center gap-3 mb-4">
                                {post.author.image ? (
                                    <Image
                                        src={post.author.image}
                                        alt={post.author.name || "Author"}
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                ) : (
                                    <div className="p-author-avatar w-12 h-12 text-sm font-black">
                                        {(post.author.name || "V").split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="font-bold text-foreground text-base leading-tight">{post.author.name || "Velonx Team"}</div>
                                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Author</div>
                                </div>
                            </div>
                            
                            {post.author.bio && (
                                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                    {post.author.bio}
                                </p>
                            )}
                            
                            <Link 
                                href={getBookSessionLink()} 
                                className="btn-redesign btn-redesign-secondary btn-redesign-sm w-full text-center flex items-center justify-center font-bold"
                            >
                                Book session with {post.author.name ? post.author.name.split(' ')[0] : 'Author'}
                            </Link>
                        </div>
                    )}

                    {/* Widget 2: Related/Trending Guides */}
                    {relatedPosts.length > 0 && (
                        <div className="p-sidebar-widget text-left">
                            <h3 className="p-widget-title">Trending Guides</h3>
                            <div className="p-widget-posts-list">
                                {relatedPosts.map((related) => (
                                    <div className="p-widget-post-item" key={related.id}>
                                        <Link 
                                            href={`/blog/${related.slug || related.id}`}
                                            className="p-widget-post-title line-clamp-2"
                                        >
                                            {related.title}
                                        </Link>
                                        <div className="p-widget-post-meta mt-1">
                                            {related.tags && related.tags[0] ? `${related.tags[0]} • ` : ''}⏱️ {calculateReadTime(related.content)} min read
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.aside>
            </div>
        </div>
    );
}
