"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search, Tag, Share2, Check, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { useBlogPosts } from "@/lib/api/hooks";
import { calculateReadTime, deriveCategories } from "@/lib/utils/blog";
import type { BlogPost } from "@/lib/api/types";

export default function BlogClient() {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Posts");
    const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    // Debounce search input by 300ms to avoid API spam
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1); // reset to page 1 on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Reset to page 1 when category changes
    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category);
        setPage(1);
    }, []);

    // Fetch blog posts from API — server-side search + tag filtering
    const { data: blogPosts, loading, pagination } = useBlogPosts({
        status: 'PUBLISHED',
        pageSize: 9,
        page,
        search: debouncedSearch || undefined,
        tag: selectedCategory !== "All Posts" ? selectedCategory : undefined,
    });

    // Derive categories dynamically from all loaded posts
    const categories = useMemo(
        () => deriveCategories(blogPosts || [], ["All Posts"]),
        [blogPosts]
    );

    const handleShare = async (post: BlogPost) => {
        const slug = post.slug || post.id;
        const url = `${window.location.origin}/blog/${slug}`;
        const shareData = {
            title: post.title,
            text: `Check out this article: ${post.title}`,
            url,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            setCopiedPostId(post.id);
            setTimeout(() => setCopiedPostId(null), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-background">
                <section className="py-20 bg-background overflow-hidden relative">
                    <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
                        <Skeleton className="h-20 w-3/4 max-w-2xl mx-auto rounded-xl" />
                        <Skeleton className="h-6 w-1/2 max-w-lg mx-auto rounded-lg" />
                        <Skeleton className="h-14 w-full max-w-xl mx-auto rounded-2xl mt-10" />
                        <div className="flex flex-wrap justify-center gap-3 mt-8">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="h-10 w-24 rounded-full" />
                            ))}
                        </div>
                    </div>
                </section>
                <section className="py-20">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="group h-full border-0 rounded-[48px] overflow-hidden bg-background shadow-xl">
                                    <Skeleton className="aspect-[16/10] w-full rounded-none" />
                                    <CardHeader className="p-8 pb-4">
                                        <Skeleton className="h-4 w-32 mb-4 rounded-md" />
                                        <Skeleton className="h-8 w-full rounded-md" />
                                        <Skeleton className="h-8 w-4/5 mt-2 rounded-md" />
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8">
                                        <Skeleton className="h-4 w-full mb-2 rounded-md" />
                                        <Skeleton className="h-4 w-full mb-2 rounded-md" />
                                        <Skeleton className="h-4 w-2/3 rounded-md" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const hasResults = blogPosts && blogPosts.length > 0;
    const isFiltered = debouncedSearch.length > 0 || selectedCategory !== "All Posts";

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="py-20 bg-background overflow-hidden relative">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl text-foreground mb-8 leading-tight font-bold tracking-tight"
                    >
                        Velonx <span className="text-[#219EBC]">Insights</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-xl mx-auto leading-relaxed max-w-2xl"
                    >
                        Explore our blog for the latest in technology, career advice, and community stories.
                    </motion.p>

                    {/* Search Bar inside Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative w-full max-w-xl mx-auto group mt-10"
                    >
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#219EBC] transition-colors" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            aria-label="Search articles"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full h-14 bg-background rounded-2xl pl-14 pr-6 border border-border focus:ring-2 focus:ring-[#219EBC] outline-none transition-all shadow-sm text-foreground placeholder:text-muted-foreground"
                        />
                    </motion.div>

                    {/* Category Filters — derived dynamically from post tags */}
                    {categories.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-3 mt-8 max-w-3xl mx-auto"
                        >
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    aria-pressed={selectedCategory === category}
                                    className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                                        selectedCategory === category
                                            ? "bg-[#219EBC] text-white shadow-lg shadow-[#219EBC]/30 ring-2 ring-[#219EBC]/50"
                                            : "bg-background border border-border text-muted-foreground hover:border-[#219EBC]/50 hover:text-foreground hover:bg-[#219EBC]/5"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Blog Grid */}
            <section id="blog-grid" className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    {hasResults ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {blogPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.07 }}
                                >
                                    <Card className="group h-full border-0 rounded-3xl overflow-hidden bg-background shadow-2xl shadow-black/[0.03] hover:shadow-black/[0.08] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                                        <div className="aspect-[16/10] overflow-hidden relative border-b border-border/10">
                                            {post.imageUrl ? (
                                                <Image
                                                    src={post.imageUrl}
                                                    alt={post.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#219EBC]/20 to-[#023047]/20 group-hover:scale-105 transition-transform duration-700">
                                                    <span className="text-6xl font-black text-[#219EBC]/30">
                                                        {post.title.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="p-8 pb-4">
                                            <div className="flex items-center flex-wrap gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                                <Badge className="bg-[#219EBC]/10 text-[#219EBC] hover:bg-[#219EBC]/20 border-0 py-1 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-none">
                                                    {post.tags[0] || 'Article'}
                                                </Badge>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-2xl font-black text-foreground leading-tight group-hover:text-[#219EBC] transition-colors line-clamp-2">
                                                {post.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-4 flex-grow">
                                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-6">
                                                {post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 150) + '...'}
                                            </p>
                                            
                                            {/* Author row */}
                                            {post.author && (
                                                <div className="flex items-center gap-3">
                                                    {post.author.image ? (
                                                        <Image
                                                            src={post.author.image}
                                                            alt={post.author.name || "Author"}
                                                            width={28}
                                                            height={28}
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-[#219EBC]/20 flex items-center justify-center text-[#219EBC] text-[10px] font-black">
                                                            {(post.author.name || "A").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-bold text-foreground">
                                                        {post.author.name || "Velonx Team"}
                                                    </span>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="px-8 pb-8 mt-auto border-t border-gray-50 pt-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#219EBC]" aria-hidden="true" />
                                                    {calculateReadTime(post.content)} min read
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Eye className="w-3.5 h-3.5 text-[#219EBC]" aria-hidden="true" />
                                                    {post.views.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Share Button */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                                                    title={copiedPostId === post.id ? 'Link copied!' : 'Share'}
                                                    className="w-10 h-10 rounded-full bg-[#219EBC]/10 text-[#219EBC] flex items-center justify-center hover:bg-[#219EBC] hover:text-white transition-all"
                                                    aria-label={`Share ${post.title}`}
                                                >
                                                    {copiedPostId === post.id ? (
                                                        <Check className="w-5 h-5 text-green-500" aria-hidden="true" />
                                                    ) : (
                                                        <Share2 className="w-5 h-5" aria-hidden="true" />
                                                    )}
                                                </button>
                                                {/* Read More Button — opens in same tab */}
                                                <Link
                                                    href={`/blog/${post.slug || post.id}`}
                                                    className="w-10 h-10 rounded-full bg-[#219EBC]/10 text-[#219EBC] flex items-center justify-center hover:bg-[#219EBC] hover:text-white transition-all"
                                                    aria-label={`Read more about ${post.title}`}
                                                >
                                                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            {isFiltered ? (
                                <>
                                    <p className="text-xl font-bold">No results found</p>
                                    <p className="text-sm mt-2">
                                        Try a different search term or category.
                                    </p>
                                    <button
                                        onClick={() => { setSearchInput(""); setSelectedCategory("All Posts"); }}
                                        className="mt-6 px-6 py-2.5 rounded-full bg-[#219EBC]/10 text-[#219EBC] font-bold text-sm hover:bg-[#219EBC] hover:text-white transition-all"
                                    >
                                        Clear filters
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-bold">No blog posts yet</p>
                                    <p className="text-sm mt-2">Check back later for new content!</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Functional Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-20 flex justify-center gap-3">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    aria-label={`Page ${p}`}
                                    aria-current={p === page ? "page" : undefined}
                                    onClick={() => {
                                        setPage(p);
                                        document.getElementById('blog-grid')?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                    className={`w-12 h-12 rounded-2xl font-black transition-all ${
                                        p === page
                                            ? "bg-[#219EBC] text-white shadow-lg shadow-[#219EBC]/30"
                                            : "bg-background border border-border text-muted-foreground hover:border-[#219EBC]/30 hover:text-foreground"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
