"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Key, Folder, Code, Brain, Shield, Smartphone, Server, BookOpen, Sparkles, Zap, RotateCcw, Play, Trophy, Download, ExternalLink, ChevronRight, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ResourcesPage() {
    const [typingText, setTypingText] = useState("");
    const targetText = 'const velonx = "Building Futures";';
    const [wpm, setWpm] = useState(0);
    const [isTyping, setIsTyping] = useState(false);

    const categories = [
        { id: 1, name: "Web Development", items: 24, icon: Code, color: "bg-blue-100 text-blue-600" },
        { id: 2, name: "Data Structures", items: 36, icon: Folder, color: "bg-green-100 text-green-600" },
        { id: 3, name: "Machine Learning", items: 18, icon: Brain, color: "bg-purple-100 text-purple-600" },
        { id: 4, name: "Cybersecurity", items: 12, icon: Shield, color: "bg-red-100 text-red-600" },
        { id: 5, name: "Mobile Development", items: 15, icon: Smartphone, color: "bg-orange-100 text-orange-600" },
        { id: 6, name: "DevOps & Cloud", items: 20, icon: Server, color: "bg-cyan-100 text-cyan-600" },
    ];

    const roadmaps = [
        { title: "Frontend Developer", duration: "3-6 months", level: "Beginner", color: "#219EBC" },
        { title: "Backend Developer", duration: "4-8 months", level: "Intermediate", color: "#6A96A0" },
        { title: "Full Stack Developer", duration: "6-12 months", level: "Advanced", color: "#E9C46A" },
        { title: "AI/ML Engineer", duration: "8-12 months", level: "Advanced", color: "#F4A261" },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Searching for the best resources...");
    };

    const handleCategoryClick = (categoryName: string) => {
        window.open("https://keyracer.in", "_blank");
    };

    const handleRoadmapClick = (title: string) => {
        toast.success(`Starting your ${title} journey!`);
    };

    const handleDownload = (resourceName: string) => {
        toast.success(`Downloading ${resourceName}...`);
    };

    const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTypingText(val);
        if (!isTyping && val.length > 0) setIsTyping(true);

        if (val === targetText) {
            toast.success("Correct! Your typing speed is improving.");
            setTypingText("");
            setIsTyping(false);
            setWpm(prev => Math.min(prev + 5, 120));
        }
    };

    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/30 px-4 py-2 text-sm font-medium text-[#219EBC] mb-6 mx-auto">
                            <Sparkles className="w-4 h-4" />
                            Learning Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
                            Master New <span className="text-[#219EBC]">Skills</span> Every Day
                        </h1>
                        <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
                            Curated roadmaps, tutorials, notes, and tools to accelerate your learning journey.
                        </p>
                        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search tutorials, roadmaps, notes..." className="pl-14 py-7 rounded-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-lg shadow-sm focus:ring-2 focus:ring-[#219EBC]/20" />
                        </form>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />



            {/* Categories */}
            <section className="py-20 animate-on-scroll bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Browse by Category</h2>
                        <div className="w-20 h-1 bg-[#219EBC] mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.name)}
                                className="group bg-gray-50 hover:bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#219EBC] hover:shadow-xl transition-all text-center"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                    <cat.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#219EBC] transition-colors">{cat.name}</h3>
                                <p className="text-gray-500 text-sm">{cat.items} resources</p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roadmaps */}
            <section className="py-20 animate-on-scroll bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Step-by-Step Roadmaps</h2>
                            <p className="text-gray-500">Follow these path to master your favorite stack</p>
                        </div>
                        <Button variant="outline" className="rounded-full border-gray-300 text-gray-700 hidden md:flex">
                            View All Paths <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roadmaps.map((map) => (
                            <Card key={map.title} className="bg-white border border-gray-200 hover:border-[#219EBC] transition-all group cursor-pointer overflow-hidden shadow-sm hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-gray-50 text-gray-900">
                                            <BookOpen className="w-6 h-6" style={{ color: map.color }} />
                                        </div>
                                        <Badge className="bg-gray-100 text-gray-600 border-0">{map.level}</Badge>
                                    </div>
                                    <CardTitle className="text-gray-900 group-hover:text-[#219EBC] transition-colors">{map.title}</CardTitle>
                                    <CardDescription>{map.duration} duration</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button
                                        onClick={() => handleRoadmapClick(map.title)}
                                        className="w-full bg-gray-50 hover:bg-[#219EBC] text-[#219EBC] hover:text-white border-0 font-bold rounded-full group/btn"
                                    >
                                        Start Path <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Resources Grid */}
            <section className="py-20 animate-on-scroll bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-black text-gray-900 mb-8">Popular Downloads</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "React Cheat Sheet", type: "PDF", size: "2.4 MB" },
                            { title: "Node.js Best Practices", type: "Guide", size: "1.8 MB" },
                            { title: "System Design Primer", type: "E-Book", size: "5.2 MB" },
                        ].map((res, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#219EBC] shadow-sm">
                                        <Download className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{res.title}</h4>
                                        <p className="text-gray-500 text-sm">{res.type} • {res.size}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-[#219EBC]"
                                    onClick={() => handleDownload(res.title)}
                                >
                                    <Download className="w-5 h-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
