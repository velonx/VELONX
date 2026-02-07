/**
 * Pagination Component
 * Feature: resources-page-ui-improvements
 * 
 * Provides page navigation controls with:
 * - Previous/Next buttons
 * - Page number buttons with ellipsis for large ranges
 * - Current page highlighting
 * - Disabled states at boundaries
 * - Keyboard navigation support
 * - Current page and total pages display
 * 
 * Requirements:
 * - 5.2: Display pagination controls when multiple pages exist
 * - 5.4: Display current page and total page count
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  /**
   * Current active page (1-indexed)
   */
  currentPage: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Handler called when page changes
   */
  onPageChange: (page: number) => void;
  
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
 * Pagination Component
 * 
 * Displays page navigation controls with Previous/Next buttons and page numbers.
 * Supports keyboard navigation and accessibility features.
 */
export const Pagination = React.memo<PaginationProps>(({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7,
  showFirstLast = true,
  scrollToTop = true,
  scrollTarget,
  className,
}) => {
  const navRef = useRef<HTMLElement>(null);

  // Don't render if only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Ensure current page is within valid range
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Handle page change with scroll
  const handlePageChange = useCallback((page: number) => {
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
  }, [validCurrentPage, totalPages, onPageChange, scrollToTop, scrollTarget]);

  // Keyboard navigation
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

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Pagination navigation"
      className={cn('flex items-center justify-center gap-2 mt-8', className)}
    >
      <div className="flex items-center gap-1">
        {/* First page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(1)}
            disabled={isFirstPage}
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
          disabled={isFirstPage}
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
                disabled={isActive}
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
          disabled={isLastPage}
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
            disabled={isLastPage}
            aria-label="Go to last page"
            title="Last page"
            className="hidden sm:inline-flex min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Page info text */}
      <div
        className="ml-4 text-sm text-muted-foreground hidden md:block"
        aria-live="polite"
        aria-atomic="true"
      >
        Page {validCurrentPage} of {totalPages}
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Page {validCurrentPage} of {totalPages}
      </div>
    </nav>
  );
});

Pagination.displayName = 'Pagination';
