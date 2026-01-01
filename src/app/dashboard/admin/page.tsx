"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Lightbulb, BarChart3, CheckCircle, XCircle, Clock, Sparkles, TrendingUp, Calendar, Eye } from "lucide-react";

export default function AdminDashboard() {
    const [requests, setRequests] = useState([
        { id: 1, name: "Alice Johnson", email: "alice@college.edu", date: "2024-12-28", status: "pending" },
        { id: 2, name: "Bob Smith", email: "bob@uni.edu", date: "2024-12-27", status: "pending" },
        { id: 3, name: "Carol Davis", email: "carol@tech.edu", date: "2024-12-26", status: "pending" },
    ]);

    const [ideas, setIdeas] = useState([
        { id: 1, title: "AI Resume Builder", author: "John Doe", date: "2024-12-28", status: "pending" },
        { id: 2, title: "Campus Marketplace", author: "Jane Smith", date: "2024-12-27", status: "pending" },
    ]);

    const handleRequestAction = (id: number, action: 'approve' | 'reject') => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r));
    };

    const handleIdeaAction = (id: number, action: 'approve' | 'reject') => {
        setIdeas(ideas.map(i => i.id === id ? { ...i, status: action === 'approve' ? 'approved' : 'rejected' } : i));
    };

    return (
        <div className="min-h-screen pt-24">
            {/* Hero Section */}
            <section className="relative py-10 mesh-gradient-bg noise-overlay overflow-hidden">
                <div className="absolute top-10 right-[15%] w-[250px] h-[250px] orb orb-violet opacity-40" />
                <div className="absolute bottom-0 left-[10%] w-[200px] h-[200px] orb orb-cyan opacity-30" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400 mb-3">
                                <Sparkles className="w-3 h-3" /> Admin Panel
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-white">Admin Dashboard</h1>
                            <p className="text-gray-400">Manage community requests and monitor activity</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="outline-glow text-white rounded-full">
                                <Calendar className="w-4 h-4 mr-2" /> Export Report
                            </Button>
                            <Button className="glow-button text-black font-semibold rounded-full">
                                <Eye className="w-4 h-4 mr-2" /> View Site
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Stats */}
            <section className="py-8 bg-[#080810]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Users, label: "Total Members", value: "1,247", change: "+12%", color: "cyan" },
                            { icon: Lightbulb, label: "Active Projects", value: "15", change: "+3", color: "yellow" },
                            { icon: Calendar, label: "Events This Month", value: "8", change: "+2", color: "violet" },
                            { icon: TrendingUp, label: "Engagement", value: "89%", change: "+5%", color: "green" },
                        ].map((stat, i) => (
                            <Card key={i} className="glass border border-white/10">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color === 'cyan' ? 'bg-cyan-500/20' : stat.color === 'yellow' ? 'bg-yellow-500/20' : stat.color === 'violet' ? 'bg-violet-500/20' : 'bg-green-500/20'}`}>
                                            <stat.icon className={`w-5 h-5 ${stat.color === 'cyan' ? 'text-cyan-400' : stat.color === 'yellow' ? 'text-yellow-400' : stat.color === 'violet' ? 'text-violet-400' : 'text-green-400'}`} />
                                        </div>
                                        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">{stat.change}</Badge>
                                    </div>
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-gray-500 text-sm">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Tabs */}
            <section className="py-10 bg-[#0a0a0f]">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="members" className="w-full">
                        <TabsList className="glass border border-white/10 p-1.5 mb-8">
                            <TabsTrigger value="members" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                <Users className="w-4 h-4" /> Member Requests
                                <Badge className="ml-2 bg-white/20">{requests.filter(r => r.status === 'pending').length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="ideas" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                <Lightbulb className="w-4 h-4" /> Project Ideas
                                <Badge className="ml-2 bg-white/20">{ideas.filter(i => i.status === 'pending').length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                <BarChart3 className="w-4 h-4" /> Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="members">
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Pending Membership Requests</CardTitle>
                                    <CardDescription className="text-gray-400">Review and approve new member applications</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {requests.map((req) => (
                                            <div key={req.id} className={`flex items-center justify-between p-4 rounded-xl border ${req.status === 'pending' ? 'bg-white/[0.02] border-white/10' : req.status === 'approved' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-12 h-12 border border-white/10">
                                                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold">
                                                            {req.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-white font-medium">{req.name}</div>
                                                        <div className="text-gray-500 text-sm">{req.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-gray-500 text-sm hidden md:block">{req.date}</span>
                                                    {req.status === 'pending' ? (
                                                        <>
                                                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-full" onClick={() => handleRequestAction(req.id, 'approve')}>
                                                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full" onClick={() => handleRequestAction(req.id, 'reject')}>
                                                                <XCircle className="w-4 h-4 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Badge className={req.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                                            {req.status === 'approved' ? 'Approved' : 'Rejected'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ideas">
                            <Card className="glass border border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Project Idea Submissions</CardTitle>
                                    <CardDescription className="text-gray-400">Review and approve community project ideas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {ideas.map((idea) => (
                                            <div key={idea.id} className={`p-5 rounded-xl border ${idea.status === 'pending' ? 'bg-white/[0.02] border-white/10' : idea.status === 'approved' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                                                            <h3 className="text-white font-bold text-lg">{idea.title}</h3>
                                                        </div>
                                                        <p className="text-gray-500 text-sm">Submitted by {idea.author} • {idea.date}</p>
                                                    </div>
                                                    {idea.status === 'pending' ? (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-full" onClick={() => handleIdeaAction(idea.id, 'approve')}>
                                                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full" onClick={() => handleIdeaAction(idea.id, 'reject')}>
                                                                <XCircle className="w-4 h-4 mr-1" /> Reject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Badge className={idea.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                                            {idea.status === 'approved' ? 'Approved' : 'Rejected'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="glass border border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-white">Weekly Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-48 flex items-end justify-between gap-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                                    <div className="w-full bg-gradient-to-t from-cyan-500 to-violet-500 rounded-t" style={{ height: `${[60, 80, 45, 90, 70, 40, 55][i]}%` }} />
                                                    <span className="text-gray-500 text-xs">{day}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="glass border border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-white">Engagement Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            { label: "Event Attendance", value: 92, color: "cyan" },
                                            { label: "Project Completion", value: 78, color: "violet" },
                                            { label: "Resource Usage", value: 85, color: "yellow" },
                                            { label: "Mentorship Sessions", value: 65, color: "green" },
                                        ].map((metric, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-400">{metric.label}</span>
                                                    <span className="text-white font-medium">{metric.value}%</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${metric.color === 'cyan' ? 'bg-cyan-500' : metric.color === 'violet' ? 'bg-violet-500' : metric.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metric.value}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}
