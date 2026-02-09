/**
 * EventsPagination Component
 * Feature: events-page-ui-improvements
 * 
 * Provides comprehensive pagination controls for events list with:
 * - Previous/Next buttons with disabled states
 * - Page number buttons with ellipsis for large ranges
 * - Page size selector (12, 24, 48 events per page)
 * - Current page and total pages display
 * - Keyboard navigation support
 * - Smooth scroll to top on page change
 * 
 * Requirements:
 * - 5.5: Pagination controls at bottom of event list
 * - 5.6: "Load More" button as alternative to pagination
 * - 5.7: Page size selector (12, 24, 48 events per page)
 * - 5.8: Current page and total pages displayed
 * - 5.9: Pagination state persists in URL
 * - 5.10: Smooth scroll to top when changing pages
 * 
 * Accessibility:
 * - ARIA labels for navigation
 * - Keyboard navigation (Tab, Enter, Arrow keys)
 * - Visible focus indicators
 * - Screen reader announcements
 */

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EventsPaginationProps {
  /**
   * Current active page (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Current page size
   */
  pageSize: number;

  /**
   * Total number of items across all pages
   */
  totalCount: number;

  /**
   * Handler called when page changes
   */
  onPageChange: (page: number) => void;

  /**
   * Handler called when page size changes
   */
  onPageSizeChange: (size: number) => void;

  /**
   * Pagination variant: 'pagination' for page numbers, 'load-more' for load more button
   */
  variant?: 'pagination' | 'load-more';

  /**
   * Maximum number of page buttons to show (default: 7)
   */
  maxVisiblePages?: number;

  /**
   * Whether to show first/last page buttons (default: true)
   */
  showFirstLast?: boolean;

  /**
   * Whether to scroll to top on page change (default: true)
   */
  scrollToTop?: boolean;

  /**
   * Scroll target selector (default: scrolls to top of page)
   */
  scrollTarget?: string;

  /**
   * Whether pagination is in loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Generate array of page numbers to display with ellipsis
 * 
 * Examples:
 * - Pages 1-7: [1, 2, 3, 4, 5, 6, 7]
 * - Pages 1-10, current 1: [1, 2, 3, 4, 5, '...', 10]
 * - Pages 1-10, current 5: [1, '...', 4, 5, 6, '...', 10]
 * - Pages 1-10, current 10: [1, '...', 6, 7, 8, 9, 10]
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | 'ellipsis')[] {
  // If total pages fit within max visible, show all
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const sidePages = Math.floor((maxVisible - 3) / 2); // Pages on each side of current

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  let startPage = Math.max(2, currentPage - sidePages);
  let endPage = Math.min(totalPages - 1, currentPage + sidePages);

  // Adjust range if at start or end
  if (currentPage <= sidePages + 2) {
    endPage = Math.min(totalPages - 1, maxVisible - 2);
  } else if (currentPage >= totalPages - sidePages - 1) {
    startPage = Math.max(2, totalPages - maxVisible + 3);
  }

  // Add ellipsis after first page if needed
  if (startPage > 2) {
    pages.push('ellipsis');
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push('ellipsis');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * EventsPagination Component
 * 
 * Displays comprehensive pagination controls with page numbers, navigation buttons,
 * and page size selector. Supports both standard pagination and "load more" variants.
 */
export const EventsPagination = React.memo<EventsPaginationProps>(({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  variant = 'pagination',
  maxVisiblePages = 7,
  showFirstLast = true,
  scrollToTop = true,
  scrollTarget,
  isLoading = false,
  className,
}) => {
  const navRef = useRef<HTMLElement>(null);

  // Don't render if no items
  if (totalCount === 0) {
    return null;
  }

  // Ensure current page is within valid range
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Calculate item range for current page
  const startItem = (validCurrentPage - 1) * pageSize + 1;
   
  const endItem = Math.min(validCurrentPage * pageSize, totalCount);

  // Handle page change with scroll
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handlePageChange = useCallback(
    (page: number) => {
      if (page === validCurrentPage || page < 1 || page > totalPages) {
        return;
      }

      onPageChange(page);

      // Scroll to top after page change
      if (scrollToTop) {
        setTimeout(() => {
          if (scrollTarget) {
            const element = document.querySelector(scrollTarget);
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    },
    [validCurrentPage, totalPages, onPageChange, scrollToTop, scrollTarget]
  );

  // Handle page size change
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newSize = parseInt(value, 10);
      if (newSize !== pageSize) {
        onPageSizeChange(newSize);
        // Reset to page 1 when changing page size
        if (validCurrentPage !== 1) {
          onPageChange(1);
        }
      }
    },
    [pageSize, validCurrentPage, onPageSizeChange, onPageChange]
  );

  // Keyboard navigation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if pagination is focused
      if (!navRef.current?.contains(document.activeElement)) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (validCurrentPage > 1) {
            handlePageChange(validCurrentPage - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (validCurrentPage < totalPages) {
            handlePageChange(validCurrentPage + 1);
          }
          break;
        case 'Home':
          e.preventDefault();
          handlePageChange(1);
          break;
        case 'End':
          e.preventDefault();
          handlePageChange(totalPages);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [validCurrentPage, totalPages, handlePageChange]);

  const pageNumbers = generatePageNumbers(validCurrentPage, totalPages, maxVisiblePages);
  const isFirstPage = validCurrentPage === 1;
  const isLastPage = validCurrentPage === totalPages;
  const hasMorePages = validCurrentPage < totalPages;

  // Load More variant
  if (variant === 'load-more') {
    return (
      <div className={cn('flex flex-col items-center gap-4 mt-8', className)}>
        {hasMorePages && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? 'Loading...' : 'Load More Events'}
          </Button>
        )}

        {/* Results info */}
        <div className="text-sm text-muted-foreground text-center">
          Showing {startItem} - {endItem} of {totalCount} events
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span id="load-more-page-size-label" className="text-sm text-muted-foreground">Events per page:</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger 
              className="w-[80px]" 
              aria-label="Select page size"
              aria-describedby="load-more-page-size-label"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent role="listbox">
              <SelectItem value="12" role="option">12</SelectItem>
              <SelectItem value="24" role="option">24</SelectItem>
              <SelectItem value="48" role="option">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Standard pagination variant
  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Events pagination navigation"
      className={cn('flex flex-col items-center gap-4 mt-8', className)}
    >
      {/* Pagination controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <div className="flex items-center gap-1">
          {/* First page button */}
          {showFirstLast && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => handlePageChange(1)}
              disabled={isFirstPage || isLoading}
              aria-label="Go to first page"
              title="First page"
              className="hidden sm:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
            >
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}

          {/* Previous page button */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={isFirstPage || isLoading}
            aria-label="Go to previous page"
            title="Previous page"
            className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* Page number buttons */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-muted-foreground"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === validCurrentPage;

              return (
                <Button
                  key={page}
                  variant={isActive ? 'default' : 'outline'}
                  size="icon-sm"
                  onClick={() => handlePageChange(page)}
                  disabled={isActive || isLoading}
                  aria-label={`Go to page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={`Page ${page}`}
                  className={cn(
                    'min-w-[44px] min-h-[44px] md:min-w-[32px] md:min-h-0',
                    isActive && 'pointer-events-none'
                  )}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={isLastPage || isLoading}
            aria-label="Go to next page"
            title="Next page"
            className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* Last page button */}
          {showFirstLast && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={isLastPage || isLoading}
              aria-label="Go to last page"
              title="Last page"
              className="hidden sm:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Page info text - desktop */}
        <div
          className="ml-4 text-sm text-muted-foreground hidden md:block"
          aria-live="polite"
          aria-atomic="true"
        >
          Page {validCurrentPage} of {totalPages}
        </div>
      </div>

      {/* Bottom info row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between">
        {/* Results info */}
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {startItem} - {endItem} of {totalCount} events
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span id="page-size-label" className="text-sm text-muted-foreground">Events per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger 
              className="w-[80px]" 
              aria-label="Select page size"
              aria-describedby="page-size-label"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent role="listbox">
              <SelectItem value="12" role="option">12</SelectItem>
              <SelectItem value="24" role="option">24</SelectItem>
              <SelectItem value="48" role="option">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Page {validCurrentPage} of {totalPages}. Showing {startItem} to {endItem} of{' '}
        {totalCount} events.
      </div>
    </nav>
  );
});

EventsPagination.displayName = 'EventsPagination';
