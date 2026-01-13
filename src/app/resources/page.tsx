"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Key, Folder, Code, Brain, Shield, Smartphone, Server, BookOpen, Sparkles, Zap, RotateCcw, Play, Trophy } from "lucide-react";

export default function ResourcesPage() {
    const [typingText, setTypingText] = useState("");
    const targetText = 'const velonx = "Building Futures";';
    const [wpm, setWpm] = useState(0);

    const categories = [
        { id: 1, name: "Web Development", items: 24, icon: Code, color: "from-cyan-500 to-blue-500" },
        { id: 2, name: "Data Structures", items: 36, icon: Folder, color: "from-green-500 to-emerald-500" },
        { id: 3, name: "Machine Learning", items: 18, icon: Brain, color: "from-violet-500 to-purple-500" },
        { id: 4, name: "Cybersecurity", items: 12, icon: Shield, color: "from-red-500 to-orange-500" },
        { id: 5, name: "Mobile Development", items: 15, icon: Smartphone, color: "from-yellow-500 to-orange-500" },
        { id: 6, name: "DevOps & Cloud", items: 20, icon: Server, color: "from-cyan-500 to-teal-500" },
    ];

    const roadmaps = [
        { title: "Frontend Developer", duration: "3-6 months", level: "Beginner", color: "cyan" },
        { title: "Backend Developer", duration: "4-8 months", level: "Intermediate", color: "violet" },
        { title: "Full Stack Developer", duration: "6-12 months", level: "Advanced", color: "yellow" },
        { title: "AI/ML Engineer", duration: "8-12 months", level: "Advanced", color: "violet" },
    ];

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
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search tutorials, roadmaps, notes..." className="pl-14 py-7 rounded-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 text-lg" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* KeyRacer Section */}
            <section className="py-16 animate-on-scroll bg-gray-50">

                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                    <Key className="w-7 h-7 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">KeyRacer</h2>
                                    <p className="text-gray-500">Typing Speed Trainer</p>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-6">
                                Boost your coding speed and efficiency. Practice typing common code patterns, algorithms, and syntax.
                            </p>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="glass rounded-xl p-4 text-center border border-white/10">
                                    <div className="text-2xl font-bold gradient-text-yellow">85</div>
                                    <div className="text-gray-500 text-sm">Avg WPM</div>
                                </div>
                                <div className="glass rounded-xl p-4 text-center border border-white/10">
                                    <div className="text-2xl font-bold gradient-text-cyan">98%</div>
                                    <div className="text-gray-500 text-sm">Accuracy</div>
                                </div>
                                <div className="glass rounded-xl p-4 text-center border border-white/10">
                                    <div className="text-2xl font-bold gradient-text-violet">#42</div>
                                    <div className="text-gray-500 text-sm">Your Rank</div>
                                </div>
                            </div>
                            <Button className="glow-button-yellow text-black font-semibold rounded-full px-6">
                                <Trophy className="w-4 h-4 mr-2" /> View Leaderboard
                            </Button>
                        </div>

                        {/* Typing Practice */}
                        <div className="glass rounded-3xl p-6 border border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <Badge className="bg-green-500/20 text-green-400 border-0">JavaScript</Badge>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="font-mono">{wpm} WPM</span>
                                </div>
                            </div>

                            <div className="bg-black/30 rounded-2xl p-5 mb-5 font-mono">
                                <p className="text-gray-500 text-sm mb-2">Type this:</p>
                                <div className="text-lg typing-cursor">
                                    {targetText.split('').map((char, i) => (
                                        <span key={i} className={i < typingText.length ? typingText[i] === char ? 'text-green-400' : 'text-red-400 bg-red-400/20' : 'text-gray-500'}>
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Input
                                value={typingText}
                                onChange={(e) => { setTypingText(e.target.value); setWpm(Math.floor(Math.random() * 30) + 60); }}
                                placeholder="Start typing here..."
                                className="bg-white/5 border-white/10 text-white font-mono py-5 rounded-xl mb-4"
                            />

                            <div className="flex gap-3">
                                <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black rounded-full" onClick={() => setTypingText("")}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                                </Button>
                                <Button className="flex-1 bg-green-500 hover:bg-green-600 text-black rounded-full">
                                    <Play className="w-4 h-4 mr-2" /> Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Categories */}
            <section className="py-16 animate-on-scroll">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white mb-3">Browse by Category</h2>
                        <p className="text-gray-400">Explore our curated collection of learning resources.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {categories.map((cat) => (
                            <Card key={cat.id} className={`glass border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group hover-lift animate-fade-in-up stagger-${cat.id}`}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <cat.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white text-lg group-hover:text-cyan-400 transition-colors">{cat.name}</CardTitle>
                                        <CardDescription className="text-gray-500">{cat.items} resources</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Roadmaps */}
            <section className="py-16 animate-on-scroll">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2">Learning Roadmaps</h2>
                            <p className="text-gray-400">Structured paths to master different tech stacks</p>
                        </div>
                        <Button variant="outline" className="rounded-full border-white/20 text-gray-300 hover:bg-white/5">View All</Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {roadmaps.map((roadmap, index) => (
                            <Card key={index} className={`glass border border-white/10 hover:border-cyan-500/30 transition-all overflow-hidden group hover-lift tilt-hover animate-fade-in-up stagger-${index + 1}`}>
                                <div className={`h-24 bg-gradient-to-br ${roadmap.color === 'cyan' ? 'from-cyan-500/20 to-blue-500/20' : roadmap.color === 'violet' ? 'from-violet-500/20 to-purple-500/20' : 'from-yellow-500/20 to-orange-500/20'} flex items-center justify-center`}>
                                    <BookOpen className="w-10 h-10 text-white/50 group-hover:scale-110 transition-transform" />
                                </div>
                                <CardHeader>
                                    <Badge variant="outline" className="w-fit border-white/20 text-gray-400 mb-2">{roadmap.level}</Badge>
                                    <CardTitle className="text-white text-lg">{roadmap.title}</CardTitle>
                                    <CardDescription className="text-gray-500">{roadmap.duration}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full rounded-full" variant="outline">Start Learning</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
