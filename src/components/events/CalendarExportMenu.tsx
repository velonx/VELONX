'use client';

import React from 'react';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { Event } from '@/lib/api/types';
import { useCalendarExport } from '@/lib/hooks/useCalendarExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface CalendarExportMenuProps {
  event: Event;
  isRegistered?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * CalendarExportMenu Component
 * 
 * Dropdown menu for exporting events to various calendar formats.
 * Provides options for ICS download, Google Calendar, and Outlook Calendar.
 * 
 * Features:
 * - ICS file download
 * - Google Calendar quick link
 * - Outlook Calendar quick link
 * - Success toast notifications
 * - Loading state during export
 * 
 * Requirements: 4.1-4.4
 * 
 * @example
 * ```tsx
 * <CalendarExportMenu 
 *   event={event} 
 *   isRegistered={true}
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function CalendarExportMenu({
  event,
  isRegistered = false,
  variant = 'outline',
  size = 'default',
  className,
}: CalendarExportMenuProps) {
  const { exportToICS, exportToGoogle, exportToOutlook, isExporting } = useCalendarExport();

  const handleExportToICS = () => {
    exportToICS(event);
  };

  const handleExportToGoogle = () => {
    exportToGoogle(event);
  };

  const handleExportToOutlook = () => {
    exportToOutlook(event);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting}
          className={className}
          aria-label="Add event to calendar - opens menu with export options"
          aria-haspopup="menu"
        >
          <Calendar className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add to Calendar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" role="menu" aria-label="Calendar export options">
        <DropdownMenuLabel>Export to Calendar</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleExportToICS}
          disabled={isExporting}
          className="cursor-pointer"
          role="menuitem"
          aria-label="Download ICS file for calendar import"
        >
          <Download className="size-4" aria-hidden="true" />
          <span>Download ICS File</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={handleExportToGoogle}
          disabled={isExporting}
          className="cursor-pointer"
          role="menuitem"
          aria-label="Open in Google Calendar"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          <span>Google Calendar</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={handleExportToOutlook}
          disabled={isExporting}
          className="cursor-pointer"
          role="menuitem"
          aria-label="Open in Outlook Calendar"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          <span>Outlook Calendar</span>
        </DropdownMenuItem>
        
        {isRegistered && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground" role="note">
              Meeting link included for registered users
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
