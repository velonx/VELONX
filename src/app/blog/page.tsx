"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight, Search, Tag, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { useBlogPosts } from "@/lib/api/hooks";

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Posts");
    const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch blog posts from API
    const { data: blogPosts, loading } = useBlogPosts({
        status: 'PUBLISHED',
        pageSize: 20
    });

    const categories = ["All Posts", "Technology", "Development", "Design", "Career"];

    const handleReadMore = (post: any) => {
        setSelectedBlog(post);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedBlog(null), 300);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
                <div className="w-16 h-16 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
            </div>
        );
    }
    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="py-20 bg-background overflow-hidden relative">
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/30 px-4 py-2 text-sm font-medium text-[#219EBC] mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Latest Updates
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl text-foreground mb-8 leading-tight"
                        style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}
                    >
                        Velonx <span className="text-[#219EBC]">Insights</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed"
                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
                    >
                        Explore our blog for the latest in technology, career advice, and community stories.
                    </motion.p>
                </div>
            </section>

            {/* Search & Categories */}
            <section className="py-8 border-y border-border bg-gray-50/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#219EBC] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 bg-background rounded-2xl pl-14 pr-6 border border-border focus:ring-2 focus:ring-[#219EBC] outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border ${selectedCategory === cat
                                        ? "bg-[#219EBC] text-white border-[#219EBC] shadow-lg shadow-[#219EBC]/20"
                                        : "bg-white text-muted-foreground border-border hover:border-[#219EBC]/30"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    {blogPosts && blogPosts.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {blogPosts
                                .filter(post => 
                                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    post.content.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="group h-full border-0 rounded-[48px] overflow-hidden bg-background shadow-2xl shadow-black/[0.03] hover:shadow-black/[0.08] transition-all duration-500 hover:-translate-y-2">
                                            <div className="aspect-[16/10] overflow-hidden relative bg-gradient-to-br from-[#219EBC] to-[#023047]">
                                                {post.imageUrl ? (
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white">
                                                        <Tag className="w-16 h-16 opacity-50" />
                                                    </div>
                                                )}
                                                <div className="absolute top-6 left-6">
                                                    <Badge className="bg-background/90 backdrop-blur-md text-[#023047] hover:bg-background border-0 py-1.5 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl">
                                                        {post.tags[0] || 'Article'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardHeader className="p-8 pb-4">
                                                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        5 min
                                                    </span>
                                                </div>
                                                <CardTitle className="text-2xl font-black text-foreground leading-tight group-hover:text-[#219EBC] transition-colors line-clamp-2">
                                                    {post.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-8 pb-8">
                                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                                                    {post.excerpt || post.content.substring(0, 150) + '...'}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="px-8 pb-10 mt-auto border-t border-gray-50 pt-8 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                                                        <User className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-foreground">{post.author?.name || 'Anonymous'}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground tracking-wider">AUTHOR</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleReadMore(post)}
                                                    className="w-10 h-10 rounded-full bg-[#219EBC]/10 text-[#219EBC] flex items-center justify-center hover:bg-[#219EBC] hover:text-white transition-all"
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-xl font-bold">No blog posts found</p>
                            <p className="text-sm mt-2">Check back later for new content!</p>
                        </div>
                    )}

                    {/* Pagination - Hidden for now */}
                    {blogPosts && blogPosts.length > 9 && (
                        <div className="mt-20 flex justify-center gap-3">
                            <button className="w-12 h-12 rounded-2xl bg-[#023047] text-white font-black shadow-lg shadow-[#023047]/20">1</button>
                            <button className="w-12 h-12 rounded-2xl bg-background border border-border text-muted-foreground font-black hover:border-[#219EBC]/30">2</button>
                            <button className="w-12 h-12 rounded-2xl bg-background border border-border text-muted-foreground font-black hover:border-[#219EBC]/30">3</button>
                        </div>
                    )}
                </div>
            </section>

            {/* Blog Detail Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-[48px] p-0">
                    {selectedBlog && (
                        <div className="relative">
                            {/* Header Image */}
                            {selectedBlog.imageUrl && (
                                <div className="aspect-[21/9] overflow-hidden relative bg-gradient-to-br from-[#219EBC] to-[#023047] rounded-t-[48px]">
                                    <img
                                        src={selectedBlog.imageUrl}
                                        alt={selectedBlog.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            
                            {/* Content */}
                            <div className="p-12">
                                {/* Tags */}
                                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedBlog.tags.map((tag: string, idx: number) => (
                                            <Badge key={idx} className="bg-[#219EBC]/10 text-[#219EBC] hover:bg-[#219EBC]/20 border-0 py-1.5 px-4 rounded-xl font-bold text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Title */}
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-4xl font-black text-foreground leading-tight">
                                        {selectedBlog.title}
                                    </DialogTitle>
                                </DialogHeader>

                                {/* Meta Info */}
                                <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8 pb-8 border-b border-border">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(selectedBlog.publishedAt || selectedBlog.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {selectedBlog.author?.name || 'Anonymous'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {Math.ceil(selectedBlog.content.split(' ').length / 200)} min read
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="prose prose-lg max-w-none">
                                    <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                                        {selectedBlog.content}
                                    </div>
                                </div>

                                {/* Author Info */}
                                <div className="mt-12 pt-8 border-t border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#219EBC] to-[#023047] flex items-center justify-center text-white font-black text-xl shadow-lg">
                                            {selectedBlog.author?.name?.[0] || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-foreground">{selectedBlog.author?.name || 'Anonymous'}</p>
                                            <p className="text-sm text-muted-foreground">Author</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
