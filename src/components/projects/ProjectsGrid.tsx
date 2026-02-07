/**
 * ProjectsGrid Component
 * Feature: project-page-ui-improvements
 * 
 * Responsive grid layout for displaying project cards with loading and empty states.
 * 
 * Requirements:
 * - 7.1: Display skeleton loaders during loading
 * - 7.4: Replace skeletons with actual cards when loading completes
 * - 7.5: Maintain existing cards during refetch with subtle loading indicator
 * - 8.1-8.6: Responsive grid layout (1/2/3 columns based on viewport)
 * - 14.3: Virtual scrolling for large lists (>50 items) - Simplified for MVP
 * - 14.4: Lazy loading for images (handled by ResponsiveImage component)
 * 
 * Accessibility:
 * - Proper ARIA labels for loading states
 * - Keyboard navigation support
 * - Screen reader announcements
 * 
 * Note: Virtual scrolling with react-window v2 has a different API.
 * For MVP, we use CSS-based responsive grid which performs well for most use cases.
 * Virtual scrolling can be added later if needed for very large datasets.
 */

'use client';

import React, { useRef } from 'react';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';
import { ProjectCard } from './ProjectCard';
import { cn } from '@/lib/utils';
import { 
  ExtendedProject, 
  UserProjectRelationship 
} from '@/lib/types/project-page.types';
import { Loader2 } from 'lucide-react';

export interface ProjectsGridProps {
  /**
   * Array of projects to display
   */
  projects: ExtendedProject[];
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Refetching state (loading more data while showing existing)
   */
  isRefetching?: boolean;
  
  /**
   * Empty state type when no projects
   */
  emptyStateType?: 'no-results' | 'no-projects' | 'no-completed';
  
  /**
   * Handler for empty state action button
   */
  onEmptyAction?: () => void;
  
  /**
   * Custom empty state action label
   */
  emptyActionLabel?: string;
  
  /**
   * Map of project IDs to user relationship status
   */
  joinRequestStatuses: Map<string, UserProjectRelationship | null>;
  
  /**
   * Handler for join request
   */
  onJoinRequest: (projectId: string) => void;
  
  /**
   * Handler for project card click
   */
  onProjectClick: (projectId: string) => void;
  
  /**
   * Map of project IDs currently being joined
   */
  joiningProjects?: Set<string>;
  
  /**
   * Current user ID for relationship checks
   */
  currentUserId?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ProjectsGrid Component
 * 
 * Displays projects in a responsive grid with loading states and empty states.
 * Uses CSS Grid for responsive layout (1/2/3 columns based on viewport).
 * Memoized to prevent unnecessary re-renders.
 */
const ProjectsGridComponent = ({
  projects,
  isLoading = false,
  isRefetching = false,
  emptyStateType = 'no-results',
  onEmptyAction,
  emptyActionLabel,
  joinRequestStatuses,
  onJoinRequest,
  onProjectClick,
  joiningProjects = new Set(),
  currentUserId,
  className,
}: ProjectsGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Loading state - show skeleton loaders
  if (isLoading && projects.length === 0) {
    return (
      <div className={cn('w-full', className)} ref={containerRef}>
        <SkeletonLoader count={6} />
      </div>
    );
  }

  // Empty state - no projects
  if (!isLoading && projects.length === 0) {
    return (
      <div className={cn('w-full', className)} ref={containerRef}>
        <EmptyState
          type={emptyStateType}
          onAction={onEmptyAction}
          actionLabel={emptyActionLabel}
        />
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {/* Refetching indicator */}
      {isRefetching && (
        <div
          className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Updating projects...</span>
        </div>
      )}

      {/* Responsive grid layout */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="region"
        aria-label="Projects grid"
        aria-live="polite"
      >
        {projects.map((project) => {
          const joinStatus = joinRequestStatuses.get(project.id) || 'none';
          const isJoining = joiningProjects.has(project.id);

          return (
            <div key={project.id} className="w-full">
              <ProjectCard
                project={project}
                joinRequestStatus={joinStatus}
                onJoinRequest={onJoinRequest}
                onClick={onProjectClick}
                isJoining={isJoining}
                currentUserId={currentUserId}
              />
            </div>
          );
        })}
      </div>

      {/* Screen reader announcement for project count */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {projects.length === 1
          ? '1 project displayed'
          : `${projects.length} projects displayed`}
      </div>
    </div>
  );
};

/**
 * Memoized ProjectsGrid to prevent unnecessary re-renders
 */
export const ProjectsGrid = React.memo(ProjectsGridComponent);

ProjectsGrid.displayName = 'ProjectsGrid';
