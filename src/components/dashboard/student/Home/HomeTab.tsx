"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Award,
  Calendar,
  FolderOpen,
  Plus,
  ArrowRight,
  Video,
  Clock,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DailyCheckIn } from "@/components/daily-check-in";
import BadgeIcon from "@/components/badges/BadgeIcon";
import UpcomingEventsWidget from "./UpcomingEventsWidget";
import { calculateLevel } from "@/lib/utils/xp-constants";

interface HomeTabProps {
  user: any;
  userStats: any;
  projects: any[];
  mentorSessions: any[];
  badges: any[];
  onNavigateTab: (tab: string, subCategory?: string) => void;
  onOpenBadge: (badge: any) => void;
}

export default function HomeTab({
  user,
  userStats,
  projects,
  mentorSessions,
  badges,
  onNavigateTab,
  onOpenBadge,
}: HomeTabProps) {
  const router = useRouter();

  const firstName = user?.name ? user.name.split(" ")[0] : "Builder";
  const activeXP = userStats?.user?.xp !== undefined ? userStats.user.xp : (user?.xp || 0);
  const activeLevel =
    userStats?.user?.level && userStats.user.level > 0
      ? userStats.user.level
      : user?.level && user.level > 0
      ? user.level
      : calculateLevel(activeXP);

  const streak = user?.currentStreak || 0;

  // Find upcoming mentor sessions
  const upcomingSessions = useMemo(() => {
    return mentorSessions
      .filter((s) => s.status === "CONFIRMED" || s.status === "PENDING")
      .slice(0, 2);
  }, [mentorSessions]);

  // Active in-progress projects
  const activeProjects = useMemo(() => {
    return projects.filter((p) => p.status === "IN_PROGRESS").slice(0, 2);
  }, [projects]);

  const earnedBadgesCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#1E1B4B] via-[#0F172A] to-[#1E293B] border border-border/40 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#F0771A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F0771A]" /> Student Hub
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2">
              Welcome back, <span className="text-[#F0771A]">{firstName}</span>! 👋
            </h1>
            <p className="text-white/70 text-sm max-w-xl">
              Track your projects, mentorship sessions, and achievements all in one streamlined dashboard.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 shrink-0">
            <div
              onClick={() => onNavigateTab("progress")}
              className="p-2 sm:p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-center"
            >
              <div className="flex items-center justify-center gap-1 text-[#F0771A] font-bold text-xs sm:text-sm">
                <span>⚡</span> {activeXP}
              </div>
              <p className="text-[10px] text-white/60 font-semibold uppercase mt-0.5">Total XP</p>
            </div>

            <div
              onClick={() => onNavigateTab("progress")}
              className="p-2 sm:p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-center border-x border-white/10"
            >
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-xs sm:text-sm">
                <Award className="w-3.5 h-3.5" /> Lvl {activeLevel}
              </div>
              <p className="text-[10px] text-white/60 font-semibold uppercase mt-0.5">Rank</p>
            </div>

            <div className="p-2 sm:p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-xs sm:text-sm">
                <Flame className="w-3.5 h-3.5" /> {streak}d
              </div>
              <p className="text-[10px] text-white/60 font-semibold uppercase mt-0.5">Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts (Unstop-style quick access) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <button
          onClick={() => router.push("/submit-project")}
          className="group flex flex-col p-4 rounded-2xl bg-card border border-border/70 hover:border-[#F0771A]/40 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0771A]/10 text-[#F0771A] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-foreground group-hover:text-[#F0771A] transition-colors">
            Submit Project
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Showcase your build</p>
        </button>

        <button
          onClick={() => router.push("/mentors")}
          className="group flex flex-col p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">
            Find Mentors
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">1-on-1 career guidance</p>
        </button>

        <button
          onClick={() => router.push("/events")}
          className="group flex flex-col p-4 rounded-2xl bg-card border border-border/70 hover:border-purple-500/40 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-foreground group-hover:text-purple-500 transition-colors">
            Hackathons
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Compete & win prizes</p>
        </button>

        <button
          onClick={() => router.push("/career")}
          className="group flex flex-col p-4 rounded-2xl bg-card border border-border/70 hover:border-blue-500/40 hover:shadow-md transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors">
            Opportunities
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Internships & jobs</p>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Scheduled Engagements & Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Sessions / Next Up Section */}
          <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-extrabold text-foreground">Upcoming Sessions</h3>
              </div>
              <button
                onClick={() => onNavigateTab("activity", "sessions")}
                className="text-xs font-bold text-[#F0771A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="rounded-2xl bg-muted/30 border border-dashed border-border/80 p-6 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground mb-1">No upcoming sessions booked</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Connect with experienced industry mentors for guidance and mock interviews.
                </p>
                <Button
                  onClick={() => router.push("/mentors")}
                  size="sm"
                  className="rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs"
                >
                  Browse Mentors
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => {
                  const date = new Date(session.date);
                  return (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/60 gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {session.mentor?.name?.[0] || "M"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{session.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            with {session.mentor?.name || "Mentor"} ({session.mentor?.company || "Tech"})
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-primary" />
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" />
                              {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {session.meetingLink ? (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-xs shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" /> Join Call
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-semibold self-start sm:self-auto">
                          Confirmed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Projects Overview */}
          <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#F0771A]" />
                <h3 className="text-base font-extrabold text-foreground">In-Progress Projects</h3>
              </div>
              <button
                onClick={() => onNavigateTab("activity", "projects")}
                className="text-xs font-bold text-[#F0771A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all ({projects.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeProjects.length === 0 ? (
              <div className="rounded-2xl bg-muted/30 border border-dashed border-border/80 p-6 text-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground mb-1">No active projects right now</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Start building a new project or collaborate with fellow student builders.
                </p>
                <Button
                  onClick={() => router.push("/submit-project")}
                  size="sm"
                  className="rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onNavigateTab("activity", "projects")}
                    className="p-4 rounded-2xl bg-muted/20 border border-border/60 hover:border-[#F0771A]/50 hover:bg-muted/40 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#F0771A]/10 text-[#F0771A]">
                          In Progress
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          {project._count?.members || project.members?.length || 1} members
                        </span>
                      </div>
                      <h4 className="font-extrabold text-foreground text-sm line-clamp-1 mb-1">
                        {project.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {project.description || "Building real-world features on Velonx."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>50%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-[#F0771A] rounded-full w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Daily Check-In, Badges Preview, Events Widget */}
        <div className="space-y-6">
          {/* Daily Check-In */}
          <DailyCheckIn />

          {/* Badges Preview Widget */}
          <div className="bg-card border border-border/70 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> Badges
              </h3>
              <button
                onClick={() => onNavigateTab("activity", "badges")}
                className="text-xs font-bold text-[#F0771A] hover:underline cursor-pointer"
              >
                {earnedBadgesCount} / {badges.length || 44} Earned
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {badges.slice(0, 4).map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => onOpenBadge(badge)}
                  className="flex flex-col items-center p-2 rounded-xl bg-muted/30 hover:bg-muted/70 transition-colors text-center cursor-pointer group"
                >
                  <BadgeIcon
                    name={badge.name}
                    rarity={badge.rarity}
                    category={badge.category}
                    earned={badge.earned}
                    size="sm"
                  />
                  <span className="text-[10px] font-bold text-foreground mt-1 truncate w-full group-hover:text-[#F0771A]">
                    {badge.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Events Widget */}
          <UpcomingEventsWidget />
        </div>
      </div>
    </div>
  );
}
