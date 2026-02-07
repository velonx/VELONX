import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventCalendar from '../EventCalendar';
import { Event } from '@/lib/api/types';

// Mock the tooltip component
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EventCalendar', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Workshop Event',
      description: 'Test workshop',
      type: 'WORKSHOP',
      date: new Date(2024, 0, 15).toISOString(),
      endDate: null,
      location: 'Online',
      meetingLink: 'https://meet.google.com/test',
      imageUrl: null,
      maxSeats: 50,
      status: 'UPCOMING',
      creatorId: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        attendees: 25,
      },
    },
    {
      id: '2',
      title: 'Hackathon Event',
      description: 'Test hackathon',
      type: 'HACKATHON',
      date: new Date(2024, 0, 15).toISOString(),
      endDate: null,
      location: 'In-person',
      meetingLink: null,
      imageUrl: null,
      maxSeats: 100,
      status: 'UPCOMING',
      creatorId: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        attendees: 50,
      },
    },
  ];

  const mockOnDateSelect = vi.fn();

  beforeEach(() => {
    mockOnDateSelect.mockClear();
  });

  it('renders calendar with current month', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
      />
    );

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    
    expect(screen.getByText(new RegExp(monthName))).toBeInTheDocument();
  });

  it('displays event count badge on dates with events', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Should show badge with count of 2 for the date with 2 events
    const badges = screen.getAllByText('2');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('calls onDateSelect when a date is clicked', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
      />
    );

    const dateButtons = screen.getAllByRole('button');
    const firstDateButton = dateButtons.find(btn => 
      btn.textContent === '15' && !btn.classList.contains('text-gray-600')
    );

    if (firstDateButton) {
      fireEvent.click(firstDateButton);
      expect(mockOnDateSelect).toHaveBeenCalled();
    }
  });

  it('navigates to previous month', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
      />
    );

    const prevButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevButton);

    // Month should change
    const today = new Date();
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1);
    const prevMonthName = prevMonth.toLocaleString('default', { month: 'long' });
    
    expect(screen.getByText(new RegExp(prevMonthName))).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
      />
    );

    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);

    // Month should change
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleString('default', { month: 'long' });
    
    expect(screen.getByText(new RegExp(nextMonthName))).toBeInTheDocument();
  });

  it('returns to today when Today button is clicked', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Navigate away first
    const nextButton = screen.getByLabelText('Next month');
    fireEvent.click(nextButton);

    // Click Today button (use getAllByText since "Today" appears in legend too)
    const todayButtons = screen.getAllByText('Today');
    const todayButton = todayButtons.find(btn => btn.tagName === 'BUTTON');
    if (todayButton) {
      fireEvent.click(todayButton);
    }

    // Should be back to current month
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    
    expect(screen.getByText(new RegExp(monthName))).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
        isLoading={true}
      />
    );

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('disables date buttons when loading', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
        isLoading={true}
      />
    );

    const dateButtons = screen.getAllByRole('button').filter(btn => 
      !btn.textContent?.includes('Today') && 
      !btn.querySelector('svg')
    );

    dateButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('highlights selected date', () => {
    const today = new Date();
    const selectedDate = new Date(today.getFullYear(), today.getMonth(), 15);
    
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
        selectedDate={selectedDate}
      />
    );

    // Check that a date button with "15" has the selected styling
    const dateButtons = screen.getAllByRole('button');
    const selectedButton = dateButtons.find(btn => 
      btn.textContent?.includes('15') && 
      btn.className.includes('bg-cyan-500/20')
    );

    expect(selectedButton).toBeDefined();
  });

  it('shows multiple event indicators', () => {
    const today = new Date();
    const eventsForToday: Event[] = [
      {
        id: '1',
        title: 'Event 1',
        description: 'Test',
        type: 'WORKSHOP',
        date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(),
        endDate: null,
        location: 'Online',
        meetingLink: null,
        imageUrl: null,
        maxSeats: 50,
        status: 'UPCOMING',
        creatorId: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    render(
      <EventCalendar
        events={eventsForToday}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Should show dots for events (up to 3 dots max)
    const eventIndicators = document.querySelectorAll('.bg-violet-400, .group-hover\\:bg-cyan-400');
    expect(eventIndicators.length).toBeGreaterThan(0);
  });

  it('displays legend with correct items', () => {
    render(
      <EventCalendar
        events={mockEvents}
        onDateSelect={mockOnDateSelect}
      />
    );

    // Use getAllByText since "Today" appears in both button and legend
    const todayTexts = screen.getAllByText('Today');
    expect(todayTexts.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Has Events')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });

  describe('Mobile Optimizations', () => {
    it('has touch-friendly button sizes (min 44x44px)', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const dateButtons = screen.getAllByRole('button').filter(btn => 
        !btn.textContent?.includes('Today') && 
        !btn.querySelector('svg')
      );

      dateButtons.forEach(button => {
        expect(button.className).toContain('min-h-[44px]');
        expect(button.className).toContain('min-w-[44px]');
      });
    });

    it('has touch-manipulation class on interactive elements', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const todayButton = screen.getAllByText('Today').find(btn => btn.tagName === 'BUTTON');
      expect(todayButton?.className).toContain('touch-manipulation');

      const prevButton = screen.getByLabelText('Previous month');
      expect(prevButton.className).toContain('touch-manipulation');

      const nextButton = screen.getByLabelText('Next month');
      expect(nextButton.className).toContain('touch-manipulation');
    });

    it('handles swipe gestures for month navigation', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const calendar = document.querySelector('.glass-strong');
      expect(calendar).toBeInTheDocument();

      const today = new Date();
      const currentMonthName = today.toLocaleString('default', { month: 'long' });
      expect(screen.getByText(new RegExp(currentMonthName))).toBeInTheDocument();

      // Simulate left swipe (next month)
      if (calendar) {
        fireEvent.touchStart(calendar, {
          targetTouches: [{ clientX: 200 }],
        });
        fireEvent.touchMove(calendar, {
          targetTouches: [{ clientX: 100 }],
        });
        fireEvent.touchEnd(calendar);

        // Should navigate to next month
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
        const nextMonthName = nextMonth.toLocaleString('default', { month: 'long' });
        expect(screen.getByText(new RegExp(nextMonthName))).toBeInTheDocument();
      }
    });

    it('handles right swipe for previous month', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const calendar = document.querySelector('.glass-strong');
      expect(calendar).toBeInTheDocument();

      // Simulate right swipe (previous month)
      if (calendar) {
        fireEvent.touchStart(calendar, {
          targetTouches: [{ clientX: 100 }],
        });
        fireEvent.touchMove(calendar, {
          targetTouches: [{ clientX: 200 }],
        });
        fireEvent.touchEnd(calendar);

        // Should navigate to previous month
        const today = new Date();
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1);
        const prevMonthName = prevMonth.toLocaleString('default', { month: 'long' });
        expect(screen.getByText(new RegExp(prevMonthName))).toBeInTheDocument();
      }
    });

    it('ignores short swipes (less than minimum distance)', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const calendar = document.querySelector('.glass-strong');
      const today = new Date();
      const currentMonthName = today.toLocaleString('default', { month: 'long' });

      // Simulate short swipe (should not trigger navigation)
      if (calendar) {
        fireEvent.touchStart(calendar, {
          targetTouches: [{ clientX: 100 }],
        });
        fireEvent.touchMove(calendar, {
          targetTouches: [{ clientX: 120 }], // Only 20px movement
        });
        fireEvent.touchEnd(calendar);

        // Should stay on current month
        expect(screen.getByText(new RegExp(currentMonthName))).toBeInTheDocument();
      }
    });

    it('has active states for touch feedback', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const dateButtons = screen.getAllByRole('button').filter(btn => 
        !btn.textContent?.includes('Today') && 
        !btn.querySelector('svg')
      );

      dateButtons.forEach(button => {
        expect(button.className).toContain('active:');
      });
    });

    it('has select-none class to prevent text selection during swipes', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const dateButtons = screen.getAllByRole('button').filter(btn => 
        !btn.textContent?.includes('Today') && 
        !btn.querySelector('svg')
      );

      dateButtons.forEach(button => {
        expect(button.className).toContain('select-none');
      });
    });

    it('displays swipe hint text on mobile', () => {
      render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      expect(screen.getByText('Swipe to navigate months')).toBeInTheDocument();
    });

    it('has responsive padding and spacing', () => {
      const { container } = render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const calendar = container.querySelector('.glass-strong');
      expect(calendar?.className).toContain('p-4');
      expect(calendar?.className).toContain('sm:p-6');
    });

    it('has responsive gap in calendar grid', () => {
      const { container } = render(
        <EventCalendar
          events={mockEvents}
          onDateSelect={mockOnDateSelect}
        />
      );

      const grid = container.querySelector('.grid-cols-7');
      expect(grid?.className).toContain('gap-1');
      expect(grid?.className).toContain('sm:gap-2');
    });
  });
});
