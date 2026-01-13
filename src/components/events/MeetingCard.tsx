"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Clock } from "lucide-react";
import {
    type ScheduledMeeting,
    getPlatformIcon,
    getStatusColor,
    formatMeetingTime,
} from "@/lib/calendar-utils";

interface MeetingCardProps {
    meeting: ScheduledMeeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
    const platformIcon = getPlatformIcon(meeting.platform);
    const statusColor = getStatusColor(meeting.status);
    const attendancePercentage = (meeting.currentAttendees / meeting.maxAttendees) * 100;

    return (
        <div className="glass rounded-xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all group">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                    {/* Platform Icon */}
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-xl flex-shrink-0">
                        {platformIcon}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors line-clamp-2">
                            {meeting.title}
                        </h4>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                            {meeting.description}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <Badge className={`${statusColor} text-xs border flex-shrink-0`}>
                    {meeting.status}
                </Badge>
            </div>

            {/* Time Info */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{formatMeetingTime(meeting.time, meeting.timezone)}</span>
                </div>
            </div>

            {/* Attendees Progress */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-xs">
                            {meeting.currentAttendees}/{meeting.maxAttendees} attendees
                        </span>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(attendancePercentage)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all"
                        style={{ width: `${attendancePercentage}%` }}
                    />
                </div>
            </div>

            {/* Join Button */}
            <Button
                className="w-full glow-button text-black font-semibold rounded-lg text-sm"
                onClick={() => window.open(meeting.meetingLink, "_blank")}
            >
                Join Meeting <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
        </div>
    );
}
