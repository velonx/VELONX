'use client';

import { useState, useCallback } from 'react';
import { Event } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface UseCalendarExportReturn {
  exportToICS: (event: Event) => void;
  exportToGoogle: (event: Event) => void;
  exportToOutlook: (event: Event) => void;
  isExporting: boolean;
}

/**
 * Custom hook for exporting events to various calendar formats
 * 
 * Features:
 * - ICS file generation and download via API
 * - Google Calendar URL generation via API
 * - Outlook Calendar URL generation via API
 * - Meeting links included only for registered users (handled by API)
 * - Error handling with user notifications
 * 
 * Requirements: 4.1-4.5
 * 
 * @example
 * ```tsx
 * const { exportToICS, exportToGoogle, exportToOutlook, isExporting } = useCalendarExport();
 * 
 * // Export to ICS file
 * exportToICS(event);
 * 
 * // Open Google Calendar
 * exportToGoogle(event);
 * 
 * // Open Outlook Calendar
 * exportToOutlook(event);
 * ```
 */
export function useCalendarExport(): UseCalendarExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Fetch calendar export data from API
   */
  const fetchExportData = useCallback(async (eventId: string) => {
    const response = await fetch(`/api/events/${eventId}/export`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar export data');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch calendar export data');
    }
    
    return result.data;
  }, []);

  /**
   * Export event to ICS file and trigger download
   */
  const exportToICS = useCallback(async (event: Event) => {
    setIsExporting(true);
    
    try {
      const exportData = await fetchExportData(event.id);
      
      // Create blob and download
      const blob = new Blob([exportData.icsData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success('Calendar event downloaded successfully');
    } catch (error) {
      console.error('Error exporting to ICS:', error);
      toast.error('Failed to export calendar event');
    } finally {
      setIsExporting(false);
    }
  }, [fetchExportData]);

  /**
   * Generate Google Calendar URL and open in new tab
   */
  const exportToGoogle = useCallback(async (event: Event) => {
    setIsExporting(true);
    
    try {
      const exportData = await fetchExportData(event.id);
      
      // Open in new tab
      window.open(exportData.googleCalendarUrl, '_blank', 'noopener,noreferrer');
      
      toast.success('Opening Google Calendar...');
    } catch (error) {
      console.error('Error exporting to Google Calendar:', error);
      toast.error('Failed to open Google Calendar');
    } finally {
      setIsExporting(false);
    }
  }, [fetchExportData]);

  /**
   * Generate Outlook Calendar URL and open in new tab
   */
  const exportToOutlook = useCallback(async (event: Event) => {
    setIsExporting(true);
    
    try {
      const exportData = await fetchExportData(event.id);
      
      // Open in new tab
      window.open(exportData.outlookUrl, '_blank', 'noopener,noreferrer');
      
      toast.success('Opening Outlook Calendar...');
    } catch (error) {
      console.error('Error exporting to Outlook Calendar:', error);
      toast.error('Failed to open Outlook Calendar');
    } finally {
      setIsExporting(false);
    }
  }, [fetchExportData]);

  return {
    exportToICS,
    exportToGoogle,
    exportToOutlook,
    isExporting,
  };
}
