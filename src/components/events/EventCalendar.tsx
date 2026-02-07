"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    getCalendarDays,
    getMonthName,
    type CalendarDay,
} from "@/lib/calendar-utils";
import { Event } from "@/lib/api/types";

interface EventCalendarProps {
    events: Event[];
    onDateSelect: (date: Date) => void;
    selectedDate?: Date;
    isLoading?: boolean;
}

export default function EventCalendar({
    events,
    onDateSelect,
    selectedDate,
    isLoading = false,
}: EventCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Get calendar days
    const calendarDays = getCalendarDays(currentYear, currentMonth);

    // Mark events on calendar days
    const markedCalendarDays = calendarDays.map(day => {
        const dayStart = new Date(day.date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day.date);
        dayEnd.setHours(23, 59, 59, 999);

        const eventsOnDay = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= dayStart && eventDate <= dayEnd;
        });

        return {
            ...day,
            hasEvents: eventsOnDay.length > 0,
            eventCount: eventsOnDay.length,
            events: eventsOnDay,
        };
    });

    // Get events for a specific date
    const getEventsForDate = (date: Date): Event[] => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return events
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= dayStart && eventDate <= dayEnd;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const isSelectedDate = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    // Touch event handlers for swipe gestures
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNextMonth();
        } else if (isRightSwipe) {
            goToPreviousMonth();
        }
    };

    // Format event time
    const formatEventTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    // Get event type badge color
    const getEventTypeBadge = (type: Event['type']) => {
        const badges = {
            WORKSHOP: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            HACKATHON: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            WEBINAR: 'bg-green-500/10 text-green-400 border-green-500/30',
        };
        return badges[type] || badges.WEBINAR;
    };

    const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

    return (
        <div 
            ref={calendarRef}
            className="glass-strong rounded-2xl p-4 sm:p-6 border border-white/10"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                    {getMonthName(currentMonth)} {currentYear}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="rounded-lg border-white/20 text-gray-300 hover:bg-white/5 text-xs min-h-[44px] px-3 sm:px-4 touch-manipulation"
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="min-w-[44px] min-h-[44px] hover:bg-white/5 touch-manipulation"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4 text-gray-300" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextMonth}
                        className="min-w-[44px] min-h-[44px] hover:bg-white/5 touch-manipulation"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 text-gray-300" />
                    </Button>
                </div>
            </div>

            {/* Swipe Hint for Mobile */}
            <div className="sm:hidden text-center text-xs text-gray-500 mb-3 flex items-center justify-center gap-2">
                <ChevronLeft className="w-3 h-3" />
                <span>Swipe to navigate months</span>
                <ChevronRight className="w-3 h-3" />
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {markedCalendarDays.map((day, index) => {
                    const isSelected = isSelectedDate(day.date);
                    const hasEvents = day.hasEvents;
                    const isCurrentMonth = day.isCurrentMonth;
                    const isToday = day.isToday;
                    const dayEvents = day.events || [];

                    const dateButton = (
                        <button
                            onClick={() => onDateSelect(day.date)}
                            disabled={isLoading}
                            className={`
                                relative aspect-square rounded-lg p-1 sm:p-2 text-sm transition-all
                                ${!isCurrentMonth
                                    ? "text-gray-600 hover:bg-white/5 active:bg-white/10"
                                    : "text-white hover:bg-white/10 active:bg-white/15"
                                }
                                ${isToday ? "bg-cyan-500/10 border border-cyan-500/30" : ""}
                                ${isSelected ? "bg-cyan-500/20 border border-cyan-500" : ""}
                                ${hasEvents && !isToday && !isSelected
                                    ? "border border-violet-500/30"
                                    : ""
                                }
                                ${!isToday && !isSelected && !hasEvents ? "border border-transparent" : ""}
                                hover:scale-105 active:scale-95 cursor-pointer group
                                disabled:opacity-50 disabled:cursor-not-allowed
                                touch-manipulation select-none
                                min-h-[44px] min-w-[44px]
                                flex items-center justify-center
                            `}
                            aria-label={`${day.date.toDateString()}${hasEvents ? `, ${day.eventCount} event${day.eventCount > 1 ? 's' : ''}` : ''}`}
                        >
                            <span
                                className={`
                                    block font-medium
                                    ${isToday ? "text-cyan-400" : ""}
                                    ${isSelected ? "text-cyan-300 font-bold" : ""}
                                `}
                            >
                                {day.date.getDate()}
                            </span>

                            {/* Multiple Events Indicator */}
                            {hasEvents && (
                                <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                    {Array.from({ length: Math.min(day.eventCount, 3) }).map(
                                        (_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-1 rounded-full bg-violet-400 group-hover:bg-cyan-400 transition-colors"
                                            />
                                        )
                                    )}
                                </div>
                            )}

                            {/* Event Count Badge */}
                            {hasEvents && day.eventCount > 0 && (
                                <Badge
                                    className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 p-0 flex items-center justify-center bg-violet-500 text-white text-[9px] sm:text-[10px] border-0 group-hover:bg-cyan-500"
                                >
                                    {day.eventCount}
                                </Badge>
                            )}
                        </button>
                    );

                    // Wrap with tooltip if there are events
                    if (hasEvents && dayEvents.length > 0) {
                        return (
                            <Tooltip key={index} delayDuration={300}>
                                <TooltipTrigger asChild>
                                    {dateButton}
                                </TooltipTrigger>
                                <TooltipContent 
                                    side="top" 
                                    className="max-w-xs bg-gray-900 text-white border border-white/10 p-3 hidden sm:block"
                                    sideOffset={5}
                                >
                                    <div className="space-y-2">
                                        <div className="font-semibold text-sm border-b border-white/10 pb-1">
                                            {day.date.toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div key={event.id} className="text-xs space-y-1">
                                                <div className="flex items-start gap-2">
                                                    <CalendarIcon className="w-3 h-3 mt-0.5 flex-shrink-0 text-cyan-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{event.title}</div>
                                                        <div className="flex items-center gap-2 text-gray-400 mt-0.5">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatEventTime(event.date)}
                                                            </span>
                                                            {event.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {event.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {event._count && (
                                                            <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                                                                <Users className="w-3 h-3" />
                                                                <span>{event._count.attendees}/{event.maxSeats}</span>
                                                            </div>
                                                        )}
                                                        <Badge 
                                                            className={`mt-1 text-[10px] px-1.5 py-0 ${getEventTypeBadge(event.type)}`}
                                                        >
                                                            {event.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-xs text-gray-400 pt-1 border-t border-white/10">
                                                +{dayEvents.length - 3} more event{dayEvents.length - 3 > 1 ? 's' : ''}
                                            </div>
                                        )}
                                        <div className="text-xs text-cyan-400 pt-1 border-t border-white/10">
                                            Click to filter events
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return <div key={index}>{dateButton}</div>;
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex-wrap text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/30" />
                    <span className="text-xs text-gray-400">Today</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 rounded border border-violet-500/30" />
                    <span className="text-xs text-gray-400">Has Events</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500" />
                    <span className="text-xs text-gray-400">Selected</span>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
                </div>
            )}
        </div>
    );
}
