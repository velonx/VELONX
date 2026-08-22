"use client";

import { useRouter } from "next/navigation";
import {
  Award,
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { XP_THRESHOLDS, calculateLevel } from "@/lib/utils/xp-constants";

interface ProgressTabProps {
  user: any;
  userStats: any;
  projects: any[];
  mentorSessions: any[];
}

export default function ProgressTab({
  user,
  userStats,
  projects,
  mentorSessions,
}: ProgressTabProps) {
  const router = useRouter();

  const activeXP = userStats?.user?.xp !== undefined ? userStats.user.xp : (user?.xp || 0);
  const activeLevel =
    userStats?.user?.level && userStats.user.level > 0
      ? userStats.user.level
      : user?.level && user.level > 0
      ? user.level
      : calculateLevel(activeXP);

  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const completedSessions = mentorSessions.filter((s) => s.status === "COMPLETED").length;
  const eventsAttended = userStats?.stats?.eventsAttending || 0;
  const streak = user?.currentStreak || 0;

  // Level thresholds & progress
  const currentThreshold = activeLevel >= 10 ? 10000 : XP_THRESHOLDS[activeLevel - 1] || 0;
  const nextThreshold = activeLevel >= 10 ? 10000 : XP_THRESHOLDS[activeLevel] || 1000;
  const xpInCurrentLevel = activeXP - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progressPercent =
    activeLevel >= 10 ? 100 : Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeeded) * 100));

  const getLevelLabel = (level: number) => {
    if (level >= 8) return "Elite Builder";
    if (level >= 6) return "Senior Builder";
    if (level >= 4) return "Active Builder";
    if (level >= 2) return "Rising Builder";
    return "Student Builder";
  };

  return (
    <div className="space-y-8">
      {/* Level & XP Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#F0771A] via-[#E0650D] to-[#1E1B4B] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" /> Level {activeLevel} • {getLevelLabel(activeLevel)}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight">{activeXP} XP</h2>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              Total experience earned across platform activities
            </p>
          </div>

          <button
            onClick={() => router.push("/leaderboard")}
            className="self-start md:self-center px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <Trophy className="w-4 h-4 text-amber-300" /> Leaderboard Rankings
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar to next level */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs font-bold text-white/90 mb-2">
            <span>
              {activeLevel >= 10 ? "Max Level Reached!" : `${Math.max(0, xpInCurrentLevel)} XP earned in Level ${activeLevel}`}
            </span>
            <span>
              {activeLevel >= 10 ? "100%" : `${Math.max(0, nextThreshold - activeXP)} XP to Level ${activeLevel + 1}`}
            </span>
          </div>

          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Level milestones */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-white/70">Current</p>
              <p className="text-base font-black">Lvl {activeLevel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-white/70">Next Goal</p>
              <p className="text-base font-black">{activeLevel >= 10 ? "MAX" : `Lvl ${activeLevel + 1}`}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-white/70">Cap</p>
              <p className="text-base font-black">Lvl 10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Index & Engagement Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Index / Progress Bars */}
        <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-[#F0771A]" /> Skill & Completion Index
            </h3>
            <span className="text-xs font-bold text-muted-foreground">Real-time Metrics</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                <span>Projects Completed</span>
                <span className="text-[#F0771A]">{Math.min(100, completedProjects * 25)}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F0771A] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, completedProjects * 25)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                {completedProjects} projects completed so far
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                <span>Event Participation</span>
                <span className="text-emerald-500">{Math.min(100, eventsAttended * 20)}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, eventsAttended * 20)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                {eventsAttended} events attended or registered
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                <span>Mentor Sessions Attended</span>
                <span className="text-purple-500">{Math.min(100, completedSessions * 33)}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, completedSessions * 33)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                {completedSessions} sessions with industry mentors
              </p>
            </div>
          </div>
        </div>

        {/* Activity Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F0771A]/10 text-[#F0771A] flex items-center justify-center mb-3">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{projects.length}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-0.5">Total Projects</p>
            </div>
          </Card>

          <Card className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{completedSessions}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-0.5">Mentor Sessions</p>
            </div>
          </Card>

          <Card className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{eventsAttended}</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-0.5">Events Enrolled</p>
            </div>
          </Card>

          <Card className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{streak} Days</p>
              <p className="text-xs text-muted-foreground font-bold uppercase mt-0.5">Active Streak</p>
            </div>
          </Card>
        </div>
      </div>

      {/* XP Rewards Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-foreground">XP Rewards Breakdown</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground mb-1">Project Completions</p>
            <p className="text-xl font-black text-[#F0771A]">+{completedProjects * 100} XP</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">100 XP per project</p>
          </div>

          <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground mb-1">Mentor Sessions</p>
            <p className="text-xl font-black text-emerald-500">+{completedSessions * 25} XP</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">25 XP per session</p>
          </div>

          <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground mb-1">Event Attendance</p>
            <p className="text-xl font-black text-purple-500">+{eventsAttended * 50} XP</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">50 XP per event</p>
          </div>

          <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground mb-1">Daily Streak Bonus</p>
            <p className="text-xl font-black text-orange-500">+{streak * 20} XP</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">20 XP per streak day</p>
          </div>
        </div>
      </div>
    </div>
  );
}
