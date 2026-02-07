import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnregisterConfirmDialog from '../UnregisterConfirmDialog';
import { Event } from '@/lib/api/types';

const mockEvent: Event = {
  id: 'event-1',
  title: 'Web Development Workshop',
  description: 'Learn modern web development with React and Next.js',
  type: 'WORKSHOP',
  date: '2024-03-15T14:00:00Z',
  endDate: '2024-03-15T16:00:00Z',
  location: 'Google Meet',
  maxSeats: 50,
  status: 'UPCOMING',
  createdAt: '2024-03-01T10:00:00Z',
  updatedAt: '2024-03-01T10:00:00Z',
  creatorId: 'user-1',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  imageUrl: null,
  _count: {
    attendees: 35
  }
};

describe('UnregisterConfirmDialog', () => {
  it('renders nothing when event is null', () => {
    const { container } = render(
      <UnregisterConfirmDialog
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
      <UnregisterConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Unregister from Event')).toBeInTheDocument();
    expect(screen.getByText('Web Development Workshop')).toBeInTheDocument();
    expect(screen.getByText(/Learn modern web development/)).toBeInTheDocument();
  });

  it('displays event type badge', () => {
    render(
      <UnregisterConfirmDialog
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
      <UnregisterConfirmDialog
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
      <UnregisterConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Google Meet')).toBeInTheDocument();
  });

  it('displays warning message about unregistering', () => {
    render(
      <UnregisterConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Please Confirm Unregistration')).toBeInTheDocument();
    expect(screen.getByText(/By unregistering, you will lose your spot/)).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    
    render(
      <UnregisterConfirmDialog
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

  it('calls onConfirm when Confirm button is clicked', () => {
    const onConfirm = vi.fn();
    
    render(
      <UnregisterConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirm Unregistration');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading', () => {
    render(
      <UnregisterConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Unregistering...');

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it('shows loading state with spinner', () => {
    render(
      <UnregisterConfirmDialog
        event={mockEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Unregistering...')).toBeInTheDocument();
  });

  it('displays duration when endDate is provided', () => {
    render(
      <UnregisterConfirmDialog
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
    const eventWithoutEndDate = { ...mockEvent, endDate: null };
    
    render(
      <UnregisterConfirmDialog
        event={eventWithoutEndDate}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Should not show duration
    expect(screen.queryByText(/\(2h\)/)).not.toBeInTheDocument();
  });

  it('handles different event types with correct styling', () => {
    const hackathonEvent = { ...mockEvent, type: 'HACKATHON' as const };
    
    const { rerender } = render(
      <UnregisterConfirmDialog
        event={hackathonEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('HACKATHON')).toBeInTheDocument();

    const webinarEvent = { ...mockEvent, type: 'WEBINAR' as const };
    rerender(
      <UnregisterConfirmDialog
        event={webinarEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('WEBINAR')).toBeInTheDocument();
  });

  it('handles different platform types', () => {
    const zoomEvent = { ...mockEvent, location: 'Zoom Meeting' };
    
    const { rerender } = render(
      <UnregisterConfirmDialog
        event={zoomEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Zoom')).toBeInTheDocument();

    const teamsEvent = { ...mockEvent, location: 'Microsoft Teams' };
    rerender(
      <UnregisterConfirmDialog
        event={teamsEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Microsoft Teams')).toBeInTheDocument();
  });

  it('handles physical location', () => {
    const physicalEvent = { ...mockEvent, location: 'Room 101, Building A' };
    
    render(
      <UnregisterConfirmDialog
        event={physicalEvent}
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Room 101, Building A')).toBeInTheDocument();
  });
});
