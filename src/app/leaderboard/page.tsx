"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Diamond } from "lucide-react";
import { useLeaderboard } from "@/lib/api/hooks";
// Avatar options for users to choose from
const AVATAR_OPTIONS = [
    { id: 1, name: "Cool Ape", src: "/avatars/cool-ape.png" },
    { id: 2, name: "Robot Hero", src: "/avatars/robot-hero.png" },
    { id: 3, name: "Space Cat", src: "/avatars/space-cat.png" },
    { id: 4, name: "Wizard Owl", src: "/avatars/wizard-owl.png" },
    { id: 5, name: "Punk Dog", src: "/avatars/punk-dog.png" },
];

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

    // Fetch leaderboard from API
    const { data: leaderboardData, loading } = useLeaderboard({ pageSize: 50 });

    // Extend leaderboard with avatars (use deterministic values based on index)
    const EXTENDED_LEADERBOARD = leaderboardData?.map((user, index) => ({
        ...user,
        avatarSrc: user.image || AVATAR_OPTIONS[index % AVATAR_OPTIONS.length].src,
        followers: Math.floor((index * 137 + 1000) % 15000) + 1000,
        prize: index === 0 ? 100000 : index === 1 ? 50000 : index === 2 ? 20000 : Math.floor(1000 / (index + 1)) * 100,
        earnPoints: 2000,
    })) || [];

    const top3 = EXTENDED_LEADERBOARD.slice(0, 3);


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
            <section className="relative py-12 bg-background overflow-hidden">

                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto mb-12">
                    </div>

                    {/* Period Toggle */}
                    <div className="flex justify-center mb-16">
                        <div className="inline-flex bg-muted rounded-2xl p-1.5 border border-border">
                            {[
                                { id: "daily", label: "Daily" },
                                { id: "monthly", label: "Monthly" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-10 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                        ? "bg-background text-primary shadow-lg shadow-black/5"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Top 3 Podium */}
                    <div className="flex justify-center items-end gap-3 md:gap-12 mb-16 relative">
                        {/* 2nd Place */}
                        <div className="text-center group animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-[24px] overflow-hidden border-4 border-border/50 shadow-2xl bg-background p-2 group-hover:scale-105 transition-transform">
                                    {top3[1]?.avatarSrc ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={top3[1].avatarSrc}
                                                alt={top3[1]?.name || 'User avatar'}
                                                className="w-full h-full object-cover rounded-[18px]"
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 rounded-[18px] flex items-center justify-center">
                                            <span className="text-muted-foreground text-2xl">👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">2</div>
                            </div>
                            <h3 className="text-foreground font-bold text-lg mb-1">{top3[1]?.name}</h3>
                            <div className="flex items-center justify-center gap-1.5 mb-2 text-[#219EBC] font-semibold text-sm">
                                <Diamond className="w-4 h-4" />
                                {top3[1]?.xp.toLocaleString()} XP
                            </div>

                            {/* Podium Block */}
                            <div className="w-32 md:w-44 h-32 mt-6 bg-gradient-to-t from-muted to-card rounded-t-[32px] border-x border-t border-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center pt-8">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Silver</span>
                                <div className="text-2xl font-black text-muted-foreground/30">2nd</div>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center group -mt-12 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-700">
                            <div className="relative mb-6">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                    <Crown className="w-12 h-12 text-[#FFB703] drop-shadow-lg animate-bounce" />
                                </div>
                                <div className="w-32 h-32 md:w-44 md:h-44 mx-auto rounded-[32px] overflow-hidden border-[6px] border-[#FFB703]/30 shadow-2xl shadow-[#FFB703]/20 bg-background p-2 group-hover:scale-110 transition-transform">
                                    {top3[0]?.avatarSrc ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={top3[0].avatarSrc}
                                                alt={top3[0]?.name || 'User avatar'}
                                                className="w-full h-full object-cover rounded-[24px]"
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 rounded-[24px] flex items-center justify-center">
                                            <span className="text-muted-foreground text-4xl">👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#FFB703] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">1</div>
                            </div>
                            <h3 className="text-foreground font-black text-2xl mb-1">{top3[0]?.name}</h3>
                            <div className="flex items-center justify-center gap-1.5 mb-2 bg-[#FF10F0]/10 rounded-full px-4 py-1.5 mx-auto w-fit text-[#FF10F0] font-bold text-sm shadow-sm">
                                <Diamond className="w-4 h-4 animate-pulse" />
                                {top3[0]?.xp.toLocaleString()} XP
                            </div>

                            {/* Podium Block */}
                            <div className="w-36 md:w-56 h-48 mt-6 bg-gradient-to-t from-[#FFB703]/10 to-card rounded-t-[40px] border-x border-t border-[#FFB703]/20 shadow-[inset_0_2px_10px_rgba(255,183,3,0.05)] flex flex-col items-center pt-10">
                                <span className="text-sm font-bold text-[#FFB703] uppercase tracking-widest">Gold</span>
                                <div className="text-4xl font-black text-[#FFB703]/50">1st</div>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="text-center group animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-[24px] overflow-hidden border-4 border-[#F4A261]/30 shadow-2xl bg-background p-2 group-hover:scale-105 transition-transform">
                                    {top3[2]?.avatarSrc ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={top3[2].avatarSrc}
                                                alt={top3[2]?.name || 'User avatar'}
                                                className="w-full h-full object-cover rounded-[18px]"
                                            />
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 rounded-[18px] flex items-center justify-center">
                                            <span className="text-muted-foreground text-2xl">👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#F4A261] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">3</div>
                            </div>
                            <h3 className="text-foreground font-bold text-lg mb-1">{top3[2]?.name}</h3>
                            <div className="flex items-center justify-center gap-1.5 mb-2 text-[#2A9D8F] font-semibold text-sm">
                                <Diamond className="w-4 h-4" />
                                {top3[2]?.xp.toLocaleString()} XP
                            </div>

                            {/* Podium Block */}
                            <div className="w-32 md:w-44 h-24 mt-6 bg-gradient-to-t from-[#F4A261]/10 to-card rounded-t-[32px] border-x border-t border-[#F4A261]/20 shadow-[inset_0_2px_10px_rgba(244,162,97,0.02)] flex flex-col items-center pt-6">
                                <span className="text-sm font-bold text-[#F4A261] uppercase tracking-widest">Bronze</span>
                                <div className="text-2xl font-black text-[#F4A261]/50">3rd</div>
                            </div>
                        </div>
                    </div>


                </div>
            </section>

            {/* User Stats Section */}
            <section className="py-12 bg-muted/30 relative">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-8">
                            <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-3">
                                <Medal className="w-6 h-6 text-[#219EBC]" />
                                Rankings Table
                            </h2>
                            <div className="bg-background rounded-[32px] border border-border shadow-sm overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-widest bg-muted/50">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-5">Champion</div>
                                    <div className="col-span-3 text-center">Activity</div>
                                    <div className="col-span-3 text-right">XP Points</div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-border">
                                    {EXTENDED_LEADERBOARD.map((user, index) => (
                                        <div
                                            key={user.id}
                                            className={`grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-muted/50 transition-all cursor-pointer group ${session?.user?.name === user.name ? 'bg-[#219EBC]/5' : ''}`}
                                        >
                                            <div className="col-span-1 font-bold text-muted-foreground group-hover:text-[#219EBC]">{user.rank}</div>
                                            <div className="col-span-5 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-border group-hover:border-[#219EBC]/30 transition-colors">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={user.avatarSrc} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground group-hover:text-[#219EBC] transition-colors">{user.name || 'Anonymous'}</p>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground py-0 px-2 rounded-md">Lvl {user.level}</Badge>
                                                </div>
                                            </div>
                                            <div className="col-span-3 flex items-center justify-center gap-4">
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-foreground">{user.projects ?? 0}</p>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Projects</p>
                                                </div>
                                                <div className="w-px h-6 bg-border"></div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-foreground">{user.badges ?? 0}</p>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Badges</p>
                                                </div>
                                                <div className="w-px h-6 bg-border"></div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-foreground">{user.currentStreak ?? 0}</p>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Streak</p>
                                                </div>
                                            </div>
                                            <div className="col-span-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5 font-black text-foreground text-lg">
                                                    <Diamond className="w-4 h-4 text-[#219EBC]" />
                                                    {user.xp.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </section>
        </div>
    );
}
