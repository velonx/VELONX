/**
 * EventsFilterPanel Component Tests
 * Feature: events-page-ui-improvements
 * Task: 5. Create EventsFilterPanel component (Desktop)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventsFilterPanel from '../EventsFilterPanel';
import { EventType, EventAvailability } from '@/lib/types/events.types';

describe('EventsFilterPanel', () => {
  const mockProps = {
    selectedTypes: [] as EventType[],
    dateRange: {},
    availability: 'all' as EventAvailability,
    myEvents: false,
    onTypeToggle: vi.fn(),
    onDateRangeChange: vi.fn(),
    onAvailabilityChange: vi.fn(),
    onMyEventsToggle: vi.fn(),
    onClearAll: vi.fn(),
    activeFilterCount: 0,
  };

  it('renders the filter panel with all sections', () => {
    render(<EventsFilterPanel {...mockProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Event Type')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('My Events')).toBeInTheDocument();
  });

  it('displays all event type options', () => {
    render(<EventsFilterPanel {...mockProps} />);

    expect(screen.getByText('Workshop')).toBeInTheDocument();
    expect(screen.getByText('Hackathon')).toBeInTheDocument();
    expect(screen.getByText('Networking')).toBeInTheDocument();
    expect(screen.getByText('Webinar')).toBeInTheDocument();
  });

  it('calls onTypeToggle when event type checkbox is clicked', () => {
    render(<EventsFilterPanel {...mockProps} />);

    const workshopCheckbox = screen.getByLabelText('Filter by Workshop');
    fireEvent.click(workshopCheckbox);

    expect(mockProps.onTypeToggle).toHaveBeenCalledWith('WORKSHOP');
  });

  it('displays selected event types as checked', () => {
    const props = {
      ...mockProps,
      selectedTypes: ['WORKSHOP', 'HACKATHON'] as EventType[],
    };

    render(<EventsFilterPanel {...props} />);

    const workshopCheckbox = screen.getByLabelText('Filter by Workshop');
    const hackathonCheckbox = screen.getByLabelText('Filter by Hackathon');
    const networkingCheckbox = screen.getByLabelText('Filter by Networking');

    // Radix UI Checkbox uses data-state attribute instead of checked property
    expect(workshopCheckbox).toHaveAttribute('data-state', 'checked');
    expect(hackathonCheckbox).toHaveAttribute('data-state', 'checked');
    expect(networkingCheckbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('displays date range preset options', () => {
    render(<EventsFilterPanel {...mockProps} />);

    expect(screen.getByText('Next 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Next 30 Days')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  it('calls onDateRangeChange when date preset is clicked', () => {
    render(<EventsFilterPanel {...mockProps} />);

    const next7DaysButton = screen.getByText('Next 7 Days');
    fireEvent.click(next7DaysButton);

    expect(mockProps.onDateRangeChange).toHaveBeenCalled();
    const callArg = mockProps.onDateRangeChange.mock.calls[0][0];
    expect(callArg).toHaveProperty('start');
    expect(callArg).toHaveProperty('end');
  });

  it('displays all availability options', () => {
    render(<EventsFilterPanel {...mockProps} />);

    expect(screen.getByText('All Events')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Almost Full')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
  });

  it('calls onAvailabilityChange when availability option is clicked', () => {
    render(<EventsFilterPanel {...mockProps} />);

    const availableButton = screen.getByText('Available');
    fireEvent.click(availableButton);

    expect(mockProps.onAvailabilityChange).toHaveBeenCalledWith('available');
  });

  it('highlights selected availability option', () => {
    const props = {
      ...mockProps,
      availability: 'available' as EventAvailability,
    };

    render(<EventsFilterPanel {...props} />);

    const availableButton = screen.getByText('Available').closest('button');
    expect(availableButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onMyEventsToggle when My Events button is clicked', () => {
    render(<EventsFilterPanel {...mockProps} />);

    const myEventsButton = screen.getByText('Show only my registered events');
    fireEvent.click(myEventsButton);

    expect(mockProps.onMyEventsToggle).toHaveBeenCalledWith(true);
  });

  it('highlights My Events button when active', () => {
    const props = {
      ...mockProps,
      myEvents: true,
    };

    render(<EventsFilterPanel {...props} />);

    const myEventsButton = screen.getByText('Show only my registered events').closest('button');
    expect(myEventsButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows Clear All button when filters are active', () => {
    const props = {
      ...mockProps,
      activeFilterCount: 3,
    };

    render(<EventsFilterPanel {...props} />);

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('does not show Clear All button when no filters are active', () => {
    render(<EventsFilterPanel {...mockProps} />);

    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('calls onClearAll when Clear All button is clicked', () => {
    const props = {
      ...mockProps,
      activeFilterCount: 3,
    };

    render(<EventsFilterPanel {...props} />);

    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    expect(mockProps.onClearAll).toHaveBeenCalled();
  });

  it('displays active filter count', () => {
    const props = {
      ...mockProps,
      activeFilterCount: 5,
    };

    render(<EventsFilterPanel {...props} />);

    expect(screen.getByText('5 filters active')).toBeInTheDocument();
  });

  it('displays singular filter text when count is 1', () => {
    const props = {
      ...mockProps,
      activeFilterCount: 1,
    };

    render(<EventsFilterPanel {...props} />);

    expect(screen.getByText('1 filter active')).toBeInTheDocument();
  });

  it('displays custom date range when set', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const props = {
      ...mockProps,
      dateRange: { start, end },
    };

    render(<EventsFilterPanel {...props} />);

    expect(screen.getByText('Custom Range')).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/1\/31\/2024/)).toBeInTheDocument();
  });

  it('clears custom date range when Clear button is clicked', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const props = {
      ...mockProps,
      dateRange: { start, end },
    };

    render(<EventsFilterPanel {...props} />);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockProps.onDateRangeChange).toHaveBeenCalledWith({});
  });

  it('has proper ARIA labels for accessibility', () => {
    render(<EventsFilterPanel {...mockProps} />);

    expect(screen.getByLabelText('Filter by Workshop')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Hackathon')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Networking')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Webinar')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<EventsFilterPanel {...mockProps} />);

    // Find the main container div with the styling classes
    const mainContainer = container.querySelector('.bg-\\[\\#0f172a\\]');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('rounded-[24px]');
    expect(mainContainer).toHaveClass('border');
  });
});
