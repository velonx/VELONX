"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Clock, ArrowRight, Search, Tag, Share2, Check, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useBlogPosts } from "@/lib/api/hooks";
import { calculateReadTime, deriveCategories } from "@/lib/utils/blog";
import type { BlogPost } from "@/lib/api/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogClient() {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Posts");
    const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const getBadgeClass = (tag: string) => {
        const t = tag.toUpperCase();
        if (t.includes("PLACEMENT") || t.includes("DSA") || t.includes("PREP") || t.includes("SHEET") || t.includes("FEATURED") || t.includes("SYSTEM")) {
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
        pageSize: 10, // Fetch slightly more to accommodate featured + grid layout
        page,
        search: debouncedSearch || undefined,
        tag: selectedCategory !== "All Posts" ? selectedCategory : undefined,
    });

    const [availableCategories, setAvailableCategories] = useState<string[]>(["All Posts"]);

    // Accumulate all categories discovered across page transitions and filters
    useEffect(() => {
        if (blogPosts && blogPosts.length > 0) {
            const currentCategories = deriveCategories(blogPosts, []);
            const timer = setTimeout(() => {
                setAvailableCategories(prev => {
                    const combined = new Set([...prev, ...currentCategories]);
                    const next = ["All Posts", ...Array.from(combined).filter(c => c !== "All Posts").sort()];
                    if (prev.length === next.length && prev.every((val, index) => val === next[index])) {
                        return prev;
                    }
                    return next;
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [blogPosts]);

    const categories = availableCategories;

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

    // Distinguish between Featured Post and regular grid posts on page 1
    const featuredPost = useMemo(() => {
        if (page === 1 && blogPosts && blogPosts.length > 0 && !debouncedSearch && selectedCategory === "All Posts") {
            return blogPosts[0];
        }
        return null;
    }, [blogPosts, page, debouncedSearch, selectedCategory]);

    const gridPosts = useMemo(() => {
        if (!blogPosts) return [];
        if (featuredPost) {
            return blogPosts.slice(1);
        }
        return blogPosts;
    }, [blogPosts, featuredPost]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 bg-background">
                <header className="relative pt-16 pb-12 bg-background overflow-hidden text-center">
                    <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                        <Skeleton className="h-6 w-44 rounded-full mb-4" />
                        <Skeleton className="h-14 w-80 rounded-xl" />
                        <Skeleton className="h-5 w-96 rounded-lg mt-4" />
                    </div>
                </header>
                <section className="py-12 bg-muted/10">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="p-blog-grid">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="p-blog-card pointer-events-none w-full min-h-87.5">
                                    <Skeleton className="p-blog-card-banner w-full h-50" />
                                    <Skeleton className="h-5 w-24 rounded mb-3 mt-4" />
                                    <Skeleton className="h-7 w-full rounded mb-4" />
                                    <Skeleton className="h-4 w-5/6 rounded mb-2" />
                                    <Skeleton className="h-4 w-4/5 rounded mb-6" />
                                    <div className="p-blog-footer mt-auto">
                                        <Skeleton className="h-5 w-28 rounded" />
                                        <Skeleton className="h-6 w-16 rounded" />
                                    </div>
                                </div>
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
            {/* Page Hero */}
            <header className="relative pt-16 pb-12 bg-background overflow-hidden text-center" aria-labelledby="page-title">
                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                    <span className="p-section-label">COMMUNITY KNOWLEDGE</span>
                    <h1 id="page-title" className="p-display-1">
                        Velonx <span className="gradient-text font-black">Blog</span>
                    </h1>
                    <p className="text-muted-foreground max-w-150 mt-4 text-base md:text-lg leading-relaxed">
                        Discover tactical guides on cracking interviews, open-source architectures, deep systems design, and tech transitions.
                    </p>
                </div>
            </header>

            {/* Filter & Search Toolbar */}
            <section className="pb-8 bg-background" aria-labelledby="filters-heading">
                <div className="container mx-auto px-4">
                    <h2 id="filters-heading" className="sr-only">Blog Filters</h2>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-border pb-8">
                        {categories.length > 1 && (
                            <div className="p-filter-chips justify-center md:justify-start">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryChange(category)}
                                        className={`p-filter-chip ${selectedCategory === category ? 'active' : ''}`}
                                        aria-label={`Filter articles by ${category}`}
                                        aria-pressed={selectedCategory === category}
                                    >
                                        {category === 'All Posts' ? 'All Topics' : category}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="p-search-bar">
                            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search articles, topics, authors..."
                                aria-label="Search articles"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="py-12 bg-muted/10">
                <div className="container mx-auto px-4 max-w-6xl">
                    
                    {/* Featured Article — Page 1 only */}
                    {featuredPost && (
                        <article className="p-blog-featured-card">
                            {featuredPost.imageUrl ? (
                                <div className="p-blog-featured-banner relative border-0">
                                    <Image
                                        src={featuredPost.imageUrl}
                                        alt={featuredPost.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="p-blog-featured-banner">
                                    {featuredPost.tags[0] || 'FEATURED'}
                                </div>
                            )}

                            <div className="flex flex-col h-full justify-between py-2 text-left">
                                <div>
                                    <div className="mb-4">
                                        <span className={`badge ${getBadgeClass(featuredPost.tags[0] || 'Featured')} font-bold text-[10px] uppercase tracking-widest`}>
                                            {featuredPost.tags[0] || 'Featured Guide'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 leading-tight">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="p-blog-desc">
                                        {featuredPost.excerpt || featuredPost.content.replace(/<[^>]*>/g, "").substring(0, 180) + '...'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                                    <span className="text-xs font-bold text-muted-foreground">
                                        Published {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString()} • {calculateReadTime(featuredPost.content)} min read
                                    </span>
                                    <Link
                                        href={`/blog/${featuredPost.slug || featuredPost.id}`}
                                        className="btn-redesign btn-redesign-primary btn-redesign-sm font-bold text-xs inline-flex items-center gap-1.5"
                                    >
                                        Read playbook <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    )}

                    {/* Regular Blog Grid */}
                    {hasResults ? (
                        <div>
                            {gridPosts.length > 0 && (
                                <div className="p-blog-grid">
                                    {gridPosts.map((post) => (
                                        <article className="p-blog-card" key={post.id}>
                                            {post.imageUrl ? (
                                                <div className="p-blog-card-banner relative border-0">
                                                    <Image
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="p-blog-card-banner">
                                                    {post.tags[0] || 'ARTICLE'}
                                                </div>
                                            )}

                                            <div className="text-left flex flex-col grow">
                                                <div className="flex items-center flex-wrap gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                                    <span className={`badge ${getBadgeClass(post.tags[0] || 'Article')} font-bold text-[9px] uppercase tracking-widest`}>
                                                        {post.tags[0] || 'Article'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                
                                                <h3 className="p-blog-title hover:text-primary transition-colors line-clamp-2">
                                                    <Link href={`/blog/${post.slug || post.id}`}>
                                                        {post.title}
                                                    </Link>
                                                </h3>
                                                
                                                <p className="p-blog-desc">
                                                    {post.excerpt || post.content.replace(/<[^>]*>/g, "").substring(0, 120) + '...'}
                                                </p>
                                                
                                                {/* Author profile block */}
                                                {post.author && (
                                                    <div className="flex items-center gap-2 mb-4">
                                                        {post.author.image ? (
                                                            <Image
                                                                src={post.author.image}
                                                                alt={post.author.name || "Author"}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-black">
                                                                {(post.author.name || "A").charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-bold text-foreground">
                                                            {post.author.name || "Velonx Team"}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="p-blog-footer">
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                                            {calculateReadTime(post.content)} min
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3.5 h-3.5 text-primary" />
                                                            {(post.views ?? 0).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {/* Share Action */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                                                            title={copiedPostId === post.id ? 'Link copied!' : 'Share'}
                                                            className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all touch-target"
                                                            aria-label={`Share ${post.title}`}
                                                            type="button"
                                                        >
                                                            {copiedPostId === post.id ? (
                                                                <Check className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <Share2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        {/* Read More Link */}
                                                        <Link
                                                            href={`/blog/${post.slug || post.id}`}
                                                            className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                                            aria-label={`Read ${post.title}`}
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-card rounded-2xl border border-border italic text-muted-foreground shadow-sm">
                            <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            {isFiltered ? (
                                <>
                                    <p className="text-xl font-bold">No results found</p>
                                    <p className="text-sm mt-2">Try a different search term or topic chip.</p>
                                    <button
                                        onClick={() => { setSearchInput(""); setSelectedCategory("All Posts"); }}
                                        className="mt-6 px-6 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
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
                                    className={`w-11 h-11 rounded-xl font-black transition-all ${
                                        p === page
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "bg-background border border-border text-muted-foreground hover:border-primary hover:text-foreground"
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
