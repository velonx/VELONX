import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegistrationConfirmDialog from '../RegistrationConfirmDialog';
import { Event } from '@/lib/api/types';

// Mock event data
const mockEvent: Event = {
  id: '1',
  title: 'Web Development Workshop',
  description: 'Learn modern web development with React and Next.js',
  type: 'WORKSHOP',
  date: new Date('2024-12-25T14:00:00').toISOString(),
  endDate: new Date('2024-12-25T16:00:00').toISOString(),
  location: 'Google Meet',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  imageUrl: null,
  maxSeats: 50,
  status: 'UPCOMING',
  creatorId: 'creator-1',
  createdAt: new Date('2024-12-01').toISOString(),
  updatedAt: new Date('2024-12-01').toISOString(),
  _count: {
    attendees: 30
  }
};

describe('RegistrationConfirmDialog', () => {
  it('renders nothing when event is null', () => {
    const { container } = render(
      <RegistrationConfirmDialog
        event={null}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog with event details when open', () => {
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Confirm Registration' })).toBeInTheDocument();
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByText(/Learn modern web development/)).toBeInTheDocument();
  });

  it('displays event type badge', () => {
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
  });

  it('displays formatted date and time', () => {
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('displays platform information', () => {
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Google Meet')).toBeInTheDocument();
  });

  it('displays commitment message', () => {
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Please Confirm Your Commitment')).toBeInTheDocument();
    expect(screen.getByText(/By registering, you're committing to attend/)).toBeInTheDocument();
  });

  it('shows spots left warning when less than 5 spots remain', () => {
    const eventWithFewSpots = {
      ...mockEvent,
      _count: { attendees: 47 } // 3 spots left
    };

    render(
      <RegistrationConfirmDialog
        event={eventWithFewSpots}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/Only 3 spots left!/)).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Confirm Registration button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm Registration/i });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows loading state when isLoading is true', () => {
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Registering...')).toBeInTheDocument();
    
    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Registering...');
    
    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it('displays duration when endDate is provided', () => {
    render(
      <RegistrationConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Duration should be 2 hours
    expect(screen.getByText(/\(2h\)/)).toBeInTheDocument();
  });

  it('handles event without endDate', () => {
    const eventWithoutEndDate = {
      ...mockEvent,
      endDate: null
    };

    render(
      <RegistrationConfirmDialog
        event={eventWithoutEndDate}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Should still render without errors
    expect(screen.getByRole('heading', { name: 'Confirm Registration' })).toBeInTheDocument();
  });

  it('handles different event types correctly', () => {
    const hackathonEvent = {
      ...mockEvent,
      type: 'HACKATHON' as const
    };

    const { rerender } = render(
      <RegistrationConfirmDialog
        event={hackathonEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('HACKATHON')).toBeInTheDocument();

    const webinarEvent = {
      ...mockEvent,
      type: 'WEBINAR' as const
    };

    rerender(
      <RegistrationConfirmDialog
        event={webinarEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('WEBINAR')).toBeInTheDocument();
  });

  it('handles different platform types', () => {
    const zoomEvent = {
      ...mockEvent,
      location: 'Zoom Meeting'
    };

    const { rerender } = render(
      <RegistrationConfirmDialog
        event={zoomEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Zoom')).toBeInTheDocument();

    const teamsEvent = {
      ...mockEvent,
      location: 'Microsoft Teams'
    };

    rerender(
      <RegistrationConfirmDialog
        event={teamsEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Microsoft Teams')).toBeInTheDocument();

    const physicalEvent = {
      ...mockEvent,
      location: 'Conference Room A'
    };

    rerender(
      <RegistrationConfirmDialog
        event={physicalEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
  });

  it('handles event without location', () => {
    const eventWithoutLocation = {
      ...mockEvent,
      location: null
    };

    render(
      <RegistrationConfirmDialog
        event={eventWithoutLocation}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Should not display platform section
    expect(screen.queryByText('Platform')).not.toBeInTheDocument();
  });
});
