"use client";

import { use, useState, useEffect } from "react";
import { useBlogPost } from "@/lib/api/hooks";
import { blogApi } from "@/lib/api/client";
import { motion, useScroll, useSpring } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Check, Eye, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { calculateReadTime } from "@/lib/utils/blog";

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
    
    // Use server-provided post data directly instead of fetching on the client,
    // which eliminates TTFB and Resource Load Delay on the client side.
    const post = initialPost;
    const loading = !post;
    const error = null;
    
    const [copied, setCopied] = useState(false);
    const [views, setViews] = useState<number | null>(null);

    // Sync local views state with fetched post views when post is loaded
    useEffect(() => {
        if (post) {
            setViews(post.views || 0);
        }
    }, [post]);

    // Track blog post view on client side (once per session)
    useEffect(() => {
        if (!post || post.status !== "PUBLISHED") return;

        const sessionKey = `viewed_post_${id}`;
        const hasViewed = sessionStorage.getItem(sessionKey);

        if (!hasViewed) {
            blogApi.trackView(id)
                .then((res) => {
                    sessionStorage.setItem(sessionKey, "true");

                    const responseData = res as any;

                    // Instantly update the local views count state from the API response
                    if (responseData?.data?.views !== undefined) {
                        setViews(responseData.data.views);
                    } else {
                        setViews(prev => (prev !== null ? prev + 1 : 1));
                    }

                    if (responseData?.data?.xpAwarded) {
                        toast.success(`🎉 You earned ${responseData.data.xpAmount} XP for reading this article!`, {
                            duration: 5000,
                            position: "bottom-right",
                            style: {
                                background: "#023047",
                                color: "#fff",
                                borderRadius: "20px",
                                border: "1px solid rgba(33, 158, 188, 0.3)",
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
        return (
            <div className="min-h-screen pt-24 bg-background pb-20">
                {/* Sticky nav skeleton */}
                <div className="sticky top-24 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <Skeleton className="h-5 w-32 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                </div>
                <article className="container mx-auto px-4 max-w-3xl pt-20 space-y-10">
                    {/* Tags + title + meta */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center gap-2">
                            <Skeleton className="h-7 w-20 rounded-xl" />
                            <Skeleton className="h-7 w-20 rounded-xl" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-8 w-4/5 mx-auto rounded-xl" />
                        <div className="flex justify-center gap-8">
                            <Skeleton className="h-5 w-28 rounded-md" />
                            <Skeleton className="h-5 w-20 rounded-md" />
                            <Skeleton className="h-5 w-20 rounded-md" />
                        </div>
                    </div>
                    {/* Hero image */}
                    <Skeleton className="w-full h-[360px] rounded-[48px]" />
                    {/* Content lines */}
                    <div className="space-y-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Skeleton key={i} className={`h-4 rounded-md ${i % 4 === 3 ? "w-3/4" : "w-full"}`} />
                        ))}
                    </div>
                </article>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-background">
                <h2 className="text-2xl font-bold text-foreground mb-4">Post not found</h2>
                <Link href="/blog" className="text-[#219EBC] hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>
            </div>
        );
    }

    const readTime = calculateReadTime(post.content || "");

    return (
        <div className="min-h-screen pt-24 bg-background pb-20 selection:bg-[#219EBC]/30">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-[#219EBC] z-[100] origin-left"
                style={{ scaleX }}
                aria-hidden="true"
            />

            {/* Top Navigation */}
            <div className="relative z-40 w-full border-b border-border/10 mb-8 mt-4">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-3xl">
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 text-muted-foreground hover:text-[#219EBC] transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Articles
                    </Link>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-5 py-2 bg-[#219EBC] text-white rounded-full hover:bg-[#1a7a94] transition-all text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[#219EBC]/20 hover:scale-105 active:scale-95"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />}
                            {copied ? 'Copied' : 'Share'}
                        </button>
                    </div>
                </div>
            </div>

            <article className="container mx-auto px-4 max-w-3xl pt-20">
                {/* Header Content */}
                <header className="text-center space-y-10 mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center gap-2.5 flex-wrap"
                    >
                        {post.tags?.map((tag: string, idx: number) => (
                            <Badge key={idx} className="bg-[#219EBC]/10 text-[#219EBC] dark:text-[#219EBC] dark:bg-[#219EBC]/10 border border-[#219EBC]/20 py-1.5 px-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.15em]">
                                {tag}
                            </Badge>
                        ))}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight text-balance"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center gap-6 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.25em] pt-4 flex-wrap"
                    >
                        <span className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-[#219EBC]" aria-hidden="true" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="w-1.5 h-1.5 bg-[#219EBC]/30 rounded-full hidden sm:block" aria-hidden="true" />
                        <span className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-[#219EBC]" aria-hidden="true" />
                            {readTime} min read
                        </span>
                        <span className="w-1.5 h-1.5 bg-[#219EBC]/30 rounded-full hidden sm:block" aria-hidden="true" />
                        <span className="flex items-center gap-2.5">
                            <Eye className="w-4 h-4 text-[#219EBC]" aria-hidden="true" />
                            {(views !== null ? views : (post.views || 0)).toLocaleString()} views
                        </span>
                    </motion.div>
                </header>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full rounded-3xl overflow-hidden mb-24 shadow-2xl shadow-black/20 border border-border/10 relative aspect-[16/9] bg-gradient-to-br from-[#219EBC]/10 to-[#023047]/10"
                >
                    {post.imageUrl ? (
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            priority
                            fetchPriority="high"
                            sizes="(max-width: 768px) 100vw, 768px"
                            className="object-cover hover:scale-105 transition-transform duration-1000"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-8xl md:text-9xl font-black text-[#219EBC]/20 select-none">
                                {post.title.charAt(0)}
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-[#219EBC] hover:prose-a:text-[#1a7a94] prose-img:rounded-[32px] prose-img:shadow-2xl prose-blockquote:border-l-[#219EBC] prose-blockquote:bg-[#219EBC]/5 prose-blockquote:rounded-r-2xl prose-blockquote:py-1 px-4 md:px-0 rich-text-content mx-auto"
                >
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </motion.div>

                {/* Author Card */}
                {post.author && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-20 p-8 rounded-[32px] bg-[#219EBC]/5 border border-[#219EBC]/10 flex items-start gap-6"
                    >
                        <div className="shrink-0">
                            {post.author.image ? (
                                <Image
                                    src={post.author.image}
                                    alt={post.author.name || "Author"}
                                    width={64}
                                    height={64}
                                    className="rounded-full object-cover ring-2 ring-[#219EBC]/20"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[#219EBC]/20 flex items-center justify-center text-[#219EBC] text-2xl font-black">
                                    {(post.author.name || "V").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-1">Written by</p>
                            <p className="text-foreground font-black text-lg leading-tight">
                                {post.author.name || "Velonx Team"}
                            </p>
                            {post.author.bio && (
                                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                                    {post.author.bio}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Footer Section */}
                <footer className="mt-16 pt-16 border-t border-border/50 flex flex-col items-center gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link
                            href="/blog"
                            className="group px-10 h-14 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/10"
                        >
                            Return to Insights
                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                        <button
                            onClick={handleShare}
                            className="text-muted-foreground hover:text-[#219EBC] transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                            <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> Share this article
                        </button>
                    </div>
                </footer>
            </article>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <section className="mt-24 border-t border-border/50 py-20 bg-background">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-12 text-center"
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#219EBC] mb-3">Continue Reading</p>
                            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                                More from Velonx <span className="text-[#219EBC]">Insights</span>
                            </h2>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map((related, index) => (
                                <motion.div
                                    key={related.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={`/blog/${related.slug || related.id}`}
                                        className="group block rounded-3xl overflow-hidden bg-background border border-border/50 hover:border-[#219EBC]/30 shadow-lg hover:shadow-xl hover:shadow-black/[0.06] transition-all duration-500 hover:-translate-y-1"
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-[16/10] relative bg-gradient-to-br from-[#219EBC]/20 to-[#023047]/20 overflow-hidden border-b border-border/10">
                                            {related.imageUrl ? (
                                                <Image
                                                    src={related.imageUrl}
                                                    alt={related.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-4xl font-black text-[#219EBC]/30">
                                                        {related.title.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div className="p-6">
                                            {/* Tags */}
                                            {related.tags.length > 0 && (
                                                <span className="inline-block bg-[#219EBC]/10 text-[#219EBC] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-3">
                                                    {related.tags[0]}
                                                </span>
                                            )}

                                            {/* Title */}
                                            <h3 className="text-foreground font-black text-lg leading-tight group-hover:text-[#219EBC] transition-colors line-clamp-2 mb-3">
                                                {related.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                                                {related.excerpt ||
                                                    related.content.replace(/<[^>]*>/g, "").substring(0, 100) + "..."}
                                            </p>

                                            {/* Meta row */}
                                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3 text-[#219EBC]" aria-hidden="true" />
                                                        {calculateReadTime(related.content)} min
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Eye className="w-3 h-3 text-[#219EBC]" aria-hidden="true" />
                                                        {related.views.toLocaleString()}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1 text-[#219EBC] group-hover:gap-2 transition-all">
                                                    Read <ArrowRight className="w-3 h-3" aria-hidden="true" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
