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
    Loader2
} from "lucide-react";
import { useProjects, useMeetings, useUserStats } from "@/lib/api/hooks";
import { DailyCheckIn } from "@/components/daily-check-in";
import SessionCard from "@/components/dashboard/SessionCard";
import ReviewDialog from "@/components/dashboard/ReviewDialog";
import ProjectJoinRequests from "@/components/dashboard/ProjectJoinRequests";
import { FollowersList } from "@/components/community/FollowersList";
import { FollowingList } from "@/components/community/FollowingList";
import { PostCard } from "@/components/community/PostCard";
import { GroupCard } from "@/components/community/GroupCard";
import { useCommunityPosts } from "@/lib/hooks/useCommunityPosts";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";

// Overview Components
import WelcomeSection from "@/components/dashboard/student/Overview/WelcomeSection";
import ProgressSummary from "@/components/dashboard/student/Overview/ProgressSummary";
import QuickActions from "@/components/dashboard/student/Overview/QuickActions";

// Mentorship Components
import FindMentors from "@/components/dashboard/student/Mentorship/FindMentors";
import UpcomingSessions from "@/components/dashboard/student/Mentorship/UpcomingSessions";
import SessionHistory from "@/components/dashboard/student/Mentorship/SessionHistory";
import StudentConfirmedSessions from "@/components/dashboard/student/StudentConfirmedSessions";
import StudentApprovedInterviews from "@/components/dashboard/student/StudentApprovedInterviews";

// Project Components
import JoinRequests from "@/components/dashboard/student/Projects/JoinRequests";

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

function StudentDashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [searchQuery, setSearchQuery] = useState("");
    const [projectStatusFilter, setProjectStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

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

    // Fetch projects based on status filter
    const projectFilters = projectStatusFilter === 'ALL'
        ? { pageSize: 100 }
        : { pageSize: 100, status: projectStatusFilter as 'IN_PROGRESS' | 'COMPLETED' };

    // Fetch real data from API
    const { data: projects, loading: projectsLoading } = useProjects(projectFilters);

    // Fetch all projects for counts
    const { data: allProjects } = useProjects({ pageSize: 100 });
    const { data: inProgressProjects } = useProjects({ pageSize: 100, status: 'IN_PROGRESS' });
    const { data: completedProjects } = useProjects({ pageSize: 100, status: 'COMPLETED' });

    const { data: meetings, loading: meetingsLoading } = useMeetings({
        pageSize: 10,
        startDate: startDate
    });
    // Only fetch user stats if we have a valid user ID
    const { data: userStats, loading: statsLoading } = useUserStats(session?.user?.id || 'skip');

    // Mentor sessions state with proper TypeScript types
    const [mentorSessions, setMentorSessions] = useState<MentorSession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [selectedSessionForReview, setSelectedSessionForReview] = useState<MentorSession | null>(null);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showFollowersDialog, setShowFollowersDialog] = useState(false);
    const [showFollowingDialog, setShowFollowingDialog] = useState(false);

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

    if (status === "loading" || projectsLoading || meetingsLoading || statsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-16 h-16 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) return null;

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard" },
        { icon: Users, label: "Community" },
        { icon: Timer, label: "Tracking" },
        { icon: Settings, label: "Setting" },
    ];

    // Map real projects to display format
    const projectsDisplay = projects?.map((project, i) => ({
        id: project.id,
        title: project.title,
        tasks: project._count?.members || 0,
        progress: project.status === 'COMPLETED' ? 100 : project.status === 'IN_PROGRESS' ? 50 : 25,
        color: i % 3 === 0 ? "bg-[#5E239D]" : i % 3 === 1 ? "bg-[#7FD8D8]" : "bg-[#FF7F5C]",
        textColor: i % 3 === 1 ? "text-[#00443D]" : "text-white",
        users: ["/avatars/1.png", "/avatars/2.png", "/avatars/3.png"],
        status: project.status,
        completedAt: project.completedAt || null
    })) || [];

    // Map real meetings to timeline format
    const timeline = meetings?.reduce((acc: any[], meeting) => {
        const date = new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const time = new Date(meeting.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        const existingDate = acc.find(item => item.date === date);
        const meetingItem = {
            time,
            title: meeting.title,
            sub: meeting.description || 'Meeting',
            color: "border-teal-400"
        };

        if (existingDate) {
            existingDate.items.push(meetingItem);
        } else {
            acc.push({
                date,
                items: [meetingItem]
            });
        }

        return acc;
    }, []) || [];

    return (
        <div className="flex min-h-screen bg-background pt-20">
            {/* Mobile Navigation - Visible only on mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-30 safe-area-pb shadow-lg">
                <nav className="flex items-center justify-around p-3">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all ${activeTab === item.label
                                ? "text-[#219EBC] bg-muted"
                                : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Left Sidebar */}
            <aside className="hidden md:block md:w-80 bg-background border-r border-border flex flex-col p-8 md:fixed md:left-0 top-20 bottom-0 z-20">
                <div className="mb-12">
                    <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full border-2 border-[#219EBC] p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={session.user?.image || "/avatars/default.png"} alt="User" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-md">
                            <Clock className="w-3 h-3 text-[#219EBC]" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{session.user?.name}</h2>
                    <p className="text-muted-foreground text-sm font-medium">{session.user?.email}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === item.label
                                ? "bg-[#219EBC]/10 text-[#219EBC]"
                                : "text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/dashboard-pattern.png" alt="" className="absolute bottom-0 left-0 w-full opacity-10" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-80 md:mr-96 p-4 md:p-12 pb-24 md:pb-12">
                {/* Mobile Header - Visible only on mobile */}
                <div className="md:hidden mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-[#219EBC] p-0.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={session.user?.image || "/avatars/default.png"} alt="User" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">{session.user?.name}</h2>
                            <p className="text-xs text-muted-foreground font-bold">Level {user?.level || 1}</p>
                        </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground relative transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
                    </button>
                </div>

                {activeTab === "Dashboard" && (
                    <>
                        {/* Mobile Daily Check-in - Visible only on mobile */}
                        <div className="md:hidden mb-6">
                            <DailyCheckIn />
                        </div>

                        {/* Header */}
                        <WelcomeSection
                            userName={session.user?.name?.split(" ")[0] || "Student"}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />

                        {/* Project Status Filter Tabs */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-foreground">My Projects</h2>
                            </div>

                            {/* Status Tabs */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <button
                                    onClick={() => handleProjectStatusChange('ALL')}
                                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${projectStatusFilter === 'ALL'
                                        ? 'bg-[#219EBC] text-white shadow-lg shadow-[#219EBC]/30'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FolderOpen className="w-4 h-4" />
                                        <span>All Projects</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${projectStatusFilter === 'ALL'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-background text-foreground'
                                            }`}>
                                            {projectCounts.all}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleProjectStatusChange('IN_PROGRESS')}
                                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${projectStatusFilter === 'IN_PROGRESS'
                                        ? 'bg-[#219EBC] text-white shadow-lg shadow-[#219EBC]/30'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4" />
                                        <span>In Progress</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${projectStatusFilter === 'IN_PROGRESS'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-background text-foreground'
                                            }`}>
                                            {projectCounts.inProgress}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleProjectStatusChange('COMPLETED')}
                                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${projectStatusFilter === 'COMPLETED'
                                        ? 'bg-[#219EBC] text-white shadow-lg shadow-[#219EBC]/30'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Completed</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${projectStatusFilter === 'COMPLETED'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-background text-foreground'
                                            }`}>
                                            {projectCounts.completed}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Project Cards */}
                        <ProgressSummary
                            projects={projectsDisplay}
                            searchQuery={searchQuery}
                        />

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

                        {/* Statistics Section - Full Width */}
                        <QuickActions userStats={userStats || {}} />
                    </>
                )}

                {activeTab === "Tracking" && (
                    <>
                        {/* Tracking Header */}
                        <header className="mb-12">
                            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                                <Timer className="w-8 h-8 text-[#219EBC]" />
                                Activity Tracking
                            </h1>
                            <p className="text-muted-foreground font-medium tracking-tight">Monitor your progress and achievements</p>
                        </header>

                        {/* Streak & XP Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {/* Streak Card */}
                            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 rounded-[32px] p-8 shadow-xl">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Flame className="w-6 h-6" />
                                            <h3 className="text-lg font-bold">Current Streak</h3>
                                        </div>
                                        <p className="text-5xl font-black mb-1">{user?.currentStreak || 0}</p>
                                        <p className="text-sm opacity-90">days in a row</p>
                                    </div>
                                    <div className="text-right">
                                        <Trophy className="w-12 h-12 opacity-20 mb-2" />
                                        <p className="text-xs opacity-75">Longest</p>
                                        <p className="text-2xl font-black">{user?.longestStreak || 0}</p>
                                    </div>
                                </div>
                                <div className="bg-background/20 rounded-xl p-4">
                                    <p className="text-sm font-bold">Keep it up! Login daily to maintain your streak and earn bonus XP.</p>
                                </div>
                            </Card>

                            {/* XP & Level Card */}
                            <Card className="bg-gradient-to-br from-[#219EBC] to-[#023047] text-white border-0 rounded-[32px] p-8 shadow-xl">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="w-6 h-6" />
                                            <h3 className="text-lg font-bold">Level {user?.level || 1}</h3>
                                        </div>
                                        <p className="text-5xl font-black mb-1">{user?.xp || 0}</p>
                                        <p className="text-sm opacity-90">total XP earned</p>
                                    </div>
                                    <div className="text-right">
                                        <TrendingUp className="w-12 h-12 opacity-20 mb-2" />
                                        <p className="text-xs opacity-75">Next Level</p>
                                        <p className="text-2xl font-black">
                                            {(() => {
                                                const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];
                                                const currentLevel = user?.level || 1;
                                                return currentLevel >= 10 ? 'MAX' : thresholds[currentLevel];
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-background/20 rounded-xl p-2">
                                    <div className="h-3 bg-background/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-background rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(() => {
                                                    const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];
                                                    const currentLevel = user?.level || 1;
                                                    const currentXP = user?.xp || 0;
                                                    if (currentLevel >= 10) return 100;
                                                    const currentThreshold = thresholds[currentLevel - 1];
                                                    const nextThreshold = thresholds[currentLevel];
                                                    const progress = ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
                                                    return Math.min(100, Math.max(0, progress));
                                                })()}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* XP Breakdown */}
                        <section className="mb-12">
                            <h3 className="text-2xl font-bold text-foreground mb-6">XP Rewards</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                <Card className="bg-background border-0 rounded-[24px] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-foreground mb-1">50</p>
                                    <p className="text-xs text-muted-foreground font-bold">Event Attendance</p>
                                </Card>
                                <Card className="bg-background border-0 rounded-[24px] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Target className="w-6 h-6 text-green-600" />
                                    </div>
                                    <p className="text-2xl font-black text-[#023047] mb-1">100</p>
                                    <p className="text-xs text-muted-foreground font-bold">Project Completion</p>
                                </Card>
                                <Card className="bg-background border-0 rounded-[24px] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-black text-[#023047] mb-1">25</p>
                                    <p className="text-xs text-muted-foreground font-bold">Mentor Session</p>
                                </Card>
                                <Card className="bg-background border-0 rounded-[24px] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Flame className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <p className="text-2xl font-black text-[#023047] mb-1">20</p>
                                    <p className="text-xs text-muted-foreground font-bold">Daily Streak</p>
                                </Card>
                                <Card className="bg-background border-0 rounded-[24px] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Award className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <p className="text-2xl font-black text-[#023047] mb-1">30</p>
                                    <p className="text-xs text-muted-foreground font-bold">Resource Share</p>
                                </Card>
                            </div>
                        </section>

                        {/* Activity Summary */}
                        <section>
                            <h3 className="text-2xl font-bold text-foreground mb-6">Activity Summary</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                <Card className="bg-background border-0 rounded-[24px] p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <Target className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">{userStats?.projectsOwned || 0}</p>
                                    <p className="text-sm text-muted-foreground font-bold">Projects Created</p>
                                </Card>
                                <Card className="bg-background border-0 rounded-[24px] p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">{userStats?.projectsMember || 0}</p>
                                    <p className="text-sm text-muted-foreground font-bold">Projects Joined</p>
                                </Card>
                                <Card className="bg-background border-0 rounded-[24px] p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">{userStats?.eventsAttended || 0}</p>
                                    <p className="text-sm text-muted-foreground font-bold">Events Attended</p>
                                </Card>
                                <Card className="bg-background border-0 rounded-[24px] p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-1">{mentorSessions.filter(s => s.status === 'COMPLETED').length}</p>
                                    <p className="text-sm text-muted-foreground font-bold">Sessions Completed</p>
                                </Card>
                            </div>
                        </section>
                    </>
                )}

                {activeTab === "Community" && (
                    <>
                        {/* Community Header */}
                        <header className="mb-12">
                            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                                <Users className="w-8 h-8 text-[#219EBC]" />
                                My Community Profile
                            </h1>
                            <p className="text-muted-foreground font-medium tracking-tight">Your posts, followers, and groups</p>
                        </header>

                        {/* Community Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            <Card className="bg-background border-0 rounded-[24px] p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{posts?.length || 0}</p>
                                <p className="text-sm text-muted-foreground font-bold">Posts Created</p>
                            </Card>
                            <Card className="bg-background border-0 rounded-[24px] p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{userGroups.length}</p>
                                <p className="text-sm text-muted-foreground font-bold">Groups Joined</p>
                            </Card>

                            <Card className="bg-background border-0 rounded-[24px] p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
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
                                <h3 className="text-2xl font-bold text-foreground">My Posts</h3>
                                <Button
                                    onClick={() => router.push('/community/feed')}
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    View Feed
                                </Button>
                            </div>
                            {postsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219EBC] mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading posts...</p>
                                </div>
                            ) : posts && posts.length > 0 ? (
                                <div className="space-y-4">
                                    {posts.slice(0, 3).map((post) => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <Card className="bg-background border-0 rounded-[32px] p-12 text-center shadow-sm">
                                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-foreground mb-2">No Posts Yet</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Share your first post with the community
                                    </p>
                                    <Button
                                        onClick={() => router.push('/community/feed')}
                                        className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
                                    >
                                        Create Post
                                    </Button>
                                </Card>
                            )}
                        </section>

                        {/* Groups Section */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-foreground">My Groups</h3>
                                <Button
                                    onClick={() => router.push('/community/groups')}
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    Browse Groups
                                </Button>
                            </div>
                            {groupsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219EBC] mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading groups...</p>
                                </div>
                            ) : userGroups.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {userGroups.slice(0, 3).map((group) => (
                                        <GroupCard key={group.id} group={group} />
                                    ))}
                                </div>
                            ) : (
                                <Card className="bg-background border-0 rounded-[32px] p-12 text-center shadow-sm">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-foreground mb-2">No Groups Yet</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Join or create a group to connect with others
                                    </p>
                                    <Button
                                        onClick={() => router.push('/community/groups')}
                                        className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
                                    >
                                        Explore Groups
                                    </Button>
                                </Card>
                            )}
                        </section>


                    </>
                )}

                {activeTab === "Setting" && (
                    <div className="text-center py-20">
                        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-[#023047] mb-2">Settings</h2>
                        <p className="text-muted-foreground">Settings page coming soon...</p>
                    </div>
                )}
            </main>

            {/* Right Sidebar - Calendar */}
            <aside className="hidden md:block md:w-96 bg-card p-10 border-l border-border md:fixed md:right-0 top-20 bottom-0 z-20 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-[#023047]">Calendar</h2>
                    <button className="w-10 h-10 rounded-xl bg-background shadow-sm border border-border flex items-center justify-center text-muted-foreground relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>

                {/* Daily Check-in Component */}
                <div className="mb-8">
                    <DailyCheckIn />
                </div>

                <div className="space-y-12">
                    {timeline.length > 0 ? (
                        timeline.map((section, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-bold text-foreground">{section.date}</h3>
                                    <button className="text-gray-300 hover:text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-8">
                                    {section.items.map((item: any, i: number) => (
                                        <div key={i} className="flex gap-6 relative">
                                            <div className="text-sm font-black text-[#023047] w-12">{item.time}</div>
                                            <div className={`flex-1 border-l-4 ${item.color} pl-6 group cursor-pointer`}>
                                                <h4 className="text-sm font-black text-[#023047] mb-1 group-hover:text-[#219EBC] transition-colors">{item.title}</h4>
                                                <p className="text-muted-foreground text-xs font-bold">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No upcoming meetings scheduled
                        </div>
                    )}
                </div>
            </aside>

            {/* Review Dialog */}
            {selectedSessionForReview && (
                <ReviewDialog
                    open={showReviewDialog}
                    onOpenChange={setShowReviewDialog}
                    session={selectedSessionForReview}
                    onSuccess={handleReviewSuccess}
                />
            )}

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
        </div>
    );
}


export default function StudentDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-lg text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        }>
            <StudentDashboardContent />
        </Suspense>
    );
}
