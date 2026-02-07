/**
 * EventsPagination Component Tests
 * Feature: events-page-ui-improvements
 * 
 * Tests pagination controls including:
 * - Page navigation (prev/next, first/last)
 * - Page number buttons with ellipsis
 * - Page size selector
 * - Current page and total pages display
 * - Disabled states
 * - Keyboard navigation
 * - Accessibility features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventsPagination } from '../EventsPagination';

describe('EventsPagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    pageSize: 12,
    totalCount: 120,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination controls', () => {
      render(<EventsPagination {...defaultProps} />);

      expect(screen.getByRole('navigation', { name: /events pagination/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/go to previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to next page/i)).toBeInTheDocument();
    });

    it('should not render when totalCount is 0', () => {
      render(<EventsPagination {...defaultProps} totalCount={0} totalPages={0} />);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should display current page and total pages', () => {
      render(<EventsPagination {...defaultProps} currentPage={3} />);

      const pageInfoElements = screen.getAllByText(/page 3 of 10/i);
      expect(pageInfoElements.length).toBeGreaterThan(0);
    });

    it('should display item range', () => {
      render(<EventsPagination {...defaultProps} currentPage={2} />);

      expect(screen.getByText(/showing 13 - 24 of 120 events/i)).toBeInTheDocument();
    });

    it('should display page size selector', () => {
      render(<EventsPagination {...defaultProps} />);

      expect(screen.getByText(/events per page:/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /select page size/i })).toBeInTheDocument();
    });
  });

  describe('Page Navigation', () => {
    it('should call onPageChange when clicking next button', () => {
      render(<EventsPagination {...defaultProps} />);

      const nextButton = screen.getByLabelText(/go to next page/i);
      fireEvent.click(nextButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking previous button', () => {
      render(<EventsPagination {...defaultProps} currentPage={3} />);

      const prevButton = screen.getByLabelText(/go to previous page/i);
      fireEvent.click(prevButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking page number', () => {
      render(<EventsPagination {...defaultProps} />);

      const pageButton = screen.getByLabelText(/go to page 5/i);
      fireEvent.click(pageButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(5);
    });

    it('should call onPageChange when clicking first page button', () => {
      render(<EventsPagination {...defaultProps} currentPage={5} />);

      const firstButton = screen.getByLabelText(/go to first page/i);
      fireEvent.click(firstButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange when clicking last page button', () => {
      render(<EventsPagination {...defaultProps} currentPage={5} />);

      const lastButton = screen.getByLabelText(/go to last page/i);
      fireEvent.click(lastButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Disabled States', () => {
    it('should disable previous and first buttons on first page', () => {
      render(<EventsPagination {...defaultProps} currentPage={1} />);

      expect(screen.getByLabelText(/go to previous page/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to first page/i)).toBeDisabled();
    });

    it('should disable next and last buttons on last page', () => {
      render(<EventsPagination {...defaultProps} currentPage={10} />);

      expect(screen.getByLabelText(/go to next page/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to last page/i)).toBeDisabled();
    });

    it('should disable current page button', () => {
      render(<EventsPagination {...defaultProps} currentPage={3} />);

      const currentPageButton = screen.getByLabelText(/go to page 3/i);
      expect(currentPageButton).toBeDisabled();
    });

    it('should disable all buttons when loading', () => {
      render(<EventsPagination {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText(/go to previous page/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to next page/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to first page/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to last page/i)).toBeDisabled();
    });
  });

  describe('Page Numbers with Ellipsis', () => {
    it('should show all page numbers when total pages <= maxVisible', () => {
      render(<EventsPagination {...defaultProps} totalPages={5} totalCount={60} />);

      expect(screen.getAllByLabelText(/go to page 1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 2/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 3/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 4/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 5/i).length).toBeGreaterThan(0);
    });

    it('should show ellipsis when total pages > maxVisible', () => {
      render(<EventsPagination {...defaultProps} totalPages={20} totalCount={240} />);

      const ellipsis = screen.getAllByText('...');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('should show ellipsis at end when on first page', () => {
      render(<EventsPagination {...defaultProps} currentPage={1} totalPages={20} totalCount={240} />);

      expect(screen.getAllByLabelText(/go to page 1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 20/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    });

    it('should show ellipsis at start when on last page', () => {
      render(<EventsPagination {...defaultProps} currentPage={20} totalPages={20} totalCount={240} />);

      expect(screen.getAllByLabelText(/go to page 1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 20/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    });

    it('should show ellipsis on both sides when in middle', () => {
      render(<EventsPagination {...defaultProps} currentPage={10} totalPages={20} totalCount={240} />);

      expect(screen.getAllByLabelText(/go to page 1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 10/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/go to page 20/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('...').length).toBe(2);
    });
  });

  describe('Page Size Selector', () => {
    beforeEach(() => {
      // Mock scrollIntoView for Radix Select
      Element.prototype.scrollIntoView = vi.fn();
    });

    it('should display current page size', () => {
      render(<EventsPagination {...defaultProps} pageSize={24} />);

      const selector = screen.getByRole('combobox', { name: /select page size/i });
      expect(selector).toHaveTextContent('24');
    });

    it('should call onPageSizeChange when selecting new size', async () => {
      render(<EventsPagination {...defaultProps} />);

      const selector = screen.getByRole('combobox', { name: /select page size/i });
      fireEvent.click(selector);

      await waitFor(() => {
        const option24 = screen.getByRole('option', { name: '24' });
        fireEvent.click(option24);
      });

      expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(24);
    });

    it('should reset to page 1 when changing page size from non-first page', async () => {
      render(<EventsPagination {...defaultProps} currentPage={3} />);

      const selector = screen.getByRole('combobox', { name: /select page size/i });
      fireEvent.click(selector);

      await waitFor(() => {
        const option24 = screen.getByRole('option', { name: '24' });
        fireEvent.click(option24);
      });

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });

    it('should offer page size options: 12, 24, 48', async () => {
      render(<EventsPagination {...defaultProps} />);

      const selector = screen.getByRole('combobox', { name: /select page size/i });
      fireEvent.click(selector);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: '12' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '24' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '48' })).toBeInTheDocument();
      });
    });
  });

  describe('Load More Variant', () => {
    it('should render load more button when variant is load-more', () => {
      render(<EventsPagination {...defaultProps} variant="load-more" />);

      expect(screen.getByRole('button', { name: /load more events/i })).toBeInTheDocument();
    });

    it('should not render load more button on last page', () => {
      render(<EventsPagination {...defaultProps} variant="load-more" currentPage={10} />);

      expect(screen.queryByRole('button', { name: /load more events/i })).not.toBeInTheDocument();
    });

    it('should call onPageChange when clicking load more', () => {
      render(<EventsPagination {...defaultProps} variant="load-more" currentPage={3} />);

      const loadMoreButton = screen.getByRole('button', { name: /load more events/i });
      fireEvent.click(loadMoreButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
    });

    it('should show loading text when loading', () => {
      render(<EventsPagination {...defaultProps} variant="load-more" isLoading={true} />);

      expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
    });

    it('should still show page size selector in load-more variant', () => {
      render(<EventsPagination {...defaultProps} variant="load-more" />);

      expect(screen.getByText(/events per page:/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EventsPagination {...defaultProps} />);

      expect(screen.getByRole('navigation', { name: /events pagination/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/go to previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to next page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to first page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to last page/i)).toBeInTheDocument();
    });

    it('should mark current page with aria-current', () => {
      render(<EventsPagination {...defaultProps} currentPage={3} />);

      const currentPageButton = screen.getByLabelText(/go to page 3/i);
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    it('should have screen reader announcement', () => {
      render(<EventsPagination {...defaultProps} currentPage={2} />);

      const announcement = screen.getByText(/page 2 of 10\. showing 13 to 24 of 120 events\./i);
      expect(announcement).toHaveClass('sr-only');
    });

    it('should have aria-live region for page info', () => {
      render(<EventsPagination {...defaultProps} />);

      const liveRegions = screen.getAllByText(/page 1 of 10/i);
      const ariaLiveRegion = liveRegions.find((el) => el.getAttribute('aria-live') === 'polite');
      expect(ariaLiveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page correctly', () => {
      render(<EventsPagination {...defaultProps} totalPages={1} totalCount={5} />);

      expect(screen.getByLabelText(/go to previous page/i)).toBeDisabled();
      expect(screen.getByLabelText(/go to next page/i)).toBeDisabled();
    });

    it('should clamp current page to valid range', () => {
      render(<EventsPagination {...defaultProps} currentPage={15} totalPages={10} />);

      // Should show page 10 as current (clamped)
      const pageInfoElements = screen.getAllByText(/page 10 of 10/i);
      expect(pageInfoElements.length).toBeGreaterThan(0);
    });

    it('should handle page size larger than total count', () => {
      render(<EventsPagination {...defaultProps} pageSize={48} totalCount={20} totalPages={1} />);

      expect(screen.getByText(/showing 1 - 20 of 20 events/i)).toBeInTheDocument();
    });

    it('should not call onPageChange when clicking current page', () => {
      render(<EventsPagination {...defaultProps} currentPage={3} />);

      const currentPageButton = screen.getByLabelText(/go to page 3/i);
      fireEvent.click(currentPageButton);

      expect(defaultProps.onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Customization', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EventsPagination {...defaultProps} className="custom-class" />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-class');
    });

    it('should hide first/last buttons when showFirstLast is false', () => {
      render(<EventsPagination {...defaultProps} showFirstLast={false} />);

      expect(screen.queryByLabelText(/go to first page/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/go to last page/i)).not.toBeInTheDocument();
    });

    it('should respect custom maxVisiblePages', () => {
      render(
        <EventsPagination
          {...defaultProps}
          totalPages={20}
          totalCount={240}
          maxVisiblePages={5}
        />
      );

      // With maxVisiblePages=5, should show fewer page buttons
      const pageButtons = screen.getAllByRole('button').filter((btn) =>
        btn.getAttribute('aria-label')?.includes('Go to page')
      );
      expect(pageButtons.length).toBeLessThanOrEqual(5);
    });
  });
});
