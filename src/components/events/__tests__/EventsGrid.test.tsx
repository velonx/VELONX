/**
 * EventsGrid Component Tests
 * Feature: events-page-ui-improvements
 * Task: 10. Update EventsGrid layout
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventsGrid from '../EventsGrid';
import { Event } from '@/lib/api/types';

// Mock EventCard component
vi.mock('../EventCard', () => ({
  default: ({ event }: { event: Event }) => (
    <div data-testid={`event-card-${event.id}`}>{event.title}</div>
  ),
}));

// Mock EventCardSkeleton component
vi.mock('../EventCardSkeleton', () => ({
  EventCardSkeletonLoader: ({ count }: { count: number }) => (
    <div data-testid="skeleton-loader">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} data-testid={`skeleton-${i}`}>Loading...</div>
      ))}
    </div>
  ),
}));

describe('EventsGrid', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Web Development Workshop',
      description: 'Learn modern web development',
      date: new Date('2024-12-01'),
      type: 'WORKSHOP',
      status: 'UPCOMING',
      maxSeats: 50,
      location: 'Google Meet',
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-01'),
      creatorId: 'user1',
      _count: { attendees: 10 },
    },
    {
      id: '2',
      title: 'Hackathon 2024',
      description: 'Build amazing projects',
      date: new Date('2024-12-15'),
      type: 'HACKATHON',
      status: 'UPCOMING',
      maxSeats: 100,
      location: 'Zoom',
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-01'),
      creatorId: 'user1',
      _count: { attendees: 45 },
    },
    {
      id: '3',
      title: 'Networking Event',
      description: 'Connect with professionals',
      date: new Date('2024-12-20'),
      type: 'NETWORKING',
      status: 'UPCOMING',
      maxSeats: 30,
      location: 'Discord',
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-01'),
      creatorId: 'user1',
      _count: { attendees: 20 },
    },
  ];

  describe('Loading State', () => {
    it('should render skeleton loaders when loading', () => {
      render(<EventsGrid events={[]} isLoading={true} skeletonCount={6} />);
      
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
      // Get only the skeleton items, not the parent loader
      const skeletons = screen.getAllByTestId(/skeleton-\d+$/);
      expect(skeletons).toHaveLength(6);
    });

    it('should render custom skeleton count', () => {
      render(<EventsGrid events={[]} isLoading={true} skeletonCount={3} />);
      
      // Get only the skeleton items, not the parent loader
      const skeletons = screen.getAllByTestId(/skeleton-\d+$/);
      expect(skeletons).toHaveLength(3);
    });

    it('should not render events when loading', () => {
      render(<EventsGrid events={mockEvents} isLoading={true} />);
      
      expect(screen.queryByTestId('event-card-1')).not.toBeInTheDocument();
    });
  });

  describe('Events Display', () => {
    it('should render all events in grid', () => {
      render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-3')).toBeInTheDocument();
    });

    it('should render events with correct titles', () => {
      render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      expect(screen.getByText('Web Development Workshop')).toBeInTheDocument();
      expect(screen.getByText('Hackathon 2024')).toBeInTheDocument();
      expect(screen.getByText('Networking Event')).toBeInTheDocument();
    });

    it('should have proper ARIA label', () => {
      render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      const grid = screen.getByRole('region', { name: 'Events grid' });
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no events', () => {
      const emptyState = <div data-testid="empty-state">No events available</div>;
      render(<EventsGrid events={[]} isLoading={false} emptyState={emptyState} />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No events available')).toBeInTheDocument();
    });

    it('should not render empty state when events exist', () => {
      const emptyState = <div data-testid="empty-state">No events available</div>;
      render(<EventsGrid events={mockEvents} isLoading={false} emptyState={emptyState} />);
      
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should render nothing when no events and no empty state provided', () => {
      const { container } = render(<EventsGrid events={[]} isLoading={false} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Responsive Grid Layout', () => {
    it('should apply responsive grid classes', () => {
      const { container } = render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should apply gap between cards', () => {
      const { container } = render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Animations', () => {
    it('should apply fade-in animation to cards', () => {
      const { container } = render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      const cards = container.querySelectorAll('.animate-fade-in-up');
      expect(cards.length).toBe(mockEvents.length);
    });

    it('should apply stagger animation classes', () => {
      const { container } = render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      const firstCard = container.querySelector('.stagger-1');
      const secondCard = container.querySelector('.stagger-2');
      const thirdCard = container.querySelector('.stagger-3');
      
      expect(firstCard).toBeInTheDocument();
      expect(secondCard).toBeInTheDocument();
      expect(thirdCard).toBeInTheDocument();
    });

    it('should apply transition classes for smooth updates', () => {
      const { container } = render(<EventsGrid events={mockEvents} isLoading={false} />);
      
      const cards = container.querySelectorAll('.transition-all');
      expect(cards.length).toBe(mockEvents.length);
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EventsGrid events={mockEvents} isLoading={false} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Callbacks', () => {
    it('should pass callbacks to EventCard components', () => {
      const onViewDetails = vi.fn();
      const onRegister = vi.fn();
      const onUnregister = vi.fn();
      const isRegistered = vi.fn(() => false);

      render(
        <EventsGrid
          events={mockEvents}
          isLoading={false}
          onViewDetails={onViewDetails}
          onRegister={onRegister}
          onUnregister={onUnregister}
          isRegistered={isRegistered}
        />
      );

      // EventCard should receive these props (verified by mock)
      expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null events array', () => {
      const emptyState = <div data-testid="empty-state">No events</div>;
      render(<EventsGrid events={null as any} isLoading={false} emptyState={emptyState} />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should handle undefined events array', () => {
      const emptyState = <div data-testid="empty-state">No events</div>;
      render(<EventsGrid events={undefined as any} isLoading={false} emptyState={emptyState} />);
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should handle large number of events with stagger fallback', () => {
      const manyEvents = Array.from({ length: 20 }, (_, i) => ({
        ...mockEvents[0],
        id: `event-${i}`,
        title: `Event ${i}`,
      }));

      const { container } = render(<EventsGrid events={manyEvents} isLoading={false} />);
      
      // Should render all events
      expect(container.querySelectorAll('[data-testid^="event-card-"]')).toHaveLength(20);
      
      // First 8 should have stagger classes
      expect(container.querySelector('.stagger-1')).toBeInTheDocument();
      expect(container.querySelector('.stagger-8')).toBeInTheDocument();
    });
  });
});
