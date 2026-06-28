"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLeaderboard } from "@/lib/api/hooks";
import Image from "next/image";
import Link from "next/link";
import { BoneyardLoader, LeaderboardPodiumSkeleton, LeaderboardRowSkeleton } from "@/components/boneyard";
import { motion } from "framer-motion";
import { getTier, getTierLabel } from "@/lib/utils/tiers";

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "elite" | "builder" | "rising">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    // Fetch leaderboard from API (load up to 1000 users for client-side search/filtering)
    const { data: leaderboardData, loading } = useLeaderboard({ pageSize: 1000 });

    // Reset to page 1 when search query or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter]);



    const getChangeIcon = (change: string) => {
        if (change === "up") return (
            <span className="lb-rank-change up" title="Moved up">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline-block">
                    <path d="M5 1L9 8H1L5 1Z" fill="#22c55e"/>
                </svg>
            </span>
        );
        if (change === "down") return (
            <span className="lb-rank-change down" title="Moved down">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline-block">
                    <path d="M5 9L1 2H9L5 9Z" fill="#ef4444"/>
                </svg>
            </span>
        );
        return (
            <span className="lb-rank-change same" title="No change">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="inline-block">
                    <rect x="0" y="1.5" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.4"/>
                    <rect x="0" y="4" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.2"/>
                </svg>
            </span>
        );
    };

    const getAvatarColor = (idx: number) => {
        const colors = ["#226CE0", "#f0771a", "#059669", "#7c3aed", "#0891b2"];
        return colors[idx % colors.length];
    };

    const getAvatarHtml = (user: any, index: number) => {
        const isTop = user.rank <= 3;
        const medalColors: Record<number, string> = { 1: "#f0c81a", 2: "#b4bec8", 3: "#cd7f32" };
        const medalColor = medalColors[user.rank];
        const initials = (user.name || "V").split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

        if (user.image) {
            return (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                    <Image src={user.image} alt={user.name || "User"} width={40} height={40} className="w-full h-full object-cover" />
                </div>
            );
        }

        if (isTop) {
            return (
                <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
                    <circle cx="20" cy="20" r="19" fill="none" stroke={medalColor} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7">
                        <animateTransform attributeName="transform" type="rotate" values="0 20 20;360 20 20" dur="10s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="20" cy="20" r="15" fill={medalColor} opacity="0.15"/>
                    <circle cx="20" cy="20" r="15" fill="none" stroke={medalColor} strokeWidth="1"/>
                    <text x="20" y="24.5" textAnchor="middle" fontSize="10" fontWeight="900" fill={medalColor}>{initials}</text>
                </svg>
            );
        }

        return (
            <div className="lb-user-avatar" style={{ background: getAvatarColor(index) }}>
                {initials}
            </div>
        );
    };

    // Process & map leaderboard users
    const EXTENDED_LEADERBOARD = leaderboardData?.map((user, index) => {
        const rank = user.rank || (index + 1);
        const change = index % 4 === 0 ? "up" : index % 4 === 1 ? "down" : "same";
        return {
            ...user,
            rank,
            change
        };
    }) || [];

    const top3 = EXTENDED_LEADERBOARD.slice(0, 3);
    const first = top3.find(u => u.rank === 1);
    const second = top3.find(u => u.rank === 2);
    const third = top3.find(u => u.rank === 3);

    const firstInitials = first ? (first.name || "V").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "KS";
    const secondInitials = second ? (second.name || "V").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "AT";
    const thirdInitials = third ? (third.name || "V").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "RM";

    // Filtering logic
    const filteredUsers = EXTENDED_LEADERBOARD.filter((user) => {
        const tier = getTier(user.xp);
        const matchesFilter = activeFilter === "all" || tier === activeFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            user.name?.toLowerCase().includes(q) ||
            getTierLabel(tier).toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const currentUserEntry = EXTENDED_LEADERBOARD.find(
        (user) => user.name === session?.user?.name
    );
    const showYourRank = !!session?.user;

    const userXp = currentUserEntry?.xp ?? (session?.user as any)?.xp ?? 0;
    const userLevel = currentUserEntry?.level ?? (session?.user as any)?.level ?? 1;

    const yourRank = currentUserEntry?.rank ?? "--";
    const yourProjects = currentUserEntry?.projects ?? (session?.user as any)?.projects ?? 0;
    const yourStreak = currentUserEntry?.currentStreak ?? (session?.user as any)?.currentStreak ?? 0;
    const yourTierLabel = currentUserEntry ? getTierLabel(getTier(currentUserEntry.xp)) : getTierLabel(getTier(userXp));
    const yourInitials = session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "RP";

    return (
        <div className="min-h-screen pt-24 bg-background selection:bg-primary/30">
            {/* HERO SECTION */}
            <section className="leaderboard-hero">
                {/* SVG Animated Background Grid */}
                <div className="lb-hero-svg-bg" aria-hidden="true">
                    <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="600" cy="200" rx="500" ry="220" fill="#226CE0" opacity="0.05"/>
                        <g opacity="0.25">
                            <circle cx="100" cy="80"  r="1.5" fill="#226CE0"/><circle cx="200" cy="80"  r="1.5" fill="#226CE0"/><circle cx="300" cy="80"  r="1.5" fill="#226CE0"/><circle cx="400" cy="80"  r="1.5" fill="#226CE0"/><circle cx="500" cy="80"  r="1.5" fill="#226CE0"/><circle cx="600" cy="80"  r="1.5" fill="#226CE0"/><circle cx="700" cy="80"  r="1.5" fill="#226CE0"/><circle cx="800" cy="80"  r="1.5" fill="#226CE0"/><circle cx="900" cy="80"  r="1.5" fill="#226CE0"/><circle cx="1000" cy="80" r="1.5" fill="#226CE0"/><circle cx="1100" cy="80" r="1.5" fill="#226CE0"/>
                            <circle cx="100" cy="160" r="1.5" fill="#226CE0"/><circle cx="200" cy="160" r="1.5" fill="#226CE0"/><circle cx="300" cy="160" r="1.5" fill="#226CE0"/><circle cx="400" cy="160" r="1.5" fill="#226CE0"/><circle cx="500" cy="160" r="1.5" fill="#226CE0"/><circle cx="600" cy="160" r="1.5" fill="#226CE0"/><circle cx="700" cy="160" r="1.5" fill="#226CE0"/><circle cx="800" cy="160" r="1.5" fill="#226CE0"/><circle cx="900" cy="160" r="1.5" fill="#226CE0"/><circle cx="1000" cy="160" r="1.5" fill="#226CE0"/><circle cx="1100" cy="160" r="1.5" fill="#226CE0"/>
                            <circle cx="100" cy="240" r="1.5" fill="#226CE0"/><circle cx="200" cy="240" r="1.5" fill="#226CE0"/><circle cx="300" cy="240" r="1.5" fill="#226CE0"/><circle cx="400" cy="240" r="1.5" fill="#226CE0"/><circle cx="500" cy="240" r="1.5" fill="#226CE0"/><circle cx="600" cy="240" r="1.5" fill="#226CE0"/><circle cx="700" cy="240" r="1.5" fill="#226CE0"/><circle cx="800" cy="240" r="1.5" fill="#226CE0"/><circle cx="900" cy="240" r="1.5" fill="#226CE0"/><circle cx="1000" cy="240" r="1.5" fill="#226CE0"/><circle cx="1100" cy="240" r="1.5" fill="#226CE0"/>
                            <circle cx="100" cy="320" r="1.5" fill="#226CE0"/><circle cx="200" cy="320" r="1.5" fill="#226CE0"/><circle cx="300" cy="320" r="1.5" fill="#226CE0"/><circle cx="400" cy="320" r="1.5" fill="#226CE0"/><circle cx="500" cy="320" r="1.5" fill="#226CE0"/><circle cx="600" cy="320" r="1.5" fill="#226CE0"/><circle cx="700" cy="320" r="1.5" fill="#226CE0"/><circle cx="800" cy="320" r="1.5" fill="#226CE0"/><circle cx="900" cy="320" r="1.5" fill="#226CE0"/><circle cx="1000" cy="320" r="1.5" fill="#226CE0"/><circle cx="1100" cy="320" r="1.5" fill="#226CE0"/>
                        </g>
                        <g opacity="0.18" stroke="#226CE0" strokeWidth="1" fill="none">
                            <line x1="200" y1="80" x2="400" y2="160"><animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite"/></line>
                            <line x1="400" y1="160" x2="600" y2="80"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="3.5s" repeatCount="indefinite"/></line>
                            <line x1="600" y1="80" x2="800" y2="160"><animate attributeName="opacity" values="0.2;0.5;0.2" dur="4.2s" repeatCount="indefinite"/></line>
                            <line x1="800" y1="160" x2="1000" y2="80"><animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.8s" repeatCount="indefinite"/></line>
                            <line x1="300" y1="240" x2="600" y2="160"><animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite"/></line>
                            <line x1="600" y1="160" x2="900" y2="240"><animate attributeName="opacity" values="0.6;0.3;0.6" dur="4.5s" repeatCount="indefinite"/></line>
                        </g>
                        <circle cx="600" cy="80" r="4" fill="#226CE0" opacity="0.6">
                            <animate attributeName="r" values="3;6;3" dur="2.5s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="200" cy="160" r="3" fill="#F0771A" opacity="0.5">
                            <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="1000" cy="160" r="3" fill="#F0771A" opacity="0.4">
                            <animate attributeName="r" values="2;5;2" dur="3.5s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                </div>

                <div className="leaderboard-hero-eyebrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                    Updated Weekly
                </div>

                <h1 className="leaderboard-hero-title">
                    Top Student<br /><span className="title-accent">Builders &amp; Hackers</span>
                </h1>

                <p className="leaderboard-hero-sub">
                    Climb the leaderboard by shipping projects, verifying skills, and maintaining streaks. Your ranking speaks louder than your resume.
                </p>

                {/* SVG Divider */}
                <div className="lb-hero-divider">
                    <div className="lb-hero-divider-line"></div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#226CE0" strokeWidth="2" opacity="0.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div className="lb-hero-divider-line"></div>
                </div>
            </section>

            {/* PODIUM SECTION */}
            <section className="podium-section">
                <div className="container mx-auto max-w-5xl">
                    <div className="podium-section-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="inline-block mr-2 opacity-50">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        This Week's Podium
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="inline-block ml-2 opacity-50">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>

                    {loading ? (
                        <LeaderboardPodiumSkeleton />
                    ) : (
                        <div className="podium-stage">
                            {/* Rank 2 - Silver */}
                            <motion.div 
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="podium-card rank-2"
                            >
                                <div className="podium-card-inner">
                                    <svg className="podium-rank-badge" width="28" height="28" viewBox="0 0 28 28" style={{ margin: "0 auto 8px", display: "block" }}>
                                        <circle cx="14" cy="14" r="13" fill="#b4bec8" opacity="0.25" stroke="#b4bec8" strokeWidth="1.5"/>
                                        <text x="14" y="18.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#b4bec8">2</text>
                                    </svg>
                                    <svg width="72" height="72" viewBox="0 0 72 72" className="block mx-auto mb-3">
                                        <circle cx="36" cy="36" r="34" fill="none" stroke="#b4bec8" strokeWidth="2" strokeDasharray="6 3" opacity="0.6">
                                            <animateTransform attributeName="transform" type="rotate" values="0 36 36;360 36 36" dur="10s" repeatCount="indefinite"/>
                                        </circle>
                                        {second?.image ? (
                                            <>
                                                <clipPath id="silver-clip">
                                                    <circle cx="36" cy="36" r="28" />
                                                </clipPath>
                                                <g clipPath="url(#silver-clip)">
                                                    <image href={second.image} x="8" y="8" width="56" height="56" preserveAspectRatio="xMidYMid slice" />
                                                </g>
                                            </>
                                        ) : (
                                            <>
                                                <circle cx="36" cy="36" r="28" fill="#b4bec8"/>
                                                <text x="36" y="41.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1a2030">{secondInitials}</text>
                                            </>
                                        )}
                                    </svg>
                                    <div className="podium-name truncate">{second?.name || "Anonymous"}</div>
                                    <div className="podium-coins">
                                        ⚡ {second ? second.xp.toLocaleString() : "0"}
                                    </div>
                                    <div className="podium-coins-label">XP</div>
                                </div>
                                <div className="podium-block">2</div>
                            </motion.div>

                            {/* Rank 1 - Gold */}
                            <motion.div 
                                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                                className="podium-card rank-1"
                            >
                                <div className="podium-card-inner">
                                    <div className="podium-crown" aria-hidden="true">
                                        <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
                                            <polygon points="4,24 4,10 10,16 16,4 22,16 28,10 28,24" fill="#f0c81a" opacity="0.9"/>
                                            <rect x="3" y="23" width="26" height="4" rx="2" fill="#f0c81a" opacity="0.7"/>
                                            <circle cx="16" cy="4" r="2.5" fill="#fff" opacity="0.9"/>
                                            <circle cx="4" cy="10" r="2" fill="#fff" opacity="0.7"/>
                                            <circle cx="28" cy="10" r="2" fill="#fff" opacity="0.7"/>
                                        </svg>
                                    </div>
                                    <svg className="podium-rank-badge" width="28" height="28" viewBox="0 0 28 28" style={{ margin: "0 auto 8px", display: "block" }}>
                                        <circle cx="14" cy="14" r="13" fill="#f0c81a" opacity="0.25" stroke="#f0c81a" strokeWidth="1.5"/>
                                        <text x="14" y="18.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#f0c81a">1</text>
                                    </svg>
                                    <svg width="80" height="80" viewBox="0 0 80 80" className="block mx-auto mb-3">
                                        <defs>
                                            <filter id="gold-glow">
                                                <feGaussianBlur stdDeviation="3" result="blur"/>
                                                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                            </filter>
                                        </defs>
                                        <circle cx="40" cy="40" r="38" fill="none" stroke="#f0c81a" strokeWidth="2.5" filter="url(#gold-glow)" opacity="0.8">
                                            <animateTransform attributeName="transform" type="rotate" values="0 40 40;-360 40 40" dur="8s" repeatCount="indefinite"/>
                                        </circle>
                                        <circle cx="40" cy="40" r="38" fill="none" stroke="#f0c81a" strokeWidth="1" strokeDasharray="4 8" opacity="0.4">
                                            <animateTransform attributeName="transform" type="rotate" values="0 40 40;360 40 40" dur="12s" repeatCount="indefinite"/>
                                        </circle>
                                        {first?.image ? (
                                            <>
                                                <clipPath id="gold-clip">
                                                    <circle cx="40" cy="40" r="31" />
                                                </clipPath>
                                                <g clipPath="url(#gold-clip)">
                                                    <image href={first.image} x="9" y="9" width="62" height="62" preserveAspectRatio="xMidYMid slice" />
                                                </g>
                                            </>
                                        ) : (
                                            <>
                                                <circle cx="40" cy="40" r="31" fill="#f0c81a" filter="url(#gold-glow)"/>
                                                <text x="40" y="45.5" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1a1200">{firstInitials}</text>
                                            </>
                                        )}
                                    </svg>
                                    <div className="podium-name truncate">{first?.name || "Anonymous"}</div>
                                    <div className="podium-coins">
                                        ⚡ {first ? first.xp.toLocaleString() : "0"}
                                    </div>
                                    <div className="podium-coins-label">XP</div>
                                </div>
                                <div className="podium-block">1</div>
                            </motion.div>

                            {/* Rank 3 - Bronze */}
                            <motion.div 
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                className="podium-card rank-3"
                            >
                                <div className="podium-card-inner">
                                    <svg className="podium-rank-badge" width="28" height="28" viewBox="0 0 28 28" style={{ margin: "0 auto 8px", display: "block" }}>
                                        <circle cx="14" cy="14" r="13" fill="#cd7f32" opacity="0.25" stroke="#cd7f32" strokeWidth="1.5"/>
                                        <text x="14" y="18.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#cd7f32">3</text>
                                    </svg>
                                    <svg width="72" height="72" viewBox="0 0 72 72" className="block mx-auto mb-3">
                                        <circle cx="36" cy="36" r="34" fill="none" stroke="#cd7f32" strokeWidth="2" strokeDasharray="4 4" opacity="0.6">
                                            <animateTransform attributeName="transform" type="rotate" values="360 36 36;0 36 36" dur="10s" repeatCount="indefinite"/>
                                        </circle>
                                        {third?.image ? (
                                            <>
                                                <clipPath id="bronze-clip">
                                                    <circle cx="36" cy="36" r="28" />
                                                </clipPath>
                                                <g clipPath="url(#bronze-clip)">
                                                    <image href={third.image} x="8" y="8" width="56" height="56" preserveAspectRatio="xMidYMid slice" />
                                                </g>
                                            </>
                                        ) : (
                                            <>
                                                <circle cx="36" cy="36" r="28" fill="#cd7f32"/>
                                                <text x="36" y="41.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1a0f00">{thirdInitials}</text>
                                            </>
                                        )}
                                    </svg>
                                    <div className="podium-name truncate">{third?.name || "Anonymous"}</div>
                                    <div className="podium-coins">
                                        ⚡ {third ? third.xp.toLocaleString() : "0"}
                                    </div>
                                    <div className="podium-coins-label">XP</div>
                                </div>
                                <div className="podium-block">3</div>
                            </motion.div>
                        </div>
                    )}

                    {/* SVG Podium Stage Base */}
                    <svg className="podium-svg-stage" viewBox="0 0 680 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginTop: "-2px" }}>
                        <rect x="230" y="0"  width="220" height="60" rx="0" fill="#f0c81a" opacity="0.06"/>
                        <rect x="80"  y="20" width="160" height="40" rx="0" fill="#b4bec8" opacity="0.05"/>
                        <rect x="440" y="30" width="160" height="30" rx="0" fill="#cd7f32" opacity="0.05"/>
                        <line x1="230" y1="0"  x2="450" y2="0"  stroke="#f0c81a" strokeWidth="1.5" opacity="0.4"/>
                        <line x1="80"  y1="20" x2="240" y2="20" stroke="#b4bec8" strokeWidth="1"   opacity="0.35"/>
                        <line x1="440" y1="30" x2="600" y2="30" stroke="#cd7f32" strokeWidth="1"   opacity="0.35"/>
                        <line x1="0" y1="59" x2="680" y2="59" stroke="#f0c81a" strokeWidth="1.5" opacity="0.3" />
                    </svg>
                </div>
            </section>

            {/* MAIN LEADERBOARD TABLE */}
            <section className="py-12 relative">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Toolbar */}
                    <div className="lb-toolbar">
                        <div className="lb-search-wrap">
                            <span className="lb-search-icon" style={{ display: "flex", alignItems: "center" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                            </span>
                            <input 
                                type="text" 
                                className="lb-search-input" 
                                placeholder="Search by builder name or tier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="lb-filter-group">
                            {[
                                { id: "all", label: "All Builders" },
                                { id: "elite", label: "Elite" },
                                { id: "builder", label: "Builders" },
                                { id: "rising", label: "Rising Stars" }
                            ].map((filter) => (
                                <button 
                                    key={filter.id}
                                    className={`lb-filter-chip ${activeFilter === filter.id ? "active" : ""}`}
                                    onClick={() => setActiveFilter(filter.id as any)}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rankings Table */}
                    <div className="lb-table-wrap">
                        <div className="lb-table-header">
                            <div>Rank</div>
                            <div>Builder</div>
                            <div className="col-tier">Tier</div>
                            <div className="col-skill text-left">Projects</div>
                            <div>XP</div>
                            <div className="col-hackathons text-center">Streak</div>
                        </div>

                        <div className="divide-y divide-border">
                            {loading ? (
                                <BoneyardLoader
                                    skeleton={LeaderboardRowSkeleton}
                                    count={6}
                                    layout="list"
                                    label="Loading leaderboard"
                                />
                            ) : filteredUsers.length === 0 ? (
                                <div className="lb-empty-state block!">
                                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mx-auto mb-3 block">
                                        <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1.5" opacity="0.15"/>
                                        <circle cx="26" cy="24" r="10" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
                                        <line x1="33" y1="32" x2="44" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
                                        <line x1="20" y1="18" x2="32" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.25"/>
                                    </svg>
                                    <div className="text-lg font-bold text-foreground mb-2">No results found</div>
                                    <div className="text-sm text-muted-foreground">Try adjusting your search or filter.</div>
                                </div>
                            ) : (
                                paginatedUsers.map((user, index) => {
                                    const tier = getTier(user.xp);
                                    const isTop = user.rank <= 3;
                                    return (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
                                            className={`lb-row ${isTop ? "top-row" : ""} ${session?.user?.name === user.name ? "bg-primary/5!" : ""}`}
                                        >
                                            <div className="lb-rank-cell">
                                                <span className="lb-rank-num">#{user.rank}</span>
                                                {getChangeIcon(user.change)}
                                            </div>
                                            <div className="lb-user-cell">
                                                {getAvatarHtml(user, index)}
                                                <div>
                                                    <div className="lb-user-name truncate max-w-37.5 sm:max-w-60">{user.name || "Anonymous"}</div>
                                                    <div className="text-xs text-muted-foreground">Level {user.level}</div>
                                                </div>
                                            </div>
                                            <div className="col-tier">
                                                <span className={`lb-tier-badge ${tier}`}>{getTierLabel(tier)}</span>
                                            </div>
                                            <div className="lb-score-cell col-skill">
                                                <div className="lb-score-num">{user.projects} {user.projects === 1 ? "project" : "projects"}</div>
                                            </div>
                                            <div className="lb-coins-cell">
                                                ⚡ {user.xp.toLocaleString()}<span className="vx-label">XP</span>
                                            </div>
                                            <div className="lb-hackathon-cell col-hackathons">
                                                🔥 {user.currentStreak}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            >
                                Previous
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                    const isVisible = p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                                    const showEllipsis = (p === 2 && currentPage > 3) || (p === totalPages - 1 && currentPage < totalPages - 2);
                                    
                                    if (showEllipsis) {
                                        return <span key={`ellipsis-${p}`} className="text-muted-foreground px-1">...</span>;
                                    }
                                    
                                    if (!isVisible) return null;
                                    
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                                                currentPage === p
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Your Rank Widget */}
                    {showYourRank && (
                        <div className="your-rank-section">
                            <div className="your-rank-left">
                                <div className="your-rank-avatar">{yourInitials}</div>
                                <div>
                                    <div className="your-rank-info-title">Your Position</div>
                                    <div className="your-rank-name">{session?.user?.name || "Rishi Pandey"}</div>
                                    <div className="your-rank-pos">
                                        {yourRank !== "--" ? `Ranked #${yourRank}` : "Not Ranked"} — {yourTierLabel}
                                    </div>
                                </div>
                            </div>
                            <div className="your-rank-stats">
                                <div className="your-rank-stats-inner flex gap-6">
                                    <div className="your-rank-stat">
                                        <div className="your-rank-stat-num">⚡ {userXp.toLocaleString()}</div>
                                        <div className="your-rank-stat-label">XP</div>
                                    </div>
                                    <div className="your-rank-stat">
                                        <div className="your-rank-stat-num">{yourProjects}</div>
                                        <div className="your-rank-stat-label">Projects</div>
                                    </div>
                                    <div className="your-rank-stat">
                                        <div className="your-rank-stat-num">🔥 {yourStreak}</div>
                                        <div className="your-rank-stat-label">Streak</div>
                                    </div>
                                </div>
                            </div>
                            <Link href="/dashboard/student" className="btn-redesign btn-redesign-primary btn-redesign-sm flex items-center justify-center font-bold">
                                View Dashboard ⚡
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* HOW TO CLIMB SECTION */}
            <section className="earn-section">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-10">
                        <div className="section-label-redesign justify-center inline-flex mb-4">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5 inline-block">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                            </svg>
                            Climb Ranks
                        </div>
                        <h2 className="text-3xl font-black text-foreground mb-4">How do you climb the ranks?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Every action you take in the Velonx ecosystem contributes to your profile and XP.</p>
                    </div>

                    <div className="earn-grid">
                        {/* Card 1: Ship Projects */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
                            className="earn-card"
                        >
                            <svg className="earn-card-svg-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="#226CE0" fillOpacity="0.1"/>
                                <path d="M24 8 C24 8 36 14 36 26 L24 38 L12 26 C12 14 24 8 24 8Z" stroke="#226CE0" strokeWidth="2" strokeLinejoin="round"/>
                                <circle cx="24" cy="26" r="4" fill="#226CE0" opacity="0.4"/>
                                <path d="M24 8v6M36 26h-6M12 26h6" stroke="#226CE0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                            </svg>
                            <div className="earn-card-title">Ship Projects</div>
                            <div className="earn-card-desc">Build and complete collaborative or solo projects. Mark your projects as complete in the Project Hub to earn base XP.</div>
                            <div className="earn-card-points" style={{ color: "#226CE0" }}>+100 XP (Owner) / +75 XP (Member)</div>
                        </motion.div>

                        {/* Card 2: Attend Events */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                            className="earn-card"
                        >
                            <svg className="earn-card-svg-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="#f0c81a" fillOpacity="0.12"/>
                                <path d="M14 10h20v14a10 10 0 0 1-20 0V10Z" stroke="#f0c81a" strokeWidth="2" strokeLinejoin="round"/>
                                <path d="M14 16H10a4 4 0 0 0 0 8h4" stroke="#f0c81a" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M34 16h4a4 4 0 0 1 0 8h-4" stroke="#f0c81a" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M20 36v3M28 36v3M18 39h12" stroke="#f0c81a" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <div className="earn-card-title">Attend Events</div>
                            <div className="earn-card-desc">Participate in online or in-person hackathons, interactive workshops, and tech webinars organized or partnered by Velonx.</div>
                            <div className="earn-card-points" style={{ color: "#eab308" }}>+25 XP per event</div>
                        </motion.div>

                        {/* Card 3: 1-on-1 Mentorship */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                            className="earn-card"
                        >
                            <svg className="earn-card-svg-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="#0891b2" fillOpacity="0.1"/>
                                <circle cx="24" cy="18" r="6" stroke="#0891b2" strokeWidth="2"/>
                                <path d="M12 34c0-5.523 5.477-10 12-10s12 4.477 12 10" stroke="#0891b2" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M24 24v4" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                            </svg>
                            <div className="earn-card-title">1-on-1 Mentorship</div>
                            <div className="earn-card-desc">Book guidance sessions with expert mentors for project feedback, code reviews, career path mapping, or mock interviews.</div>
                            <div className="earn-card-points" style={{ color: "#0891b2" }}>+25 XP per session</div>
                        </motion.div>

                        {/* Card 4: Daily Login & Streaks */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
                            className="earn-card"
                        >
                            <svg className="earn-card-svg-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="#ef4444" fillOpacity="0.1"/>
                                <path d="M24 37c6.075 0 11-4.925 11-11 0-5.523-3.5-11-11-17-7.5 6-11 11.477-11 17 0 6.075 4.925 11 11 11Z" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round"/>
                                <path d="M24 31a5 5 0 0 0 5-5c0-2.5-1.5-5-5-7.5-3.5 2.5-5 5-5 7.5a5 5 0 0 0 5 5Z" fill="#ef4444" opacity="0.4"/>
                            </svg>
                            <div className="earn-card-title">Daily Login &amp; Streaks</div>
                            <div className="earn-card-desc">Keep your daily login streak active! Build consistency to earn daily XP and boost your multiplier by up to +0.5x.</div>
                            <div className="earn-card-points" style={{ color: "#ef4444" }}>+10 XP daily &amp; multipliers</div>
                        </motion.div>

                        {/* Card 5: Refer & Invite */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                            className="earn-card"
                        >
                            <svg className="earn-card-svg-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="#F0771A" fillOpacity="0.1"/>
                                <circle cx="18" cy="18" r="6" stroke="#F0771A" strokeWidth="2"/>
                                <circle cx="34" cy="18" r="5" stroke="#F0771A" strokeWidth="1.5" opacity="0.6"/>
                                <path d="M8 36c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#F0771A" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M34 26c3.866 0 7 2.91 7 6.5" stroke="#F0771A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                            </svg>
                            <div className="earn-card-title">Refer &amp; Invite</div>
                            <div className="earn-card-desc">Share your referral link. Earn up to 150 XP per friend (signup, profile complete, first activity) and boost your multiplier.</div>
                            <div className="earn-card-points" style={{ color: "#F0771A" }}>Up to +150 XP per referral</div>
                        </motion.div>

                        {/* Card 6: Learn & Earn */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                            className="earn-card"
                        >
                            <svg className="earn-card-svg-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" fill="#a855f7" fillOpacity="0.1"/>
                                <path d="M16 10h16a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" stroke="#a855f7" strokeWidth="2"/>
                                <path d="M19 18h10M19 23h10M19 28h6" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="34" cy="34" r="7" fill="#a855f7" fillOpacity="0.15" stroke="#a855f7" strokeWidth="1.5"/>
                                <path d="M31 34l2 2 4-4" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div className="earn-card-title">Learn &amp; Earn</div>
                            <div className="earn-card-desc">Complete roadmap tracks, read tech blogs (+5 XP), visit learning resources (+10 XP), and pass certificate tests to unlock badges.</div>
                            <div className="earn-card-points" style={{ color: "#a855f7" }}>+500 XP per certification</div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
