"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    getCalendarDays,
    markEventsOnCalendar,
    getMonthName,
    type ScheduledMeeting,
    type CalendarDay,
} from "@/lib/calendar-utils";

interface EventCalendarProps {
    meetings: ScheduledMeeting[];
    onDateSelect: (date: Date) => void;
    selectedDate?: Date;
}

export default function EventCalendar({
    meetings,
    onDateSelect,
    selectedDate,
}: EventCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    // Get calendar days and mark event dates
    const calendarDays = markEventsOnCalendar(
        getCalendarDays(currentYear, currentMonth),
        meetings
    );

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

    const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

    return (
        <div className="glass-strong rounded-2xl p-6 border border-white/10">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                    {getMonthName(currentMonth)} {currentYear}
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="rounded-lg border-white/20 text-gray-300 hover:bg-white/5 text-xs"
                    >
                        Today
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="w-8 h-8 hover:bg-white/5"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-300" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextMonth}
                        className="w-8 h-8 hover:bg-white/5"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Button>
                </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
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
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                    const isSelected = isSelectedDate(day.date);
                    const hasEvents = day.hasEvents;
                    const isCurrentMonth = day.isCurrentMonth;
                    const isToday = day.isToday;

                    return (
                        <button
                            key={index}
                            onClick={() => onDateSelect(day.date)}
                            className={`
                relative aspect-square rounded-lg p-2 text-sm transition-all
                ${!isCurrentMonth
                                    ? "text-gray-600 hover:bg-white/5"
                                    : "text-white hover:bg-white/10"
                                }
                ${isToday ? "bg-cyan-500/10 border border-cyan-500/30" : ""}
                ${isSelected ? "bg-cyan-500/20 border border-cyan-500" : ""}
                ${hasEvents && !isToday && !isSelected
                                    ? "border border-violet-500/30"
                                    : ""
                                }
                ${!isToday && !isSelected && !hasEvents ? "border border-transparent" : ""}
                hover:scale-105 cursor-pointer group
              `}
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

                            {/* Event Indicator */}
                            {hasEvents && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
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
                                    className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-violet-500 text-white text-[10px] border-0 group-hover:bg-cyan-500"
                                >
                                    {day.eventCount}
                                </Badge>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/30" />
                    <span className="text-xs text-gray-400">Today</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border border-violet-500/30" />
                    <span className="text-xs text-gray-400">Has Events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500" />
                    <span className="text-xs text-gray-400">Selected</span>
                </div>
            </div>
        </div>
    );
}
