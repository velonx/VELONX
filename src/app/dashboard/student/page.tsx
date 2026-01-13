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
                <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const stats = [
        { icon: Zap, label: "Total XP", value: "2,450", color: "orange" },
        { icon: Trophy, label: "Rank", value: "#42", color: "violet" },
        { icon: Folder, label: "Projects", value: "3", color: "blue" },
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
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="relative py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* NFT-style Avatar with Edit Button */}
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#219EBC] shadow-xl shadow-[#219EBC]/30 bg-gradient-to-br from-[#219EBC]/20 to-gray-100 p-1 mx-auto">
                                <img
                                    src={displayAvatar}
                                    alt="Your avatar"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            </div>
                            <AvatarSelector
                                currentAvatar={userAvatar}
                                onSelectAvatar={setUserAvatar}
                                trigger={
                                    <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#219EBC] to-[#1a7a94] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                }
                            />
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#E9C46A]/20 px-4 py-1.5 text-sm font-medium text-[#8B7A52] mb-4 mx-auto">
                                <Sparkles className="w-3 h-3" /> Rising Star
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">Welcome to Velonx, {userName}!</h1>
                            <p className="text-gray-500 text-lg">Keep up the great work. You&apos;re on fire! 🔥</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Stats Grid */}
            <section className="py-8 animate-on-scroll bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="bg-white border border-gray-200 hover:border-[#219EBC] hover:shadow-lg transition-all">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color === 'orange' ? 'bg-orange-100' : stat.color === 'violet' ? 'bg-violet-100' : stat.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color === 'orange' ? 'text-orange-500' : stat.color === 'violet' ? 'text-violet-500' : stat.color === 'blue' ? 'text-[#219EBC]' : 'text-green-500'}`} />
                                    </div>
                                    <div>
                                        <div className={`text-2xl font-bold ${stat.color === 'orange' ? 'text-orange-500' : stat.color === 'violet' ? 'text-violet-500' : stat.color === 'blue' ? 'text-[#219EBC]' : 'text-green-500'}`}>{stat.value}</div>
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
            <section className="py-10 animate-on-scroll">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Actions */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-orange-400" /> Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {quickActions.map((action, i) => (
                                            <Button key={i} variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 text-gray-300 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-all">
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
                                        <Folder className="w-5 h-5 text-blue-400" /> Your Projects
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { name: "AI Study Buddy", role: "Frontend Lead", progress: 65 },
                                        { name: "E-commerce Platform", role: "Full Stack", progress: 40 },
                                    ].map((project, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <div className="text-white font-medium">{project.name}</div>
                                                    <div className="text-gray-500 text-sm">{project.role}</div>
                                                </div>
                                                <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${project.progress}%` }} />
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
                                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: '82%' }} />
                                        </div>
                                        <p className="text-gray-500 text-sm text-center">550 XP to Level 6</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Achievements */}
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-orange-400" /> Recent Achievements
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
