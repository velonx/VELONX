"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Timer,
    Settings,
    Bell,
    MoreHorizontal,
    Clock,
    Calendar,
    Users,
    Flame,
    Trophy,
    TrendingUp,
    Award,
    Target,
    FolderOpen,
    CheckCircle2,
    Loader2,
    Flag,
    AlertCircle,
    XCircle,
    ShoppingBag,
} from "lucide-react";
import SwagOrdersList from "@/components/dashboard/student/SwagOrdersList";
import { useProjects, useMeetings, useUserStats } from "@/lib/api/hooks";
import { DailyCheckIn } from "@/components/daily-check-in";
import { ProfileCompletionWizard } from "@/components/dashboard/ProfileCompletionWizard";
import { getTier, getTierLabel } from "@/lib/utils/tiers";
import { XP_THRESHOLDS, calculateLevel } from "@/lib/utils/xp-constants";
import ReviewDialog from "@/components/dashboard/ReviewDialog";
import { FollowersList } from "@/components/community/FollowersList";
import { FollowingList } from "@/components/community/FollowingList";
import { PostCard } from "@/components/community/PostCard";
import { GroupCard } from "@/components/community/GroupCard";
import { useCommunityPosts } from "@/lib/hooks/useCommunityPosts";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";
import BadgeIcon from "@/components/badges/BadgeIcon";
import BadgeModal from "@/components/badges/BadgeModal";
import {
    DashboardSidebarSkeleton as SidebarSkeleton,
    DashboardWelcomeSkeleton as WelcomeSectionSkeleton,
    DashboardStatsSkeleton as BentoStatsSkeleton,
    DashboardProjectSkeleton,
    DashboardCheckInSkeleton as DailyCheckInSkeleton,
    DashboardBadgesSkeleton as BadgesWidgetSkeleton,
    DashboardBadgesGridSkeleton,
    DashboardSkillsSkeleton as SkillIndexSkeleton,
    DashboardActivitySkeleton as ActivityTimelineSkeleton,
    DashboardReportSkeleton,
    DashboardFullSkeleton as FullDashboardSkeleton,
    BoneyardLoader
} from "@/components/boneyard";
import { FeedSkeleton } from "@/components/community/FeedSkeleton";
import { GroupCardSkeletonLoader } from "@/components/community/GroupCardSkeleton";

// Overview Components
import WelcomeSection from "@/components/dashboard/student/Overview/WelcomeSection";
import ProgressSummary from "@/components/dashboard/student/Overview/ProgressSummary";
import DashboardHero from "@/components/dashboard/student/Overview/DashboardHero";
import UpcomingEventsWidget from "@/components/dashboard/student/Overview/UpcomingEventsWidget";

// Mentorship Components
import StudentConfirmedSessions from "@/components/dashboard/student/StudentConfirmedSessions";
import StudentApprovedInterviews from "@/components/dashboard/student/StudentApprovedInterviews";

// Project Components
import JoinRequests from "@/components/dashboard/student/Projects/JoinRequests";
import { EditProjectModal } from "@/components/projects/EditProjectModal";

// Report Components
import { ReportDialog } from "@/components/ReportDialog";

// TypeScript interface for mentor sessions
interface MentorSession {
    id: string;
    title: string;
    description?: string;
    date: string;
    duration: number;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    meetingLink?: string;
    mentor: {
        id: string;
        name: string;
        company: string;
        imageUrl?: string;
        expertise: string[];
    };
    review?: {
        id: string;
        rating: number;
        comment?: string;
    };
}

// Extended user type with tracking fields
interface ExtendedUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    currentStreak?: number;
    longestStreak?: number;
    xp?: number;
    level?: number;
}

// ====== SKELETON LOADING COMPONENTS ======
function ProjectsListSkeleton() {
    return (
        <BoneyardLoader
            skeleton={DashboardProjectSkeleton}
            count={3}
            columns={3}
            label="Loading projects"
            gridClassName="mb-12"
        />
    );
}

function StudentDashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [projectStatusFilter, setProjectStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
    const [editingProject, setEditingProject] = useState<any | null>(null);

    // Cast session user to extended type
    const user = session?.user as ExtendedUser | undefined;

    // Memoize the start date to prevent re-fetching on every render
    const [startDate] = useState(() => new Date().toISOString());

    // Initialize project status filter from URL
    useEffect(() => {
        const statusParam = searchParams.get('projectStatus');
        if (statusParam === 'IN_PROGRESS' || statusParam === 'COMPLETED' || statusParam === 'ALL') {
            setProjectStatusFilter(statusParam);
        }
    }, [searchParams]);

    // Honor the ?tab= query param so notification links (e.g. join requests)
    // open the correct dashboard tab instead of always landing on Overview.
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const validTabs = ['overview', 'community', 'tracking', 'swag', 'report'];
        if (tabParam && validTabs.includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // When linked with a hash (e.g. #join-requests), scroll the target section
    // into view once the page has rendered.
    useEffect(() => {
        if (typeof window === 'undefined' || !window.location.hash) return;
        const id = window.location.hash.slice(1);
        const timer = setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
        return () => clearTimeout(timer);
    }, [activeTab]);

    // Fetch projects based on status filter
    const projectFilters = projectStatusFilter === 'ALL'
        ? { pageSize: 100, memberId: session?.user?.id }
        : { pageSize: 100, status: projectStatusFilter as 'IN_PROGRESS' | 'COMPLETED', memberId: session?.user?.id };

    // Fetch real data from API
    const { data: projects, loading: projectsLoading } = useProjects(projectFilters);

    // Fetch all projects for counts
    const { data: allProjects } = useProjects({ pageSize: 100, memberId: session?.user?.id });
    const { data: inProgressProjects } = useProjects({ pageSize: 100, status: 'IN_PROGRESS', memberId: session?.user?.id });
    const { data: completedProjects } = useProjects({ pageSize: 100, status: 'COMPLETED', memberId: session?.user?.id });

    const { data: meetings, loading: meetingsLoading } = useMeetings({
        pageSize: 10,
        startDate: startDate
    });
    // Only fetch user stats if we have a valid user ID
    const { data: userStats, loading: statsLoading } = useUserStats(session?.user?.id || 'skip');

    const activeXP = userStats?.user?.xp !== undefined ? userStats.user.xp : (user?.xp || 0);
    const activeLevel = (userStats?.user?.level && userStats.user.level > 0)
        ? userStats.user.level
        : (user?.level && user.level > 0)
            ? user.level
            : calculateLevel(activeXP);

    // Mentor sessions state with proper TypeScript types
    const [mentorSessions, setMentorSessions] = useState<MentorSession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [selectedSessionForReview, setSelectedSessionForReview] = useState<MentorSession | null>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showFollowersDialog, setShowFollowersDialog] = useState(false);
    const [showFollowingDialog, setShowFollowingDialog] = useState(false);

    // Report state
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [myReports, setMyReports] = useState<any[]>([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    // Badges state
    const [badges, setBadges] = useState<any[]>([]);
    const [loadingBadges, setLoadingBadges] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [showAllBadges, setShowAllBadges] = useState(false);

    const fetchBadges = useCallback(async () => {
        if (!session?.user?.id) return;
        setLoadingBadges(true);
        try {
            const res = await fetch("/api/user/badges");
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setBadges(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch badges:", error);
        } finally {
            setLoadingBadges(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchBadges();
        }
    }, [session?.user?.id, fetchBadges]);

    const fetchMyReports = useCallback(async () => {
        if (!session?.user?.id) return;
        setReportsLoading(true);
        try {
            const res = await fetch('/api/reports?pageSize=20');
            const data = await res.json();
            if (data.success) setMyReports(data.data);
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        } finally {
            setReportsLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (activeTab === 'report' && session?.user?.id) {
            fetchMyReports();
        }
    }, [activeTab, session?.user?.id, fetchMyReports]);

    // Fetch user's community posts
    const { posts, isLoading: postsLoading } = useCommunityPosts({
        authorId: session?.user?.id
    });

    // Fetch user's groups
    const { groups, isLoading: groupsLoading } = useCommunityGroups();
    const userGroups = groups?.filter(g => g.ownerId === session?.user?.id) || [];



    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    // Fetch mentor sessions - memoized with useCallback
    const fetchMentorSessions = useCallback(async () => {
        if (!session?.user?.id) return;

        setLoadingSessions(true);
        try {
            const response = await fetch('/api/mentor-sessions?viewAs=student&pageSize=10');
            const data = await response.json();
            if (data.success) {
                setMentorSessions(data.data);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchMentorSessions();
        }
    }, [session?.user?.id, fetchMentorSessions]);

    // Session handlers
    const handleCancelSession = (sessionId: string) => {
        setMentorSessions(prev => prev.filter(s => s.id !== sessionId));
    };

    const handleReviewSession = (sessionId: string) => {
        const session = mentorSessions.find(s => s.id === sessionId);
        if (session) {
            setSelectedSessionForReview(session);
            setShowReviewDialog(true);
        }
    };

    const handleReviewSuccess = () => {
        setShowReviewDialog(false);
        setSelectedSessionForReview(null);
        fetchMentorSessions(); // Refresh to show review
    };

    // Handle project status filter change
    const handleProjectStatusChange = (status: 'ALL' | 'IN_PROGRESS' | 'COMPLETED') => {
        setProjectStatusFilter(status);
        // Update URL query params
        const params = new URLSearchParams(searchParams.toString());
        params.set('projectStatus', status);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Calculate project counts
    const projectCounts = {
        all: allProjects?.length || 0,
        inProgress: inProgressProjects?.length || 0,
        completed: completedProjects?.length || 0
    };

    if (status === "loading") {
        return <FullDashboardSkeleton />;
    }

    if (!session) return null;

    // Sidebar menu items
    const menuItems = [
        { key: "overview", emoji: "📊", label: "Overview Workspace", shortLabel: "Overview" },
        { key: "community", emoji: "👥", label: "My Community", shortLabel: "Community" },
        { key: "tracking", emoji: "⚡", label: "Activity Tracking", shortLabel: "Activity" },
        { key: "swag", emoji: "🛍️", label: "My Redemptions", shortLabel: "Redemptions" },
        { key: "report", emoji: "🚩", label: "Reports", shortLabel: "Reports" },
    ];

    // Map real projects to display format
    const projectsDisplay = projects?.map((project, i) => ({
        id: project.id,
        title: project.title,
        tasks: project._count?.members || 0,
        progress: project.status === 'COMPLETED' ? 100 : project.status === 'IN_PROGRESS' ? 50 : 25,
        color: i % 3 === 0 ? "bg-[#5E239D]" : i % 3 === 1 ? "bg-[#7FD8D8]" : "bg-[#FF7F5C]",
        textColor: i % 3 === 1 ? "text-[#00443D]" : "text-white",
        status: project.status,
        completedAt: project.completedAt || null,
        ownerId: project.ownerId,
        githubUrl: project.githubUrl || null,
        liveUrl: project.liveUrl || null,
        logoUrl: project.logoUrl || null,
        category: project.category || null,
        techStack: project.techStack || [],
        owner: project.owner || null,
        members: project.members || [],
    })) || [];

    // Level label
    const getLevelLabel = (level: number) => {
        if (level >= 8) return 'Elite Builder';
        if (level >= 6) return 'Senior Builder';
        if (level >= 4) return 'Active Builder';
        if (level >= 2) return 'Rising Builder';
        return 'Student Builder';
    };

    // Build activity items from real data (meetings + sessions)
    const activityItems: { time: string; title: string; dotClass: string }[] = [];

    // Add mentor session activity
    mentorSessions.slice(0, 3).forEach(s => {
        const date = new Date(s.date);
        const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        activityItems.push({
            time: timeStr,
            title: `${s.status === 'COMPLETED' ? 'Completed' : 'Upcoming'} session: ${s.title} with ${s.mentor.name}`,
            dotClass: s.status === 'COMPLETED' ? 'success' : ''
        });
    });

    // Add meeting activity
    meetings?.slice(0, 3).forEach(m => {
        const date = new Date(m.date);
        const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        activityItems.push({
            time: timeStr,
            title: m.title,
            dotClass: ''
        });
    });

    // Sort by most recent
    activityItems.sort((a, b) => b.time.localeCompare(a.time));

    return (
        <div className="container px-4 md:px-8 pb-16">
            {/* ====== Tab Navigation (replaces the old per-page sidebar; site nav now lives in the global app sidebar) ====== */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                {menuItems.map(item => (
                    <button
                        key={item.key}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === item.key
                                ? 'bg-accent text-accent-foreground shadow-md shadow-accent/25'
                                : 'bg-card border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab(item.key)}
                    >
                        <span className="text-base">{item.emoji}</span> {item.shortLabel || item.label}
                    </button>
                ))}
            </div>

            {/* ====== Main Content Panel Area ====== */}
            <main className="w-full min-w-0">

                {/* ====== Panel: Overview ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'overview' ? 'active' : ''}`}>
                    <DashboardHero firstName={session.user?.name?.split(' ')[0] || 'Builder'} />

                    <WelcomeSection
                        userName={session.user?.name || 'Student'}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    {/* Bento Stats Row */}
                    {statsLoading || projectsLoading ? (
                        <BentoStatsSkeleton />
                    ) : (
                        <section className="dashboard-bento grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl font-bold shrink-0">
                                    ⚡
                                </div>
                                <div>
                                    <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">XP BALANCE</span>
                                    <span className="text-xl font-black text-foreground block tracking-tight">{activeXP} XP</span>
                                    <span className="text-xs font-bold text-amber-500">⚡ Level {activeLevel}</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl font-bold shrink-0">
                                    📅
                                </div>
                                <div>
                                    <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">ENROLLED EVENTS</span>
                                    <span className="text-xl font-black text-foreground block tracking-tight">{userStats?.stats?.eventsAttending || 0} Active</span>
                                    <span className="text-xs font-semibold text-muted-foreground">Events registered</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#F0771A]/10 dark:bg-[#F0771A]/10 text-[#F0771A] flex items-center justify-center text-xl font-bold shrink-0">
                                    📁
                                </div>
                                <div>
                                    <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">MY PROJECTS</span>
                                    <span className="text-xl font-black text-foreground block tracking-tight">{projectCounts.all} Total</span>
                                    <span className="text-xs font-bold text-[#F0771A] dark:text-[#F0771A]">{projectCounts.inProgress} In Progress</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card border border-border/60 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl font-bold shrink-0">
                                    🏅
                                </div>
                                <div>
                                    <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block">BUILDER LEVEL</span>
                                    <span className="text-xl font-black text-foreground block tracking-tight">Lvl {activeLevel}</span>
                                    <span className="text-xs font-bold text-[#F0771A] dark:text-[#F0771A]">{getLevelLabel(activeLevel)}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
                        {/* Left Column: Projects, Mentorship, Requests */}
                        <div className="space-y-10 min-w-0">
                            {/* Projects Section */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="heading-section text-2xl">My Projects</h2>
                                </div>

                                {/* Status Tabs */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <button
                                        onClick={() => handleProjectStatusChange('ALL')}
                                        className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${projectStatusFilter === 'ALL'
                                            ? 'bg-[#FF5D17] text-white shadow-md shadow-[#FF5D17]/25'
                                            : 'bg-white dark:bg-card border border-border/60 text-muted-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FolderOpen className="w-4 h-4" />
                                            <span>All Projects</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${projectStatusFilter === 'ALL'
                                                ? 'bg-white/20 text-white'
                                                : 'bg-muted text-foreground'
                                                }`}>
                                                {projectCounts.all}
                                            </span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleProjectStatusChange('IN_PROGRESS')}
                                        className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${projectStatusFilter === 'IN_PROGRESS'
                                            ? 'bg-[#FF5D17] text-white shadow-md shadow-[#FF5D17]/25'
                                            : 'bg-white dark:bg-card border border-border/60 text-muted-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4" />
                                            <span>In Progress</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${projectStatusFilter === 'IN_PROGRESS'
                                                ? 'bg-white/20 text-white'
                                                : 'bg-muted text-foreground'
                                                }`}>
                                                {projectCounts.inProgress}
                                            </span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleProjectStatusChange('COMPLETED')}
                                        className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${projectStatusFilter === 'COMPLETED'
                                            ? 'bg-[#FF5D17] text-white shadow-md shadow-[#FF5D17]/25'
                                            : 'bg-white dark:bg-card border border-border/60 text-muted-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Completed</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${projectStatusFilter === 'COMPLETED'
                                                ? 'bg-white/20 text-white'
                                                : 'bg-muted text-foreground'
                                                }`}>
                                                {projectCounts.completed}
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                {/* Project Cards */}
                                {projectsLoading ? (
                                    <ProjectsListSkeleton />
                                ) : (
                                    <ProgressSummary
                                        projects={projectsDisplay}
                                        searchQuery={searchQuery}
                                        onEdit={(projectId) => {
                                            const raw = projects?.find(p => p.id === projectId);
                                            if (raw) setEditingProject(raw as any);
                                        }}
                                        currentUserId={session?.user?.id}
                                    />
                                )}
                            </div>

                            {/* Confirmed Mentor Sessions Section */}
                            {session?.user?.id && (
                                <StudentConfirmedSessions userId={session.user.id} />
                            )}

                            {/* Approved Mock Interviews Section */}
                            {session?.user?.id && (
                                <StudentApprovedInterviews userId={session.user.id} />
                            )}

                            {/* Project Join Requests Section */}
                            {session?.user?.id && (
                                <JoinRequests userId={session.user.id} />
                            )}
                        </div>

                        {/* Right Column: Widgets */}
                        <div className="space-y-6">
                            {/* Upcoming Events */}
                            <UpcomingEventsWidget />

                            {/* Daily Check-in */}
                            <DailyCheckIn />

                            {/* Dynamic Badges System Widget */}
                            <div className="bg-white dark:bg-card border border-border/60 rounded-4xl p-6 shadow-xs relative overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-foreground">Badges</h3>
                                    {!loadingBadges && (
                                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#F0771A]/10 text-[#F0771A] dark:bg-[#F0771A]/40 dark:text-[#F0771A]">
                                            {badges.filter(b => b.earned).length} / {badges.length || 44} Earned
                                        </span>
                                    )}
                                </div>

                                {loadingBadges ? (
                                    <DashboardBadgesGridSkeleton />
                                ) : badges.length === 0 ? (
                                    <div className="text-center py-6 text-zinc-500 text-xs">
                                        No badges configured yet.
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-3 my-2">
                                            {badges
                                                .sort((a, b) => {
                                                    if (a.earned && !b.earned) return -1;
                                                    if (!a.earned && b.earned) return 1;
                                                    const rarityWeight = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
                                                    const aWeight = rarityWeight[a.rarity as keyof typeof rarityWeight] || 0;
                                                    const bWeight = rarityWeight[b.rarity as keyof typeof rarityWeight] || 0;
                                                    return bWeight - aWeight;
                                                })
                                                .slice(0, showAllBadges ? undefined : 6)
                                                .map(badge => (
                                                    <div 
                                                        key={badge.id} 
                                                        onClick={() => {
                                                            setSelectedBadge(badge);
                                                            setShowBadgeModal(true);
                                                        }}
                                                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-muted/30 border border-transparent hover:border-border hover:bg-muted/70 transition-all duration-200 cursor-pointer group text-center"
                                                        title={`${badge.name} (${badge.rarity})`}
                                                    >
                                                        <BadgeIcon 
                                                            name={badge.name} 
                                                            rarity={badge.rarity} 
                                                            category={badge.category} 
                                                            earned={badge.earned} 
                                                            size="md" 
                                                        />
                                                        <span className="text-[11px] font-bold text-foreground mt-2 truncate w-full">
                                                            {badge.name}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>

                                        <button
                                            onClick={() => setShowAllBadges(!showAllBadges)}
                                            className="w-full text-center py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 mt-2 border-t border-border/40 cursor-pointer"
                                        >
                                            {showAllBadges ? "Show Less" : "View All Badges →"}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Skill Index */}
                            {statsLoading || projectsLoading || loadingSessions ? (
                                <SkillIndexSkeleton />
                            ) : (
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <h3 className="text-sm font-bold text-foreground mb-4">Skill Index</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold text-foreground">
                                                <span>Projects Completed</span>
                                                <span>{Math.min(100, projectCounts.completed * 20)}%</span>
                                            </div>
                                            <div className="radar-bar-track">
                                                <div className="radar-bar-fill" style={{ width: `${Math.min(100, projectCounts.completed * 20)}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold text-foreground">
                                                <span>Event Participation</span>
                                                <span>{Math.min(100, (userStats?.stats?.eventsAttending || 0) * 25)}%</span>
                                            </div>
                                            <div className="radar-bar-track">
                                                <div className="radar-bar-fill" style={{ width: `${Math.min(100, (userStats?.stats?.eventsAttending || 0) * 25)}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold text-foreground">
                                                <span>Mentor Sessions</span>
                                                <span>{Math.min(100, mentorSessions.filter(s => s.status === 'COMPLETED').length * 25)}%</span>
                                            </div>
                                            <div className="radar-bar-track">
                                                <div className="radar-bar-fill" style={{ width: `${Math.min(100, mentorSessions.filter(s => s.status === 'COMPLETED').length * 25)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Workspace Activity */}
                            {meetingsLoading || loadingSessions ? (
                                <ActivityTimelineSkeleton />
                            ) : (
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <h3 className="text-sm font-bold text-foreground mb-4">Recent Workspace Activity</h3>
                                    {activityItems.length > 0 ? (
                                        <div className="activity-timeline">
                                            {activityItems.slice(0, 5).map((item, i) => (
                                                <div className="activity-item" key={i}>
                                                    <div className={`activity-dot ${item.dotClass}`}></div>
                                                    <div className="activity-time">{item.time}</div>
                                                    <div className="activity-title text-sm">{item.title}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No recent activity yet. Join events and book mentor sessions to see activity here.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ====== Panel: Community ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'community' ? 'active' : ''}`}>
                    <h1 className="heading-section text-3xl mb-2">
                        My Community Profile
                    </h1>
                    <p className="text-muted-foreground mb-8 text-sm max-w-xl">
                        Your posts, followers, and groups at a glance.
                    </p>

                    {/* Community Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                        <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-[#F0771A]/10 dark:bg-[#F0771A]/30 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-[#F0771A]" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground mb-1">{posts?.length || 0}</p>
                            <p className="text-sm text-muted-foreground font-bold">Posts Created</p>
                        </Card>
                        <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground mb-1">{userGroups.length}</p>
                            <p className="text-sm text-muted-foreground font-bold">Groups Joined</p>
                        </Card>
                        <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground mb-1">0</p>
                            <p className="text-sm text-muted-foreground font-bold">Total Reactions</p>
                        </Card>
                    </div>

                    {/* Posts Section */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="heading-card text-xl">My Posts</h3>
                            <Button
                                onClick={() => router.push('/community')}
                                variant="outline"
                                className="rounded-xl"
                            >
                                View Feed
                            </Button>
                        </div>
                        {postsLoading ? (
                            <FeedSkeleton count={3} />
                        ) : posts && posts.length > 0 ? (
                            <div className="space-y-4">
                                {posts.slice(0, 3).map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        currentUserId={session?.user?.id}
                                        onEdit={async (postId, content) => {
                                            const { getCSRFToken } = await import('@/lib/utils/csrf');
                                            const csrfToken = await getCSRFToken();
                                            const res = await fetch(`/api/community/posts/${postId}`, {
                                                method: 'PATCH',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'x-csrf-token': csrfToken
                                                },
                                                body: JSON.stringify({ content })
                                            });
                                            if (!res.ok) throw new Error('Failed to edit post');
                                            router.refresh();
                                        }}
                                        onDelete={async (postId) => {
                                            const { getCSRFToken } = await import('@/lib/utils/csrf');
                                            const csrfToken = await getCSRFToken();
                                            const res = await fetch(`/api/community/posts/${postId}`, {
                                                method: 'DELETE',
                                                headers: { 'x-csrf-token': csrfToken }
                                            });
                                            if (!res.ok) throw new Error('Failed to delete post');
                                            router.refresh();
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-card border rounded-3xl p-12 text-center shadow-sm">
                                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="heading-card text-xl mb-2">No Posts Yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Share your first post with the community
                                </p>
                                <Button
                                    onClick={() => router.push('/community')}
                                    className="bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold rounded-xl"
                                >
                                    Create Post
                                </Button>
                            </Card>
                        )}
                    </section>

                    {/* Groups Section */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="heading-card text-xl">My Groups</h3>
                            <Button
                                onClick={() => router.push('/community/groups')}
                                variant="outline"
                                className="rounded-xl"
                            >
                                Browse Groups
                            </Button>
                        </div>
                        {groupsLoading ? (
                            <GroupCardSkeletonLoader count={3} />
                        ) : userGroups.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {userGroups.slice(0, 3).map((group) => (
                                    <GroupCard key={group.id} group={group} />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-card border rounded-3xl p-12 text-center shadow-sm">
                                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="heading-card text-xl mb-2">No Groups Yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Join or create a group to connect with others
                                </p>
                                <Button
                                    onClick={() => router.push('/community/groups')}
                                    className="bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold rounded-xl"
                                >
                                    Explore Groups
                                </Button>
                            </Card>
                        )}
                    </section>
                </div>

                {/* ====== Panel: Tracking ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'tracking' ? 'active' : ''}`}>
                    <h1 className="heading-section text-3xl mb-2">
                        Activity Tracking
                    </h1>
                    <p className="text-muted-foreground mb-8 text-sm max-w-xl">
                        Monitor your progress, XP rewards, and achievement metrics.
                    </p>

                    {/* XP & Level Card */}
                    <Card className="bg-linear-to-br from-[#F0771A] to-[#16140F] text-white border-0 rounded-3xl p-8 shadow-xl max-w-2xl mb-10">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-6 h-6" />
                                    <h3 className="text-lg font-bold">Level {activeLevel}</h3>
                                </div>
                                <p className="text-5xl font-black mb-1">{activeXP}</p>
                                <p className="text-sm opacity-90">total XP earned</p>
                            </div>
                            <div className="text-right">
                                <Trophy className="w-16 h-16 opacity-20" />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-background/20 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold opacity-90">
                                    {(() => {
                                        const currentLevel = activeLevel;
                                        const currentXP = activeXP;
                                        if (currentLevel >= 10) return 'Max Level Reached!';
                                        const currentThreshold = XP_THRESHOLDS[currentLevel - 1];
                                        return `${currentXP - currentThreshold} XP`;
                                    })()}
                                </span>
                                <span className="text-xs font-bold opacity-90">
                                    {(() => {
                                        const currentLevel = activeLevel;
                                        const currentXP = activeXP;
                                        if (currentLevel >= 10) return '';
                                        const nextThreshold = XP_THRESHOLDS[currentLevel];
                                        const remaining = nextThreshold - currentXP;
                                        return `${remaining} XP to go`;
                                    })()}
                                </span>
                            </div>
                            <div className="h-3 bg-background/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-background rounded-full transition-all duration-500 relative"
                                    style={{
                                        width: `${(() => {
                                            const currentLevel = activeLevel;
                                            const currentXP = activeXP;
                                            if (currentLevel >= 10) return 100;
                                            const currentThreshold = XP_THRESHOLDS[currentLevel - 1];
                                            const nextThreshold = XP_THRESHOLDS[currentLevel];
                                            const progress = ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
                                            return Math.min(100, Math.max(0, progress));
                                        })()}%`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            </div>
                        </div>


                        {/* Level Milestones */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-background/20 rounded-xl p-3 text-center">
                                <Flame className="w-5 h-5 mx-auto mb-1 opacity-75" />
                                <p className="text-xs opacity-75 mb-1">Current</p>
                                <p className="text-lg font-black">Lvl {activeLevel}</p>
                            </div>
                            <div className="bg-background/20 rounded-xl p-3 text-center">
                                <Target className="w-5 h-5 mx-auto mb-1 opacity-75" />
                                <p className="text-xs opacity-75 mb-1">Next</p>
                                <p className="text-lg font-black">
                                    {activeLevel >= 10 ? 'MAX' : `Lvl ${activeLevel + 1}`}
                                </p>
                            </div>
                            <div className="bg-background/20 rounded-xl p-3 text-center">
                                <Trophy className="w-5 h-5 mx-auto mb-1 opacity-75" />
                                <p className="text-xs opacity-75 mb-1">Max</p>
                                <p className="text-lg font-black">Lvl 10</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => router.push('/leaderboard')}
                            className="w-full bg-background/20 hover:bg-background/30 rounded-xl p-3 flex items-center justify-between transition-all group"
                        >
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                <span className="text-sm font-bold">View Leaderboard</span>
                            </div>
                            <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Card>

                    {/* XP Breakdown */}
                    <section className="mb-12">
                        <h3 className="heading-card text-xl mb-6">XP Rewards</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            <Card className="bg-card border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-[#F0771A]/10 dark:bg-[#F0771A]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-6 h-6 text-[#F0771A]" />
                                </div>
                                <p className="text-2xl font-bold text-foreground mb-1">{(userStats?.stats?.eventsAttending || 0) * 50}</p>
                                <p className="text-xs text-muted-foreground font-bold">Event Attendance</p>
                            </Card>
                            <Card className="bg-card border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-2xl font-black text-foreground mb-1">{projectCounts.completed * 100}</p>
                                <p className="text-xs text-muted-foreground font-bold">Project Completion</p>
                            </Card>
                            <Card className="bg-card border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-[#F0771A]/10 dark:bg-[#F0771A]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-5 h-5 text-[#F0771A]" />
                                </div>
                                <p className="text-2xl font-black text-foreground mb-1">{mentorSessions.filter(s => s.status === 'COMPLETED').length * 25}</p>
                                <p className="text-xs text-muted-foreground font-bold">Mentor Sessions</p>
                            </Card>
                            <Card className="bg-card border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Flame className="w-6 h-6 text-orange-600" />
                                </div>
                                <p className="text-2xl font-black text-foreground mb-1">{(user?.currentStreak || 0) * 20}</p>
                                <p className="text-xs text-muted-foreground font-bold">Streak Bonus</p>
                            </Card>
                            <Card className="bg-card border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Award className="w-5 h-5 text-teal-600" />
                                </div>
                                <p className="text-2xl font-black text-foreground mb-1">{(userStats?.stats?.blogPostsAuthored || 0) * 30}</p>
                                <p className="text-xs text-muted-foreground font-bold">Resource Share</p>
                            </Card>
                        </div>
                    </section>

                    {/* Activity Summary */}
                    <section>
                        <h3 className="heading-card text-xl mb-6">Activity Summary</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-[#F0771A]/10 dark:bg-[#F0771A]/30 rounded-xl flex items-center justify-center">
                                        <Target className="w-5 h-5 text-[#F0771A]" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{userStats?.stats?.projectsOwned || 0}</p>
                                <p className="text-sm text-muted-foreground font-bold">Projects Created</p>
                            </Card>
                            <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-[#F0771A]/10 dark:bg-[#F0771A]/30 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#F0771A]" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{userStats?.stats?.projectsJoined || 0}</p>
                                <p className="text-sm text-muted-foreground font-bold">Projects Joined</p>
                            </Card>
                            <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{userStats?.stats?.eventsAttending || 0}</p>
                                <p className="text-sm text-muted-foreground font-bold">Events Attended</p>
                            </Card>
                            <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{mentorSessions.filter(s => s.status === 'COMPLETED').length}</p>
                                <p className="text-sm text-muted-foreground font-bold">Sessions Completed</p>
                            </Card>
                        </div>
                    </section>
                </div>

                {/* ====== Panel: Swag ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'swag' ? 'active' : ''}`}>
                    <h1 className="heading-section text-3xl mb-2">
                        My Redemptions
                    </h1>
                    <p className="text-muted-foreground mb-8 text-sm max-w-xl">
                        Your orders and swag history.
                    </p>
                    <SwagOrdersList />
                </div>

                {/* ====== Panel: Report ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'report' ? 'active' : ''}`}>
                    <h1 className="heading-section text-3xl mb-2">
                        Reports
                    </h1>
                    <p className="text-muted-foreground mb-8 text-sm max-w-xl">
                        Submit issues, bugs, or violations with photo &amp; video evidence.
                    </p>

                    {/* Submit button */}
                    <div className="mb-8">
                        <button
                            id="open-report-dialog-btn"
                            onClick={() => setShowReportDialog(true)}
                            className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Flag className="w-5 h-5" />
                            Submit a Report
                        </button>
                    </div>

                    {/* My Reports */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="heading-card text-xl">My Reports</h2>
                            <button
                                onClick={fetchMyReports}
                                className="text-sm text-[#F0771A] hover:underline font-medium"
                            >
                                Refresh
                            </button>
                        </div>
                        {reportsLoading ? (
                            <BoneyardLoader
                                skeleton={DashboardReportSkeleton}
                                count={3}
                                layout="list"
                                label="Loading reports"
                            />
                        ) : myReports.length === 0 ? (
                            <div className="bg-muted/40 border border-border rounded-2xl p-12 text-center">
                                <Flag className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                                <h3 className="heading-card text-xl mb-2">No reports yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                    Use the button above to report bugs, violations, or any platform issue.
                                    Attach photos and videos as evidence.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myReports.map((report) => {
                                    const STATUS_STYLE = {
                                        OPEN: { label: 'Open', icon: AlertCircle, color: 'text-[#F0771A]', bg: 'bg-[#F0771A]/10 dark:bg-[#F0771A]/30' },
                                        IN_REVIEW: { label: 'In Review', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
                                        RESOLVED: { label: 'Resolved', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                                        DISMISSED: { label: 'Dismissed', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
                                    };
                                    const s = STATUS_STYLE[report.status as keyof typeof STATUS_STYLE];
                                    const SIcon = s?.icon || AlertCircle;
                                    return (
                                        <div
                                            key={report.id}
                                            className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${s?.bg || 'bg-muted'}`}>
                                                    <SIcon className={`w-5 h-5 ${s?.color || 'text-muted-foreground'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-bold">
                                                            {report.category?.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s?.bg || 'bg-muted'} ${s?.color || ''}`}>
                                                            {s?.label || report.status}
                                                        </span>
                                                        {report.photoUrls?.length > 0 && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                📷 {report.photoUrls.length}
                                                            </span>
                                                        )}
                                                        {report.videoUrls?.length > 0 && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                🎥 {report.videoUrls.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-foreground">{report.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                                                    {report.adminNotes && (
                                                        <div className="mt-3 bg-muted/50 rounded-xl p-3">
                                                            <p className="text-xs font-bold text-muted-foreground mb-1">Admin Response:</p>
                                                            <p className="text-sm text-foreground">{report.adminNotes}</p>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Submitted {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>


            </main>

            {/* Review Dialog */}
            {selectedSessionForReview && (
                <ReviewDialog
                    open={showReviewDialog}
                    onOpenChange={setShowReviewDialog}
                    session={selectedSessionForReview}
                    onSuccess={handleReviewSuccess}
                />
            )}

            {/* Report Dialog */}
            <ReportDialog
                open={showReportDialog}
                onOpenChange={setShowReportDialog}
                onSuccess={() => {
                    setShowReportDialog(false);
                    fetchMyReports();
                }}
            />

            {/* Followers Dialog */}
            <FollowersList
                userId={session?.user?.id || ''}
                isOpen={showFollowersDialog}
                onClose={() => setShowFollowersDialog(false)}
            />

            {/* Following Dialog */}
            <FollowingList
                userId={session?.user?.id || ''}
                isOpen={showFollowingDialog}
                onClose={() => setShowFollowingDialog(false)}
            />

            {/* Edit Project Modal */}
            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    isOpen={true}
                    onClose={() => setEditingProject(null)}
                    onSaved={() => {
                        setEditingProject(null);
                        // Trigger a page refresh to reflect updates
                        window.location.reload();
                    }}
                />
            )}

            {/* Badge Detail Modal */}
            <BadgeModal
                isOpen={showBadgeModal}
                onClose={() => {
                    setShowBadgeModal(false);
                    setSelectedBadge(null);
                }}
                badge={selectedBadge}
            />

            {/* Profile Completion Wizard */}
            <ProfileCompletionWizard />
        </div>
    );
}


export default function StudentDashboard() {
    return (
        <Suspense fallback={<FullDashboardSkeleton />}>
            <StudentDashboardContent />
        </Suspense>
    );
}
