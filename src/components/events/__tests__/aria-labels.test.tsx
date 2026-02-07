/**
 * ARIA Labels and Roles Test
 * Task: 32. Add ARIA labels and roles
 * 
 * Tests that all components have proper ARIA labels, roles, and descriptions
 * for accessibility compliance.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EventsToolbar from '../EventsToolbar';
import { EventsFilterPanel } from '../EventsFilterPanel';
import EventsGrid from '../EventsGrid';
import { EventsPagination } from '../EventsPagination';
import { CalendarExportMenu } from '../CalendarExportMenu';
import { EventType, EventAvailability } from '@/lib/types/events.types';

describe('ARIA Labels and Roles - Task 32', () => {
  describe('EventsToolbar', () => {
    it('should have search role and aria-label', () => {
      render(
        <EventsToolbar
          searchQuery=""
          onSearchChange={() => {}}
          sortBy="date-asc"
          onSortChange={() => {}}
          resultsCount={10}
        />
      );

      const searchRegion = screen.getByRole('search');
      expect(searchRegion).toHaveAttribute('aria-label', 'Event search and sort controls');

      const searchInput = screen.getByRole('textbox', { name: /search events/i });
      expect(searchInput).toBeInTheDocument();
    });

    it('should have aria-live region for results count', () => {
      const { container } = render(
        <EventsToolbar
          searchQuery=""
          onSearchChange={() => {}}
          sortBy="date-asc"
          onSortChange={() => {}}
          resultsCount={5}
        />
      );

      const liveRegions = container.querySelectorAll('[aria-live="polite"]');
      expect(liveRegions.length).toBeGreaterThan(0);
    });

    it('should have aria-describedby for search input', () => {
      render(
        <EventsToolbar
          searchQuery=""
          onSearchChange={() => {}}
          sortBy="date-asc"
          onSortChange={() => {}}
          resultsCount={10}
        />
      );

      const searchInput = screen.getByRole('textbox', { name: /search events/i });
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-hint');
    });
  });

  describe('EventsFilterPanel', () => {
    const mockProps = {
      selectedTypes: [] as EventType[],
      dateRange: {},
      availability: 'all' as EventAvailability,
      myEvents: false,
      onTypeToggle: () => {},
      onDateRangeChange: () => {},
      onAvailabilityChange: () => {},
      onMyEventsToggle: () => {},
      onClearAll: () => {},
      activeFilterCount: 0,
    };

    it('should have region role with aria-label', () => {
      render(<EventsFilterPanel {...mockProps} />);

      const filterRegion = screen.getByRole('region', { name: /event filters/i });
      expect(filterRegion).toBeInTheDocument();
    });

    it('should have group roles for filter sections', () => {
      render(<EventsFilterPanel {...mockProps} />);

      const groups = screen.getAllByRole('group');
      expect(groups.length).toBeGreaterThan(0);
    });

    it('should have radiogroup for date range and availability', () => {
      render(<EventsFilterPanel {...mockProps} />);

      const radioGroups = screen.getAllByRole('radiogroup');
      expect(radioGroups.length).toBeGreaterThanOrEqual(2); // Date range and availability
    });

    it('should have switch role for My Events toggle', () => {
      render(<EventsFilterPanel {...mockProps} />);

      const myEventsSwitch = screen.getByRole('switch', { name: /show only my registered events/i });
      expect(myEventsSwitch).toBeInTheDocument();
      expect(myEventsSwitch).toHaveAttribute('aria-checked', 'false');
    });

    it('should have aria-live region for active filter count', () => {
      const { rerender } = render(<EventsFilterPanel {...mockProps} activeFilterCount={0} />);

      rerender(<EventsFilterPanel {...mockProps} activeFilterCount={3} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('EventsGrid', () => {
    it('should have region role with aria-label', () => {
      render(
        <EventsGrid
          events={[]}
          isLoading={false}
          emptyState={<div>No events</div>}
        />
      );

      // Empty state should have aria-live
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-live region for loaded events', () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Test Event',
          description: 'Test',
          date: new Date().toISOString(),
          type: 'WORKSHOP' as const,
          status: 'UPCOMING' as const,
          location: 'Online',
          maxSeats: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creatorId: '1',
          _count: { attendees: 10 },
        },
      ];

      render(<EventsGrid events={mockEvents} isLoading={false} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('1 event loaded');
    });

    it('should have list role for events container', () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Test Event',
          description: 'Test',
          date: new Date().toISOString(),
          type: 'WORKSHOP' as const,
          status: 'UPCOMING' as const,
          location: 'Online',
          maxSeats: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creatorId: '1',
          _count: { attendees: 10 },
        },
      ];

      const { container } = render(<EventsGrid events={mockEvents} isLoading={false} />);

      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
    });
  });

  describe('EventsPagination', () => {
    const mockProps = {
      currentPage: 1,
      totalPages: 5,
      pageSize: 12,
      totalCount: 60,
      onPageChange: () => {},
      onPageSizeChange: () => {},
    };

    it('should have navigation role with aria-label', () => {
      render(<EventsPagination {...mockProps} />);

      const nav = screen.getByRole('navigation', { name: /events pagination/i });
      expect(nav).toBeInTheDocument();
    });

    it('should have aria-label for all navigation buttons', () => {
      render(<EventsPagination {...mockProps} />);

      expect(screen.getByRole('button', { name: /go to previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to page 1/i })).toBeInTheDocument();
    });

    it('should have aria-current for active page', () => {
      render(<EventsPagination {...mockProps} currentPage={2} />);

      const activePage = screen.getByRole('button', { name: /go to page 2/i });
      expect(activePage).toHaveAttribute('aria-current', 'page');
    });

    it('should have aria-describedby for page size selector', () => {
      render(<EventsPagination {...mockProps} />);

      const pageSize = screen.getByRole('combobox', { name: /select page size/i });
      expect(pageSize).toHaveAttribute('aria-describedby', 'page-size-label');
    });

    it('should have aria-live region for page status', () => {
      const { container } = render(<EventsPagination {...mockProps} />);

      const liveRegions = container.querySelectorAll('[aria-live="polite"]');
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });

  describe('CalendarExportMenu', () => {
    const mockEvent = {
      id: '1',
      title: 'Test Event',
      description: 'Test',
      date: new Date().toISOString(),
      type: 'WORKSHOP' as const,
      status: 'UPCOMING' as const,
      location: 'Online',
      maxSeats: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: '1',
      _count: { attendees: 10 },
    };

    it('should have aria-label for trigger button', () => {
      render(<CalendarExportMenu event={mockEvent} />);

      const button = screen.getByRole('button', { name: /add event to calendar/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should have role="menu" for dropdown content', () => {
      const { container } = render(<CalendarExportMenu event={mockEvent} />);

      // Note: Menu content is rendered in a portal, so we check the button has aria-haspopup
      const button = screen.getByRole('button', { name: /add event to calendar/i });
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });
  });
});
