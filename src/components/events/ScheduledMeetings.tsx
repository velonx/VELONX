"use client";

import MeetingCard from "./MeetingCard";
import { type ScheduledMeeting, getMeetingsForDate } from "@/lib/calendar-utils";
import { Calendar as CalendarIcon } from "lucide-react";

interface ScheduledMeetingsProps {
    meetings: ScheduledMeeting[];
    selectedDate?: Date;
}

export default function ScheduledMeetings({
    meetings,
    selectedDate,
}: ScheduledMeetingsProps) {
    // Filter meetings for selected date or show all upcoming
    const displayMeetings = selectedDate
        ? getMeetingsForDate(selectedDate, meetings)
        : meetings
            .filter((m) => m.status === "upcoming")
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 6);

    const dateString = selectedDate
        ? selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "All Upcoming";

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">Scheduled Events</h3>
                </div>
                <p className="text-gray-400 text-sm">{dateString}</p>
            </div>

            {/* Meetings List */}
            {displayMeetings.length > 0 ? (
                <div className="space-y-4">
                    {displayMeetings.map((meeting) => (
                        <MeetingCard key={meeting.id} meeting={meeting} />
                    ))}
                </div>
            ) : (
                <div className="glass rounded-xl p-8 border border-white/10 text-center">
                    <div className="text-4xl mb-3">📅</div>
                    <h4 className="text-white font-semibold mb-2">No Events Scheduled</h4>
                    <p className="text-gray-400 text-sm">
                        {selectedDate
                            ? "No meetings scheduled for this date."
                            : "Check back later for upcoming events."}
                    </p>
                </div>
            )}

            {/* Total Count */}
            {displayMeetings.length > 0 && (
                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        Showing {displayMeetings.length} event{displayMeetings.length !== 1 ? "s" : ""}
                    </p>
                </div>
            )}
        </div>
    );
}
