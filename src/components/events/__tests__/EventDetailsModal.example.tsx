/**
 * EventDetailsModal Example
 * 
 * This file demonstrates how to use the EventDetailsModal component
 * with various configurations and states.
 */

import { useState } from 'react';
import EventDetailsModal from '../EventDetailsModal';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/api/types';

// Example event data
const exampleEvent: Event = {
  id: '1',
  title: 'Advanced React Patterns Workshop',
  description: `Join us for an in-depth workshop on advanced React patterns! 

This comprehensive workshop will cover:
- Custom Hooks and Hook Patterns
- Context API and State Management
- Performance Optimization Techniques
- Server Components and Suspense
- Testing Strategies

Perfect for developers who want to take their React skills to the next level. Bring your laptop and be ready to code along!`,
  type: 'WORKSHOP',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours duration
  location: 'Google Meet',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  imageUrl: null,
  maxSeats: 100,
  status: 'UPCOMING',
  creatorId: 'creator-1',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  updatedAt: new Date().toISOString(),
  _count: {
    attendees: 75
  },
  creator: {
    id: 'creator-1',
    name: 'Sarah Johnson',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  }
};

// Example: Basic Usage
export function BasicExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Event Details
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

// Example: With Registration
export function WithRegistrationExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (eventId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRegistered(true);
    setIsLoading(false);
    console.log('Registered for event:', eventId);
  };

  const handleUnregister = async (eventId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRegistered(false);
    setIsLoading(false);
    console.log('Unregistered from event:', eventId);
  };

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Event with Registration
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        isRegistered={isRegistered}
        isLoading={isLoading}
      />
    </div>
  );
}

// Example: With Calendar Export
export function WithCalendarExportExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCalendarExport = (event: Event) => {
    console.log('Exporting to calendar:', event.title);
    // Implement calendar export logic
  };

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Event with Calendar Export
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCalendarExport={handleCalendarExport}
      />
    </div>
  );
}

// Example: Full Event (Almost Full)
export function AlmostFullEventExample() {
  const [isOpen, setIsOpen] = useState(false);

  const almostFullEvent: Event = {
    ...exampleEvent,
    _count: {
      attendees: 85 // 85% full
    }
  };

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Almost Full Event
      </Button>

      <EventDetailsModal
        event={almostFullEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

// Example: Full Event
export function FullEventExample() {
  const [isOpen, setIsOpen] = useState(false);

  const fullEvent: Event = {
    ...exampleEvent,
    _count: {
      attendees: 100 // 100% full
    }
  };

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Full Event
      </Button>

      <EventDetailsModal
        event={fullEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRegister={(id) => console.log('Register:', id)}
      />
    </div>
  );
}

// Example: Starting Soon Event
export function StartingSoonEventExample() {
  const [isOpen, setIsOpen] = useState(false);

  const startingSoonEvent: Event = {
    ...exampleEvent,
    date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    endDate: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString()
  };

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Starting Soon Event
      </Button>

      <EventDetailsModal
        event={startingSoonEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

// Example: Different Event Types
export function DifferentEventTypesExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event>(exampleEvent);

  const hackathonEvent: Event = {
    ...exampleEvent,
    id: '2',
    title: '48-Hour Hackathon',
    type: 'HACKATHON',
    description: 'Build amazing projects in 48 hours!'
  };

  const webinarEvent: Event = {
    ...exampleEvent,
    id: '3',
    title: 'Web Development Trends 2024',
    type: 'WEBINAR',
    description: 'Learn about the latest trends in web development.'
  };

  return (
    <div className="p-8 space-y-4">
      <div className="flex gap-4">
        <Button onClick={() => { setSelectedEvent(exampleEvent); setIsOpen(true); }}>
          Workshop
        </Button>
        <Button onClick={() => { setSelectedEvent(hackathonEvent); setIsOpen(true); }}>
          Hackathon
        </Button>
        <Button onClick={() => { setSelectedEvent(webinarEvent); setIsOpen(true); }}>
          Webinar
        </Button>
      </div>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

// Example: All Features Combined
export function CompleteExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (eventId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRegistered(true);
    setIsLoading(false);
    alert(`Successfully registered for event ${eventId}!`);
  };

  const handleUnregister = async (eventId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRegistered(false);
    setIsLoading(false);
    alert(`Successfully unregistered from event ${eventId}!`);
  };

  const handleCalendarExport = (event: Event) => {
    alert(`Exporting "${event.title}" to calendar!`);
  };

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Complete Example
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        onCalendarExport={handleCalendarExport}
        isRegistered={isRegistered}
        isLoading={isLoading}
      />
    </div>
  );
}

// Example: Admin View with Attendee List
export function AdminViewExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Event as Admin (with Attendee List)
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userRole="ADMIN"
        onRegister={(id) => console.log('Register:', id)}
        onUnregister={(id) => console.log('Unregister:', id)}
        onCalendarExport={(event) => console.log('Export:', event.title)}
      />
    </div>
  );
}

// Example: Student View (No Attendee List)
export function StudentViewExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Event as Student (no Attendee List)
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userRole="STUDENT"
        onRegister={(id) => console.log('Register:', id)}
        onUnregister={(id) => console.log('Unregister:', id)}
        onCalendarExport={(event) => console.log('Export:', event.title)}
      />
    </div>
  );
}

// Example: Meeting Link Display (Registered User)
export function MeetingLinkExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Event with Meeting Link (Registered)
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isRegistered={true}
        onUnregister={(id) => console.log('Unregister:', id)}
        onCalendarExport={(event) => console.log('Export:', event.title)}
      />
    </div>
  );
}

// Example: No Meeting Link Display (Not Registered)
export function NoMeetingLinkExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>
        View Event without Meeting Link (Not Registered)
      </Button>

      <EventDetailsModal
        event={exampleEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isRegistered={false}
        onRegister={(id) => console.log('Register:', id)}
        onCalendarExport={(event) => console.log('Export:', event.title)}
      />
    </div>
  );
}
