/**
 * Boneyard — Centralized skeleton loading system.
 *
 * Barrel export for clean imports:
 *   import { BoneyardLoader, MentorCardSkeleton, BoneText } from '@/components/boneyard';
 */

// Bone primitives
export {
  BoneText,
  BoneAvatar,
  BoneImage,
  BoneBadge,
  BoneButton,
  BoneBar,
  BoneBlock,
  BoneIcon,
} from './Bone';

// Generic loader
export { BoneyardLoader } from './BoneyardLoader';
export type { BoneyardLoaderProps } from './BoneyardLoader';

// Pre-composed domain skeletons
export {
  // Global / Loading
  HeroSkeleton,
  GridCardSkeleton,
  // Mentors
  MentorCardSkeleton,
  // Swag
  SwagCardSkeleton,
  // Leaderboard
  LeaderboardPodiumSkeleton,
  LeaderboardRowSkeleton,
  // Career
  CareerCardSkeleton,
  // Blog
  BlogHeroSkeleton,
  BlogCardSkeleton,
  BlogPostSkeleton,
  // Community
  CommunityGroupItemSkeleton,
  // Dashboard
  DashboardSidebarSkeleton,
  DashboardWelcomeSkeleton,
  DashboardStatsSkeleton,
  DashboardProjectSkeleton,
  DashboardCheckInSkeleton,
  DashboardBadgesSkeleton,
  DashboardBadgesGridSkeleton,
  DashboardSkillsSkeleton,
  DashboardActivitySkeleton,
  DashboardReportSkeleton,
  DashboardFullSkeleton,
  // Events (refactored)
  EventCardBoneSkeleton,
  // Feed (refactored)
  FeedPostBoneSkeleton,
  // Group cards (refactored)
  GroupCardBoneSkeleton,
  // Projects (refactored)
  ProjectCardBoneSkeleton,
  // Resources (refactored)
  ResourceCardBoneSkeleton,
  // Career detail page
  CareerDetailSkeleton,
} from './skeletons';
