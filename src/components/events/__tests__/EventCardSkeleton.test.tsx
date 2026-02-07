/**
 * EventCardSkeleton Component Tests
 * Feature: events-page-ui-improvements
 * 
 * Tests for the EventCardSkeleton loading placeholder component.
 * 
 * Requirements:
 * - 7.1: Display skeleton loaders during loading
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EventCardSkeleton, EventCardSkeletonLoader } from '../EventCardSkeleton';

describe('EventCardSkeleton', () => {
  describe('Single Skeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<EventCardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('has aria-hidden attribute', () => {
      const { container } = render(<EventCardSkeleton />);
      const card = container.firstChild;
      expect(card).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies custom className', () => {
      const { container } = render(<EventCardSkeleton className="custom-class" />);
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('has skeleton-shimmer class for animation', () => {
      const { container } = render(<EventCardSkeleton />);
      const card = container.firstChild;
      expect(card).toHaveClass('skeleton-shimmer');
    });

    it('matches EventCard structure with gradient header', () => {
      const { container } = render(<EventCardSkeleton />);
      
      // Check for gradient header section
      const gradientHeader = container.querySelector('.bg-gradient-to-br');
      expect(gradientHeader).toBeInTheDocument();
      expect(gradientHeader).toHaveClass('h-40');
    });

    it('has correct card styling matching EventCard', () => {
      const { container } = render(<EventCardSkeleton />);
      const card = container.firstChild;
      
      expect(card).toHaveClass('bg-[#0f172a]');
      expect(card).toHaveClass('border-0');
      expect(card).toHaveClass('rounded-[24px]');
      expect(card).toHaveClass('shadow-2xl');
    });
  });

  describe('EventCardSkeletonLoader', () => {
    it('renders default count of 6 skeletons', () => {
      const { container } = render(<EventCardSkeletonLoader />);
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons).toHaveLength(6);
    });

    it('renders custom count of skeletons', () => {
      const { container } = render(<EventCardSkeletonLoader count={3} />);
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons).toHaveLength(3);
    });

    it('has proper accessibility attributes', () => {
      render(<EventCardSkeletonLoader />);
      
      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-busy', 'true');
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-label', 'Loading events');
    });

    it('has screen reader text', () => {
      render(<EventCardSkeletonLoader />);
      
      const srText = screen.getByText('Loading events, please wait...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('applies grid layout', () => {
      const { container } = render(<EventCardSkeletonLoader />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('applies custom className', () => {
      const { container } = render(<EventCardSkeletonLoader className="custom-loader" />);
      const loader = container.firstChild;
      expect(loader).toHaveClass('custom-loader');
    });

    it('renders correct number of skeleton cards', () => {
      const { container } = render(<EventCardSkeletonLoader count={3} />);
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      
      // Should render exactly 3 skeletons
      expect(skeletons).toHaveLength(3);
      
      // Each skeleton should be a card element
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass('skeleton-shimmer');
      });
    });
  });

  describe('Structure Matching', () => {
    it('has header section with badges', () => {
      const { container } = render(<EventCardSkeleton />);
      
      // Check for badge placeholders in header
      const header = container.querySelector('.h-40');
      expect(header).toBeInTheDocument();
      
      // Should have badge placeholders
      const badges = header?.querySelectorAll('.absolute');
      expect(badges?.length).toBeGreaterThan(0);
    });

    it('has content section with title and description', () => {
      const { container } = render(<EventCardSkeleton />);
      
      // Check for CardHeader
      const cardHeader = container.querySelector('[class*="p-6"]');
      expect(cardHeader).toBeInTheDocument();
    });

    it('has footer section with action buttons', () => {
      const { container } = render(<EventCardSkeleton />);
      
      // Check for footer with buttons
      const footer = container.querySelector('[class*="CardFooter"]') || 
                     container.querySelector('[class*="p-6"][class*="pt-0"]');
      expect(footer).toBeInTheDocument();
    });

    it('has attendee progress bar placeholder', () => {
      const { container } = render(<EventCardSkeleton />);
      
      // Check for progress bar skeleton
      const progressBar = container.querySelector('.rounded-full');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains responsive grid classes', () => {
      const { container } = render(<EventCardSkeletonLoader />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1'); // Mobile
      expect(grid).toHaveClass('md:grid-cols-2'); // Tablet
      expect(grid).toHaveClass('lg:grid-cols-3'); // Desktop
    });
  });
});
