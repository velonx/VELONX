import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventDetailsModal from '../EventDetailsModal';
import { Event } from '@/lib/api/types';
import { eventsApi } from '@/lib/api/client';

// Mock the eventsApi
vi.mock('@/lib/api/client', () => ({
  eventsApi: {
    getAttendees: vi.fn()
  }
}));

describe('EventDetailsModal', () => {
  const mockEvent: Event = {
    id: '1',
    title: 'React Workshop',
    description: 'Learn React fundamentals and advanced patterns. This workshop covers hooks, context, and performance optimization.',
    type: 'WORKSHOP',
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
    endDate: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(), // 2 hours duration
    location: 'Google Meet',
    meetingLink: null,
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

  const mockAttendees = [
    {
      id: 'att-1',
      eventId: '1',
      userId: 'user-1',
      status: 'REGISTERED',
      createdAt: new Date().toISOString(),
      user: {
        id: 'user-1',
        name: 'Alice Smith',
        email: 'alice@example.com',
        image: null,
        createdAt: new Date().toISOString()
      }
    },
    {
      id: 'att-2',
      eventId: '1',
      userId: 'user-2',
      status: 'REGISTERED',
      createdAt: new Date().toISOString(),
      user: {
        id: 'user-2',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        image: null,
        createdAt: new Date().toISOString()
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={false}
          onClose={vi.fn()}
        />
      );
      expect(screen.queryByText('React Workshop')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    it('should not render when event is null', () => {
      render(
        <EventDetailsModal
          event={null}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.queryByText('React Workshop')).not.toBeInTheDocument();
    });
  });

  describe('Event Header', () => {
    it('should display event title', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    it('should display event type badge', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
    });

    it('should display event status', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('UPCOMING')).toBeInTheDocument();
    });

    it('should display "New" badge for recent events', () => {
      const newEvent = {
        ...mockEvent,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };
      render(
        <EventDetailsModal
          event={newEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('Event Metadata', () => {
    it('should display formatted date', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      // Check for "Date" label
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('should display formatted time', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      // Check for "Time" label
      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('should display duration', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('2 hours')).toBeInTheDocument();
    });

    it('should display platform information', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('Platform')).toBeInTheDocument();
      expect(screen.getByText('Google Meet')).toBeInTheDocument();
    });

    it('should display attendee information', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('Attendees')).toBeInTheDocument();
      expect(screen.getByText('25 / 50 registered')).toBeInTheDocument();
      expect(screen.getByText('25 spots left')).toBeInTheDocument();
    });
  });

  describe('Event Description', () => {
    it('should display full description', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('About This Event')).toBeInTheDocument();
      expect(screen.getByText(/Learn React fundamentals/)).toBeInTheDocument();
    });
  });

  describe('Creator Information', () => {
    it('should display creator section', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getAllByText('Event Organizer').length).toBeGreaterThan(0);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display "Anonymous" when creator name is null', () => {
      const eventWithoutCreatorName = {
        ...mockEvent,
        creator: { ...mockEvent.creator!, name: null }
      };
      render(
        <EventDetailsModal
          event={eventWithoutCreatorName}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should display Register button when not registered', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          onRegister={vi.fn()}
          isRegistered={false}
        />
      );
      expect(screen.getByText('Register Now')).toBeInTheDocument();
    });

    it('should call onRegister when Register button clicked', () => {
      const onRegister = vi.fn();
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          onRegister={onRegister}
          isRegistered={false}
        />
      );
      fireEvent.click(screen.getByText('Register Now'));
      expect(onRegister).toHaveBeenCalledWith('1');
    });

    it('should display Registered button when user is registered', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );
      expect(screen.getByText('Registered')).toBeInTheDocument();
    });

    it('should call onUnregister when Registered button clicked', () => {
      const onUnregister = vi.fn();
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          onUnregister={onUnregister}
          isRegistered={true}
        />
      );
      fireEvent.click(screen.getByText('Registered'));
      expect(onUnregister).toHaveBeenCalledWith('1');
    });

    it('should disable Register button when event is full', () => {
      const fullEvent = {
        ...mockEvent,
        _count: { attendees: 50 }
      };
      render(
        <EventDetailsModal
          event={fullEvent}
          isOpen={true}
          onClose={vi.fn()}
          onRegister={vi.fn()}
          isRegistered={false}
        />
      );
      const button = screen.getByText('Event Full');
      expect(button).toBeDisabled();
    });

    it('should display loading state', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          onRegister={vi.fn()}
          isLoading={true}
        />
      );
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should display calendar export button', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          onCalendarExport={vi.fn()}
        />
      );
      expect(screen.getByText('Add to Calendar')).toBeInTheDocument();
    });

    it('should render calendar export menu', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
        />
      );
      // The CalendarExportMenu component should be rendered
      expect(screen.getByText('Add to Calendar')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={onClose}
        />
      );
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Attendee List (Admin Only)', () => {
    it('should not display attendee list for non-admin users', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="STUDENT"
        />
      );
      expect(screen.queryByText('Registered Attendees')).not.toBeInTheDocument();
    });

    it('should fetch and display attendees for admin users', async () => {
      vi.mocked(eventsApi.getAttendees).mockResolvedValue({
        success: true,
        data: {
          event: {
            id: '1',
            title: 'React Workshop',
            date: mockEvent.date,
            maxSeats: 50
          },
          attendees: mockAttendees,
          totalAttendees: 2
        }
      });

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      // Should show loading state initially
      expect(screen.getByText('Loading attendees...')).toBeInTheDocument();

      // Wait for attendees to load
      await waitFor(() => {
        expect(screen.getByText('Registered Attendees')).toBeInTheDocument();
      });

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(eventsApi.getAttendees).toHaveBeenCalledWith('1');
    });

    it('should display attendee count badge', async () => {
      vi.mocked(eventsApi.getAttendees).mockResolvedValue({
        success: true,
        data: {
          event: {
            id: '1',
            title: 'React Workshop',
            date: mockEvent.date,
            maxSeats: 50
          },
          attendees: mockAttendees,
          totalAttendees: 2
        }
      });

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display "No attendees registered yet" when list is empty', async () => {
      vi.mocked(eventsApi.getAttendees).mockResolvedValue({
        success: true,
        data: {
          event: {
            id: '1',
            title: 'React Workshop',
            date: mockEvent.date,
            maxSeats: 50
          },
          attendees: [],
          totalAttendees: 0
        }
      });

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No attendees registered yet')).toBeInTheDocument();
      });
    });

    it('should display error message when fetch fails', async () => {
      vi.mocked(eventsApi.getAttendees).mockRejectedValue(new Error('Network error'));

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load attendees')).toBeInTheDocument();
      });
    });

    it('should show "See All" button when attendees exceed initial display limit', async () => {
      const manyAttendees = Array.from({ length: 15 }, (_, i) => ({
        id: `att-${i}`,
        eventId: '1',
        userId: `user-${i}`,
        status: 'REGISTERED',
        createdAt: new Date().toISOString(),
        user: {
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          image: null,
          createdAt: new Date().toISOString()
        }
      }));

      vi.mocked(eventsApi.getAttendees).mockResolvedValue({
        success: true,
        data: {
          event: {
            id: '1',
            title: 'React Workshop',
            date: mockEvent.date,
            maxSeats: 50
          },
          attendees: manyAttendees,
          totalAttendees: 15
        }
      });

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('See All 15 Attendees')).toBeInTheDocument();
      });
    });

    it('should expand attendee list when "See All" button clicked', async () => {
      const manyAttendees = Array.from({ length: 15 }, (_, i) => ({
        id: `att-${i}`,
        eventId: '1',
        userId: `user-${i}`,
        status: 'REGISTERED',
        createdAt: new Date().toISOString(),
        user: {
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          image: null,
          createdAt: new Date().toISOString()
        }
      }));

      vi.mocked(eventsApi.getAttendees).mockResolvedValue({
        success: true,
        data: {
          event: {
            id: '1',
            title: 'React Workshop',
            date: mockEvent.date,
            maxSeats: 50
          },
          attendees: manyAttendees,
          totalAttendees: 15
        }
      });

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('See All 15 Attendees')).toBeInTheDocument();
      });

      // Initially should only show 12 attendees
      expect(screen.queryByText('User 14')).not.toBeInTheDocument();

      // Click "See All" button
      fireEvent.click(screen.getByText('See All 15 Attendees'));

      // Now should show all attendees
      await waitFor(() => {
        expect(screen.getByText('User 14')).toBeInTheDocument();
      });

      // Button should change to "Show Less"
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });

    it('should collapse attendee list when "Show Less" button clicked', async () => {
      const manyAttendees = Array.from({ length: 15 }, (_, i) => ({
        id: `att-${i}`,
        eventId: '1',
        userId: `user-${i}`,
        status: 'REGISTERED',
        createdAt: new Date().toISOString(),
        user: {
          id: `user-${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          image: null,
          createdAt: new Date().toISOString()
        }
      }));

      vi.mocked(eventsApi.getAttendees).mockResolvedValue({
        success: true,
        data: {
          event: {
            id: '1',
            title: 'React Workshop',
            date: mockEvent.date,
            maxSeats: 50
          },
          attendees: manyAttendees,
          totalAttendees: 15
        }
      });

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('See All 15 Attendees')).toBeInTheDocument();
      });

      // Expand the list
      fireEvent.click(screen.getByText('See All 15 Attendees'));

      await waitFor(() => {
        expect(screen.getByText('Show Less')).toBeInTheDocument();
      });

      // Collapse the list
      fireEvent.click(screen.getByText('Show Less'));

      // Should hide attendees beyond initial display limit
      await waitFor(() => {
        expect(screen.queryByText('User 14')).not.toBeInTheDocument();
      });
    });

    it('should not show "See All" button when attendees are within initial display limit', async () => {
      vi.mocked(eventsApi.getAttendees).mockResolvedValue({
        success: true,
        data: {
          event: {
            id: '1',
            title: 'React Workshop',
            date: mockEvent.date,
            maxSeats: 50
          },
          attendees: mockAttendees,
          totalAttendees: 2
        }
      });

      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          userRole="ADMIN"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      expect(screen.queryByText(/See All/)).not.toBeInTheDocument();
    });
  });

  describe('Meeting Link Display', () => {
    const eventWithMeetingLink: Event = {
      ...mockEvent,
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    };

    it('should not display meeting link when user is not registered', () => {
      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={false}
        />
      );
      expect(screen.queryByText('Meeting Link')).not.toBeInTheDocument();
      expect(screen.queryByText('https://meet.google.com/abc-defg-hij')).not.toBeInTheDocument();
    });

    it('should not display meeting link section when event has no meeting link', () => {
      render(
        <EventDetailsModal
          event={mockEvent}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );
      expect(screen.queryByText('Meeting Link')).not.toBeInTheDocument();
    });

    it('should display meeting link when user is registered and event has meeting link', () => {
      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );
      expect(screen.getByText('Meeting Link')).toBeInTheDocument();
      expect(screen.getByText('https://meet.google.com/abc-defg-hij')).toBeInTheDocument();
    });

    it('should display registration confirmation message', () => {
      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );
      expect(screen.getByText("You're registered! Use the link below to join the event.")).toBeInTheDocument();
    });

    it('should display Copy Link button', () => {
      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });

    it('should display Join Meeting button', () => {
      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );
      expect(screen.getByText('Join Meeting')).toBeInTheDocument();
    });

    it('should copy meeting link to clipboard when Copy Link button clicked', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      });

      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );

      const copyButton = screen.getByText('Copy Link');
      fireEvent.click(copyButton);

      expect(writeTextMock).toHaveBeenCalledWith('https://meet.google.com/abc-defg-hij');
    });

    it('should show toast notification after copying link', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      });

      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );

      const copyButton = screen.getByText('Copy Link');
      fireEvent.click(copyButton);

      // Wait for toast to appear
      await waitFor(() => {
        const toasts = screen.getAllByText('Meeting link copied to clipboard!');
        expect(toasts.length).toBeGreaterThan(0);
      });
    });

    it('should open meeting link in new tab when Join Meeting button clicked', () => {
      const windowOpenMock = vi.fn();
      window.open = windowOpenMock;

      render(
        <EventDetailsModal
          event={eventWithMeetingLink}
          isOpen={true}
          onClose={vi.fn()}
          isRegistered={true}
        />
      );

      const joinButton = screen.getByText('Join Meeting');
      fireEvent.click(joinButton);

      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://meet.google.com/abc-defg-hij',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });
});
