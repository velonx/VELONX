/**
 * Tests for ActiveFiltersDisplay Component
 * Feature: events-page-ui-improvements
 * Validates: Requirements 1.6, 1.7
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveFiltersDisplay } from '../ActiveFiltersDisplay';
import { EventType, EventAvailability } from '@/lib/types/events.types';

describe('ActiveFiltersDisplay', () => {
  const mockOnClearAll = vi.fn();
  const mockOnRemoveFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when no filters are active', () => {
      const { container } = render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when search filter is active', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'workshop',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText(/Search: "workshop"/)).toBeInTheDocument();
      expect(screen.getByText('1 filter active')).toBeInTheDocument();
    });

    it('should render event type filters', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: ['WORKSHOP' as EventType, 'HACKATHON' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Hackathon')).toBeInTheDocument();
      expect(screen.getByText('2 filters active')).toBeInTheDocument();
    });

    it('should render date range filter with start and end dates', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: { start: startDate, end: endDate },
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText(/Jan 1, 2024 - Dec 31, 2024/)).toBeInTheDocument();
      expect(screen.getByText('1 filter active')).toBeInTheDocument();
    });

    it('should render date range filter with only start date', () => {
      const startDate = new Date('2024-01-01');

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: { start: startDate },
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText(/From Jan 1, 2024/)).toBeInTheDocument();
    });

    it('should render date range filter with only end date', () => {
      const endDate = new Date('2024-12-31');

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: { end: endDate },
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText(/Until Dec 31, 2024/)).toBeInTheDocument();
    });

    it('should render availability filter', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'available' as EventAvailability,
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('1 filter active')).toBeInTheDocument();
    });

    it('should render myEvents filter', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: true,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('My Events')).toBeInTheDocument();
      expect(screen.getByText('1 filter active')).toBeInTheDocument();
    });

    it('should render multiple filters correctly', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'react',
            types: ['WORKSHOP' as EventType, 'WEBINAR' as EventType],
            dateRange: { start: new Date('2024-01-01') },
            availability: 'available' as EventAvailability,
            myEvents: true,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText(/Search: "react"/)).toBeInTheDocument();
      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Webinar')).toBeInTheDocument();
      expect(screen.getByText(/From Jan 1, 2024/)).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('My Events')).toBeInTheDocument();
      expect(screen.getByText('6 filters active')).toBeInTheDocument();
    });

    it('should use singular "filter" for count of 1', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('1 filter active')).toBeInTheDocument();
    });

    it('should use plural "filters" for count > 1', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: ['WORKSHOP' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('2 filters active')).toBeInTheDocument();
    });
  });

  describe('Clear All Functionality', () => {
    it('should call onClearAll when Clear All button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: ['WORKSHOP' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const clearAllButton = screen.getByRole('button', { name: /Clear all 2 filters/i });
      await user.click(clearAllButton);

      expect(mockOnClearAll).toHaveBeenCalledTimes(1);
    });

    it('should have correct aria-label on Clear All button', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: ['WORKSHOP' as EventType, 'HACKATHON' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const clearAllButton = screen.getByRole('button', { name: 'Clear all 3 filters' });
      expect(clearAllButton).toBeInTheDocument();
    });
  });

  describe('Remove Individual Filter', () => {
    it('should call onRemoveFilter when search filter remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'workshop',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const removeButton = screen.getByRole('button', { name: /Remove Search: "workshop" filter/i });
      await user.click(removeButton);

      expect(mockOnRemoveFilter).toHaveBeenCalledWith('search', undefined);
    });

    it('should call onRemoveFilter when type filter remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: ['WORKSHOP' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Workshop filter' });
      await user.click(removeButton);

      expect(mockOnRemoveFilter).toHaveBeenCalledWith('type', 'WORKSHOP');
    });

    it('should call onRemoveFilter when date range filter remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: { start: new Date('2024-01-01') },
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const removeButton = screen.getByRole('button', { name: /Remove From Jan 1, 2024 filter/i });
      await user.click(removeButton);

      expect(mockOnRemoveFilter).toHaveBeenCalledWith('dateRange', undefined);
    });

    it('should call onRemoveFilter when availability filter remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'available' as EventAvailability,
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove Available filter' });
      await user.click(removeButton);

      expect(mockOnRemoveFilter).toHaveBeenCalledWith('availability', undefined);
    });

    it('should call onRemoveFilter when myEvents filter remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: true,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const removeButton = screen.getByRole('button', { name: 'Remove My Events filter' });
      await user.click(removeButton);

      expect(mockOnRemoveFilter).toHaveBeenCalledWith('myEvents', undefined);
    });

    it('should call onRemoveFilter with correct type value for multiple types', async () => {
      const user = userEvent.setup();

      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: ['WORKSHOP' as EventType, 'HACKATHON' as EventType, 'WEBINAR' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const hackathonRemoveButton = screen.getByRole('button', { name: 'Remove Hackathon filter' });
      await user.click(hackathonRemoveButton);

      expect(mockOnRemoveFilter).toHaveBeenCalledWith('type', 'HACKATHON');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA region role', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const region = screen.getByRole('region', { name: 'Active filters' });
      expect(region).toBeInTheDocument();
    });

    it('should have proper ARIA list role for filter chips', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const list = screen.getByRole('list', { name: 'Active filter chips' });
      expect(list).toBeInTheDocument();
    });

    it('should have screen reader announcement for filter count', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: ['WORKSHOP' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent('2 filters active');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have aria-hidden on icon elements', () => {
      const { container } = render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have descriptive aria-labels on remove buttons', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'workshop',
            types: ['HACKATHON' as EventType],
            dateRange: {},
            availability: 'available' as EventAvailability,
            myEvents: true,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByRole('button', { name: /Remove Search: "workshop" filter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Hackathon filter' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Available filter' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove My Events filter' })).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'test',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
          className="custom-class"
        />
      );

      const region = container.querySelector('.custom-class');
      expect(region).toBeInTheDocument();
    });
  });

  describe('Event Type Labels', () => {
    it('should display correct labels for all event types', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: ['WORKSHOP' as EventType, 'HACKATHON' as EventType, 'WEBINAR' as EventType, 'NETWORKING' as EventType],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('Workshop')).toBeInTheDocument();
      expect(screen.getByText('Hackathon')).toBeInTheDocument();
      expect(screen.getByText('Webinar')).toBeInTheDocument();
      expect(screen.getByText('Networking')).toBeInTheDocument();
    });
  });

  describe('Availability Labels', () => {
    it('should display correct label for "available" availability', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'available' as EventAvailability,
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should display correct label for "almost-full" availability', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'almost-full' as EventAvailability,
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('Almost Full')).toBeInTheDocument();
    });

    it('should display correct label for "full" availability', () => {
      render(
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {},
            availability: 'full' as EventAvailability,
            myEvents: false,
          }}
          onClearAll={mockOnClearAll}
          onRemoveFilter={mockOnRemoveFilter}
        />
      );

      expect(screen.getByText('Full')).toBeInTheDocument();
    });
  });
});
