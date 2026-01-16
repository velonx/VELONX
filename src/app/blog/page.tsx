"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight, Search, Tag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BLOG_POSTS } from "@/lib/blog-data";
import Link from "next/link";

export default function BlogPage() {
    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
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
                        className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight"
                    >
                        Velonx <span className="text-[#219EBC]">Insights</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Explore our blog for the latest in technology, career advice, and community stories.
                    </motion.p>
                </div>
            </section>

            {/* Search & Categories */}
            <section className="py-8 border-y border-gray-100 bg-gray-50/50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#219EBC] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="w-full h-14 bg-white rounded-2xl pl-14 pr-6 border border-gray-200 focus:ring-2 focus:ring-[#219EBC] outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {["All Posts", "Technology", "Development", "Design", "Career"].map((cat, i) => (
                                <button
                                    key={i}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border ${i === 0
                                        ? "bg-[#219EBC] text-white border-[#219EBC] shadow-lg shadow-[#219EBC]/20"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-[#219EBC]/30"}`}
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {BLOG_POSTS.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="group h-full border-0 rounded-[48px] overflow-hidden bg-white shadow-2xl shadow-black/[0.03] hover:shadow-black/[0.08] transition-all duration-500 hover:-translate-y-2">
                                    <div className="aspect-[16/10] overflow-hidden relative">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <Badge className="bg-white/90 backdrop-blur-md text-[#023047] hover:bg-white border-0 py-1.5 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl">
                                                {post.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                        <CardTitle className="text-2xl font-black text-gray-900 leading-tight group-hover:text-[#219EBC] transition-colors line-clamp-2">
                                            {post.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8">
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                                            {post.content}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="px-8 pb-10 mt-auto border-t border-gray-50 pt-8 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900">{post.author.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 tracking-wider">AUTHOR</p>
                                            </div>
                                        </div>
                                        <button className="w-10 h-10 rounded-full bg-[#219EBC]/10 text-[#219EBC] flex items-center justify-center hover:bg-[#219EBC] hover:text-white transition-all">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-20 flex justify-center gap-3">
                        <button className="w-12 h-12 rounded-2xl bg-[#023047] text-white font-black shadow-lg shadow-[#023047]/20">1</button>
                        <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-500 font-black hover:border-[#219EBC]/30">2</button>
                        <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-500 font-black hover:border-[#219EBC]/30">3</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
