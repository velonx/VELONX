/**
 * EventCardSkeleton Usage Examples
 * Feature: events-page-ui-improvements
 * 
 * Demonstrates how to use the EventCardSkeleton component in different scenarios.
 */

'use client';

import React from 'react';
import { EventCardSkeleton, EventCardSkeletonLoader } from '../EventCardSkeleton';

/**
 * Example 1: Single Skeleton Card
 * Use when loading a single event detail
 */
export function SingleSkeletonExample() {
  return (
    <div className="p-6 bg-[#0a0f1e] min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">Single Event Loading</h2>
      <div className="max-w-md">
        <EventCardSkeleton />
      </div>
    </div>
  );
}

/**
 * Example 2: Grid of Skeleton Cards (Default)
 * Use when loading the events page with default count
 */
export function GridSkeletonDefaultExample() {
  return (
    <div className="p-6 bg-[#0a0f1e] min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">Loading Events (Default)</h2>
      <EventCardSkeletonLoader />
    </div>
  );
}

/**
 * Example 3: Grid with Custom Count
 * Use when you know how many events to display
 */
export function GridSkeletonCustomCountExample() {
  return (
    <div className="p-6 bg-[#0a0f1e] min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">Loading 9 Events</h2>
      <EventCardSkeletonLoader count={9} />
    </div>
  );
}

/**
 * Example 4: With Custom Styling
 * Use when you need to apply custom styles
 */
export function CustomStyledSkeletonExample() {
  return (
    <div className="p-6 bg-[#0a0f1e] min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">Custom Styled Loading</h2>
      <EventCardSkeletonLoader 
        count={3} 
        className="max-w-6xl mx-auto" 
      />
    </div>
  );
}

/**
 * Example 5: Conditional Loading State
 * Use in actual implementation with loading state
 */
export function ConditionalLoadingExample() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
      setEvents([
        { id: '1', title: 'Event 1' },
        { id: '2', title: 'Event 2' },
        { id: '3', title: 'Event 3' },
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 bg-[#0a0f1e] min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">
        Conditional Loading State
      </h2>
      
      {isLoading ? (
        <EventCardSkeletonLoader count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="text-white p-4 bg-gray-800 rounded">
              {event.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Integration with Events Page
 * Typical usage in the events page
 */
export function EventsPageIntegrationExample() {
  const isLoading = true; // This would come from your data fetching hook
  const events = []; // This would come from your API

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-white text-4xl font-bold mb-2">Upcoming Events</h1>
        <p className="text-gray-400">Discover and register for exciting events</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && events.length === 0 ? (
          // Show skeleton loader on initial load
          <EventCardSkeletonLoader count={6} />
        ) : (
          // Show actual events
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* EventCard components would go here */}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 7: Responsive Grid
 * Demonstrates responsive behavior
 */
export function ResponsiveGridExample() {
  return (
    <div className="p-6 bg-[#0a0f1e] min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">
        Responsive Grid (Resize to see changes)
      </h2>
      <p className="text-gray-400 mb-6">
        1 column on mobile, 2 on tablet, 3 on desktop
      </p>
      <EventCardSkeletonLoader count={6} />
    </div>
  );
}

/**
 * Example 8: Accessibility Features
 * Shows how the component handles accessibility
 */
export function AccessibilityExample() {
  return (
    <div className="p-6 bg-[#0a0f1e] min-h-screen">
      <h2 className="text-white text-2xl font-bold mb-6">
        Accessibility Features
      </h2>
      <div className="text-gray-400 mb-6 space-y-2">
        <p>✓ aria-busy="true" on container</p>
        <p>✓ aria-live="polite" for screen readers</p>
        <p>✓ aria-hidden="true" on skeleton elements</p>
        <p>✓ Screen reader text: "Loading events, please wait..."</p>
        <p>✓ Respects prefers-reduced-motion</p>
      </div>
      <EventCardSkeletonLoader count={3} />
    </div>
  );
}

// Export all examples for Storybook or documentation
export default {
  SingleSkeletonExample,
  GridSkeletonDefaultExample,
  GridSkeletonCustomCountExample,
  CustomStyledSkeletonExample,
  ConditionalLoadingExample,
  EventsPageIntegrationExample,
  ResponsiveGridExample,
  AccessibilityExample,
};
