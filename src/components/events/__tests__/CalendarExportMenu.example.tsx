import React from 'react';
import { CalendarExportMenu } from '../CalendarExportMenu';
import { Event } from '@/lib/api/types';

const mockEvent: Event = {
  id: '1',
  title: 'Web Development Workshop',
  description: 'Learn modern web development with React and Next.js',
  type: 'WORKSHOP',
  date: '2024-03-15T10:00:00Z',
  endDate: '2024-03-15T12:00:00Z',
  location: 'Online',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  imageUrl: null,
  maxSeats: 50,
  status: 'UPCOMING',
  creatorId: 'creator-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Example usage of CalendarExportMenu component
 */
export function CalendarExportMenuExample() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Default Variant</h2>
        <CalendarExportMenu event={mockEvent} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Outline Variant</h2>
        <CalendarExportMenu event={mockEvent} variant="outline" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Ghost Variant</h2>
        <CalendarExportMenu event={mockEvent} variant="ghost" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Small Size</h2>
        <CalendarExportMenu event={mockEvent} variant="outline" size="sm" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Large Size</h2>
        <CalendarExportMenu event={mockEvent} variant="outline" size="lg" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Registered User (shows meeting link message)</h2>
        <CalendarExportMenu event={mockEvent} isRegistered={true} variant="outline" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Not Registered (no meeting link message)</h2>
        <CalendarExportMenu event={mockEvent} isRegistered={false} variant="outline" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">In Event Card Context</h2>
        <div className="border rounded-lg p-4 max-w-md">
          <h3 className="font-semibold mb-2">{mockEvent.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{mockEvent.description}</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-white rounded-md">
              Register
            </button>
            <CalendarExportMenu event={mockEvent} variant="outline" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">In Event Details Modal Context</h2>
        <div className="border rounded-lg p-6 max-w-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{mockEvent.title}</h3>
              <p className="text-muted-foreground">{mockEvent.description}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button className="px-6 py-2 bg-primary text-white rounded-md">
              Register Now
            </button>
            <CalendarExportMenu event={mockEvent} variant="outline" isRegistered={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
