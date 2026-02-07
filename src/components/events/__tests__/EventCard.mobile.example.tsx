/**
 * Mobile Example for EventCard
 * 
 * This file demonstrates the mobile-optimized EventCard component
 * with various states and configurations for manual testing.
 * 
 * To test:
 * 1. Import this in a page component
 * 2. View on mobile device or use browser dev tools
 * 3. Test touch interactions
 * 4. Verify button sizes (should be at least 44px)
 */

import EventCard from '../EventCard';
import { Event } from '@/lib/api/types';

// Example event with image
const eventWithImage: Event = {
  id: '1',
  title: 'Advanced React Patterns Workshop',
  description: 'Deep dive into advanced React patterns including hooks, context, and performance optimization techniques.',
  type: 'WORKSHOP',
  date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
  location: 'Google Meet',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  maxSeats: 50,
  status: 'UPCOMING',
  creatorId: 'creator-1',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  _count: { attendees: 25 },
  creator: {
    id: 'creator-1',
    name: 'Sarah Johnson',
    image: null
  }
};

// Almost full event
const almostFullEvent: Event = {
  ...eventWithImage,
  id: '2',
  title: 'Mobile App Development Bootcamp',
  _count: { attendees: 42 }, // 84% full
};

// Starting soon event
const startingSoonEvent: Event = {
  ...eventWithImage,
  id: '3',
  title: 'Web Performance Optimization',
  date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
  endDate: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
};

// Full event
const fullEvent: Event = {
  ...eventWithImage,
  id: '4',
  title: 'TypeScript Masterclass',
  _count: { attendees: 50 },
};

// New event
const newEvent: Event = {
  ...eventWithImage,
  id: '5',
  title: 'GraphQL API Design',
  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
};

// Event without image
const eventWithoutImage: Event = {
  ...eventWithImage,
  id: '6',
  title: 'Docker & Kubernetes Workshop',
  imageUrl: null,
};

// Physical location event
const physicalEvent: Event = {
  ...eventWithImage,
  id: '7',
  title: 'Networking Meetup',
  type: 'HACKATHON',
  location: 'Tech Hub, Building A, Room 301',
  imageUrl: null,
};

export function MobileEventCardExamples() {
  const handleViewDetails = (event: Event) => {
    console.log('View details:', event.title);
  };

  const handleRegister = (eventId: string) => {
    console.log('Register for event:', eventId);
  };

  const handleUnregister = (eventId: string) => {
    console.log('Unregister from event:', eventId);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-4 space-y-6">
      <h1 className="text-white text-2xl font-bold mb-4">
        EventCard Mobile Examples
      </h1>
      
      <div className="space-y-4">
        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            Standard Event with Image
          </h2>
          <EventCard
            event={eventWithImage}
            onViewDetails={handleViewDetails}
            onRegister={handleRegister}
            isRegistered={false}
          />
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            Almost Full Event
          </h2>
          <EventCard
            event={almostFullEvent}
            onViewDetails={handleViewDetails}
            onRegister={handleRegister}
            isRegistered={false}
          />
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            Starting Soon Event
          </h2>
          <EventCard
            event={startingSoonEvent}
            onViewDetails={handleViewDetails}
            onRegister={handleRegister}
            isRegistered={false}
          />
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            Full Event (Disabled)
          </h2>
          <EventCard
            event={fullEvent}
            onViewDetails={handleViewDetails}
            onRegister={handleRegister}
            isRegistered={false}
          />
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            New Event
          </h2>
          <EventCard
            event={newEvent}
            onViewDetails={handleViewDetails}
            onRegister={handleRegister}
            isRegistered={false}
          />
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            Registered Event
          </h2>
          <EventCard
            event={eventWithImage}
            onViewDetails={handleViewDetails}
            onUnregister={handleUnregister}
            isRegistered={true}
          />
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            Event Without Image
          </h2>
          <EventCard
            event={eventWithoutImage}
            onViewDetails={handleViewDetails}
            onRegister={handleRegister}
            isRegistered={false}
          />
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-2">
            Physical Location Event
          </h2>
          <EventCard
            event={physicalEvent}
            onViewDetails={handleViewDetails}
            onRegister={handleRegister}
            isRegistered={false}
          />
        </section>
      </div>

      {/* Touch Target Testing Guide */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg">
        <h2 className="text-white text-lg font-semibold mb-2">
          Mobile Testing Checklist
        </h2>
        <ul className="text-gray-300 text-sm space-y-2">
          <li>✓ Primary buttons are 44px height on mobile</li>
          <li>✓ Touch targets have active states (scale down on press)</li>
          <li>✓ Images load with lazy loading and optimization</li>
          <li>✓ Text is readable at mobile sizes</li>
          <li>✓ Spacing is appropriate for small screens</li>
          <li>✓ All interactive elements are easily tappable</li>
          <li>✓ No accidental double-tap zoom (touch-manipulation)</li>
        </ul>
      </div>

      {/* Screen Size Indicator */}
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-mono">
        <div className="sm:hidden">Mobile (&lt; 640px)</div>
        <div className="hidden sm:block">Desktop (≥ 640px)</div>
      </div>
    </div>
  );
}

export default MobileEventCardExamples;
