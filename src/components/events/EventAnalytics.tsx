"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Calendar, TrendingUp, Clock, Award } from "lucide-react";
import { type ScheduledMeeting } from "@/lib/calendar-utils";

interface EventAnalyticsProps {
    meetings: ScheduledMeeting[];
}

export default function EventAnalytics({ meetings }: EventAnalyticsProps) {
    // Calculate statistics
    const totalEvents = meetings.length;
    const upcomingEvents = meetings.filter((m) => m.status === "upcoming").length;
    const completedEvents = meetings.filter((m) => m.status === "completed").length;

    const totalAttendees = meetings.reduce((sum, m) => sum + m.currentAttendees, 0);
    const totalCapacity = meetings.reduce((sum, m) => sum + m.maxAttendees, 0);
    const avgAttendance = totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;

    // Platform distribution
    const platformStats = meetings.reduce((acc, m) => {
        acc[m.platform] = (acc[m.platform] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Event type distribution
    const typeStats = meetings.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Most popular event
    const mostPopular = meetings.reduce((max, m) => {
        const attendance = (m.currentAttendees / m.maxAttendees) * 100;
        const maxAttendance = (max.currentAttendees / max.maxAttendees) * 100;
        return attendance > maxAttendance ? m : max;
    }, meetings[0] || { title: "N/A", currentAttendees: 0, maxAttendees: 1 });

    const stats = [
        {
            title: "Total Events",
            value: totalEvents,
            icon: Calendar,
            color: "text-cyan-400",
            bgColor: "bg-cyan-500/10",
        },
        {
            title: "Upcoming",
            value: upcomingEvents,
            icon: Clock,
            color: "text-violet-400",
            bgColor: "bg-violet-500/10",
        },
        {
            title: "Completed",
            value: completedEvents,
            icon: Award,
            color: "text-yellow-400",
            bgColor: "bg-yellow-500/10",
        },
        {
            title: "Total Attendees",
            value: totalAttendees,
            icon: Users,
            color: "text-green-400",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Avg Attendance",
            value: `${Math.round(avgAttendance)}%`,
            icon: TrendingUp,
            color: "text-orange-400",
            bgColor: "bg-orange-500/10",
        },
        {
            title: "Total Capacity",
            value: totalCapacity,
            icon: TrendingUp,
            color: "text-pink-400",
            bgColor: "bg-pink-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-7 h-7 text-cyan-400" />
                <div>
                    <h2 className="text-2xl font-bold text-white">Event Analytics</h2>
                    <p className="text-gray-400 text-sm">Overview of your community events</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className="glass border border-white/10 hover:border-cyan-500/30 transition-all group"
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                                    </div>
                                    <div
                                        className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                    >
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Platform Distribution */}
            <Card className="glass-strong border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(platformStats).map(([platform, count]) => (
                            <div key={platform} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                                        {platform === "google-meet" && "🎥"}
                                        {platform === "zoom" && "📹"}
                                        {platform === "teams" && "👥"}
                                        {platform === "discord" && "💬"}
                                    </div>
                                    <span className="text-white capitalize">
                                        {platform.replace("-", " ")}
                                    </span>
                                </div>
                                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                                    {count} {count === 1 ? "event" : "events"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Event Type Distribution */}
            <Card className="glass-strong border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Event Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(typeStats).map(([type, count]) => {
                            const percentage = ((count / totalEvents) * 100).toFixed(0);
                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-white capitalize">{type}</span>
                                        <span className="text-gray-400 text-sm">{percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Most Popular Event */}
            <Card className="glass-strong border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        Most Popular Event
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-cyan-400">{mostPopular.title}</h4>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>
                                    {mostPopular.currentAttendees} / {mostPopular.maxAttendees} attendees
                                </span>
                            </div>
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                                {Math.round((mostPopular.currentAttendees / mostPopular.maxAttendees) * 100)}%
                                full
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
