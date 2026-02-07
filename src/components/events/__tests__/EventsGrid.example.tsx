/**
 * EventsGrid Component Examples
 * Feature: events-page-ui-improvements
 * Task: 10. Update EventsGrid layout
 * 
 * This file demonstrates various usage patterns for the EventsGrid component.
 */

import React from 'react';
import EventsGrid from '../EventsGrid';
import { Event } from '@/lib/api/types';
import { Calendar } from 'lucide-react';

// Sample events data
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React and Next.js',
    date: '2024-12-01T14:00:00.000Z',
    endDate: '2024-12-01T16:00:00.000Z',
    type: 'WORKSHOP',
    status: 'UPCOMING',
    maxSeats: 50,
    location: 'Google Meet',
    imageUrl: null,
    createdAt: '2024-11-25T00:00:00.000Z',
    updatedAt: '2024-11-25T00:00:00.000Z',
    creatorId: 'user1',
    _count: { attendees: 10 },
  },
  {
    id: '2',
    title: 'Hackathon 2024',
    description: 'Build amazing projects in 48 hours',
    date: '2024-12-15T09:00:00.000Z',
    endDate: '2024-12-17T18:00:00.000Z',
    type: 'HACKATHON',
    status: 'UPCOMING',
    maxSeats: 100,
    location: 'Zoom',
    imageUrl: null,
    createdAt: '2024-11-20T00:00:00.000Z',
    updatedAt: '2024-11-20T00:00:00.000Z',
    creatorId: 'user1',
    _count: { attendees: 85 },
  },
  {
    id: '3',
    title: 'Tech Webinar',
    description: 'Connect with professionals in the tech industry',
    date: '2024-12-20T18:00:00.000Z',
    endDate: '2024-12-20T20:00:00.000Z',
    type: 'WEBINAR',
    status: 'UPCOMING',
    maxSeats: 30,
    location: 'Discord',
    imageUrl: null,
    createdAt: '2024-11-28T00:00:00.000Z',
    updatedAt: '2024-11-28T00:00:00.000Z',
    creatorId: 'user1',
    _count: { attendees: 20 },
  },
];

/**
 * Example 1: Basic Usage
 * Shows events in a responsive grid
 */
export function BasicExample() {
  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
      <EventsGrid
        events={sampleEvents}
        isLoading={false}
        onViewDetails={(event) => console.log('View details:', event.title)}
        onRegister={(eventId) => console.log('Register for:', eventId)}
      />
    </div>
  );
}

/**
 * Example 2: Loading State
 * Shows skeleton loaders while data is being fetched
 */
export function LoadingExample() {
  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Loading Events...</h2>
      <EventsGrid
        events={[]}
        isLoading={true}
        skeletonCount={6}
      />
    </div>
  );
}

/**
 * Example 3: Empty State
 * Shows custom empty state when no events are available
 */
export function EmptyStateExample() {
  const customEmptyState = (
    <div className="text-center py-20 text-gray-400">
      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p className="text-xl font-bold">No upcoming events</p>
      <p className="text-sm mt-2">Check back later for new events!</p>
      <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Create Event
      </button>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Events</h2>
      <EventsGrid
        events={[]}
        isLoading={false}
        emptyState={customEmptyState}
      />
    </div>
  );
}

/**
 * Example 4: With Registration Status
 * Shows events with registration status tracking
 */
export function WithRegistrationExample() {
  const [registeredEvents, setRegisteredEvents] = React.useState<Set<string>>(
    new Set(['1', '3'])
  );

  const handleRegister = (eventId: string) => {
    setRegisteredEvents((prev) => new Set([...prev, eventId]));
    console.log('Registered for event:', eventId);
  };

  const handleUnregister = (eventId: string) => {
    setRegisteredEvents((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
    console.log('Unregistered from event:', eventId);
  };

  const isRegistered = (eventId: string) => registeredEvents.has(eventId);

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">My Events</h2>
      <EventsGrid
        events={sampleEvents}
        isLoading={false}
        onViewDetails={(event) => console.log('View details:', event.title)}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        isRegistered={isRegistered}
      />
    </div>
  );
}

/**
 * Example 5: Custom Skeleton Count
 * Shows custom number of skeleton loaders
 */
export function CustomSkeletonExample() {
  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Loading 3 Events...</h2>
      <EventsGrid
        events={[]}
        isLoading={true}
        skeletonCount={3}
      />
    </div>
  );
}

/**
 * Example 6: Responsive Grid Demo
 * Shows how the grid adapts to different screen sizes
 */
export function ResponsiveGridExample() {
  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Responsive Grid</h2>
      <div className="mb-4 text-sm text-gray-600">
        <p>• Mobile (&lt;768px): 1 column</p>
        <p>• Tablet (768px-1024px): 2 columns</p>
        <p>• Desktop (&gt;1024px): 3 columns</p>
      </div>
      <EventsGrid
        events={sampleEvents}
        isLoading={false}
        onViewDetails={(event) => console.log('View details:', event.title)}
        onRegister={(eventId) => console.log('Register for:', eventId)}
      />
    </div>
  );
}

/**
 * Example 7: With Custom Classes
 * Shows how to apply custom styling
 */
export function CustomClassesExample() {
  return (
    <div className="p-8 bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-white">Dark Theme Events</h2>
      <EventsGrid
        events={sampleEvents}
        isLoading={false}
        className="custom-events-grid"
        onViewDetails={(event) => console.log('View details:', event.title)}
        onRegister={(eventId) => console.log('Register for:', eventId)}
      />
    </div>
  );
}

/**
 * Example 8: Large Dataset
 * Shows grid with many events to demonstrate stagger animation
 */
export function LargeDatasetExample() {
  const manyEvents = Array.from({ length: 12 }, (_, i) => ({
    ...sampleEvents[i % 3],
    id: `event-${i}`,
    title: `${sampleEvents[i % 3].title} ${i + 1}`,
  }));

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">All Events (12 items)</h2>
      <EventsGrid
        events={manyEvents}
        isLoading={false}
        onViewDetails={(event) => console.log('View details:', event.title)}
        onRegister={(eventId) => console.log('Register for:', eventId)}
      />
    </div>
  );
}

/**
 * Example 9: Integration with API
 * Shows realistic usage with API data fetching
 */
export function APIIntegrationExample() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(sampleEvents);
      setIsLoading(false);
    }, 2000);
  }, []);

  const emptyState = (
    <div className="text-center py-20 text-gray-400">
      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <p className="text-xl font-bold">No events found</p>
      <p className="text-sm mt-2">Try adjusting your filters</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Events from API</h2>
      <EventsGrid
        events={events}
        isLoading={isLoading}
        skeletonCount={6}
        emptyState={emptyState}
        onViewDetails={(event) => console.log('View details:', event.title)}
        onRegister={(eventId) => console.log('Register for:', eventId)}
      />
    </div>
  );
}

/**
 * Example 10: All Examples Combined
 * Shows all examples in a single view for testing
 */
export function AllExamples() {
  return (
    <div className="space-y-16">
      <BasicExample />
      <LoadingExample />
      <EmptyStateExample />
      <WithRegistrationExample />
      <CustomSkeletonExample />
      <ResponsiveGridExample />
      <CustomClassesExample />
      <LargeDatasetExample />
      <APIIntegrationExample />
    </div>
  );
}

export default AllExamples;
