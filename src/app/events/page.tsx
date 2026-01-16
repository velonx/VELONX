"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, ArrowRight, Sparkles, MapPin, Clock, ExternalLink, Code, Smartphone, Cloud, PenTool as Tool, LayoutGrid, RotateCcw } from "lucide-react";
import { EVENTS, SCHEDULED_MEETINGS } from "@/lib/mock-data";
import EventsSidebar from "@/components/events/EventsSidebar";
import EventCalendar from "@/components/events/EventCalendar";
import ScheduledMeetings from "@/components/events/ScheduledMeetings";
import AddEventForm from "@/components/events/AddEventForm";
import EventAnalytics from "@/components/events/EventAnalytics";
import toast from "react-hot-toast";

export default function EventsPage() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const [currentView, setCurrentView] = useState<"events" | "calendar" | "analytics">("events");
    const [currentStatus, setCurrentStatus] = useState<"upcoming" | "past">("upcoming");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [showAddEventDialog, setShowAddEventDialog] = useState(false);

    const upcomingEvents = EVENTS;
    const pastEvents = [
        {
            id: 101,
            title: "Intro to Web3",
            date: "2024-12-10",
            type: "Online",
            attendees: 120,
            description: "Learn the basics of blockchain and decentralized apps.",
            topics: ["Blockchain", "Ethereum", "DApps"]
        },
        {
            id: 102,
            title: "React Performance Workshop",
            date: "2024-11-25",
            type: "Offline",
            attendees: 85,
            description: "Deep dive into React profiling and optimization techniques.",
            topics: ["React", "Performance", "Web Dev"]
        },
    ];

    const handleRegister = (eventTitle: string) => {
        toast.success(`Successfully registered for "${eventTitle}"! Check your email for details.`);
    };

    const handleAddToCalendar = (eventTitle: string) => {
        toast.success(`"${eventTitle}" added to your calendar.`);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        toast.success(`Selected date: ${date.toDateString()}`);
    };

    const handleAddEvent = () => {
        setShowAddEventDialog(true);
    };

    const handleEventAdded = () => {
        toast.success("Event created successfully! It will appear on the calendar.");
        setShowAddEventDialog(false);
    };

    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="relative py-16">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold text-[#023047] tracking-tight">
                            Join Our Events
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Participate in live coding sessions, workshops, hackathons, and networking events to grow your skills and connect with the community.
                        </p>
                        <div className="pt-4">
                            <button className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-full px-10 py-4 text-lg transition-all shadow-lg shadow-[#219EBC]/25 flex items-center gap-2 mx-auto">
                                Browse Events <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Main Content with Sidebar */}
            <section className="py-16 animate-on-scroll bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="w-full lg:w-72 shrink-0">
                            <EventsSidebar
                                currentView={currentView}
                                onViewChange={setCurrentView}
                                currentStatus={currentStatus}
                                onStatusChange={setCurrentStatus}
                                onAddEvent={handleAddEvent}
                                isAdmin={isAdmin}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {currentView === "events" ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(currentStatus === "upcoming" ? upcomingEvents : pastEvents).map((event, index) => {
                                            const colors = [
                                                "from-red-500 to-rose-600",
                                                "from-indigo-600 to-blue-700",
                                                "from-blue-600 to-cyan-500",
                                                "from-orange-500 to-amber-600",
                                                "from-emerald-500 to-teal-600",
                                                "from-rose-500 to-pink-600"
                                            ];
                                            const icons = [Code, Sparkles, Smartphone, Users, Cloud, Tool];
                                            const Icon = icons[index % icons.length];
                                            const bgColor = colors[index % colors.length];

                                            return (
                                                <Card key={event.id} className="bg-[#0f172a] border-0 rounded-[24px] overflow-hidden shadow-2xl hover:scale-[1.02] transition-all group">
                                                    {/* Top Section */}
                                                    <div className={`h-40 bg-gradient-to-br ${bgColor} relative flex items-center justify-center`}>
                                                        <div className="absolute top-4 right-4">
                                                            <Badge className="bg-orange-500/20 text-orange-400 border-0 uppercase text-[10px] font-bold tracking-widest px-3 py-1 backdrop-blur-md">
                                                                {event.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-white transform group-hover:scale-110 transition-transform duration-500">
                                                            <Icon className="w-16 h-16 opacity-90" />
                                                        </div>
                                                    </div>

                                                    {/* Bottom Section */}
                                                    <CardHeader className="p-6 pb-0">
                                                        <div className="text-[#219EBC] font-bold text-sm mb-3 flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            {event.date}
                                                        </div>
                                                        <CardTitle className="text-white text-2xl font-bold leading-tight mb-3">
                                                            {event.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                                                            Join us for this exciting exploration into {event.title.toLowerCase()}. Learn from industry experts and build real skills.
                                                        </CardDescription>

                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-2 mb-6">
                                                            {["JavaScript", "React", "Node.js"].map(tag => (
                                                                <Badge key={tag} className="bg-white/5 text-gray-400 hover:text-white border-0 text-[10px] font-medium transition-colors">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>

                                                        {/* Progress */}
                                                        <div className="space-y-2 mb-8">
                                                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                                                <span className="text-gray-500 flex items-center gap-1.5">
                                                                    <Users className="w-3.5 h-3.5" /> Attendees
                                                                </span>
                                                                <span className="text-white">42/50</span>
                                                            </div>
                                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                                                    style={{ width: '84%' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardHeader>

                                                    <CardFooter className="p-6 pt-0">
                                                        <button
                                                            onClick={() => handleRegister(event.title)}
                                                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 text-sm"
                                                        >
                                                            Register Now <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                    </CardFooter>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : currentView === "calendar" ? (
                                <EventCalendar
                                    meetings={SCHEDULED_MEETINGS}
                                    onDateSelect={handleDateSelect}
                                    selectedDate={selectedDate}
                                />
                            ) : (
                                <EventAnalytics meetings={SCHEDULED_MEETINGS} />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Add Event Dialog Overlay */}
            {showAddEventDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <AddEventForm
                            open={showAddEventDialog}
                            onOpenChange={setShowAddEventDialog}
                            onEventAdded={handleEventAdded}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
