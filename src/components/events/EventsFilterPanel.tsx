/**
 * EventsFilterPanel Component
 * Feature: events-page-ui-improvements
 * Task: 5. Create EventsFilterPanel component (Desktop)
 * 
 * Desktop filter panel for events with type, date range, availability, and "My Events" filters.
 * Integrates with existing EventsSidebar styling for consistent design.
 * 
 * Requirements: 1.3-1.7, 3.6
 */

'use client';

import React from 'react';
import { Filter, X, Calendar as CalendarIcon, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { EventType, EventAvailability, DateRange } from '@/lib/types/events.types';

interface EventsFilterPanelProps {
  selectedTypes: EventType[];
  dateRange: DateRange;
  availability: EventAvailability;
  myEvents: boolean;
  onTypeToggle: (type: EventType) => void;
  onDateRangeChange: (range: DateRange) => void;
  onAvailabilityChange: (availability: EventAvailability) => void;
  onMyEventsToggle: (enabled: boolean) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; icon: string }[] = [
  { value: 'WORKSHOP', label: 'Workshop', icon: '🛠️' },
  { value: 'HACKATHON', label: 'Hackathon', icon: '💻' },
  { value: 'NETWORKING', label: 'Networking', icon: '🤝' },
  { value: 'WEBINAR', label: 'Webinar', icon: '🎓' },
];

const DATE_RANGE_PRESETS: { label: string; getValue: () => DateRange }[] = [
  {
    label: 'Next 7 Days',
    getValue: () => {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 7);
      return { start, end };
    },
  },
  {
    label: 'Next 30 Days',
    getValue: () => {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);
      return { start, end };
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    },
  },
];

const AVAILABILITY_OPTIONS: { value: EventAvailability; label: string; description: string }[] = [
  { value: 'all', label: 'All Events', description: 'Show all events' },
  { value: 'available', label: 'Available', description: 'Spots available' },
  { value: 'almost-full', label: 'Almost Full', description: '>80% capacity' },
  { value: 'full', label: 'Full', description: 'No spots left' },
];

export const EventsFilterPanel: React.FC<EventsFilterPanelProps> = ({
  selectedTypes,
  dateRange,
  availability,
  myEvents,
  onTypeToggle,
  onDateRangeChange,
  onAvailabilityChange,
  onMyEventsToggle,
  onClearAll,
  activeFilterCount,
}) => {
  const hasActiveFilters = activeFilterCount > 0;

  // Check if a date range preset is active
  const isPresetActive = (preset: typeof DATE_RANGE_PRESETS[0]) => {
    const presetRange = preset.getValue();
    return (
      dateRange.start?.toDateString() === presetRange.start?.toDateString() &&
      dateRange.end?.toDateString() === presetRange.end?.toDateString()
    );
  };

  return (
    <div 
      className="bg-[#0f172a] rounded-[24px] p-6 border border-white/10 w-72 shadow-2xl space-y-6"
      role="region"
      aria-label="Event filters"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h3 className="text-white font-bold text-lg">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-auto p-1 text-xs text-gray-400 hover:text-white hover:bg-white/5"
              aria-label={`Clear all ${activeFilterCount} active filters`}
            >
              Clear All
            </Button>
          )}
        </div>
        <p className="text-gray-400 text-xs leading-relaxed" id="filter-description">
          Refine your event search with filters below.
        </p>
        {hasActiveFilters && (
          <div 
            className="mt-2 flex items-center gap-2"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" aria-hidden="true" />
            <span className="text-cyan-400 text-xs font-medium">
              {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
            </span>
          </div>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Event Type Filter */}
      <div className="space-y-3" role="group" aria-labelledby="event-type-heading">
        <div className="flex items-center gap-2 mb-1 px-1">
          <CalendarIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <h4 id="event-type-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">Event Type</h4>
        </div>
        <div className="space-y-2">
          {EVENT_TYPE_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Checkbox
                id={`type-${option.value}`}
                checked={selectedTypes.includes(option.value)}
                onCheckedChange={() => onTypeToggle(option.value)}
                aria-label={`Filter by ${option.label} events`}
                aria-describedby={`type-${option.value}-desc`}
                className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
              />
              <label
                htmlFor={`type-${option.value}`}
                className="text-sm cursor-pointer flex-1 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <span className="text-base" aria-hidden="true">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </label>
              <span id={`type-${option.value}-desc`} className="sr-only">
                {selectedTypes.includes(option.value) ? 'Selected' : 'Not selected'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Date Range Filter */}
      <div className="space-y-3" role="group" aria-labelledby="date-range-heading">
        <div className="flex items-center gap-2 mb-1 px-1">
          <CalendarIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <h4 id="date-range-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">Date Range</h4>
        </div>
        <div className="space-y-2" role="radiogroup" aria-labelledby="date-range-heading">
          {DATE_RANGE_PRESETS.map((preset) => {
            const isActive = isPresetActive(preset);
            return (
              <button
                key={preset.label}
                onClick={() => onDateRangeChange(preset.getValue())}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border text-left
                  ${isActive
                    ? 'bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                  }
                `}
                role="radio"
                aria-checked={isActive}
                aria-label={`Filter events for ${preset.label}`}
              >
                <span className="text-sm font-medium">{preset.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" aria-hidden="true" />
                )}
              </button>
            );
          })}
          {(dateRange.start || dateRange.end) && !DATE_RANGE_PRESETS.some(isPresetActive) && (
            <div className="px-3 py-2 rounded-lg bg-[#1e293b] border border-cyan-500/50" role="status">
              <div className="text-xs text-gray-400 mb-1">Custom Range</div>
              <div className="text-sm text-white font-medium">
                {dateRange.start?.toLocaleDateString()} - {dateRange.end?.toLocaleDateString()}
              </div>
              <button
                onClick={() => onDateRangeChange({})}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                aria-label="Clear custom date range"
              >
                <X className="w-3 h-3" aria-hidden="true" /> Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Availability Filter */}
      <div className="space-y-3" role="group" aria-labelledby="availability-heading">
        <div className="flex items-center gap-2 mb-1 px-1">
          <Users className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <h4 id="availability-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">Availability</h4>
        </div>
        <div className="space-y-2" role="radiogroup" aria-labelledby="availability-heading">
          {AVAILABILITY_OPTIONS.map((option) => {
            const isActive = availability === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onAvailabilityChange(option.value)}
                className={`
                  w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-all border text-left
                  ${isActive
                    ? 'bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                  }
                `}
                role="radio"
                aria-checked={isActive}
                aria-label={`Filter by ${option.label}: ${option.description}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] mt-1.5" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* My Events Toggle */}
      <div className="space-y-3" role="group" aria-labelledby="my-events-heading">
        <div className="flex items-center gap-2 mb-1 px-1">
          <CheckCircle2 className="w-4 h-4 text-gray-500" aria-hidden="true" />
          <h4 id="my-events-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">My Events</h4>
        </div>
        <button
          onClick={() => onMyEventsToggle(!myEvents)}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all border
            ${myEvents
              ? 'bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
              : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
            }
          `}
          role="switch"
          aria-checked={myEvents}
          aria-label="Show only my registered events"
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">Show only my registered events</span>
          {myEvents && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};

export default EventsFilterPanel;
