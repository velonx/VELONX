"use client";

import { use, useEffect, useState } from "react";
import { useBlogPost } from "@/lib/api/hooks";
import { motion, useScroll, useSpring } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: post, loading, error } = useBlogPost(id);
    const [copied, setCopied] = useState(false);
    
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
            <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
                <div className="w-16 h-16 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
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

    return (
        <div className="min-h-screen pt-24 bg-background pb-20 selection:bg-[#219EBC]/30">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-[#219EBC] z-[100] origin-left"
                style={{ scaleX }}
            />

            {/* Top Navigation */}
            <div className="sticky top-24 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link 
                        href="/blog" 
                        className="flex items-center gap-2 text-muted-foreground hover:text-[#219EBC] transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Articles
                    </Link>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-5 py-2 bg-[#219EBC] text-white rounded-full hover:bg-[#1a7a94] transition-all text-[11px] font-black uppercase tracking-wider shadow-lg shadow-[#219EBC]/20 hover:scale-105 active:scale-95"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
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
                        className="flex justify-center gap-2.5"
                    >
                        {post.tags?.map((tag: string, idx: number) => (
                            <Badge key={idx} className="bg-[#219EBC]/10 text-[#219EBC] dark:text-[#219EBC] dark:bg-[#219EBC]/10 border border-[#219EBC]/20 py-1.5 px-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.15em]">
                                {tag}
                            </Badge>
                        ))}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-7xl font-black text-foreground leading-[1.05] tracking-tight"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-center gap-8 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.25em] pt-4"
                    >
                        <span className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-[#219EBC]" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="w-1.5 h-1.5 bg-[#219EBC]/30 rounded-full" />
                        <span className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-[#219EBC]" />
                            {Math.ceil((post.content?.split(' ').length || 0) / 200)} min read
                        </span>
                    </motion.div>
                </header>

                {/* Hero Image */}
                {post.imageUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="w-full rounded-[64px] overflow-hidden mb-24 shadow-4xl shadow-black/30 border border-white/5"
                    >
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-auto object-cover max-h-[700px] hover:scale-105 transition-transform duration-1000"
                        />
                    </motion.div>
                )}

                {/* Main Content */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="rich-text-content px-4 md:px-0"
                >
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </motion.div>

                {/* Footer Section */}
                <footer className="mt-32 pt-20 border-t border-border/50 flex flex-col items-center gap-10">
                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.3em]">End of Story</p>
                        <p className="text-foreground/60 text-lg italic max-w-md mx-auto">
                            "Innovation distinguishes between a leader and a follower."
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6">
                        <Link 
                            href="/blog"
                            className="group px-10 h-16 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-black/10"
                        >
                            Return to Insights
                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <button
                            onClick={handleShare}
                            className="text-muted-foreground hover:text-[#219EBC] transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                            <Share2 className="w-3.5 h-3.5" /> Share this article
                        </button>
                    </div>
                </footer>
            </article>
        </div>
    );
}

