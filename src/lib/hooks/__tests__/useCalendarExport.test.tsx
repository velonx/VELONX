import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCalendarExport } from '../useCalendarExport';
import { Event } from '@/lib/api/types';
import toast from 'react-hot-toast';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCalendarExport', () => {
  // Mock event data
  const mockEvent: Event = {
    id: 'event-123',
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React and Next.js',
    type: 'WORKSHOP',
    date: '2024-03-15T14:00:00.000Z',
    endDate: '2024-03-15T16:00:00.000Z',
    location: 'Room 101, Tech Building',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    imageUrl: 'https://example.com/image.jpg',
    maxSeats: 50,
    status: 'UPCOMING',
    creatorId: 'user-123',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockEventWithoutEndDate: Event = {
    ...mockEvent,
    endDate: null,
  };

  const mockEventWithoutLocation: Event = {
    ...mockEvent,
    location: null,
  };

  const mockEventWithoutMeetingLink: Event = {
    ...mockEvent,
    meetingLink: null,
  };

  // Mock export data from API
  const mockExportData = {
    icsData: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VELONX//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:event-123@velonx.com
DTSTAMP:20240101T000000Z
DTSTART:20240315T140000Z
DTEND:20240315T160000Z
SUMMARY:Web Development Workshop
DESCRIPTION:Learn modern web development with React and Next.js
LOCATION:Room 101\\, Tech Building
URL:https://meet.google.com/abc-defg-hij
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`,
    googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Web+Development+Workshop&dates=20240315T140000Z/20240315T160000Z&details=Learn+modern+web+development+with+React+and+Next.js%0A%0AMeeting+Link%3A+https%3A%2F%2Fmeet.google.com%2Fabc-defg-hij&location=Room+101%2C+Tech+Building',
    outlookUrl: 'https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&subject=Web+Development+Workshop&startdt=2024-03-15T14%3A00%3A00.000Z&enddt=2024-03-15T16%3A00%3A00.000Z&body=Learn+modern+web+development+with+React+and+Next.js%0A%0AMeeting+Link%3A+https%3A%2F%2Fmeet.google.com%2Fabc-defg-hij&location=Room+101%2C+Tech+Building',
  };

  // Mock DOM APIs
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;
  let windowOpenSpy: any;
  let fetchSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch API
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockExportData,
      }),
    } as Response);
    
    // Mock document.createElement
    createElementSpy = vi.spyOn(document, 'createElement');
    appendChildSpy = vi.spyOn(document.body, 'appendChild');
    removeChildSpy = vi.spyOn(document.body, 'removeChild');
    
    // Mock URL APIs
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    
    // Mock window.open
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToICS', () => {
    it('should generate and download ICS file with all event details', async () => {
      const { result } = renderHook(() => useCalendarExport());
      
      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      await act(async () => {
        result.current.exportToICS(mockEvent);
        await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
      });

      // Verify API was called
      expect(fetchSpy).toHaveBeenCalledWith('/api/events/event-123/export');
      
      // Verify link was created and clicked
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('web_development_workshop.ics');
      expect(mockLink.click).toHaveBeenCalled();
      
      // Verify cleanup
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
      
      // Verify success toast
      expect(toast.success).toHaveBeenCalledWith('Calendar event downloaded successfully');
    });

    it('should generate ICS content with correct format', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      let blobContent = '';
      const OriginalBlob = global.Blob;
      global.Blob = class MockBlob extends OriginalBlob {
        constructor(content: any[], options?: any) {
          super(content, options);
          blobContent = content[0];
        }
      } as any;

      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      act(() => {
        result.current.exportToICS(mockEvent);
      });

      // Verify ICS content structure
      expect(blobContent).toContain('BEGIN:VCALENDAR');
      expect(blobContent).toContain('VERSION:2.0');
      expect(blobContent).toContain('BEGIN:VEVENT');
      expect(blobContent).toContain('SUMMARY:Web Development Workshop');
      expect(blobContent).toContain('DESCRIPTION:Learn modern web development with React and Next.js');
      expect(blobContent).toContain('LOCATION:Room 101\\, Tech Building');
      expect(blobContent).toContain('URL:https://meet.google.com/abc-defg-hij');
      expect(blobContent).toContain('END:VEVENT');
      expect(blobContent).toContain('END:VCALENDAR');
      
      global.Blob = OriginalBlob;
    });

    it('should handle event without end date (default 1 hour duration)', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      let blobContent = '';
      const OriginalBlob = global.Blob;
      global.Blob = class MockBlob extends OriginalBlob {
        constructor(content: any[], options?: any) {
          super(content, options);
          blobContent = content[0];
        }
      } as any;

      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      act(() => {
        result.current.exportToICS(mockEventWithoutEndDate);
      });

      // Verify ICS was generated
      expect(blobContent).toContain('BEGIN:VCALENDAR');
      expect(mockLink.click).toHaveBeenCalled();
      
      global.Blob = OriginalBlob;
    });

    it('should handle event without location', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      let blobContent = '';
      const OriginalBlob = global.Blob;
      global.Blob = class MockBlob extends OriginalBlob {
        constructor(content: any[], options?: any) {
          super(content, options);
          blobContent = content[0];
        }
      } as any;

      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      act(() => {
        result.current.exportToICS(mockEventWithoutLocation);
      });

      // Verify no LOCATION field in ICS
      expect(blobContent).not.toContain('LOCATION:');
      expect(mockLink.click).toHaveBeenCalled();
      
      global.Blob = OriginalBlob;
    });

    it('should handle event without meeting link', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      let blobContent = '';
      const OriginalBlob = global.Blob;
      global.Blob = class MockBlob extends OriginalBlob {
        constructor(content: any[], options?: any) {
          super(content, options);
          blobContent = content[0];
        }
      } as any;

      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      act(() => {
        result.current.exportToICS(mockEventWithoutMeetingLink);
      });

      // Verify no URL field in ICS
      expect(blobContent).not.toContain('URL:');
      expect(mockLink.click).toHaveBeenCalled();
      
      global.Blob = OriginalBlob;
    });

    it('should escape special characters in ICS content', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      const eventWithSpecialChars: Event = {
        ...mockEvent,
        title: 'Workshop: React, Vue; Angular\\Next.js',
        description: 'Line 1\nLine 2; with, special\\chars',
        location: 'Room 101, Building A; Floor 2',
      };

      let blobContent = '';
      const OriginalBlob = global.Blob;
      global.Blob = class MockBlob extends OriginalBlob {
        constructor(content: any[], options?: any) {
          super(content, options);
          blobContent = content[0];
        }
      } as any;

      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      act(() => {
        result.current.exportToICS(eventWithSpecialChars);
      });

      // Verify special characters are escaped
      expect(blobContent).toContain('\\,');
      expect(blobContent).toContain('\\;');
      expect(blobContent).toContain('\\n');
      expect(blobContent).toContain('\\\\');
      
      global.Blob = OriginalBlob;
    });

    it('should handle export errors gracefully', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      // Mock error in Blob creation
      const OriginalBlob = global.Blob;
      global.Blob = class MockBlob extends OriginalBlob {
        constructor() {
          throw new Error('Blob creation failed');
        }
      } as any;

      act(() => {
        result.current.exportToICS(mockEvent);
      });

      // Verify error toast
      expect(toast.error).toHaveBeenCalledWith('Failed to export calendar event');
      
      global.Blob = OriginalBlob;
    });

    it('should set isExporting state correctly', async () => {
      const { result } = renderHook(() => useCalendarExport());
      
      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      expect(result.current.isExporting).toBe(false);

      act(() => {
        result.current.exportToICS(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });
  });

  describe('exportToGoogle', () => {
    it('should open Google Calendar with correct URL parameters', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToGoogle(mockEvent);
      });

      // Verify window.open was called
      expect(windowOpenSpy).toHaveBeenCalled();
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      
      // Verify URL structure
      expect(calledUrl).toContain('https://calendar.google.com/calendar/render');
      expect(calledUrl).toContain('action=TEMPLATE');
      expect(calledUrl).toContain('text=Web+Development+Workshop');
      expect(calledUrl).toContain('dates=');
      expect(calledUrl).toContain('location=Room+101');
      
      // Verify success toast
      expect(toast.success).toHaveBeenCalledWith('Opening Google Calendar...');
    });

    it('should include meeting link in details', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToGoogle(mockEvent);
      });

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('details=');
      expect(calledUrl).toContain('Meeting+Link');
    });

    it('should handle event without end date', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToGoogle(mockEventWithoutEndDate);
      });

      expect(windowOpenSpy).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle event without location', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToGoogle(mockEventWithoutLocation);
      });

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('location=');
    });

    it('should handle event without meeting link', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToGoogle(mockEventWithoutMeetingLink);
      });

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('Meeting+Link');
    });

    it('should handle export errors gracefully', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      // Mock window.open to throw error
      windowOpenSpy.mockImplementation(() => {
        throw new Error('Failed to open window');
      });

      act(() => {
        result.current.exportToGoogle(mockEvent);
      });

      // Verify error toast
      expect(toast.error).toHaveBeenCalledWith('Failed to open Google Calendar');
    });

    it('should open in new tab with security attributes', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToGoogle(mockEvent);
      });

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.any(String),
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('exportToOutlook', () => {
    it('should open Outlook Calendar with correct URL parameters', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEvent);
      });

      // Verify window.open was called
      expect(windowOpenSpy).toHaveBeenCalled();
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      
      // Verify URL structure
      expect(calledUrl).toContain('https://outlook.live.com/calendar/0/deeplink/compose');
      expect(calledUrl).toContain('path=%2Fcalendar%2Faction%2Fcompose');
      expect(calledUrl).toContain('rru=addevent');
      expect(calledUrl).toContain('subject=Web+Development+Workshop');
      expect(calledUrl).toContain('startdt=');
      expect(calledUrl).toContain('enddt=');
      expect(calledUrl).toContain('location=Room+101');
      
      // Verify success toast
      expect(toast.success).toHaveBeenCalledWith('Opening Outlook Calendar...');
    });

    it('should include meeting link in body', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEvent);
      });

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('body=');
      expect(calledUrl).toContain('Meeting+Link');
    });

    it('should use ISO 8601 date format', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEvent);
      });

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      // ISO format includes 'T' and 'Z'
      expect(calledUrl).toMatch(/startdt=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}/);
    });

    it('should handle event without end date', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEventWithoutEndDate);
      });

      expect(windowOpenSpy).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle event without location', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEventWithoutLocation);
      });

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('location=');
    });

    it('should handle event without meeting link', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEventWithoutMeetingLink);
      });

      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('Meeting+Link');
    });

    it('should handle export errors gracefully', () => {
      const { result } = renderHook(() => useCalendarExport());
      
      // Mock window.open to throw error
      windowOpenSpy.mockImplementation(() => {
        throw new Error('Failed to open window');
      });

      act(() => {
        result.current.exportToOutlook(mockEvent);
      });

      // Verify error toast
      expect(toast.error).toHaveBeenCalledWith('Failed to open Outlook Calendar');
    });

    it('should open in new tab with security attributes', () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEvent);
      });

      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.any(String),
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('isExporting state', () => {
    it('should be false initially', () => {
      const { result } = renderHook(() => useCalendarExport());
      expect(result.current.isExporting).toBe(false);
    });

    it('should remain false after successful ICS export', async () => {
      const { result } = renderHook(() => useCalendarExport());
      
      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      createElementSpy.mockReturnValue(mockLink);

      act(() => {
        result.current.exportToICS(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('should remain false after successful Google export', async () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToGoogle(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('should remain false after successful Outlook export', async () => {
      const { result } = renderHook(() => useCalendarExport());

      act(() => {
        result.current.exportToOutlook(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
    });

    it('should return to false after error', async () => {
      const { result } = renderHook(() => useCalendarExport());
      
      const OriginalBlob = global.Blob;
      global.Blob = class MockBlob extends OriginalBlob {
        constructor() {
          throw new Error('Error');
        }
      } as any;

      act(() => {
        result.current.exportToICS(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });
      
      global.Blob = OriginalBlob;
    });
  });
});
