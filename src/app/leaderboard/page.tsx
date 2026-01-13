"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LEADERBOARD } from "@/lib/mock-data";
import { Trophy, Medal, Zap, TrendingUp, Sparkles, Crown, Flame, Target, Users, Diamond, Clock, ChevronRight, Bell, User } from "lucide-react";

// Avatar options for users to choose from
const AVATAR_OPTIONS = [
    { id: 1, name: "Cool Ape", src: "/avatars/cool-ape.png" },
    { id: 2, name: "Robot Hero", src: "/avatars/robot-hero.png" },
    { id: 3, name: "Space Cat", src: "/avatars/space-cat.png" },
    { id: 4, name: "Wizard Owl", src: "/avatars/wizard-owl.png" },
    { id: 5, name: "Punk Dog", src: "/avatars/punk-dog.png" },
];

// Extended leaderboard with avatars and more data
const EXTENDED_LEADERBOARD = LEADERBOARD.map((user, index) => ({
    ...user,
    avatarSrc: AVATAR_OPTIONS[index % AVATAR_OPTIONS.length].src,
    followers: Math.floor(Math.random() * 15000) + 1000,
    prize: index === 0 ? 100000 : index === 1 ? 50000 : index === 2 ? 20000 : Math.floor(1000 / (index + 1)) * 100,
    earnPoints: 2000,
}));

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [timeLeft, setTimeLeft] = useState({
        days: 10,
        hours: 23,
        minutes: 59,
        seconds: 29,
    });
    const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

    const top3 = EXTENDED_LEADERBOARD.slice(0, 3);
    const rest = EXTENDED_LEADERBOARD.slice(3);

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;
                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                }
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                }
                if (hours < 0) {
                    hours = 23;
                    days--;
                }
                if (days < 0) {
                    days = 0;
                    hours = 0;
                    minutes = 0;
                    seconds = 0;
                }
                return { days, hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen pt-16 bg-white">
            {/* Hero Section with Tabs */}
            <section className="relative py-8 bg-gradient-to-b from-gray-50 to-white">

                <div className="container mx-auto px-4">
                    {/* Period Toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex bg-white/5 rounded-full p-1 border border-white/10">
                            <button
                                onClick={() => setActiveTab("daily")}
                                className={`px-8 py-2.5 rounded-full font-medium transition-all ${activeTab === "daily"
                                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-black"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setActiveTab("monthly")}
                                className={`px-8 py-2.5 rounded-full font-medium transition-all ${activeTab === "monthly"
                                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-black"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>

                    {/* Top 3 Podium */}
                    <div className="flex justify-center items-end gap-4 md:gap-8 mb-8">
                        {/* 2nd Place */}
                        <div className="text-center animate-fade-in-up stagger-2">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 md:w-28 md:h-28 mx-auto rounded-2xl overflow-hidden border-4 border-gray-400/50 shadow-xl shadow-gray-500/20 bg-gradient-to-br from-gray-700/50 to-gray-900/50 p-2">
                                    <img
                                        src={top3[1]?.avatarSrc}
                                        alt={top3[1]?.name}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">{top3[1]?.name}</h3>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Trophy className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-400 text-sm">Earn {top3[1]?.earnPoints.toLocaleString()} points</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Diamond className="w-5 h-5 text-cyan-400" />
                                <span className="text-2xl font-bold text-white">{top3[1]?.prize.toLocaleString()}</span>
                            </div>
                            <span className="text-gray-500 text-sm">Prize</span>

                            {/* Podium */}
                            <div className="w-32 md:w-40 h-32 mt-4 bg-gradient-to-t from-gray-700/30 via-gray-600/20 to-gray-500/10 rounded-t-3xl flex items-center justify-center backdrop-blur-sm border border-white/5 mx-auto">
                                <span className="text-5xl font-black text-gray-400/50">2</span>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center -mt-8 animate-fade-in-up stagger-1">
                            <div className="relative mb-4">
                                {/* Crown */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                                    <Crown className="w-10 h-10 text-yellow-400 drop-shadow-lg animate-crown-bounce" />
                                </div>
                                <div className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-2xl overflow-hidden border-4 border-yellow-400/70 shadow-2xl shadow-yellow-500/30 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 p-2">
                                    <img
                                        src={top3[0]?.avatarSrc}
                                        alt={top3[0]?.name}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-xl mb-1">{top3[0]?.name}</h3>
                            <div className="flex items-center justify-center gap-1 mb-2 bg-yellow-500/20 rounded-full px-4 py-1 mx-auto w-fit">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 text-sm font-medium">Earn {top3[0]?.earnPoints.toLocaleString()} points</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Diamond className="w-6 h-6 text-cyan-400" />
                                <span className="text-3xl font-bold gradient-text-cyan">{top3[0]?.prize.toLocaleString()}</span>
                            </div>
                            <span className="text-gray-500 text-sm">Prize</span>

                            {/* Podium */}
                            <div className="w-36 md:w-48 h-44 mt-4 bg-gradient-to-t from-yellow-600/20 via-yellow-500/10 to-yellow-400/5 rounded-t-3xl flex items-center justify-center backdrop-blur-sm border border-yellow-500/20 mx-auto">
                                <span className="text-6xl font-black gradient-text-yellow">1</span>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="text-center animate-fade-in-up stagger-3">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 md:w-28 md:h-28 mx-auto rounded-2xl overflow-hidden border-4 border-amber-600/50 shadow-xl shadow-amber-500/20 bg-gradient-to-br from-amber-700/30 to-amber-900/30 p-2">
                                    <img
                                        src={top3[2]?.avatarSrc}
                                        alt={top3[2]?.name}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">{top3[2]?.name}</h3>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-gray-400 text-sm">Earn {top3[2]?.earnPoints.toLocaleString()} points</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Diamond className="w-5 h-5 text-cyan-400" />
                                <span className="text-2xl font-bold text-white">{top3[2]?.prize.toLocaleString()}</span>
                            </div>
                            <span className="text-gray-500 text-sm">Prize</span>

                            {/* Podium */}
                            <div className="w-32 md:w-40 h-24 mt-4 bg-gradient-to-t from-amber-700/20 via-amber-600/10 to-amber-500/5 rounded-t-3xl flex items-center justify-center backdrop-blur-sm border border-amber-500/10 mx-auto">
                                <span className="text-5xl font-black text-amber-500/50">3</span>
                            </div>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="flex justify-center mb-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm">Ends in</span>
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono">
                                {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                            </div>
                        </div>
                    </div>

                    {/* User Stats Banner */}
                    <div className="max-w-2xl mx-auto mb-12">
                        {session?.user ? (
                            <div className="glass rounded-2xl px-6 py-4 border border-cyan-500/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/50">
                                        {session.user.image ? (
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold">
                                                {session.user.name?.charAt(0) || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{session.user.name}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Rank</span>
                                            <span className="text-cyan-400 font-bold">#42</span>
                                            <span className="text-gray-500">•</span>
                                            <Diamond className="w-4 h-4 text-cyan-400" />
                                            <span className="text-cyan-400 font-bold">2,450</span>
                                            <span className="text-gray-400">points</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400">Earned today</div>
                                    <div className="flex items-center gap-1">
                                        <Diamond className="w-5 h-5 text-cyan-400" />
                                        <span className="text-xl font-bold gradient-text-cyan">+50</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass rounded-2xl px-6 py-4 border border-white/10 flex items-center justify-center gap-2 text-center">
                                <User className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-400">Login to see your ranking and earn points!</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Ranking List */}
            <section className="py-8 animate-on-scroll">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 text-gray-500 text-sm font-medium border-b border-white/5">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-4">User name</div>
                        <div className="col-span-2 text-center">Followers</div>
                        <div className="col-span-3 text-center">Point</div>
                        <div className="col-span-2 text-right">Reward</div>
                    </div>

                    {/* Ranking Rows */}
                    <div className="divide-y divide-white/5">
                        {rest.map((user, index) => (
                            <div
                                key={user.rank}
                                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors animate-row-slide stagger-${index + 1}`}
                            >
                                <div className="col-span-1 text-gray-400 font-medium">{user.rank}</div>
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                        <img
                                            src={user.avatarSrc}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{user.name}</div>
                                        <div className="text-gray-500 text-sm">@{user.name.toLowerCase()}</div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center text-gray-300">{user.followers.toLocaleString()}</div>
                                <div className="col-span-3 text-center text-white font-medium">{(user.xp * 1000).toLocaleString()}</div>
                                <div className="col-span-2 text-right flex items-center justify-end gap-1">
                                    <Diamond className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400 font-medium">{user.prize.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to Earn Section */}
            <section className="py-16 animate-on-scroll">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">How to Earn XP</h2>
                    <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: Target, title: "Complete Projects", xp: "+100 XP", color: "cyan" },
                            { icon: Zap, title: "Attend Events", xp: "+50 XP", color: "orange" },
                            { icon: TrendingUp, title: "Help Others", xp: "+50 XP", color: "green" },
                            { icon: Flame, title: "Daily Streaks", xp: "+25 XP", color: "yellow" },
                        ].map((item, i) => (
                            <Card key={i} className={`glass border border-white/10 text-center group hover:border-cyan-500/30 transition-all hover-lift animate-fade-in-up stagger-${i + 1}`}>
                                <CardHeader>
                                    <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${item.color === 'cyan' ? 'bg-cyan-500/20' : item.color === 'orange' ? 'bg-orange-500/20' : item.color === 'green' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                                        <item.icon className={`w-7 h-7 ${item.color === 'cyan' ? 'text-cyan-400' : item.color === 'orange' ? 'text-orange-400' : item.color === 'green' ? 'text-green-400' : 'text-yellow-400'}`} />
                                    </div>
                                    <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge className={`${item.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' : item.color === 'orange' ? 'bg-orange-500/20 text-orange-400' : item.color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} border-0 text-lg font-bold`}>
                                        {item.xp}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
