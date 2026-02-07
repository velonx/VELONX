"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    BarChart3, 
    Users, 
    Calendar, 
    TrendingUp, 
    Clock, 
    Award, 
    Download,
    Flame,
    Target
} from "lucide-react";
import { 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell, 
    LineChart, 
    Line,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from "recharts";
import { type Event } from "@/lib/api/types";

interface EventAnalyticsProps {
    events: Event[];
}

interface PersonalAnalytics {
    eventsAttended: number;
    upcomingEvents: number;
    participationStreak: number;
    favoriteEventType: string | null;
    totalHours: number;
}

interface DateRangeFilter {
    label: string;
    startDate: Date;
    endDate: Date;
}

const CHART_COLORS = {
    primary: "#06b6d4", // cyan-500
    secondary: "#8b5cf6", // violet-500
    tertiary: "#f59e0b", // amber-500
    quaternary: "#10b981", // emerald-500
    quinary: "#ec4899", // pink-500
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary];

export default function EventAnalytics({ events }: EventAnalyticsProps) {
    const { data: session } = useSession();
    const [personalAnalytics, setPersonalAnalytics] = useState<PersonalAnalytics | null>(null);
    const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangeFilter>({
        label: "All Time",
        startDate: new Date(0),
        endDate: new Date(),
    });

    // Fetch personal analytics
    useEffect(() => {
        if (session?.user) {
            fetchPersonalAnalytics();
        }
    }, [session]);

    const fetchPersonalAnalytics = async () => {
        setIsLoadingPersonal(true);
        try {
            const response = await fetch("/api/events/analytics/personal");
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setPersonalAnalytics(result.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch personal analytics:", error);
        } finally {
            setIsLoadingPersonal(false);
        }
    };

    // Filter events by date range
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= dateRange.startDate && eventDate <= dateRange.endDate;
        });
    }, [events, dateRange]);

    // Calculate platform statistics
    const totalEvents = filteredEvents.length;
    const upcomingEvents = filteredEvents.filter((e) => e.status === "UPCOMING").length;
    const completedEvents = filteredEvents.filter((e) => e.status === "COMPLETED").length;
    const totalAttendees = filteredEvents.reduce((sum, e) => sum + (e._count?.attendees || 0), 0);
    const totalCapacity = filteredEvents.reduce((sum, e) => sum + e.maxSeats, 0);
    const avgAttendance = totalCapacity > 0 ? (totalAttendees / totalCapacity) * 100 : 0;

    // Event type distribution for pie chart
    const typeDistribution = useMemo(() => {
        const typeCount: Record<string, number> = {};
        filteredEvents.forEach((event) => {
            typeCount[event.type] = (typeCount[event.type] || 0) + 1;
        });
        return Object.entries(typeCount).map(([name, value]) => ({
            name: name.charAt(0) + name.slice(1).toLowerCase(),
            value,
        }));
    }, [filteredEvents]);

    // Monthly event trend for line chart
    const monthlyTrend = useMemo(() => {
        const monthCount: Record<string, number> = {};
        filteredEvents.forEach((event) => {
            const date = new Date(event.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
        });
        
        return Object.entries(monthCount)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6) // Last 6 months
            .map(([month, count]) => ({
                month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
                events: count,
            }));
    }, [filteredEvents]);

    // Attendance by event type for bar chart
    const attendanceByType = useMemo(() => {
        const typeAttendance: Record<string, { total: number; capacity: number }> = {};
        filteredEvents.forEach((event) => {
            if (!typeAttendance[event.type]) {
                typeAttendance[event.type] = { total: 0, capacity: 0 };
            }
            typeAttendance[event.type].total += event._count?.attendees || 0;
            typeAttendance[event.type].capacity += event.maxSeats;
        });
        
        return Object.entries(typeAttendance).map(([type, data]) => ({
            type: type.charAt(0) + type.slice(1).toLowerCase(),
            attendees: data.total,
            capacity: data.capacity,
            percentage: data.capacity > 0 ? Math.round((data.total / data.capacity) * 100) : 0,
        }));
    }, [filteredEvents]);

    // Date range presets
    const dateRangePresets: DateRangeFilter[] = [
        {
            label: "Last 7 Days",
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
        },
        {
            label: "Last 30 Days",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
        },
        {
            label: "Last 90 Days",
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
        },
        {
            label: "All Time",
            startDate: new Date(0),
            endDate: new Date(),
        },
    ];

    // Export to CSV
    const exportToCSV = () => {
        const headers = ["Title", "Type", "Date", "Status", "Attendees", "Capacity", "Attendance %"];
        const rows = filteredEvents.map((event) => [
            event.title,
            event.type,
            new Date(event.date).toLocaleDateString(),
            event.status,
            event._count?.attendees || 0,
            event.maxSeats,
            event.maxSeats > 0 
                ? `${Math.round(((event._count?.attendees || 0) / event.maxSeats) * 100)}%` 
                : "0%",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `event-analytics-${Date.now()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const platformStats = [
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
            icon: Target,
            color: "text-pink-400",
            bgColor: "bg-pink-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Export */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-cyan-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Event Analytics</h2>
                        <p className="text-gray-400 text-sm">
                            {session?.user ? "Your personal and platform analytics" : "Platform-wide analytics"}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={exportToCSV}
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-wrap gap-2">
                {dateRangePresets.map((preset) => (
                    <Button
                        key={preset.label}
                        onClick={() => setDateRange(preset)}
                        variant={dateRange.label === preset.label ? "default" : "outline"}
                        size="sm"
                        className={
                            dateRange.label === preset.label
                                ? "bg-cyan-500 text-white hover:bg-cyan-600"
                                : "border-white/10 text-gray-400 hover:bg-white/5"
                        }
                    >
                        {preset.label}
                    </Button>
                ))}
            </div>

            {/* Personal Analytics Section */}
            {session?.user && personalAnalytics && (
                <Card className="glass-strong border border-cyan-500/30">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-cyan-400" />
                            Your Personal Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400">
                                    {personalAnalytics.eventsAttended}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">Events Attended</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-violet-400">
                                    {personalAnalytics.upcomingEvents}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">Upcoming</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1">
                                    <Flame className="w-6 h-6" />
                                    {personalAnalytics.participationStreak}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">Streak</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">
                                    {personalAnalytics.totalHours}h
                                </div>
                                <div className="text-sm text-gray-400 mt-1">Total Hours</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-pink-400 capitalize">
                                    {personalAnalytics.favoriteEventType?.toLowerCase() || "N/A"}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">Favorite Type</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformStats.map((stat) => {
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

            {/* Charts Row 1: Event Type Distribution & Monthly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Type Distribution Pie Chart */}
                <Card className="glass-strong border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Event Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {typeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={typeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {typeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: "rgba(0, 0, 0, 0.8)", 
                                            border: "1px solid rgba(6, 182, 212, 0.3)",
                                            borderRadius: "8px"
                                        }}
                                        labelStyle={{ color: "#fff" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                No data available for selected date range
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Event Trend Line Chart */}
                <Card className="glass-strong border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Event Trend (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#9ca3af"
                                        style={{ fontSize: "12px" }}
                                    />
                                    <YAxis 
                                        stroke="#9ca3af"
                                        style={{ fontSize: "12px" }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: "rgba(0, 0, 0, 0.8)", 
                                            border: "1px solid rgba(6, 182, 212, 0.3)",
                                            borderRadius: "8px"
                                        }}
                                        labelStyle={{ color: "#fff" }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="events" 
                                        stroke={CHART_COLORS.primary} 
                                        strokeWidth={2}
                                        dot={{ fill: CHART_COLORS.primary, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                No data available for selected date range
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Attendance by Event Type Bar Chart */}
            <Card className="glass-strong border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Attendance by Event Type</CardTitle>
                </CardHeader>
                <CardContent>
                    {attendanceByType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis 
                                    dataKey="type" 
                                    stroke="#9ca3af"
                                    style={{ fontSize: "12px" }}
                                />
                                <YAxis 
                                    stroke="#9ca3af"
                                    style={{ fontSize: "12px" }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: "rgba(0, 0, 0, 0.8)", 
                                        border: "1px solid rgba(6, 182, 212, 0.3)",
                                        borderRadius: "8px"
                                    }}
                                    labelStyle={{ color: "#fff" }}
                                />
                                <Legend 
                                    wrapperStyle={{ color: "#9ca3af" }}
                                />
                                <Bar dataKey="attendees" fill={CHART_COLORS.primary} name="Attendees" />
                                <Bar dataKey="capacity" fill={CHART_COLORS.secondary} name="Capacity" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No data available for selected date range
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
