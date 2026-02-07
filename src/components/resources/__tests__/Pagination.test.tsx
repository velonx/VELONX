/**
 * Pagination Component Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for Pagination component functionality.
 * Requirements: 5.2, 5.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  describe('Visibility', () => {
    it('does not render when totalPages is 1', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('does not render when totalPages is 0', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders when totalPages is greater than 1', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Page Number Display', () => {
    it('displays current page and total pages', () => {
      render(<Pagination currentPage={2} totalPages={10} onPageChange={mockOnPageChange} />);
      const pageInfo = screen.getAllByText('Page 2 of 10');
      expect(pageInfo.length).toBeGreaterThan(0);
    });

    it('displays all page numbers when total pages is small', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 5' })).toBeInTheDocument();
    });

    it('displays ellipsis for large page ranges', () => {
      render(<Pagination currentPage={5} totalPages={20} onPageChange={mockOnPageChange} />);
      const ellipsis = screen.getAllByText('...');
      expect(ellipsis.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Buttons', () => {
    it('disables Previous button on first page', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByRole('button', { name: 'Go to previous page' });
      expect(prevButton).toBeDisabled();
    });

    it('disables Next button on last page', () => {
      render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByRole('button', { name: 'Go to next page' });
      expect(nextButton).toBeDisabled();
    });

    it('enables Previous button when not on first page', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByRole('button', { name: 'Go to previous page' });
      expect(prevButton).not.toBeDisabled();
    });

    it('enables Next button when not on last page', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByRole('button', { name: 'Go to next page' });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Page Change Handling', () => {
    it('calls onPageChange when clicking Next button', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByRole('button', { name: 'Go to next page' });
      fireEvent.click(nextButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange when clicking Previous button', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByRole('button', { name: 'Go to previous page' });
      fireEvent.click(prevButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when clicking page number', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      const pageButton = screen.getByRole('button', { name: 'Go to page 3' });
      fireEvent.click(pageButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('does not call onPageChange when clicking current page', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
      const currentPageButton = screen.getByRole('button', { name: 'Go to page 2' });
      expect(currentPageButton).toBeDisabled();
    });
  });

  describe('Current Page Highlighting', () => {
    it('highlights current page button', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const currentPageButton = screen.getByRole('button', { name: 'Go to page 3' });
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });

    it('does not highlight non-current page buttons', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const otherPageButton = screen.getByRole('button', { name: 'Go to page 2' });
      expect(otherPageButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('First/Last Page Buttons', () => {
    it('shows first/last page buttons by default', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
      expect(screen.getByRole('button', { name: 'Go to first page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to last page' })).toBeInTheDocument();
    });

    it('hides first/last page buttons when showFirstLast is false', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={10}
          onPageChange={mockOnPageChange}
          showFirstLast={false}
        />
      );
      expect(screen.queryByRole('button', { name: 'Go to first page' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Go to last page' })).not.toBeInTheDocument();
    });

    it('calls onPageChange with 1 when clicking first page button', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
      const firstButton = screen.getByRole('button', { name: 'Go to first page' });
      fireEvent.click(firstButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange with totalPages when clicking last page button', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
      const lastButton = screen.getByRole('button', { name: 'Go to last page' });
      fireEvent.click(lastButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination navigation');
    });

    it('has screen reader announcement for current page', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const srOnly = screen.getAllByText('Page 3 of 5');
      expect(srOnly.length).toBeGreaterThan(0);
    });

    it('has proper ARIA labels on buttons', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
      expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid current page (too low)', () => {
      render(<Pagination currentPage={0} totalPages={5} onPageChange={mockOnPageChange} />);
      // Should clamp to page 1
      const pageInfo = screen.getAllByText('Page 1 of 5');
      expect(pageInfo.length).toBeGreaterThan(0);
    });

    it('handles invalid current page (too high)', () => {
      render(<Pagination currentPage={10} totalPages={5} onPageChange={mockOnPageChange} />);
      // Should clamp to page 5
      const pageInfo = screen.getAllByText('Page 5 of 5');
      expect(pageInfo.length).toBeGreaterThan(0);
    });

    it('does not call onPageChange for out of range pages', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByRole('button', { name: 'Go to previous page' });
      fireEvent.click(prevButton);
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });
});
