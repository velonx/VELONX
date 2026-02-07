/**
 * EventDetailsModal Mobile Example
 * 
 * This example demonstrates the mobile-optimized EventDetailsModal component.
 * 
 * Mobile Optimizations:
 * - Full-screen modal on mobile devices (< 640px)
 * - Responsive text sizing and spacing
 * - Larger touch targets (minimum 44x44px)
 * - Smooth momentum scrolling on iOS
 * - Optimized content layout for small screens
 * - Stacked button layout on mobile
 * 
 * To test:
 * 1. Open in browser and resize to mobile viewport (< 640px)
 * 2. Test on actual mobile devices (iOS Safari, Chrome Mobile)
 * 3. Verify touch targets are easily tappable
 * 4. Verify scrolling is smooth and natural
 * 5. Verify content doesn't overflow or require horizontal scrolling
 */

import React, { useState } from 'react';
import EventDetailsModal from '../EventDetailsModal';
import { Event } from '@/lib/api/types';
import { Button } from '@/components/ui/button';

export default function EventDetailsModalMobileExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const mockEvent: Event = {
    id: '1',
    title: 'Mobile-First React Workshop: Building Responsive Applications',
    description: `Join us for an intensive workshop on building mobile-first React applications.

Topics covered:
• Responsive design principles
• Mobile-first CSS strategies
• Touch event handling
• Performance optimization for mobile
• Progressive Web Apps (PWA)
• Testing on real devices

This workshop is perfect for developers who want to create exceptional mobile experiences. We'll cover both theory and hands-on practice, with real-world examples and best practices.

Bring your laptop and be ready to code! We'll provide all the necessary resources and starter code.`,
    type: 'WORKSHOP',
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
    location: 'Google Meet',
    meetingLink: isRegistered ? 'https://meet.google.com/abc-defg-hij' : null,
    imageUrl: null,
    maxSeats: 50,
    status: 'UPCOMING',
    creatorId: 'creator-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      attendees: 42
    },
    creator: {
      id: 'creator-1',
      name: 'Sarah Johnson',
      image: null
    }
  };

  const handleRegister = (eventId: string) => {
    console.log('Registering for event:', eventId);
    setIsRegistered(true);
  };

  const handleUnregister = (eventId: string) => {
    console.log('Unregistering from event:', eventId);
    setIsRegistered(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 rounded-xl p-6 sm:p-8 border border-white/10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            EventDetailsModal Mobile Example
          </h1>
          
          <div className="space-y-4 text-gray-300 mb-6">
            <p>
              This example demonstrates the mobile-optimized EventDetailsModal component.
            </p>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-400 mb-2">
                Testing Instructions:
              </h2>
              <ul className="space-y-2 text-sm">
                <li>• Resize browser to mobile viewport (&lt; 640px)</li>
                <li>• Test on actual mobile devices (iOS Safari, Chrome Mobile)</li>
                <li>• Verify modal is full-screen on mobile</li>
                <li>• Check that all touch targets are easily tappable (44x44px minimum)</li>
                <li>• Verify smooth scrolling (especially on iOS)</li>
                <li>• Ensure no horizontal scrolling is required</li>
                <li>• Test button interactions and feedback</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-400 mb-2">
                Mobile Optimizations:
              </h2>
              <ul className="space-y-2 text-sm">
                <li>✓ Full-screen modal on mobile (no margins)</li>
                <li>✓ Responsive text sizing (smaller on mobile)</li>
                <li>✓ Responsive spacing (tighter on mobile)</li>
                <li>✓ Larger touch targets (44x44px minimum)</li>
                <li>✓ Smooth momentum scrolling on iOS</li>
                <li>✓ Stacked button layout on mobile</li>
                <li>✓ Optimized grid layouts (fewer columns on mobile)</li>
                <li>✓ Proper text wrapping and truncation</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setIsOpen(true)}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              Open Modal (Not Registered)
            </Button>
            
            <Button
              onClick={() => {
                setIsRegistered(true);
                setIsOpen(true);
              }}
              className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-600/20"
            >
              Open Modal (Registered)
            </Button>
          </div>

          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <h2 className="text-lg font-semibold text-orange-400 mb-2">
              Current State:
            </h2>
            <p className="text-sm text-gray-300">
              Registration Status: <span className="font-semibold text-white">
                {isRegistered ? 'Registered ✓' : 'Not Registered'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <EventDetailsModal
        event={mockEvent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        isRegistered={isRegistered}
        userRole="STUDENT"
      />
    </div>
  );
}
