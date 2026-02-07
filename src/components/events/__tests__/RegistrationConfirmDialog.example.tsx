"use client";

import { useState } from 'react';
import RegistrationConfirmDialog from '../RegistrationConfirmDialog';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/api/types';

/**
 * Example usage of RegistrationConfirmDialog component
 * 
 * This example demonstrates:
 * - Opening the confirmation dialog
 * - Handling registration confirmation
 * - Loading states during registration
 * - Different event types and platforms
 */

const exampleWorkshopEvent: Event = {
  id: '1',
  title: 'Advanced React Patterns Workshop',
  description: 'Deep dive into advanced React patterns including hooks, context, and performance optimization techniques.',
  type: 'WORKSHOP',
  date: new Date('2024-12-25T14:00:00').toISOString(),
  endDate: new Date('2024-12-25T17:00:00').toISOString(),
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

const exampleHackathonEvent: Event = {
  id: '2',
  title: '24-Hour AI Hackathon',
  description: 'Build innovative AI solutions in 24 hours. Team up with other developers and compete for prizes!',
  type: 'HACKATHON',
  date: new Date('2024-12-30T09:00:00').toISOString(),
  endDate: new Date('2024-12-31T09:00:00').toISOString(),
  location: 'Discord',
  meetingLink: 'https://discord.gg/hackathon',
  imageUrl: null,
  maxSeats: 100,
  status: 'UPCOMING',
  creatorId: 'creator-2',
  createdAt: new Date('2024-12-10').toISOString(),
  updatedAt: new Date('2024-12-10').toISOString(),
  _count: {
    attendees: 95 // Almost full
  }
};

const exampleWebinarEvent: Event = {
  id: '3',
  title: 'Introduction to Cloud Computing',
  description: 'Learn the fundamentals of cloud computing and how to deploy applications to the cloud.',
  type: 'WEBINAR',
  date: new Date('2024-12-28T18:00:00').toISOString(),
  endDate: new Date('2024-12-28T19:30:00').toISOString(),
  location: 'Zoom',
  meetingLink: 'https://zoom.us/j/123456789',
  imageUrl: null,
  maxSeats: 200,
  status: 'UPCOMING',
  creatorId: 'creator-3',
  createdAt: new Date('2024-12-15').toISOString(),
  updatedAt: new Date('2024-12-15').toISOString(),
  _count: {
    attendees: 150
  }
};

export default function RegistrationConfirmDialogExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsLoading(false);
  };

  const handleConfirm = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Registration confirmed for event:', selectedEvent?.id);
      setIsLoading(false);
      setIsOpen(false);
      alert(`Successfully registered for: ${selectedEvent?.title}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Registration Confirm Dialog Examples
          </h1>
          <p className="text-gray-400 text-lg">
            Click on any event to see the registration confirmation dialog
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workshop Event */}
          <div className="bg-[#0f172a] rounded-xl border border-white/10 p-6 space-y-4">
            <div className="text-4xl text-center">🛠️</div>
            <h3 className="text-xl font-bold text-white text-center">
              Workshop Event
            </h3>
            <p className="text-gray-400 text-sm text-center">
              {exampleWorkshopEvent.title}
            </p>
            <Button
              onClick={() => handleOpenDialog(exampleWorkshopEvent)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all"
            >
              Register
            </Button>
          </div>

          {/* Hackathon Event (Almost Full) */}
          <div className="bg-[#0f172a] rounded-xl border border-white/10 p-6 space-y-4">
            <div className="text-4xl text-center">🏆</div>
            <h3 className="text-xl font-bold text-white text-center">
              Hackathon Event
            </h3>
            <p className="text-gray-400 text-sm text-center">
              {exampleHackathonEvent.title}
            </p>
            <div className="text-center">
              <span className="text-orange-400 text-xs font-semibold">
                Only 5 spots left!
              </span>
            </div>
            <Button
              onClick={() => handleOpenDialog(exampleHackathonEvent)}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:scale-[1.02] transition-all"
            >
              Register
            </Button>
          </div>

          {/* Webinar Event */}
          <div className="bg-[#0f172a] rounded-xl border border-white/10 p-6 space-y-4">
            <div className="text-4xl text-center">📺</div>
            <h3 className="text-xl font-bold text-white text-center">
              Webinar Event
            </h3>
            <p className="text-gray-400 text-sm text-center">
              {exampleWebinarEvent.title}
            </p>
            <Button
              onClick={() => handleOpenDialog(exampleWebinarEvent)}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:scale-[1.02] transition-all"
            >
              Register
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-[#0f172a] rounded-xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Component Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Event summary with title and description</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Formatted date and time display</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Platform/location information with icons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Duration calculation and display</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Commitment message with spots left warning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Loading state during registration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Confirm and Cancel buttons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Gradient header matching event type</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Registration Confirm Dialog */}
      <RegistrationConfirmDialog
        event={selectedEvent}
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}
