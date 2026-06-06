"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
import ReviewDialog from "@/components/dashboard/ReviewDialog";
import { FollowersList } from "@/components/community/FollowersList";
import { FollowingList } from "@/components/community/FollowingList";
import { PostCard } from "@/components/community/PostCard";
import { GroupCard } from "@/components/community/GroupCard";
import { useCommunityPosts } from "@/lib/hooks/useCommunityPosts";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";

// Overview Components
import WelcomeSection from "@/components/dashboard/student/Overview/WelcomeSection";
import ProgressSummary from "@/components/dashboard/student/Overview/ProgressSummary";

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

    if (status === "loading" || projectsLoading || meetingsLoading || statsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-16 h-16 rounded-full border-4 border-[#226CE0] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) return null;

    // Sidebar menu items
    const menuItems = [
        { key: "overview", emoji: "📊", label: "Overview Workspace" },
        { key: "community", emoji: "👥", label: "My Community" },
        { key: "tracking", emoji: "⚡", label: "Activity Tracking" },
        { key: "swag", emoji: "🛍️", label: "My Redemptions" },
        { key: "report", emoji: "🚩", label: "Reports" },
        { key: "settings", emoji: "⚙️", label: "Workspace Settings" },
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
        completedAt: project.completedAt || null,
        ownerId: project.ownerId,
        githubUrl: project.githubUrl || null,
        liveUrl: project.liveUrl || null,
    })) || [];

    // Generate user initials
    const userInitials = session.user?.name
        ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

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
        <div className="container dashboard-layout">
            {/* ====== Sidebar ====== */}
            <aside className="card-glass-redesign dashboard-sidebar-card hidden md:flex rounded-2xl w-20 fixed left-0">
                <div className="sr-only">Dashboard Setting</div>
                <div className="dashboard-user-profile">
                    {session.user?.image ? (
                        <div className="w-18 h-18 rounded-full border-2 border-[#A78BFA] overflow-hidden" style={{ boxShadow: '0 0 20px rgba(124,58,237,0.15)' }}>
                            <Image src={session.user.image} alt="User" width={72} height={72} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="dashboard-user-avatar">{userInitials}</div>
                    )}
                    <div className="dashboard-user-name">{session.user?.name || 'Student'}</div>
                    <div className="dashboard-user-tag">{getLevelLabel(user?.level || 1)}</div>
                </div>

                <div className="dashboard-menu">
                    {menuItems.map(item => (
                        <button
                            key={item.key}
                            className={`dashboard-menu-item ${activeTab === item.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.key)}
                        >
                            <span>{item.emoji}</span> {item.label}
                        </button>
                    ))}
                </div>
            </aside>

            {/* ====== Mobile Bottom Nav ====== */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-30 safe-area-pb shadow-lg">
                <nav className="flex items-center justify-around p-2">
                    {menuItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all text-xs font-bold ${
                                activeTab === item.key
                                    ? 'text-[#7C3AED] bg-purple-50 dark:bg-purple-900/20'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <span className="text-base">{item.emoji}</span>
                            <span className="truncate max-w-14">{item.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* ====== Main Content Panel Area ====== */}
            <main className="md:ml-20 md:mr-96" style={{ width: '100%' }}>
                {/* Bento Stats Row */}
                <section className="dashboard-bento">
                    <div className="dashboard-widget-card">
                        <span className="dashboard-widget-label">XP Balance</span>
                        <span className="dashboard-widget-value">{user?.xp || 0} XP</span>
                        <span className="dashboard-widget-footer" style={{ color: '#22C55E' }}>⚡ Level {user?.level || 1}</span>
                    </div>
                    <div className="dashboard-widget-card">
                        <span className="dashboard-widget-label">Enrolled Events</span>
                        <span className="dashboard-widget-value">{userStats?.stats?.eventsAttending || 0} Active</span>
                        <span className="dashboard-widget-footer">Events registered</span>
                    </div>
                    <div className="dashboard-widget-card">
                        <span className="dashboard-widget-label">My Projects</span>
                        <span className="dashboard-widget-value">{projectCounts.all} Total</span>
                        <span className="dashboard-widget-footer" style={{ color: '#7C3AED' }}>{projectCounts.inProgress} In Progress</span>
                    </div>
                    <div className="dashboard-widget-card">
                        <span className="dashboard-widget-label">Builder Level</span>
                        <span className="dashboard-widget-value">Lvl {user?.level || 1}</span>
                        <span className="dashboard-widget-footer" style={{ color: '#226CE0' }}>{getLevelLabel(user?.level || 1)}</span>
                    </div>
                </section>

                {/* ====== Panel: Overview ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'overview' ? 'active' : ''}`}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Welcome Back, {session.user?.name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Your workspace is up to date. Keep participating in events and pushing code to earn more XP.
                    </p>

                    {/* Daily Check-in */}
                    <div className="mb-8">
                        <DailyCheckIn />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }} className="max-lg:grid-cols-1">
                        {/* Left: Activity Timeline */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Recent Workspace Activity</h3>
                            {activityItems.length > 0 ? (
                                <div className="activity-timeline">
                                    {activityItems.slice(0, 5).map((item, i) => (
                                        <div className="activity-item" key={i}>
                                            <div className={`activity-dot ${item.dotClass}`}></div>
                                            <div className="activity-time">{item.time}</div>
                                            <div className="activity-title">{item.title}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No recent activity yet. Join events and book mentor sessions to see activity here.</p>
                            )}
                        </div>

                        {/* Right: Badges & Skill Bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Earned Badges</h3>
                                <div className="dashboard-badge-list">
                                    <div className="badge-icon-box">
                                        <span>💻</span>
                                        <div className="badge-icon-label">Coder</div>
                                    </div>
                                    <div className="badge-icon-box">
                                        <span>{projectCounts.completed > 0 ? '🏆' : '🔒'}</span>
                                        <div className="badge-icon-label">{projectCounts.completed > 0 ? 'Finisher' : 'Locked'}</div>
                                    </div>
                                    <div className="badge-icon-box">
                                        <span>{(user?.currentStreak || 0) >= 3 ? '🔥' : '🔒'}</span>
                                        <div className="badge-icon-label">{(user?.currentStreak || 0) >= 3 ? 'Active' : 'Locked'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Skill Index</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600 }}>
                                            <span>Projects Completed</span>
                                            <span>{Math.min(100, projectCounts.completed * 20)}%</span>
                                        </div>
                                        <div className="radar-bar-track">
                                            <div className="radar-bar-fill" style={{ width: `${Math.min(100, projectCounts.completed * 20)}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600 }}>
                                            <span>Event Participation</span>
                                            <span>{Math.min(100, (userStats?.stats?.eventsAttending || 0) * 25)}%</span>
                                        </div>
                                        <div className="radar-bar-track">
                                            <div className="radar-bar-fill" style={{ width: `${Math.min(100, (userStats?.stats?.eventsAttending || 0) * 25)}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600 }}>
                                            <span>Mentor Sessions</span>
                                            <span>{Math.min(100, mentorSessions.filter(s => s.status === 'COMPLETED').length * 25)}%</span>
                                        </div>
                                        <div className="radar-bar-track">
                                            <div className="radar-bar-fill" style={{ width: `${Math.min(100, mentorSessions.filter(s => s.status === 'COMPLETED').length * 25)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">My Projects</h2>
                        </div>

                        {/* Status Tabs */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <button
                                onClick={() => handleProjectStatusChange('ALL')}
                                className={`px-6 py-3 rounded-2xl font-bold transition-all ${projectStatusFilter === 'ALL'
                                    ? 'bg-[#226CE0] text-white shadow-lg shadow-[#226CE0]/30'
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
                                    ? 'bg-[#226CE0] text-white shadow-lg shadow-[#226CE0]/30'
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
                                    ? 'bg-[#226CE0] text-white shadow-lg shadow-[#226CE0]/30'
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

                        {/* Project Cards */}
                        <ProgressSummary
                            projects={projectsDisplay}
                            searchQuery={searchQuery}
                            onEdit={(projectId) => {
                                const raw = projects?.find(p => p.id === projectId);
                                if (raw) setEditingProject(raw as any);
                            }}
                            currentUserId={session?.user?.id}
                        />
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

                {/* ====== Panel: Community ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'community' ? 'active' : ''}`}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        My Community Profile
                    </h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Your posts, followers, and groups at a glance.
                    </p>

                    {/* Community Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                        <Card className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-600" />
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
                            <h3 className="text-2xl font-bold text-foreground">My Posts</h3>
                            <Button
                                onClick={() => router.push('/community')}
                                variant="outline"
                                className="rounded-xl"
                            >
                                View Feed
                            </Button>
                        </div>
                        {postsLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading posts...</p>
                            </div>
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
                            <Card className="bg-card border rounded-4xl p-12 text-center shadow-sm">
                                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">No Posts Yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Share your first post with the community
                                </p>
                                <Button
                                    onClick={() => router.push('/community')}
                                    className="bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl"
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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading groups...</p>
                            </div>
                        ) : userGroups.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {userGroups.slice(0, 3).map((group) => (
                                    <GroupCard key={group.id} group={group} />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-card border rounded-4xl p-12 text-center shadow-sm">
                                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">No Groups Yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Join or create a group to connect with others
                                </p>
                                <Button
                                    onClick={() => router.push('/community/groups')}
                                    className="bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl"
                                >
                                    Explore Groups
                                </Button>
                            </Card>
                        )}
                    </section>
                </div>

                {/* ====== Panel: Tracking ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'tracking' ? 'active' : ''}`}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Activity Tracking
                    </h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Monitor your progress, XP rewards, and achievement metrics.
                    </p>

                    {/* XP & Level Card */}
                    <Card className="bg-linear-to-br from-[#226CE0] to-[#1A234A] text-white border-0 rounded-4xl p-8 shadow-xl max-w-2xl mb-10">
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
                                <Trophy className="w-16 h-16 opacity-20" />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-background/20 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold opacity-90">
                                    {(() => {
                                        const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];
                                        const currentLevel = user?.level || 1;
                                        const currentXP = user?.xp || 0;
                                        if (currentLevel >= 10) return 'Max Level Reached!';
                                        const currentThreshold = thresholds[currentLevel - 1];
                                        return `${currentXP - currentThreshold} XP`;
                                    })()}
                                </span>
                                <span className="text-xs font-bold opacity-90">
                                    {(() => {
                                        const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000];
                                        const currentLevel = user?.level || 1;
                                        const currentXP = user?.xp || 0;
                                        if (currentLevel >= 10) return '';
                                        const nextThreshold = thresholds[currentLevel];
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
                                <p className="text-lg font-black">Lvl {user?.level || 1}</p>
                            </div>
                            <div className="bg-background/20 rounded-xl p-3 text-center">
                                <Target className="w-5 h-5 mx-auto mb-1 opacity-75" />
                                <p className="text-xs opacity-75 mb-1">Next</p>
                                <p className="text-lg font-black">
                                    {(user?.level || 1) >= 10 ? 'MAX' : `Lvl ${(user?.level || 1) + 1}`}
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
                        <h3 className="text-2xl font-bold text-foreground mb-6">XP Rewards</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            <Card className="bg-card border rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                                <p className="text-2xl font-bold text-foreground mb-1">{(userStats?.stats?.eventsAttending || 0) * 50}</p>
                                <p className="text-xs text-muted-foreground font-bold">Event Attendance</p>
                            </Card>
                            <Card className="bg-card border rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-2xl font-black text-foreground mb-1">{projectCounts.completed * 100}</p>
                                <p className="text-xs text-muted-foreground font-bold">Project Completion</p>
                            </Card>
                            <Card className="bg-card border rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-2xl font-black text-foreground mb-1">{mentorSessions.filter(s => s.status === 'COMPLETED').length * 25}</p>
                                <p className="text-xs text-muted-foreground font-bold">Mentor Sessions</p>
                            </Card>
                            <Card className="bg-card border rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Flame className="w-6 h-6 text-orange-600" />
                                </div>
                                <p className="text-2xl font-black text-foreground mb-1">{(user?.currentStreak || 0) * 20}</p>
                                <p className="text-xs text-muted-foreground font-bold">Streak Bonus</p>
                            </Card>
                            <Card className="bg-card border rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
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
                        <h3 className="text-2xl font-bold text-foreground mb-6">Activity Summary</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            <Card className="bg-card border rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                        <Target className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{userStats?.stats?.projectsOwned || 0}</p>
                                <p className="text-sm text-muted-foreground font-bold">Projects Created</p>
                            </Card>
                            <Card className="bg-card border rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{userStats?.stats?.projectsJoined || 0}</p>
                                <p className="text-sm text-muted-foreground font-bold">Projects Joined</p>
                            </Card>
                            <Card className="bg-card border rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-1">{userStats?.stats?.eventsAttending || 0}</p>
                                <p className="text-sm text-muted-foreground font-bold">Events Attended</p>
                            </Card>
                            <Card className="bg-card border rounded-3xl p-6 shadow-sm">
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
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        My Redemptions
                    </h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Your orders and swag history.
                    </p>
                    <SwagOrdersList />
                </div>

                {/* ====== Panel: Report ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'report' ? 'active' : ''}`}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Reports
                    </h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
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
                            <h2 className="text-2xl font-bold text-foreground">My Reports</h2>
                            <button
                                onClick={fetchMyReports}
                                className="text-sm text-[#226CE0] hover:underline font-medium"
                            >
                                Refresh
                            </button>
                        </div>

                        {reportsLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-10 h-10 animate-spin text-[#226CE0]" />
                            </div>
                        ) : myReports.length === 0 ? (
                            <div className="bg-muted/40 border border-border rounded-3xl p-12 text-center">
                                <Flag className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-foreground mb-2">No reports yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                    Use the button above to report bugs, violations, or any platform issue.
                                    Attach photos and videos as evidence.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myReports.map((report) => {
                                    const STATUS_STYLE = {
                                        OPEN: { label: 'Open', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                                        IN_REVIEW: { label: 'In Review', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
                                        RESOLVED: { label: 'Resolved', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                                        DISMISSED: { label: 'Dismissed', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
                                    };
                                    const s = STATUS_STYLE[report.status as keyof typeof STATUS_STYLE];
                                    const SIcon = s?.icon || AlertCircle;
                                    return (
                                        <div
                                            key={report.id}
                                            className="bg-card border border-border rounded-3xl p-6 hover:shadow-md transition-shadow"
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

                {/* ====== Panel: Settings ====== */}
                <div className={`dashboard-content-panel ${activeTab === 'settings' ? 'active' : ''}`}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Workspace Settings
                    </h1>
                    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Customize your profile. Updating these parameters will help other community members discover and connect with you.
                    </p>

                    <div className="bg-card border border-border rounded-2xl p-8">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }} className="max-sm:grid-cols-1">
                            <div className="dashboard-form-group">
                                <label className="dashboard-form-label">Full Name</label>
                                <input type="text" className="dashboard-form-input" placeholder={session.user?.name || 'Your Name'} defaultValue={session.user?.name || ''} readOnly />
                            </div>
                            <div className="dashboard-form-group">
                                <label className="dashboard-form-label">Email</label>
                                <input type="email" className="dashboard-form-input" placeholder={session.user?.email || 'your@email.com'} defaultValue={session.user?.email || ''} readOnly />
                            </div>
                            <div className="dashboard-form-group">
                                <label className="dashboard-form-label">GitHub Profile URL</label>
                                <input type="url" className="dashboard-form-input" placeholder="https://github.com/username" />
                            </div>
                            <div className="dashboard-form-group">
                                <label className="dashboard-form-label">LinkedIn Profile URL</label>
                                <input type="url" className="dashboard-form-input" placeholder="https://linkedin.com/in/username" />
                            </div>
                        </div>

                        <div className="dashboard-form-group mb-4">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="dashboard-form-label">Technical Stack & Skills</label>
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>(Comma separated)</span>
                            </div>
                            <input type="text" className="dashboard-form-input" placeholder="React, Node, Python, Figma, etc." />
                        </div>

                        <div className="dashboard-form-group mb-6">
                            <label className="dashboard-form-label">Developer Biography</label>
                            <textarea className="dashboard-form-input" rows={4} placeholder="Briefly describe what you like to build..." style={{ resize: 'none' }}></textarea>
                        </div>

                        <button
                            className="w-full flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/20"
                            onClick={() => {
                                alert('Profile settings saved! ✨');
                            }}
                        >
                            Update Workspace Profile Info 🚀
                        </button>
                    </div>
                </div>
            </main>

            {/* ====== Right Sidebar - Calendar ====== */}
            <aside className="hidden md:block w-96 fixed right-0 bg-card p-10 border-l border-border top-20 bottom-0 z-20 overflow-y-auto" aria-label="Calendar sidebar">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-foreground">Calendar</h2>
                </div>
                {/* Daily Check-in Component */}
                <div className="mb-8">
                    <DailyCheckIn />
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
