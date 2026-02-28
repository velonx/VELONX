/**
 * EventCard Registration Closed Tests
 * Feature: event-registration-closed
 * Task 8: EventCard component updates
 * 
 * Tests for Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 11.1, 11.2, 11.3, 11.5
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventCard from '@/components/events/EventCard';
import type { Event } from '@/lib/api/types';

// Mock the CalendarExportMenu component
vi.mock('@/components/events/CalendarExportMenu', () => ({
  CalendarExportMenu: () => <div data-testid="calendar-export-menu">Calendar Export</div>
}));

const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: '1',
  title: 'Test Event',
  description: 'Test Description',
  type: 'WORKSHOP',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  location: 'Test Location',
  maxSeats: 50,
  status: 'UPCOMING',
  creatorId: 'creator-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _count: {
    attendees: 0
  },
  ...overrides
});

describe('EventCard - Registration Closed Badge (Requirement 4.1, 4.2, 4.3)', () => {
  it('should display "Full" badge when event is at capacity', () => {
    const event = createMockEvent({
      maxSeats: 50,
      _count: { attendees: 50 }
    });

    render(<EventCard event={event} />);
    
    // Check for badge with "Full" text - there may be multiple instances
    const badges = screen.getAllByText(/Full/i);
    expect(badges.length).toBeGreaterThan(0);
    // Check that at least one is a badge element
    const badge = badges.find(el => el.getAttribute('aria-label')?.includes('Registration closed'));
    expect(badge).toBeInTheDocument();
  });

  it('should display "Closed" badge when registration deadline has passed', () => {
    const event = createMockEvent({
      registrationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} />);
    
    // Check for badge with "Closed" text - there may be multiple "Closed" texts
    const badges = screen.getAllByText(/Closed/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display "Closed" badge when manually closed', () => {
    const event = createMockEvent({
      registrationManuallyClosedAt: new Date().toISOString(),
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} />);
    
    // Check for badge with "Closed" text - there may be multiple instances
    const badges = screen.getAllByText(/Closed/i);
    expect(badges.length).toBeGreaterThan(0);
    // Check that at least one is a badge element
    const badge = badges.find(el => el.getAttribute('aria-label')?.includes('Registration closed'));
    expect(badge).toBeInTheDocument();
  });

  it('should not display closed badge when registration is open', () => {
    const event = createMockEvent({
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} />);
    
    // Should not have "Full" or "Closed" badge
    expect(screen.queryByText(/^Full$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Closed$/)).not.toBeInTheDocument();
  });
});

describe('EventCard - Registration Button State (Requirement 4.4, 6.1, 6.2, 6.3, 6.4)', () => {
  it('should disable button when registration is closed due to capacity', () => {
    const event = createMockEvent({
      maxSeats: 50,
      _count: { attendees: 50 }
    });

    render(<EventCard event={event} onRegister={vi.fn()} />);
    
    // Button text is "Event Full" but aria-label includes full message
    const button = screen.getByRole('button', { name: /Event is full/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveTextContent(/Event Full/i);
  });

  it('should disable button when registration deadline has passed', () => {
    const event = createMockEvent({
      registrationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} onRegister={vi.fn()} />);
    
    // Button text is "Deadline Passed" but aria-label includes full message
    const button = screen.getByRole('button', { name: /Registration deadline has passed/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveTextContent(/Deadline Passed/i);
  });

  it('should disable button when manually closed', () => {
    const event = createMockEvent({
      registrationManuallyClosedAt: new Date().toISOString(),
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} onRegister={vi.fn()} />);
    
    // Button text is "Registration Closed" but aria-label includes full message
    const button = screen.getByRole('button', { name: /Registration is currently closed/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveTextContent(/Registration Closed/i);
  });

  it('should show "Register Now" button when registration is open', () => {
    const event = createMockEvent({
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} onRegister={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /Register for/i });
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/Register Now/i);
  });

  it('should show "Registered" button when user is registered', () => {
    const event = createMockEvent({
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} isRegistered={true} onUnregister={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /You are registered/i });
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/Registered/i);
  });
});

describe('EventCard - ARIA Labels (Requirement 4.5, 11.1, 11.2, 11.3, 11.5)', () => {
  it('should include registration status in card aria-label', () => {
    const event = createMockEvent({
      maxSeats: 50,
      _count: { attendees: 50 }
    });

    render(<EventCard event={event} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Event is full'));
  });

  it('should have hidden status description for screen readers', () => {
    const event = createMockEvent({
      registrationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} />);
    
    // Check for sr-only element with status description
    const statusDescription = screen.getByText(/Registration is closed/i);
    expect(statusDescription).toBeInTheDocument();
    expect(statusDescription).toHaveClass('sr-only');
  });

  it('should announce open registration status to screen readers', () => {
    const event = createMockEvent({
      _count: { attendees: 10 }
    });

    render(<EventCard event={event} />);
    
    // Check for sr-only element with open status
    const statusDescription = screen.getByText(/Registration is open/i);
    expect(statusDescription).toBeInTheDocument();
    expect(statusDescription).toHaveClass('sr-only');
  });

  it('should include closure reason in badge aria-label', () => {
    const event = createMockEvent({
      maxSeats: 50,
      _count: { attendees: 50 }
    });

    render(<EventCard event={event} />);
    
    // Check for badge with aria-label
    const badge = screen.getByLabelText(/Registration closed/i);
    expect(badge).toBeInTheDocument();
  });
});

describe('EventCard - Visual Distinction (Requirement 4.3)', () => {
  it('should apply different styles for capacity closure', () => {
    const event = createMockEvent({
      maxSeats: 50,
      _count: { attendees: 50 }
    });

    const { container } = render(<EventCard event={event} />);
    
    // Check for capacity-specific styling (red badge)
    const badge = container.querySelector('.bg-red-700\\/90');
    expect(badge).toBeInTheDocument();
  });

  it('should apply different styles for deadline closure', () => {
    const event = createMockEvent({
      registrationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      _count: { attendees: 10 }
    });

    const { container } = render(<EventCard event={event} />);
    
    // Check for deadline-specific styling (amber badge)
    const badge = container.querySelector('.bg-amber-700\\/90');
    expect(badge).toBeInTheDocument();
  });

  it('should apply different styles for manual closure', () => {
    const event = createMockEvent({
      registrationManuallyClosedAt: new Date().toISOString(),
      _count: { attendees: 10 }
    });

    const { container } = render(<EventCard event={event} />);
    
    // Check for manual-specific styling (gray badge)
    const badge = container.querySelector('.bg-gray-700\\/90');
    expect(badge).toBeInTheDocument();
  });
});

describe('EventCard - Reduced Visual Emphasis (Requirement 4.4)', () => {
  it('should reduce opacity when registration is closed', () => {
    const event = createMockEvent({
      maxSeats: 50,
      _count: { attendees: 50 }
    });

    const { container } = render(<EventCard event={event} />);
    
    const card = container.querySelector('.opacity-90');
    expect(card).toBeInTheDocument();
  });

  it('should not reduce opacity when registration is open', () => {
    const event = createMockEvent({
      _count: { attendees: 10 }
    });

    const { container } = render(<EventCard event={event} />);
    
    const card = container.querySelector('.opacity-90');
    expect(card).not.toBeInTheDocument();
  });
});
