/**
 * Bone Primitives — the atoms of the Boneyard skeleton system.
 *
 * These composable building blocks replace raw `<Skeleton>` usage
 * throughout the codebase, providing semantic, size-aware skeleton
 * elements that can be assembled into any loading layout.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─── BoneText ────────────────────────────────────────────────
/** A text-line skeleton. Renders one or more shimmer lines. */
export interface BoneTextProps {
  /** Number of lines to render @default 1 */
  lines?: number;
  /** Width of the last line (accepts Tailwind width class) @default "w-3/4" */
  lastWidth?: string;
  /** Tailwind height class @default "h-4" */
  height?: string;
  className?: string;
}

export function BoneText({
  lines = 1,
  lastWidth = 'w-3/4',
  height = 'h-4',
  className,
}: BoneTextProps) {
  if (lines === 1) {
    return <Skeleton className={cn(height, 'rounded-md', className)} />;
  }
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            height,
            'rounded-md',
            i === lines - 1 ? lastWidth : 'w-full',
          )}
        />
      ))}
    </div>
  );
}

// ─── BoneAvatar ──────────────────────────────────────────────
/** A circular avatar skeleton. */
const avatarSizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-18 h-18',
  '3xl': 'w-20 h-20',
} as const;

export interface BoneAvatarProps {
  size?: keyof typeof avatarSizes;
  className?: string;
}

export function BoneAvatar({ size = 'md', className }: BoneAvatarProps) {
  return (
    <Skeleton
      className={cn(avatarSizes[size], 'rounded-full shrink-0', className)}
    />
  );
}

// ─── BoneImage ───────────────────────────────────────────────
/** A rectangular image placeholder with optional aspect ratio. */
export interface BoneImageProps {
  /** Tailwind aspect ratio class @default "aspect-video" */
  aspect?: string;
  className?: string;
}

export function BoneImage({
  aspect = 'aspect-video',
  className,
}: BoneImageProps) {
  return (
    <Skeleton className={cn('w-full rounded-xl', aspect, className)} />
  );
}

// ─── BoneBadge ───────────────────────────────────────────────
/** A pill/badge skeleton. */
export interface BoneBadgeProps {
  width?: string;
  className?: string;
}

export function BoneBadge({ width = 'w-16', className }: BoneBadgeProps) {
  return (
    <Skeleton className={cn('h-6 rounded-full', width, className)} />
  );
}

// ─── BoneButton ──────────────────────────────────────────────
/** A button-shaped skeleton. */
export interface BoneButtonProps {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  className?: string;
}

const buttonSizes = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-11',
} as const;

export function BoneButton({
  size = 'md',
  width = 'w-24',
  className,
}: BoneButtonProps) {
  return (
    <Skeleton
      className={cn(buttonSizes[size], 'rounded-full', width, className)}
    />
  );
}

// ─── BoneBar ─────────────────────────────────────────────────
/** A progress bar skeleton. */
export interface BoneBarProps {
  className?: string;
}

export function BoneBar({ className }: BoneBarProps) {
  return (
    <Skeleton className={cn('h-2 w-full rounded-full', className)} />
  );
}

// ─── BoneBlock ───────────────────────────────────────────────
/** A generic rectangular skeleton block for custom sizes. */
export interface BoneBlockProps {
  className?: string;
}

export function BoneBlock({ className }: BoneBlockProps) {
  return <Skeleton className={cn('rounded-md', className)} />;
}

// ─── BoneIcon ────────────────────────────────────────────────
/** A small icon-sized square/circle skeleton. */
export interface BoneIconProps {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'lg' | 'xl' | '2xl' | 'md';
  className?: string;
}

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
} as const;

export function BoneIcon({
  size = 'md',
  rounded = 'lg',
  className,
}: BoneIconProps) {
  return (
    <Skeleton
      className={cn(iconSizes[size], `rounded-${rounded}`, className)}
    />
  );
}
