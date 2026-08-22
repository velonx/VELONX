"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flag, Home, FolderKanban, TrendingUp, AlertCircle } from "lucide-react";
import { useProjects, useUserStats } from "@/lib/api/hooks";
import { ProfileCompletionWizard } from "@/components/dashboard/ProfileCompletionWizard";
import ReviewDialog from "@/components/dashboard/ReviewDialog";
import BadgeModal from "@/components/badges/BadgeModal";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { ReportDialog } from "@/components/ReportDialog";
import { DashboardFullSkeleton as FullDashboardSkeleton } from "@/components/boneyard";

// Tab Components
import HomeTab from "@/components/dashboard/student/Home/HomeTab";
import ActivityTab from "@/components/dashboard/student/Activity/ActivityTab";
import ProgressTab from "@/components/dashboard/student/Progress/ProgressTab";

function StudentDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary navigation: 'home' | 'activity' | 'progress'
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeCategory, setActiveCategory] = useState<string>("projects");

  // Modal states
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<any | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Mentor sessions state
  const [mentorSessions, setMentorSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Badges state
  const [badges, setBadges] = useState<any[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Sync tab with URL search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      if (tabParam === "overview" || tabParam === "home") {
        setActiveTab("home");
      } else if (
        tabParam === "activity" ||
        tabParam === "projects" ||
        tabParam === "swag" ||
        tabParam === "sessions"
      ) {
        setActiveTab("activity");
        if (tabParam === "swag") setActiveCategory("orders");
        else if (tabParam === "sessions") setActiveCategory("sessions");
        else setActiveCategory("projects");
      } else if (tabParam === "tracking" || tabParam === "progress") {
        setActiveTab("progress");
      }
    }

    const catParam = searchParams.get("category");
    if (catParam) {
      setActiveCategory(catParam);
    }
  }, [searchParams]);

  // Fetch projects data
  const { data: projects, loading: projectsLoading, refetch: refetchProjects } = useProjects({
    pageSize: 100,
    memberId: session?.user?.id,
  });

  // Fetch user stats
  const { data: userStats, loading: statsLoading } = useUserStats(session?.user?.id || "skip");

  // Fetch mentor sessions
  const fetchMentorSessions = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoadingSessions(true);
    try {
      const response = await fetch("/api/mentor-sessions?viewAs=student&pageSize=20");
      const data = await response.json();
      if (data.success) {
        setMentorSessions(data.data || []);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, [session?.user?.id]);

  // Fetch badges
  const fetchBadges = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoadingBadges(true);
    try {
      const res = await fetch("/api/user/badges");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBadges(data.data || []);
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
      fetchMentorSessions();
      fetchBadges();
    }
  }, [session?.user?.id, fetchMentorSessions, fetchBadges]);

  const handleNavigateTab = (tab: string, subCategory?: string) => {
    setActiveTab(tab);
    if (subCategory) {
      setActiveCategory(subCategory);
    }
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (subCategory) {
      params.set("category", subCategory);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleReviewSession = (sessionId: string) => {
    const s = mentorSessions.find((item) => item.id === sessionId);
    if (s) {
      setSelectedSessionForReview(s);
      setShowReviewDialog(true);
    }
  };

  if (status === "loading" || (projectsLoading && !projects)) {
    return <FullDashboardSkeleton />;
  }

  if (!session) return null;

  const tabs = [
    { key: "home", label: "Home", icon: Home },
    { key: "activity", label: "My Activity", icon: FolderKanban },
    { key: "progress", label: "Progress & Rewards", icon: TrendingUp },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20">
      {/* Top Bar with Simplified Tab Navigation & Report Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Navigation Tabs (Unstop style clean pills) */}
        <div className="flex items-center gap-2 bg-card border border-border/80 p-1.5 rounded-2xl w-fit shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleNavigateTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Report Trigger */}
        <button
          onClick={() => setShowReportDialog(true)}
          className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-border/60 transition-colors cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Main Tab Content Panels */}
      <main className="w-full">
        {activeTab === "home" && (
          <HomeTab
            user={session.user}
            userStats={userStats}
            projects={projects || []}
            mentorSessions={mentorSessions}
            badges={badges}
            onNavigateTab={handleNavigateTab}
            onOpenBadge={(badge) => {
              setSelectedBadge(badge);
              setShowBadgeModal(true);
            }}
          />
        )}

        {activeTab === "activity" && (
          <ActivityTab
            userId={session?.user?.id || ""}
            initialCategory={activeCategory}
            projects={projects || []}
            mentorSessions={mentorSessions}
            loadingSessions={loadingSessions}
            badges={badges}
            loadingBadges={loadingBadges}
            onEditProject={(project) => setEditingProject(project)}
            onReviewSession={handleReviewSession}
            onCancelSession={(sessionId) =>
              setMentorSessions((prev) => prev.filter((s) => s.id !== sessionId))
            }
            onOpenBadge={(badge) => {
              setSelectedBadge(badge);
              setShowBadgeModal(true);
            }}
          />
        )}

        {activeTab === "progress" && (
          <ProgressTab
            user={session.user}
            userStats={userStats}
            projects={projects || []}
            mentorSessions={mentorSessions}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {selectedSessionForReview && (
        <ReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          session={selectedSessionForReview}
          onSuccess={() => {
            setShowReviewDialog(false);
            setSelectedSessionForReview(null);
            fetchMentorSessions();
          }}
        />
      )}

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSuccess={() => setShowReportDialog(false)}
      />

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={true}
          onClose={() => setEditingProject(null)}
          onSaved={() => {
            setEditingProject(null);
            refetchProjects();
          }}
        />
      )}

      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => {
          setShowBadgeModal(false);
          setSelectedBadge(null);
        }}
        badge={selectedBadge}
      />

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
