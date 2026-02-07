/**
 * ResourcesGrid Component
 * Feature: resources-page-ui-improvements
 * 
 * Responsive grid layout for displaying resource cards with loading, error, and empty states.
 * 
 * Requirements:
 * - 1.3: Display search results in grid
 * - 6.1: Display skeleton loaders during loading
 * - 6.2: Display error state with retry
 * - 7.2: 1 column on mobile (< 768px)
 * - 7.3: 2 columns on tablet (768px - 1024px)
 * - 7.4: 3-4 columns on desktop (> 1024px)
 * 
 * Accessibility:
 * - Proper ARIA labels for loading states
 * - Keyboard navigation support
 * - Screen reader announcements
 */

'use client';

import React, { useRef } from 'react';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { ResourceCard } from './ResourceCard';
import { cn } from '@/lib/utils';
import { Resource } from '@/lib/api/types';
import { ResourceError } from '@/lib/hooks/useResources';
import { Loader2 } from 'lucide-react';

export interface ResourcesGridProps {
  /**
   * Array of resources to display
   */
  resources: Resource[];
  
  /**
   * Loading state (initial load)
   */
  isLoading?: boolean;
  
  /**
   * Refetching state (loading more data while showing existing)
   */
  isRefetching?: boolean;
  
  /**
   * Error object if fetch failed
   */
  error?: ResourceError | Error | null;
  
  /**
   * Whether filters are currently active
   */
  hasActiveFilters?: boolean;
  
  /**
   * Handler for retry button in error state
   */
  onRetry?: () => void;
  
  /**
   * Handler for clear filters button in empty state
   */
  onClearFilters?: () => void;
  
  /**
   * Whether retry is in progress
   */
  isRetrying?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ResourcesGrid Component
 * 
 * Displays resources in a responsive grid with conditional rendering of:
 * - LoadingState: During initial data fetch
 * - ErrorState: When fetch fails
 * - EmptyState: When no resources match filters
 * - ResourceCards: When resources are available
 * 
 * Grid layout:
 * - Mobile (< 768px): 1 column
 * - Tablet (768px - 1024px): 2 columns
 * - Desktop (1024px - 1440px): 3 columns
 * - Large Desktop (> 1440px): 4 columns
 * 
 * Memoized to prevent unnecessary re-renders.
 */
const ResourcesGridComponent = ({
  resources,
  isLoading = false,
  isRefetching = false,
  error = null,
  hasActiveFilters = false,
  onRetry,
  onClearFilters,
  isRetrying = false,
  className,
}: ResourcesGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Loading state - show skeleton loaders
  if (isLoading && resources.length === 0) {
    return (
      <div className={cn('w-full', className)} ref={containerRef}>
        <LoadingState count={12} />
      </div>
    );
  }

  // Error state - show error message with retry
  if (error && resources.length === 0) {
    // Determine error type based on error properties
    let errorType: 'network' | 'server' | 'client' | 'generic' = 'generic';
    let errorMessage = error.message;
    
    // Check if it's a ResourceError with enhanced properties
    const resourceError = error as ResourceError;
    if (resourceError.userMessage) {
      errorMessage = resourceError.userMessage;
    }
    
    if (resourceError.statusCode) {
      if (resourceError.code === 'NETWORK_ERROR') {
        errorType = 'network';
      } else if (resourceError.statusCode >= 500 && resourceError.statusCode < 600) {
        errorType = 'server';
      } else if (resourceError.statusCode >= 400 && resourceError.statusCode < 500) {
        errorType = 'client';
      }
    } else {
      // Fallback to message-based detection
      if (error.message.toLowerCase().includes('network') || 
          error.message.toLowerCase().includes('fetch')) {
        errorType = 'network';
      } else if (error.message.toLowerCase().includes('500') || 
                 error.message.toLowerCase().includes('server')) {
        errorType = 'server';
      } else if (error.message.toLowerCase().includes('400') || 
                 error.message.toLowerCase().includes('invalid')) {
        errorType = 'client';
      }
    }

    // Only show retry button if error can be retried
    const showRetry = resourceError.canRetry !== false && onRetry;

    return (
      <div className={cn('w-full', className)} ref={containerRef}>
        <ErrorState
          type={errorType}
          message={errorMessage}
          onRetry={showRetry ? onRetry : undefined}
          isRetrying={isRetrying}
          details={error.stack}
        />
      </div>
    );
  }

  // Empty state - no resources
  if (!isLoading && !error && resources.length === 0) {
    return (
      <div className={cn('w-full', className)} ref={containerRef}>
        <EmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  // Success state - display resources
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
          <span>Updating resources...</span>
        </div>
      )}

      {/* Responsive grid layout */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="region"
        aria-label="Resources grid"
        aria-live="polite"
      >
        {resources.map((resource, index) => (
          <div 
            key={resource.id} 
            className="w-full resource-grid-item"
            style={{ animationDelay: `${Math.min(index * 0.05, 0.6)}s` }}
          >
            <ResourceCard resource={resource} />
          </div>
        ))}
      </div>

      {/* Screen reader announcement for resource count */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resources.length === 1
          ? '1 resource displayed'
          : `${resources.length} resources displayed`}
      </div>
    </div>
  );
};

/**
 * Memoized ResourcesGrid to prevent unnecessary re-renders
 */
export const ResourcesGrid = React.memo(ResourcesGridComponent);

ResourcesGrid.displayName = 'ResourcesGrid';
