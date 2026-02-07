/**
 * EventsFilterDrawer Component
 * Feature: events-page-ui-improvements
 * Task: 6. Create EventsFilterDrawer component (Mobile)
 * 
 * Mobile-optimized slide-up drawer for event filters with smooth animations.
 * Includes all filter components from desktop panel with Apply/Cancel buttons
 * and live result count preview.
 * 
 * Requirements: 6.2
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar as CalendarIcon, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { EventType, EventAvailability, DateRange } from '@/lib/types/events.types';
import { cn } from '@/lib/utils';

interface EventsFilterDrawerProps {
  selectedTypes: EventType[];
  dateRange: DateRange;
  availability: EventAvailability;
  myEvents: boolean;
  onTypeToggle: (type: EventType) => void;
  onDateRangeChange: (range: DateRange) => void;
  onAvailabilityChange: (availability: EventAvailability) => void;
  onMyEventsToggle: (enabled: boolean) => void;
  onApply: () => void;
  onCancel: () => void;
  onClearAll: () => void;
  activeFilterCount: number;
  resultsCount?: number;
  className?: string;
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

export const EventsFilterDrawer: React.FC<EventsFilterDrawerProps> = ({
  selectedTypes,
  dateRange,
  availability,
  myEvents,
  onTypeToggle,
  onDateRangeChange,
  onAvailabilityChange,
  onMyEventsToggle,
  onApply,
  onCancel,
  onClearAll,
  activeFilterCount,
  resultsCount,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    selectedTypes,
    dateRange,
    availability,
    myEvents,
  });

  // Sync local filters with props when drawer opens
  useEffect(() => {
    if (open) {
      setLocalFilters({
        selectedTypes,
        dateRange,
        availability,
        myEvents,
      });
    }
  }, [open, selectedTypes, dateRange, availability, myEvents]);

  // Check if a date range preset is active
  const isPresetActive = (preset: typeof DATE_RANGE_PRESETS[0]) => {
    const presetRange = preset.getValue();
    return (
      localFilters.dateRange.start?.toDateString() === presetRange.start?.toDateString() &&
      localFilters.dateRange.end?.toDateString() === presetRange.end?.toDateString()
    );
  };

  // Handle local filter changes
  const handleTypeToggle = (type: EventType) => {
    setLocalFilters((prev) => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter((t) => t !== type)
        : [...prev.selectedTypes, type],
    }));
  };

  const handleDateRangeChange = (range: DateRange) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: range,
    }));
  };

  const handleAvailabilityChange = (newAvailability: EventAvailability) => {
    setLocalFilters((prev) => ({
      ...prev,
      availability: newAvailability,
    }));
  };

  const handleMyEventsToggle = (enabled: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      myEvents: enabled,
    }));
  };

  const handleClearAll = () => {
    setLocalFilters({
      selectedTypes: [],
      dateRange: {},
      availability: 'all',
      myEvents: false,
    });
    onClearAll();
  };

  const handleApply = () => {
    // Apply all local filters
    localFilters.selectedTypes.forEach((type) => {
      if (!selectedTypes.includes(type)) {
        onTypeToggle(type);
      }
    });
    selectedTypes.forEach((type) => {
      if (!localFilters.selectedTypes.includes(type)) {
        onTypeToggle(type);
      }
    });
    
    if (JSON.stringify(localFilters.dateRange) !== JSON.stringify(dateRange)) {
      onDateRangeChange(localFilters.dateRange);
    }
    
    if (localFilters.availability !== availability) {
      onAvailabilityChange(localFilters.availability);
    }
    
    if (localFilters.myEvents !== myEvents) {
      onMyEventsToggle(localFilters.myEvents);
    }

    onApply();
    setOpen(false);
  };

  const handleCancel = () => {
    // Reset local filters to current props
    setLocalFilters({
      selectedTypes,
      dateRange,
      availability,
      myEvents,
    });
    onCancel();
    setOpen(false);
  };

  // Calculate local active filter count
  const localActiveFilterCount =
    localFilters.selectedTypes.length +
    (localFilters.dateRange.start || localFilters.dateRange.end ? 1 : 0) +
    (localFilters.availability !== 'all' ? 1 : 0) +
    (localFilters.myEvents ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            'w-full justify-between gap-2 h-11 min-h-[44px] bg-[#0f172a] border-white/10 text-white hover:bg-white/5',
            className
          )}
          aria-label={`Open filters, ${activeFilterCount} active`}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <span>Filters</span>
          </span>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-auto h-5 w-5 rounded-full p-0 text-xs bg-cyan-500 text-white"
              aria-label={`${activeFilterCount} filters active`}
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] flex flex-col bg-[#0f172a] border-t border-white/10 text-white"
        aria-label="Filter options"
      >
        <SheetHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              Filter Events
            </SheetTitle>
            {localActiveFilterCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" aria-hidden="true" />
                <span className="text-cyan-400 text-xs font-medium">
                  {localActiveFilterCount} active
                </span>
              </motion.div>
            )}
          </div>
          {resultsCount !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-gray-400 mt-2"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {resultsCount} {resultsCount === 1 ? 'event' : 'events'} found
            </motion.div>
          )}
        </SheetHeader>

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 px-4" role="region" aria-label="Filter options">
          {/* Event Type Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
            role="group"
            aria-labelledby="drawer-event-type-heading"
          >
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <h4 id="drawer-event-type-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">Event Type</h4>
            </div>
            <div className="space-y-2">
              {EVENT_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors min-h-[44px]"
                >
                  <Checkbox
                    id={`drawer-type-${option.value}`}
                    checked={localFilters.selectedTypes.includes(option.value)}
                    onCheckedChange={() => handleTypeToggle(option.value)}
                    aria-label={`Filter by ${option.label} events`}
                    aria-describedby={`drawer-type-${option.value}-desc`}
                    className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 min-w-[20px] min-h-[20px]"
                  />
                  <label
                    htmlFor={`drawer-type-${option.value}`}
                    className="text-sm cursor-pointer flex-1 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="text-lg" aria-hidden="true">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </label>
                  <span id={`drawer-type-${option.value}-desc`} className="sr-only">
                    {localFilters.selectedTypes.includes(option.value) ? 'Selected' : 'Not selected'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <Separator className="bg-white/10" />

          {/* Date Range Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
            role="group"
            aria-labelledby="drawer-date-range-heading"
          >
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <h4 id="drawer-date-range-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">Date Range</h4>
            </div>
            <div className="space-y-2" role="radiogroup" aria-labelledby="drawer-date-range-heading">
              {DATE_RANGE_PRESETS.map((preset) => {
                const isActive = isPresetActive(preset);
                return (
                  <button
                    key={preset.label}
                    onClick={() => handleDateRangeChange(preset.getValue())}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all border text-left min-h-[44px]',
                      isActive
                        ? 'bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                    )}
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`Filter events for ${preset.label}`}
                  >
                    <span className="text-sm font-medium">{preset.label}</span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
              <AnimatePresence>
                {(localFilters.dateRange.start || localFilters.dateRange.end) &&
                  !DATE_RANGE_PRESETS.some(isPresetActive) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 py-3 rounded-lg bg-[#1e293b] border border-cyan-500/50"
                      role="status"
                    >
                      <div className="text-xs text-gray-400 mb-1">Custom Range</div>
                      <div className="text-sm text-white font-medium">
                        {localFilters.dateRange.start?.toLocaleDateString()} -{' '}
                        {localFilters.dateRange.end?.toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleDateRangeChange({})}
                        className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 min-h-[44px]"
                        aria-label="Clear custom date range"
                      >
                        <X className="w-3 h-3" aria-hidden="true" /> Clear
                      </button>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </motion.div>

          <Separator className="bg-white/10" />

          {/* Availability Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
            role="group"
            aria-labelledby="drawer-availability-heading"
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <h4 id="drawer-availability-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">Availability</h4>
            </div>
            <div className="space-y-2" role="radiogroup" aria-labelledby="drawer-availability-heading">
              {AVAILABILITY_OPTIONS.map((option) => {
                const isActive = localFilters.availability === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAvailabilityChange(option.value)}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-all border text-left min-h-[44px]',
                      isActive
                        ? 'bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                    )}
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`Filter by ${option.label}: ${option.description}`}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] mt-1.5"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <Separator className="bg-white/10" />

          {/* My Events Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
            role="group"
            aria-labelledby="drawer-my-events-heading"
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <h4 id="drawer-my-events-heading" className="text-gray-100 text-xs font-bold uppercase tracking-wider">My Events</h4>
            </div>
            <button
              onClick={() => handleMyEventsToggle(!localFilters.myEvents)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all border min-h-[44px]',
                localFilters.myEvents
                  ? 'bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
              )}
              role="switch"
              aria-checked={localFilters.myEvents}
              aria-label="Show only my registered events"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">Show only my registered events</span>
              {localFilters.myEvents && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  aria-hidden="true"
                />
              )}
            </button>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4 border-t border-white/10 space-y-2 px-4 pb-4"
        >
          {localActiveFilterCount > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleClearAll}
              className="w-full h-12 min-h-[44px] bg-transparent border-white/20 text-white hover:bg-white/5"
              aria-label="Clear all filters"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handleCancel}
              className="flex-1 h-12 min-h-[44px] bg-transparent border-white/20 text-white hover:bg-white/5"
              aria-label="Cancel and close"
            >
              Cancel
            </Button>

            <Button
              size="lg"
              onClick={handleApply}
              className="flex-1 h-12 min-h-[44px] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20"
              aria-label="Apply filters and close"
            >
              Apply Filters
              {localActiveFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                  {localActiveFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
};

export default EventsFilterDrawer;
