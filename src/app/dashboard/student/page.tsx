"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarSelector, { AVATAR_OPTIONS } from "@/components/avatar-selector";
import { Zap, Trophy, Folder, Calendar, ArrowRight, PlusCircle, Users, BookOpen, Keyboard, Sparkles, CheckCircle, Pencil } from "lucide-react";

export default function StudentDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userAvatar, setUserAvatar] = useState(AVATAR_OPTIONS[0].src);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    // Use session avatar if available, otherwise use selected avatar
    const displayAvatar = session?.user?.image || userAvatar;
    const userName = session?.user?.name?.split(" ")[0] || "User";

    // Show loading state while checking auth
    if (status === "loading") {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const stats = [
        { icon: Zap, label: "Total XP", value: "2,450", color: "yellow" },
        { icon: Trophy, label: "Rank", value: "#42", color: "violet" },
        { icon: Folder, label: "Projects", value: "3", color: "cyan" },
        { icon: Calendar, label: "Events", value: "7", color: "green" },
    ];

    const quickActions = [
        { icon: PlusCircle, label: "Submit Idea", href: "/projects" },
        { icon: Calendar, label: "Join Event", href: "/events" },
        { icon: Users, label: "Find Mentor", href: "/mentors" },
        { icon: Keyboard, label: "Practice", href: "/resources" },
    ];

    const achievements = [
        { emoji: "🚀", title: "First Project", date: "Dec 2024" },
        { emoji: "⭐", title: "Attended 5 Events", date: "Dec 2024" },
        { emoji: "🔥", title: "7-Day Streak", date: "This Week" },
    ];

    return (
        <div className="min-h-screen pt-24">
            {/* Hero Section */}
            <section className="relative py-12 mesh-gradient-bg noise-overlay overflow-hidden">
                <div className="absolute top-10 right-[10%] w-[300px] h-[300px] orb orb-yellow opacity-40" />
                <div className="absolute bottom-0 left-[5%] w-[200px] h-[200px] orb orb-violet opacity-30" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            {/* NFT-style Avatar with Edit Button */}
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/30 bg-gradient-to-br from-cyan-600/20 to-violet-600/20 p-1">
                                    <img
                                        src={displayAvatar}
                                        alt="Your avatar"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                                <AvatarSelector
                                    currentAvatar={userAvatar}
                                    onSelectAvatar={setUserAvatar}
                                    trigger={
                                        <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    }
                                />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400 mb-2">
                                    <Sparkles className="w-3 h-3" /> Rising Star
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-white">Welcome back, {userName}!</h1>
                                <p className="text-gray-400">Keep up the great work. You&apos;re on fire! 🔥</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <AvatarSelector
                                currentAvatar={userAvatar}
                                onSelectAvatar={setUserAvatar}
                            />

                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Stats Grid */}
            <section className="py-8 bg-[#080810]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="glass border border-white/10 hover:border-cyan-500/30 transition-all">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color === 'yellow' ? 'bg-yellow-500/20' : stat.color === 'violet' ? 'bg-violet-500/20' : stat.color === 'cyan' ? 'bg-cyan-500/20' : 'bg-green-500/20'}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color === 'yellow' ? 'text-yellow-400' : stat.color === 'violet' ? 'text-violet-400' : stat.color === 'cyan' ? 'text-cyan-400' : 'text-green-400'}`} />
                                    </div>
                                    <div>
                                        <div className={`text-2xl font-bold ${stat.color === 'yellow' ? 'gradient-text-yellow' : stat.color === 'violet' ? 'gradient-text-violet' : 'gradient-text-cyan'}`}>{stat.value}</div>
                                        <div className="text-gray-500 text-sm">{stat.label}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Main Content */}
            <section className="py-10 bg-[#0a0a0f]">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Actions */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-400" /> Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {quickActions.map((action, i) => (
                                            <Button key={i} variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 text-gray-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all">
                                                <action.icon className="w-6 h-6" />
                                                <span className="text-sm">{action.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Projects */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Folder className="w-5 h-5 text-cyan-400" /> Your Projects
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { name: "AI Study Buddy", role: "Frontend Lead", progress: 65 },
                                        { name: "E-commerce Platform", role: "Full Stack", progress: 40 },
                                    ].map((project, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <div className="text-white font-medium">{project.name}</div>
                                                    <div className="text-gray-500 text-sm">{project.role}</div>
                                                </div>
                                                <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{ width: `${project.progress}%` }} />
                                                </div>
                                                <span className="text-gray-400 text-sm">{project.progress}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Upcoming Events */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-violet-400" /> Upcoming Events
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { name: "React Workshop", date: "Jan 10, 2025", type: "Online" },
                                        { name: "Hackathon 2025", date: "Jan 20, 2025", type: "Offline" },
                                    ].map((event, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                                    {event.type === 'Online' ? '💻' : '🏢'}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{event.name}</div>
                                                    <div className="text-gray-500 text-sm">{event.date}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-white/20 text-gray-400">{event.type}</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Level Progress */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Level 5</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">2,450 XP</span>
                                            <span className="text-gray-400">3,000 XP</span>
                                        </div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: '82%' }} />
                                        </div>
                                        <p className="text-gray-500 text-sm text-center">550 XP to Level 6</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Achievements */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-400" /> Recent Achievements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {achievements.map((ach, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                            <span className="text-2xl">{ach.emoji}</span>
                                            <div>
                                                <div className="text-white font-medium">{ach.title}</div>
                                                <div className="text-gray-500 text-sm">{ach.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Portfolio Status */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-green-400" /> Portfolio Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { item: "Profile Photo", done: true },
                                        { item: "Bio & Skills", done: true },
                                        { item: "3+ Projects", done: false },
                                        { item: "GitHub Connected", done: true },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className={item.done ? 'text-gray-300' : 'text-gray-500'}>{item.item}</span>
                                            {item.done ? (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                                            )}
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-3 border-t border-white/10">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Completion</span>
                                            <span className="text-green-400">75%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
