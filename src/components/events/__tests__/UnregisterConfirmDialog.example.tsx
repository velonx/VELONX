import { useState } from 'react';
import UnregisterConfirmDialog from '../UnregisterConfirmDialog';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/api/types';

const mockEvent: Event = {
  id: 'event-1',
  title: 'Web Development Workshop',
  description: 'Learn modern web development with React and Next.js. This comprehensive workshop covers the latest best practices and techniques.',
  type: 'WORKSHOP',
  date: new Date('2024-03-15T14:00:00Z'),
  endDate: new Date('2024-03-15T16:00:00Z'),
  location: 'Google Meet',
  maxSeats: 50,
  status: 'UPCOMING',
  createdAt: new Date('2024-03-01T10:00:00Z'),
  updatedAt: new Date('2024-03-01T10:00:00Z'),
  creatorId: 'user-1',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  _count: {
    attendees: 35
  }
};

const hackathonEvent: Event = {
  ...mockEvent,
  id: 'event-2',
  title: '24-Hour Coding Hackathon',
  description: 'Join us for an intense 24-hour coding challenge. Build innovative solutions and compete for prizes!',
  type: 'HACKATHON',
  date: new Date('2024-03-20T09:00:00Z'),
  endDate: new Date('2024-03-21T09:00:00Z'),
  location: 'Discord',
  maxSeats: 100,
  _count: {
    attendees: 85
  }
};

const webinarEvent: Event = {
  ...mockEvent,
  id: 'event-3',
  title: 'Career Development Webinar',
  description: 'Learn how to advance your tech career with insights from industry experts.',
  type: 'WEBINAR',
  date: new Date('2024-03-18T18:00:00Z'),
  endDate: new Date('2024-03-18T19:30:00Z'),
  location: 'Zoom Meeting',
  maxSeats: 200,
  _count: {
    attendees: 120
  }
};

const physicalEvent: Event = {
  ...mockEvent,
  id: 'event-4',
  title: 'Networking Meetup',
  description: 'Connect with fellow developers and tech enthusiasts in person.',
  type: 'NETWORKING',
  date: new Date('2024-03-22T17:00:00Z'),
  endDate: new Date('2024-03-22T20:00:00Z'),
  location: 'Tech Hub, 123 Main Street, San Francisco',
  maxSeats: 30,
  _count: {
    attendees: 28
  }
};

export default function UnregisterConfirmDialogExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event>(mockEvent);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      alert(`Successfully unregistered from "${selectedEvent.title}"`);
    }, 2000);
  };

  const openDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          UnregisterConfirmDialog Examples
        </h1>
        <p className="text-gray-600 mb-8">
          Interactive examples of the unregister confirmation dialog component
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Workshop Event */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Workshop Event</h3>
            <p className="text-sm text-gray-600 mb-4">
              Standard workshop with Google Meet
            </p>
            <Button
              onClick={() => openDialog(mockEvent)}
              className="w-full"
            >
              Unregister from Workshop
            </Button>
          </div>

          {/* Hackathon Event */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Hackathon Event</h3>
            <p className="text-sm text-gray-600 mb-4">
              24-hour hackathon on Discord
            </p>
            <Button
              onClick={() => openDialog(hackathonEvent)}
              className="w-full"
            >
              Unregister from Hackathon
            </Button>
          </div>

          {/* Webinar Event */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Webinar Event</h3>
            <p className="text-sm text-gray-600 mb-4">
              Career development webinar on Zoom
            </p>
            <Button
              onClick={() => openDialog(webinarEvent)}
              className="w-full"
            >
              Unregister from Webinar
            </Button>
          </div>

          {/* Physical Event */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Physical Event</h3>
            <p className="text-sm text-gray-600 mb-4">
              In-person networking meetup
            </p>
            <Button
              onClick={() => openDialog(physicalEvent)}
              className="w-full"
            >
              Unregister from Meetup
            </Button>
          </div>
        </div>

        {/* Loading State Example */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-lg mb-2">Loading State</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click to see the loading state during unregistration
          </p>
          <Button
            onClick={() => {
              setSelectedEvent(mockEvent);
              setIsOpen(true);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 3000);
            }}
            className="w-full"
          >
            Show Loading State
          </Button>
        </div>
      </div>

      {/* Dialog Component */}
      <UnregisterConfirmDialog
        event={selectedEvent}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setIsLoading(false);
        }}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}
