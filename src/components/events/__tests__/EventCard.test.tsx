import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EventCard from '../EventCard';
import { Event } from '@/lib/api/types';

describe('EventCard', () => {
  const mockEvent: Event = {
    id: '1',
    title: 'React Workshop',
    description: 'Learn React fundamentals and advanced patterns',
    type: 'WORKSHOP',
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
    endDate: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(), // 2 hours duration
    location: 'Google Meet',
    imageUrl: null,
    maxSeats: 50,
    status: 'UPCOMING',
    creatorId: 'creator-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
    _count: {
      attendees: 25
    },
    creator: {
      id: 'creator-1',
      name: 'John Doe',
      image: null
    }
  };

  describe('Basic Rendering', () => {
    it('should render event title', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    it('should render event description', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText(/Learn React fundamentals/)).toBeInTheDocument();
    });

    it('should render event type badge', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should display formatted date', () => {
      render(<EventCard event={mockEvent} />);
      const dateElement = screen.getByText(/\w+ \d+, \d{4}/);
      expect(dateElement).toBeInTheDocument();
    });

    it('should display formatted time', () => {
      render(<EventCard event={mockEvent} />);
      // Time format: "12:00 PM" or similar
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}\s?(AM|PM)/i);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should display duration when endDate is provided', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText('2h')).toBeInTheDocument();
    });

    it('should not display duration when endDate is null', () => {
      const eventWithoutEndDate = { ...mockEvent, endDate: null };
      render(<EventCard event={eventWithoutEndDate} />);
      expect(screen.queryByText(/\d+h/)).not.toBeInTheDocument();
    });
  });

  describe('Platform/Location Display', () => {
    it('should display Google Meet platform', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText('Google Meet')).toBeInTheDocument();
    });

    it('should display Zoom platform', () => {
      const zoomEvent = { ...mockEvent, location: 'Zoom Meeting' };
      render(<EventCard event={zoomEvent} />);
      expect(screen.getByText('Zoom')).toBeInTheDocument();
    });

    it('should display physical location', () => {
      const physicalEvent = { ...mockEvent, location: 'Conference Room A' };
      render(<EventCard event={physicalEvent} />);
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    });

    it('should not display platform when location is null', () => {
      const noLocationEvent = { ...mockEvent, location: null };
      render(<EventCard event={noLocationEvent} />);
      expect(screen.queryByText(/Meet|Zoom|Teams/)).not.toBeInTheDocument();
    });
  });

  describe('Dynamic Tags', () => {
    it('should display creator name as tag', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText('By John Doe')).toBeInTheDocument();
    });

    it('should display event status', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText('UPCOMING')).toBeInTheDocument();
    });
  });

  describe('Urgency Badges', () => {
    it('should display "New" badge for events created within 7 days', () => {
      const newEvent = {
        ...mockEvent,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      };
      render(<EventCard event={newEvent} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should not display "New" badge for events older than 7 days', () => {
      const oldEvent = {
        ...mockEvent,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      };
      render(<EventCard event={oldEvent} />);
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });

    it('should display "Starting Soon" badge for events within 24 hours', () => {
      const soonEvent = {
        ...mockEvent,
        date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours from now
      };
      render(<EventCard event={soonEvent} />);
      expect(screen.getByText('Starting Soon')).toBeInTheDocument();
    });

    it('should display "Almost Full" badge when 80% or more seats taken', () => {
      const almostFullEvent = {
        ...mockEvent,
        _count: { attendees: 42 } // 84% of 50
      };
      render(<EventCard event={almostFullEvent} />);
      expect(screen.getByText('Almost Full')).toBeInTheDocument();
    });

    it('should not display "Almost Full" when event is full', () => {
      const fullEvent = {
        ...mockEvent,
        _count: { attendees: 50 }
      };
      render(<EventCard event={fullEvent} />);
      expect(screen.queryByText('Almost Full')).not.toBeInTheDocument();
    });
  });

  describe('Attendee Progress', () => {
    it('should display attendee count', () => {
      render(<EventCard event={mockEvent} />);
      expect(screen.getByText('25/50')).toBeInTheDocument();
    });

    it('should display correct progress bar width', () => {
      const { container } = render(<EventCard event={mockEvent} />);
      const progressBar = container.querySelector('[style*="width"]');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should handle zero attendees', () => {
      const emptyEvent = {
        ...mockEvent,
        _count: { attendees: 0 }
      };
      render(<EventCard event={emptyEvent} />);
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render View Details button when handler provided', () => {
      const onViewDetails = vi.fn();
      render(<EventCard event={mockEvent} onViewDetails={onViewDetails} />);
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    it('should call onViewDetails when button clicked', () => {
      const onViewDetails = vi.fn();
      render(<EventCard event={mockEvent} onViewDetails={onViewDetails} />);
      fireEvent.click(screen.getByText('View Details'));
      expect(onViewDetails).toHaveBeenCalledWith(mockEvent);
    });

    it('should render Register button when not registered', () => {
      const onRegister = vi.fn();
      render(<EventCard event={mockEvent} onRegister={onRegister} isRegistered={false} />);
      expect(screen.getByText('Register Now')).toBeInTheDocument();
    });

    it('should call onRegister when Register button clicked', () => {
      const onRegister = vi.fn();
      render(<EventCard event={mockEvent} onRegister={onRegister} isRegistered={false} />);
      fireEvent.click(screen.getByText('Register Now'));
      expect(onRegister).toHaveBeenCalledWith('1');
    });

    it('should render Registered button when user is registered', () => {
      render(<EventCard event={mockEvent} isRegistered={true} />);
      expect(screen.getByText('Registered')).toBeInTheDocument();
    });

    it('should call onUnregister when Registered button clicked', () => {
      const onUnregister = vi.fn();
      render(<EventCard event={mockEvent} onUnregister={onUnregister} isRegistered={true} />);
      fireEvent.click(screen.getByText('Registered'));
      expect(onUnregister).toHaveBeenCalledWith('1');
    });

    it('should disable Register button when event is full', () => {
      const fullEvent = {
        ...mockEvent,
        _count: { attendees: 50 }
      };
      render(<EventCard event={fullEvent} onRegister={vi.fn()} />);
      const button = screen.getByText('Event Full');
      expect(button).toBeDisabled();
    });
  });

  describe('Hover States', () => {
    it('should apply hover classes', () => {
      const { container } = render(<EventCard event={mockEvent} />);
      const card = container.firstChild;
      expect(card).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<EventCard event={mockEvent} className="custom-class" />);
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });
  });
});
