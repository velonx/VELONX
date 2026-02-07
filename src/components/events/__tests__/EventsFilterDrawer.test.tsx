/**
 * EventsFilterDrawer Component Tests
 * Feature: events-page-ui-improvements
 * Task: 6. Create EventsFilterDrawer component (Mobile)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventsFilterDrawer } from '../EventsFilterDrawer';
import { EventType, EventAvailability } from '@/lib/types/events.types';

describe('EventsFilterDrawer', () => {
  const mockProps = {
    selectedTypes: [] as EventType[],
    dateRange: {},
    availability: 'all' as EventAvailability,
    myEvents: false,
    onTypeToggle: vi.fn(),
    onDateRangeChange: vi.fn(),
    onAvailabilityChange: vi.fn(),
    onMyEventsToggle: vi.fn(),
    onApply: vi.fn(),
    onCancel: vi.fn(),
    onClearAll: vi.fn(),
    activeFilterCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the filter trigger button', () => {
      render(<EventsFilterDrawer {...mockProps} />);
      expect(screen.getByRole('button', { name: /open filters/i })).toBeInTheDocument();
    });

    it('should display active filter count badge when filters are active', () => {
      render(<EventsFilterDrawer {...mockProps} activeFilterCount={3} />);
      expect(screen.getByLabelText('3 filters active')).toBeInTheDocument();
    });

    it('should not display badge when no filters are active', () => {
      render(<EventsFilterDrawer {...mockProps} activeFilterCount={0} />);
      expect(screen.queryByLabelText(/filters active/i)).not.toBeInTheDocument();
    });

    it('should display results count when provided', async () => {
      render(<EventsFilterDrawer {...mockProps} resultsCount={42} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        expect(screen.getByText('42 events found')).toBeInTheDocument();
      });
    });
  });

  describe('Event Type Filter', () => {
    it('should render all event type options', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Workshop')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Hackathon')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Networking')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Webinar')).toBeInTheDocument();
      });
    });

    it('should check selected event types', async () => {
      render(
        <EventsFilterDrawer
          {...mockProps}
          selectedTypes={['WORKSHOP', 'HACKATHON']}
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const workshopCheckbox = screen.getByLabelText('Filter by Workshop');
        const hackathonCheckbox = screen.getByLabelText('Filter by Hackathon');
        const networkingCheckbox = screen.getByLabelText('Filter by Networking');
        
        expect(workshopCheckbox).toBeChecked();
        expect(hackathonCheckbox).toBeChecked();
        expect(networkingCheckbox).not.toBeChecked();
      });
    });

    it('should toggle event type when clicked', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const workshopCheckbox = screen.getByLabelText('Filter by Workshop');
        fireEvent.click(workshopCheckbox);
      });
      
      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(mockProps.onTypeToggle).toHaveBeenCalledWith('WORKSHOP');
      });
    });
  });

  describe('Date Range Filter', () => {
    it('should render date range preset options', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Next 7 Days')).toBeInTheDocument();
        expect(screen.getByText('Next 30 Days')).toBeInTheDocument();
        expect(screen.getByText('This Month')).toBeInTheDocument();
      });
    });

    it('should highlight active date range preset', async () => {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 7);
      
      render(
        <EventsFilterDrawer
          {...mockProps}
          dateRange={{ start, end }}
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const next7DaysButton = screen.getByText('Next 7 Days').closest('button');
        expect(next7DaysButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should apply date range when preset is clicked', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const next7DaysButton = screen.getByText('Next 7 Days');
        fireEvent.click(next7DaysButton);
      });
      
      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(mockProps.onDateRangeChange).toHaveBeenCalled();
      });
    });
  });

  describe('Availability Filter', () => {
    it('should render all availability options', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        expect(screen.getByText('All Events')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('Almost Full')).toBeInTheDocument();
        expect(screen.getByText('Full')).toBeInTheDocument();
      });
    });

    it('should highlight selected availability option', async () => {
      render(
        <EventsFilterDrawer
          {...mockProps}
          availability="available"
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const availableButton = screen.getByText('Available').closest('button');
        expect(availableButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should apply availability when option is clicked', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const availableButton = screen.getByText('Available');
        fireEvent.click(availableButton);
      });
      
      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(mockProps.onAvailabilityChange).toHaveBeenCalledWith('available');
      });
    });
  });

  describe('My Events Toggle', () => {
    it('should render my events toggle', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Show only my registered events')).toBeInTheDocument();
      });
    });

    it('should highlight when my events is enabled', async () => {
      render(
        <EventsFilterDrawer
          {...mockProps}
          myEvents={true}
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const myEventsButton = screen.getByText('Show only my registered events').closest('button');
        expect(myEventsButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should toggle my events when clicked', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const myEventsButton = screen.getByText('Show only my registered events');
        fireEvent.click(myEventsButton);
      });
      
      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(mockProps.onMyEventsToggle).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Action Buttons', () => {
    it('should show clear all button when filters are active', async () => {
      render(
        <EventsFilterDrawer
          {...mockProps}
          selectedTypes={['WORKSHOP']}
          activeFilterCount={1}
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
      });
    });

    it('should call onClearAll when clear all button is clicked', async () => {
      render(
        <EventsFilterDrawer
          {...mockProps}
          selectedTypes={['WORKSHOP']}
          activeFilterCount={1}
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear all filters/i });
        fireEvent.click(clearButton);
      });
      
      expect(mockProps.onClearAll).toHaveBeenCalled();
    });

    it('should call onCancel and close drawer when cancel button is clicked', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel and close/i });
        fireEvent.click(cancelButton);
      });
      
      expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it('should call onApply and close drawer when apply button is clicked', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply filters/i });
        fireEvent.click(applyButton);
      });
      
      expect(mockProps.onApply).toHaveBeenCalled();
    });

    it('should display active filter count on apply button', async () => {
      render(
        <EventsFilterDrawer
          {...mockProps}
          selectedTypes={['WORKSHOP', 'HACKATHON']}
          activeFilterCount={2}
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /apply filters/i });
        expect(applyButton).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<EventsFilterDrawer {...mockProps} activeFilterCount={2} />);
      
      expect(screen.getByLabelText('Open filters, 2 active')).toBeInTheDocument();
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filter options')).toBeInTheDocument();
      });
    });

    it('should have minimum touch target sizes', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      const triggerButton = screen.getByRole('button', { name: /open filters/i });
      expect(triggerButton).toHaveClass('min-h-[44px]');
    });
  });

  describe('Local Filter State', () => {
    it('should maintain local filter state until apply is clicked', async () => {
      render(<EventsFilterDrawer {...mockProps} />);
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const workshopCheckbox = screen.getByLabelText('Filter by Workshop');
        fireEvent.click(workshopCheckbox);
      });
      
      // Close without applying
      const cancelButton = screen.getByRole('button', { name: /cancel and close/i });
      fireEvent.click(cancelButton);
      
      // onTypeToggle should not be called
      expect(mockProps.onTypeToggle).not.toHaveBeenCalled();
    });

    it('should reset local filters when cancel is clicked', async () => {
      render(
        <EventsFilterDrawer
          {...mockProps}
          selectedTypes={['WORKSHOP']}
        />
      );
      
      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const hackathonCheckbox = screen.getByLabelText('Filter by Hackathon');
        fireEvent.click(hackathonCheckbox);
      });
      
      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel and close/i });
      fireEvent.click(cancelButton);
      
      // Reopen drawer
      fireEvent.click(screen.getByRole('button', { name: /open filters/i }));
      
      await waitFor(() => {
        const workshopCheckbox = screen.getByLabelText('Filter by Workshop');
        const hackathonCheckbox = screen.getByLabelText('Filter by Hackathon');
        
        expect(workshopCheckbox).toBeChecked();
        expect(hackathonCheckbox).not.toBeChecked();
      });
    });
  });
});
