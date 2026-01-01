"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MENTORS } from "@/lib/mock-data";
import { Search, Star, MessageCircle, Linkedin, Sparkles, Filter } from "lucide-react";

export default function MentorsPage() {
    const tags = ["All", "Frontend", "Backend", "AI/ML", "Mobile", "DevOps", "Design"];

    return (
        <div className="min-h-screen pt-24">
            {/* Hero Section */}
            <section className="relative py-16 mesh-gradient-bg noise-overlay overflow-hidden">
                <div className="absolute top-10 left-[10%] w-[300px] h-[300px] orb orb-yellow opacity-40" />
                <div className="absolute bottom-10 right-[15%] w-[250px] h-[250px] orb orb-violet opacity-30" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full glow-badge px-4 py-2 text-sm font-medium text-cyan-300 mb-6">
                            <Sparkles className="w-4 h-4" />
                            Expert Network
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            <span className="text-white inline-block text-vanish-line-1">Connect with</span> <span className="gradient-text-yellow inline-block text-vanish-line-2">Industry Mentors</span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-8">
                            Get guidance from experienced professionals who&apos;ve been in your shoes.
                        </p>
                        <div className="relative max-w-md mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input placeholder="Search mentors by name or expertise..." className="pl-12 py-6 rounded-full bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Filters */}
            <section className="py-8 bg-[#080810]">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                        {tags.map((tag, index) => (
                            <Button key={tag} variant="outline" className={`rounded-full border-white/20 ${index === 0 ? 'bg-cyan-500 text-black border-cyan-500' : 'text-gray-400 hover:bg-white/5'}`}>
                                {tag}
                            </Button>
                        ))}
                        <Button variant="outline" className="rounded-full border-white/20 text-gray-400 hover:bg-white/5">
                            <Filter className="w-4 h-4 mr-2" /> More Filters
                        </Button>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Mentors Grid */}
            <section className="py-16 bg-[#0a0a0f]">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MENTORS.map((mentor, index) => (
                            <Card key={mentor.id} className={`glass border border-white/10 hover:border-yellow-500/30 transition-all group overflow-hidden hover-lift animate-fade-in-up stagger-${(index % 6) + 1}`}>
                                <div className={`h-2 ${index % 3 === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : index % 3 === 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`} />
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-16 h-16 border-2 border-white/10 avatar-pulse">
                                            <AvatarFallback className={`text-xl font-bold ${index % 3 === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-black' : index % 3 === 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white' : 'bg-gradient-to-br from-violet-500 to-purple-500 text-white'}`}>
                                                {mentor.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="text-white text-lg group-hover:text-yellow-400 transition-colors">{mentor.name}</CardTitle>
                                            <CardDescription className="text-gray-500">{mentor.company}</CardDescription>
                                            <div className="flex items-center gap-1 mt-1 text-yellow-400">
                                                <Star className="w-4 h-4 fill-yellow-400" />
                                                <span className="text-sm">{mentor.rating}</span>
                                                <span className="text-gray-500 text-sm">• {mentor.sessions} sessions</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {mentor.expertise.map((skill) => (
                                            <Badge key={skill} className="bg-white/5 text-gray-300 border-0">{skill}</Badge>
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        Available for 1:1 mentoring sessions. Helping students transition into tech roles.
                                    </p>
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button className="flex-1 glow-button text-black font-semibold rounded-full">
                                        <MessageCircle className="w-4 h-4 mr-2" /> Connect
                                    </Button>
                                    <Button variant="outline" size="icon" className="rounded-full border-white/20 text-gray-400 hover:bg-white/5">
                                        <Linkedin className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Become Mentor CTA */}
            <section className="py-16 bg-[#080810]">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-xl mx-auto p-8 glass rounded-3xl border border-white/10 breathing-glow tilt-hover">
                        <h2 className="text-2xl font-bold text-white mb-3">Become a Mentor</h2>
                        <p className="text-gray-400 mb-6">Share your experience and help shape the next generation of tech talent.</p>
                        <Button className="glow-button-yellow text-black font-semibold rounded-full px-8">
                            Apply as Mentor
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
