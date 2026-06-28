/**
 * Pre-composed domain skeletons — built from Bone primitives.
 *
 * Each skeleton here replaces a block of inline <Skeleton> elements
 * scattered across pages. They are the single source of truth for
 * how loading states look for each card type.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight, ShieldCheck, Briefcase, GraduationCap } from 'lucide-react';
import {
  BoneText,
  BoneAvatar,
  BoneImage,
  BoneBadge,
  BoneButton,
  BoneBar,
  BoneBlock,
  BoneIcon,
} from './Bone';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HERO / GLOBAL LOADING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Global loading hero section (used in loading.tsx) */
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("py-20 relative z-10 text-center space-y-8 flex flex-col items-center", className)}>
      <div className="container mx-auto px-4 flex flex-col items-center">
        <Skeleton className="h-6 w-32 rounded-full mb-4 opacity-70" />
        <Skeleton className="h-16 md:h-20 w-4/5 max-w-2xl rounded-3xl" />
        <Skeleton className="h-6 w-2/3 max-w-md rounded-lg mt-6 opacity-60" />
        <div className="flex gap-4 mt-8">
          <BoneButton size="lg" width="w-32" />
          <BoneButton size="lg" width="w-32" className="opacity-80" />
        </div>
      </div>
    </section>
  );
}

/** Global loading grid card (used in loading.tsx) */
export function GridCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 border border-border/50 rounded-4xl bg-card/40 backdrop-blur-md flex flex-col space-y-5 relative overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <BoneImage aspect="aspect-video" className="rounded-3xl" />
      <div className="flex justify-between items-center px-1">
        <BoneBadge width="w-20" />
        <BoneBlock className="h-4 w-12 rounded-md" />
      </div>
      <div className="space-y-3 px-1 grow">
        <Skeleton className="h-7 w-3/4 rounded-xl" />
        <BoneText lines={2} lastWidth="w-5/6" className="opacity-70" />
      </div>
      <div className="flex justify-between items-center border-t border-border/30 pt-4 px-1 mt-auto">
        <BoneBadge width="w-16" />
        <BoneButton size="sm" />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MENTORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Mentor card skeleton (home page + mentors page) */
export function MentorCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-mentor-card pointer-events-none w-full min-h-87.5", className)} aria-hidden="true">
      <div className="p-mentor-avatar-wrapper">
        <Skeleton className="w-full h-full rounded-full" />
      </div>
      <Skeleton className="h-6 w-32 rounded mx-auto mb-2 mt-4" />
      <Skeleton className="h-4 w-24 rounded mx-auto mb-4" />
      <div className="flex justify-center gap-2 mb-6">
        <BoneBlock className="h-5 w-12" />
        <BoneBlock className="h-5 w-12" />
      </div>
      <div className="p-mentor-footer mt-auto w-full">
        <Skeleton className="h-4 w-28 rounded mx-auto mb-2" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SWAG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Swag store card skeleton */
export function SwagCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "card-redesign card-glass-redesign swag-card pointer-events-none flex flex-col justify-between gap-4",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex flex-col flex-1 gap-3">
        <Skeleton className="w-full h-48 rounded-xl bg-muted/20" />
        <Skeleton className="h-5 rounded w-3/4 mt-4 bg-muted/20" />
        <BoneText lines={2} lastWidth="w-5/6" height="h-4" className="[&_*]:bg-muted/20" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border/40 mt-6">
        <Skeleton className="h-6 rounded w-1/3 bg-muted/20" />
        <Skeleton className="h-8 rounded w-1/4 bg-muted/20" />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEADERBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Leaderboard podium skeleton (top 3 with different sizes) */
export function LeaderboardPodiumSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center items-end gap-4 max-w-175 mx-auto animate-pulse", className)}>
      {/* Silver — Rank 2 */}
      <div className="flex-1 max-w-50 text-center">
        <div className="podium-card-inner border-border/40 bg-muted/20">
          <BoneAvatar size="xs" className="mx-auto mb-2" />
          <BoneAvatar size="xl" className="mx-auto mb-3" />
          <Skeleton className="w-24 h-4 mx-auto mb-2" />
          <Skeleton className="w-28 h-3 mx-auto mb-4" />
          <Skeleton className="w-16 h-5 mx-auto" />
        </div>
        <div className="podium-block bg-muted/10 h-13.75 text-muted-foreground/30 text-lg">2</div>
      </div>
      {/* Gold — Rank 1 */}
      <div className="flex-1 max-w-55 text-center -mt-6">
        <div className="podium-card-inner border-border/40 bg-muted/20">
          <Skeleton className="w-8 h-6 mx-auto mb-2" />
          <BoneAvatar size="xs" className="mx-auto mb-2" />
          <BoneAvatar size="3xl" className="mx-auto mb-3" />
          <Skeleton className="w-28 h-5 mx-auto mb-2" />
          <Skeleton className="w-32 h-3 mx-auto mb-4" />
          <Skeleton className="w-20 h-6 mx-auto" />
        </div>
        <div className="podium-block bg-muted/15 h-20 text-muted-foreground/40 text-2xl">1</div>
      </div>
      {/* Bronze — Rank 3 */}
      <div className="flex-1 max-w-50 text-center">
        <div className="podium-card-inner border-border/40 bg-muted/20">
          <BoneAvatar size="xs" className="mx-auto mb-2" />
          <BoneAvatar size="xl" className="mx-auto mb-3" />
          <Skeleton className="w-24 h-4 mx-auto mb-2" />
          <Skeleton className="w-28 h-3 mx-auto mb-4" />
          <Skeleton className="w-16 h-5 mx-auto" />
        </div>
        <div className="podium-block bg-muted/10 h-10 text-muted-foreground/30 text-lg">3</div>
      </div>
    </div>
  );
}

/** Leaderboard table row skeleton */
export function LeaderboardRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("lb-row animate-pulse pointer-events-none", className)} aria-hidden="true">
      <BoneBlock className="w-6 h-5" />
      <div className="flex items-center gap-3">
        <BoneAvatar size="md" />
        <div className="space-y-1.5">
          <Skeleton className="w-28 h-4 rounded" />
          <Skeleton className="w-36 h-3 rounded" />
        </div>
      </div>
      <div className="col-tier flex items-center">
        <BoneBadge width="w-20" className="h-5" />
      </div>
      <div className="col-skill flex items-center">
        <BoneBlock className="w-16 h-4" />
      </div>
      <BoneBlock className="w-16 h-5" />
      <div className="col-hackathons flex justify-center">
        <BoneBlock className="w-8 h-5" />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAREER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Career / internship listing card skeleton */
export function CareerCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-job-card animate-pulse border-border/60", className)} aria-hidden="true">
      <Skeleton className="shrink-0 w-14 h-14 rounded-xl bg-muted/20" />
      <div className="p-job-info-main flex-1 w-full">
        <div className="flex items-center gap-2 mb-1.5">
          <Skeleton className="h-6 w-1/3 min-w-37.5 max-w-60 bg-muted/30 rounded" />
        </div>
        <div className="p-job-details-meta flex flex-wrap gap-4 items-center">
          <Skeleton className="h-4 w-24 bg-muted/20 rounded" />
          <Skeleton className="h-4 w-28 bg-muted/20 rounded" />
          <Skeleton className="h-4 w-20 bg-muted/20 rounded" />
          <Skeleton className="h-4 w-24 bg-muted/20 rounded" />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Skeleton className="h-6 w-16 bg-muted/15 rounded" />
          <Skeleton className="h-6 w-20 bg-muted/15 rounded" />
          <Skeleton className="h-6 w-24 bg-muted/15 rounded" />
        </div>
      </div>
      <div className="p-job-action shrink-0 flex items-center gap-3">
        <Skeleton className="h-6 w-16 bg-muted/20 rounded-full" />
        <Skeleton className="h-9 w-28 bg-muted/30 rounded-lg" />
        <Skeleton className="h-9 w-9 bg-muted/20 rounded-lg" />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Blog hero skeleton (header on blog list page) */
export function BlogHeroSkeleton({ className }: { className?: string }) {
  return (
    <header className={cn("relative pt-16 pb-12 bg-background overflow-hidden text-center", className)}>
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        <Skeleton className="h-6 w-44 rounded-full mb-4" />
        <Skeleton className="h-14 w-80 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-lg mt-4" />
      </div>
    </header>
  );
}

/** Blog card skeleton (blog listing grid) */
export function BlogCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-blog-card pointer-events-none w-full min-h-87.5", className)} aria-hidden="true">
      <Skeleton className="p-blog-card-banner w-full h-50" />
      <Skeleton className="h-5 w-24 rounded mb-3 mt-4" />
      <Skeleton className="h-7 w-full rounded mb-4" />
      <Skeleton className="h-4 w-5/6 rounded mb-2" />
      <Skeleton className="h-4 w-4/5 rounded mb-6" />
      <div className="p-blog-footer mt-auto">
        <Skeleton className="h-5 w-28 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  );
}

/** Blog post detail skeleton (individual post page) */
export function BlogPostSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen pt-24 bg-background pb-20", className)}>
      {/* Sticky toolbar */}
      <div className="sticky top-24 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
      {/* Article */}
      <article className="container mx-auto px-4 max-w-3xl pt-20 space-y-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center gap-2">
            <Skeleton className="h-7 w-20 rounded-xl" />
            <Skeleton className="h-7 w-20 rounded-xl" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="flex justify-center gap-8">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-full h-90 rounded-3xl" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 rounded-md ${i % 4 === 3 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </article>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMUNITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Community sidebar group item skeleton */
export function CommunityGroupItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("group-item pointer-events-none", className)} aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-6" />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Dashboard sidebar skeleton */
export function DashboardSidebarSkeleton({ className }: { className?: string }) {
  return (
    <aside className={cn("card-glass-redesign dashboard-sidebar-card hidden md:block rounded-2xl w-full flex-col p-6 space-y-6 animate-pulse", className)}>
      <div className="flex flex-col items-center gap-3">
        <BoneAvatar size="2xl" />
        <Skeleton className="h-5 w-32" />
        <BoneBadge width="w-24" className="h-4" />
      </div>
      <div className="space-y-3 pt-6 w-full px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </aside>
  );
}

/** Dashboard welcome section skeleton */
export function DashboardWelcomeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-12 w-64 rounded-xl" />
    </div>
  );
}

/** Dashboard bento stats skeleton */
export function DashboardStatsSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("dashboard-bento mb-8", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="dashboard-widget-card space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </section>
  );
}

/** Dashboard project card skeleton */
export function DashboardProjectSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-[40px] p-8 space-y-6", className)} aria-hidden="true">
      <div className="flex justify-between items-start">
        <div className="flex -space-x-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <BoneAvatar key={idx} size="md" className="border border-background" />
          ))}
        </div>
        <div className="flex gap-2">
          <BoneAvatar size="sm" />
          <BoneAvatar size="sm" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <BoneBar />
      </div>
    </div>
  );
}

/** Dashboard daily check-in skeleton */
export function DashboardCheckInSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full rounded-[20px] bg-linear-to-br from-orange-500/80 to-amber-400/80 p-5 text-white shadow-lg space-y-4 animate-pulse", className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-white/20 rounded" />
          <div className="h-8 w-16 bg-white/20 rounded" />
        </div>
        <div className="text-4xl opacity-50">🔥</div>
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-3 w-4 bg-white/20 rounded" />
            <div className="w-8 h-8 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
      <div className="h-11 w-full bg-white/20 rounded-2xl" />
    </div>
  );
}

/** Dashboard badges widget skeleton */
export function DashboardBadgesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden", className)}>
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-4 w-16" />
        <BoneBadge width="w-24" className="h-5" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-900/10 border border-transparent space-y-2 animate-pulse">
            <BoneAvatar size="lg" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-full mt-4 rounded-xl" />
    </div>
  );
}

/** Dashboard inline badges grid skeleton (used when just badges loading) */
export function DashboardBadgesGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-900/10 border border-transparent space-y-2 animate-pulse">
          <BoneAvatar size="lg" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

/** Dashboard skill index skeleton */
export function DashboardSkillsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6", className)}>
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-8" />
            </div>
            <BoneBar />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard activity timeline skeleton */
export function DashboardActivitySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6", className)}>
      <Skeleton className="h-4 w-36 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start animate-pulse">
            <Skeleton className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Dashboard report card skeleton */
export function DashboardReportSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6 space-y-4 animate-pulse", className)} aria-hidden="true">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/** Dashboard full page skeleton (combines all dashboard skeletons) */
export function DashboardFullSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("container dashboard-layout px-4 md:px-8 pb-24 md:pb-16 min-h-screen", className)}>
      <DashboardSidebarSkeleton />
      <main className="w-full min-w-0 md:ml-20 md:mr-96">
        <div className="dashboard-content-panel active">
          <DashboardWelcomeSkeleton />
          <DashboardStatsSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
            <div className="space-y-10 min-w-0">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-8 w-36" />
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28 rounded-2xl" />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <DashboardProjectSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <DashboardCheckInSkeleton />
              <DashboardBadgesSkeleton />
              <DashboardSkillsSkeleton />
              <DashboardActivitySkeleton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EVENTS (refactored from EventCardSkeleton.tsx)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Event card skeleton using Bone primitives */
export function EventCardBoneSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "event-card relative animate-pulse skeleton-shimmer bg-[#0f172a] border-0 rounded-3xl shadow-2xl",
        className,
      )}
      aria-hidden="true"
    >
      <div className="event-banner h-40 bg-muted/20 mb-4 rounded-[14px] relative flex items-center justify-center">
        <div className="absolute top-3 left-3">
          <BoneBadge width="w-16" className="h-5 bg-muted/30" />
        </div>
      </div>
      <div className="flex items-center gap-4 mb-2.5 px-6">
        <Skeleton className="h-3.5 w-24 bg-muted/30" />
        <Skeleton className="h-3.5 w-16 bg-muted/30" />
      </div>
      <div className="p-6">
        <Skeleton className="h-5 w-3/4 bg-muted/40 mb-2 rounded" />
      </div>
      <BoneText lines={3} lastWidth="w-4/6" height="h-3.5" className="mb-5 grow px-6 [&_*]:bg-muted/20" />
      <div className="px-6 mb-4">
        <BoneBar className="bg-muted/20" />
      </div>
      <div className="flex justify-between items-center border-t border-border mt-auto p-6 pt-0">
        <BoneBlock className="h-4 w-16 bg-muted/30" />
        <BoneButton size="sm" className="bg-muted/40" />
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMUNITY FEED (refactored from FeedSkeleton.tsx)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Feed post skeleton using Bone primitives */
export function FeedPostBoneSkeleton({ className, showImage = false }: { className?: string; showImage?: boolean }) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <BoneAvatar size="md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <BoneText lines={3} lastWidth="w-4/6" />
        {showImage && <BoneImage />}
      </CardContent>
      <CardFooter className="flex-col gap-3 pt-0">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-2 w-full border-t pt-3">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardFooter>
    </Card>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMUNITY GROUP CARD (refactored from GroupCardSkeleton.tsx)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Group card skeleton using Bone primitives */
export function GroupCardBoneSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}
      aria-busy="true"
      aria-label="Loading group information"
    >
      <CardHeader className="pb-3">
        <Skeleton className="w-full h-32 mb-3 rounded-lg" />
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 flex-1" />
          <BoneBadge width="w-16" className="h-5 shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <BoneText lines={2} lastWidth="w-3/4" className="mb-3" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t border-border/50">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROJECTS (refactored from SkeletonLoader.tsx)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Project card skeleton using Bone primitives */
export function ProjectCardBoneSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("p-project-card skeleton-shimmer", "pointer-events-none select-none", className)}
      aria-hidden="true"
    >
      <div className="p-project-header">
        <BoneBadge width="w-20" />
        <BoneBlock className="h-5 w-12 rounded-md" />
      </div>
      <div className="flex flex-col grow">
        <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
        <BoneText lines={2} lastWidth="w-5/6" className="mb-5" />
      </div>
      <div className="p-project-tags">
        <BoneBadge width="w-16" />
        <BoneBadge width="w-20" />
        <BoneBadge width="w-14" />
        <BoneBadge width="w-18" />
      </div>
      <div className="p-project-footer">
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <BoneBlock className="h-8 w-8 rounded-lg" />
          <BoneBlock className="h-8 w-8 rounded-lg" />
          <BoneButton size="sm" />
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESOURCES (refactored from LoadingState.tsx)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Resource card skeleton using Bone primitives */
export function ResourceCardBoneSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn("relative overflow-hidden flex flex-col h-full skeleton-shimmer", className)}
      aria-hidden="true"
    >
      <div className="relative w-full aspect-video bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center gap-2">
          <BoneBadge width="w-20" />
        </div>
        <BoneText lines={2} lastWidth="w-3/4" height="h-5" />
        <BoneText lines={3} lastWidth="w-2/3" className="flex-1" />
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </Card>
  );
}

/** Career details detail page skeleton */
export function CareerDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen pt-36 bg-background pb-20 relative overflow-hidden", className)}>
      {/* Background Animated Mesh Glow Elements */}
      <div className="mesh-glow-container animate-pulse">
        <div className="mesh-glow-node node-1"></div>
        <div className="mesh-glow-node node-2"></div>
        <div className="mesh-glow-node node-3"></div>
      </div>

      <div className="container px-4 md:px-8 max-w-7xl mx-auto animate-pulse">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <BoneBlock className="h-4 w-12 bg-muted/20" />
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
          <BoneBlock className="h-4 w-16 bg-muted/20" />
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
          <BoneBlock className="h-4 w-32 bg-muted/30" />
        </div>

        {/* Dynamic Grid Layout */}
        <div className="career-detail-layout">
          {/* Top Hero Card Skeleton */}
          <header className="card card-glass job-hero-card p-6 md:p-8">
            <div className="job-hero-top flex flex-col md:flex-row gap-6 items-start md:items-center">
              <BoneBlock className="company-large-logo w-22.5 h-22.5 rounded-xl bg-muted/25" />
              <div className="job-hero-info flex-1 space-y-3">
                <div className="flex gap-2">
                  <BoneBadge width="w-24" className="bg-muted/20" />
                  <BoneBadge width="w-16" className="bg-muted/20" />
                </div>
                <BoneBlock className="h-8 w-2/3 bg-muted/35" />
                <BoneBlock className="h-4 w-1/3 bg-muted/20" />
              </div>
            </div>
            
            <div className="job-hero-stats grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="hero-stat-item flex gap-3">
                  <BoneIcon size="md" rounded="xl" className="bg-muted/20 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <BoneBlock className="h-3 w-12 bg-muted/15" />
                    <BoneBlock className="h-4 w-20 bg-muted/30" />
                  </div>
                </div>
              ))}
            </div>
          </header>

          {/* Left Column (Main Details Content) */}
          <main className="career-main-content space-y-6">
            {/* About the Role */}
            <article className="card card-glass content-block-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-muted-foreground/30" />
                <BoneBlock className="h-6 w-32 bg-muted/30" />
              </div>
              <BoneText lines={3} lastWidth="w-4/5" className="[&_*]:bg-muted/20" />
            </article>

            {/* Key Responsibilities */}
            <article className="card card-glass content-block-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-muted-foreground/30" />
                <BoneBlock className="h-6 w-44 bg-muted/30" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <BoneIcon size="sm" rounded="lg" className="bg-muted/20 shrink-0 mt-1" />
                    <BoneBlock className="h-4 w-full bg-muted/15" />
                  </div>
                ))}
              </div>
            </article>

            {/* Requirements & Skills */}
            <article className="card card-glass content-block-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-muted-foreground/30" />
                <BoneBlock className="h-6 w-52 bg-muted/30" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <BoneIcon size="sm" rounded="lg" className="bg-muted/20 shrink-0 mt-1" />
                    <BoneBlock className="h-4 w-full bg-muted/15" />
                  </div>
                ))}
              </div>
            </article>
          </main>

          {/* Right Column (Sidebar) */}
          <aside className="sidebar-wrapper space-y-6">
            <div className="card card-glass action-panel-card p-6 space-y-4">
              <BoneBlock className="h-12 w-full bg-muted/30 rounded-xl" />
            </div>
            <div className="card card-glass p-5">
              <BoneBlock className="h-10 w-full bg-muted/20 rounded-lg" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
