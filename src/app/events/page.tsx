"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, ArrowRight, Sparkles } from "lucide-react";
import { EVENTS } from "@/lib/mock-data";

export default function EventsPage() {
    const upcomingEvents = EVENTS;
    const pastEvents = [
        { id: 101, title: "Intro to Web3", date: "2024-12-10", type: "Online", attendees: 120 },
        { id: 102, title: "React Performance Workshop", date: "2024-11-25", type: "Offline", attendees: 85 },
    ];

    return (
        <div className="min-h-screen pt-24">
            {/* Hero Section */}
            <section className="relative py-16 mesh-gradient-bg noise-overlay overflow-hidden">
                <div className="absolute top-10 right-[10%] w-[300px] h-[300px] orb orb-cyan opacity-40" />
                <div className="absolute bottom-0 left-[5%] w-[200px] h-[200px] orb orb-violet opacity-30" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full glow-badge px-4 py-2 text-sm font-medium text-cyan-300 mb-6">
                            <Sparkles className="w-4 h-4" />
                            Community Events
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            <span className="gradient-text-cyan inline-block text-vanish-line-1">Learn, Connect</span> <span className="text-white inline-block text-vanish-line-2">&</span> <span className="gradient-text-yellow inline-block text-vanish-line-3">Grow Together</span>
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Join workshops, hackathons, and networking sessions designed to level up your skills.
                        </p>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Events Tabs */}
            <section className="py-16 bg-[#080810]">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="upcoming" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="glass border border-white/10 p-1.5">
                                <TabsTrigger value="upcoming" className="px-8 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium">
                                    Upcoming Events
                                </TabsTrigger>
                                <TabsTrigger value="past" className="px-8 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium">
                                    Past Events
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="upcoming">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingEvents.map((event, index) => (
                                    <Card key={event.id} className={`glass border border-white/10 hover:border-cyan-500/30 transition-all group overflow-hidden hover-lift animate-fade-in-up stagger-${index + 1}`}>
                                        <div className={`h-40 ${index % 2 === 0 ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20' : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'} flex items-center justify-center`}>
                                            <div className="text-center">
                                                <div className="text-5xl mb-2">{event.type === 'Online' ? '💻' : '🏢'}</div>
                                                <Badge className="bg-white/10 text-white border-0">{event.type}</Badge>
                                            </div>
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-white text-xl group-hover:text-cyan-400 transition-colors">{event.title}</CardTitle>
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <Users className="w-4 h-4" />
                                                    <span>{event.filled}/{event.seats}</span>
                                                </div>
                                                <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{ width: `${(event.filled / event.seats) * 100}%` }} />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full glow-button text-black font-semibold rounded-full">
                                                Register Now <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="past">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastEvents.map((event, idx) => (
                                    <Card key={event.id} className={`glass border border-white/10 opacity-70 hover:opacity-100 transition-all animate-fade-in-up stagger-${idx + 1}`}>
                                        <div className="h-32 bg-white/5 flex items-center justify-center">
                                            <span className="text-gray-500">Event Completed</span>
                                        </div>
                                        <CardHeader>
                                            <Badge className="w-fit bg-white/10 text-gray-400 border-0 mb-2">Completed</Badge>
                                            <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                                            <p className="text-gray-500 text-sm">{event.date} • {event.attendees} attended</p>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button variant="outline" className="w-full rounded-full border-white/20 text-gray-300 hover:bg-white/5">
                                                View Recap
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Host CTA */}
            <section className="py-16 bg-[#0a0a0f]">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-xl mx-auto p-8 glass rounded-3xl border border-white/10 breathing-glow tilt-hover">
                        <h2 className="text-2xl font-bold text-white mb-3">Want to host your own event?</h2>
                        <p className="text-gray-400 mb-6">Share your expertise with the community.</p>
                        <Button className="glow-button-yellow text-black font-semibold rounded-full px-8">
                            Apply to Host
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
