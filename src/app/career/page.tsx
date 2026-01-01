"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Video, Calendar, CheckCircle, Clock, Sparkles, Briefcase, GraduationCap } from "lucide-react";

export default function CareerPage() {
    return (
        <div className="min-h-screen pt-24">
            {/* Hero Section */}
            <section className="relative py-16 mesh-gradient-bg noise-overlay overflow-hidden">
                <div className="absolute top-10 right-[10%] w-[300px] h-[300px] orb orb-cyan opacity-40" />
                <div className="absolute bottom-10 left-[15%] w-[250px] h-[250px] orb orb-violet opacity-30" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full glow-badge px-4 py-2 text-sm font-medium text-cyan-300 mb-6">
                                <Sparkles className="w-4 h-4" />
                                Career Services
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">
                                <span className="text-white inline-block text-vanish-line-1">Launch Your</span> <span className="gradient-text-cyan inline-block text-vanish-line-2">Tech Career</span>
                            </h1>
                            <p className="text-gray-400 text-lg mb-6">
                                Get resume reviews, mock interviews, and personalized career guidance from industry professionals.
                            </p>
                            <div className="flex gap-4">
                                <Button className="glow-button text-black font-semibold rounded-full px-6">
                                    <Upload className="w-4 h-4 mr-2" /> Upload Resume
                                </Button>
                                <Button variant="outline" className="outline-glow text-white rounded-full px-6">
                                    <Video className="w-4 h-4 mr-2" /> Book Mock Interview
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            <div className="glass rounded-2xl p-5 border border-white/10 animate-slide-in-left stagger-1 hover-lift">
                                <Briefcase className="w-8 h-8 text-cyan-400 mb-3" />
                                <div className="text-2xl font-bold text-white">150+</div>
                                <div className="text-gray-500 text-sm">Placements</div>
                            </div>
                            <div className="glass rounded-2xl p-5 border border-white/10 mt-6 animate-slide-in-right stagger-2 hover-lift">
                                <GraduationCap className="w-8 h-8 text-violet-400 mb-3" />
                                <div className="text-2xl font-bold text-white">50+</div>
                                <div className="text-gray-500 text-sm">Partner Companies</div>
                            </div>
                            <div className="glass rounded-2xl p-5 border border-white/10 animate-slide-in-left stagger-3 hover-lift">
                                <FileText className="w-8 h-8 text-yellow-400 mb-3" />
                                <div className="text-2xl font-bold text-white">300+</div>
                                <div className="text-gray-500 text-sm">Resumes Reviewed</div>
                            </div>
                            <div className="glass rounded-2xl p-5 border border-white/10 mt-6 animate-slide-in-right stagger-4 hover-lift">
                                <Video className="w-8 h-8 text-green-400 mb-3" />
                                <div className="text-2xl font-bold text-white">200+</div>
                                <div className="text-gray-500 text-sm">Mock Interviews</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Services Tabs */}
            <section className="py-16 bg-[#080810]">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="resume" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="glass border border-white/10 p-1.5">
                                <TabsTrigger value="resume" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                    <FileText className="w-4 h-4" /> Resume Review
                                </TabsTrigger>
                                <TabsTrigger value="mock" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                    <Video className="w-4 h-4" /> Mock Interview
                                </TabsTrigger>
                                <TabsTrigger value="status" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                    <Clock className="w-4 h-4" /> My Applications
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="resume">
                            <div className="max-w-2xl mx-auto">
                                <Card className="glass border border-white/10">
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                        <CardTitle className="text-white text-2xl">Submit Your Resume</CardTitle>
                                        <CardDescription className="text-gray-400">Get personalized feedback from industry experts</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-cyan-500/50 transition-colors cursor-pointer animate-upload-pulse">
                                            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                            <p className="text-white font-medium mb-2">Drag & drop your resume here</p>
                                            <p className="text-gray-500 text-sm mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                                            <Button className="glow-button text-black rounded-full">Browse Files</Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Target Role</Label>
                                            <Input placeholder="e.g. Frontend Developer, ML Engineer" className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Additional Notes</Label>
                                            <Textarea placeholder="Any specific areas you'd like feedback on?" className="bg-white/5 border-white/10 text-white" rows={3} />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full glow-button text-black font-semibold rounded-full py-5">
                                            Submit for Review
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="mock">
                            <div className="max-w-2xl mx-auto">
                                <Card className="glass border border-white/10">
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                                            <Video className="w-8 h-8 text-white" />
                                        </div>
                                        <CardTitle className="text-white text-2xl">Schedule Mock Interview</CardTitle>
                                        <CardDescription className="text-gray-400">Practice with real interview questions</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Full Name *</Label>
                                                <Input className="bg-white/5 border-white/10 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Email *</Label>
                                                <Input type="email" className="bg-white/5 border-white/10 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Interview Type *</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {["Technical DSA", "System Design", "Behavioral", "HR Round"].map((type) => (
                                                    <Button key={type} variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 hover:border-cyan-500/50">
                                                        {type}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Preferred Date & Time</Label>
                                            <Input type="datetime-local" className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Target Company (Optional)</Label>
                                            <Input placeholder="e.g. Google, Amazon, Microsoft" className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full glow-button-yellow text-black font-semibold rounded-full py-5">
                                            <Calendar className="w-4 h-4 mr-2" /> Book Interview Slot
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="status">
                            <div className="max-w-3xl mx-auto space-y-4">
                                {[
                                    { title: "Resume Review", target: "Frontend Developer", status: "In Review", date: "Dec 28, 2024", statusColor: "yellow" },
                                    { title: "Mock Interview", target: "System Design", status: "Scheduled", date: "Jan 5, 2025", statusColor: "cyan" },
                                    { title: "Resume Review", target: "Full Stack", status: "Completed", date: "Dec 20, 2024", statusColor: "green" },
                                ].map((item, i) => (
                                    <Card key={i} className={`glass border border-white/10 hover:border-cyan-500/30 transition-all animate-slide-in-left stagger-${i + 1}`}>
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.title.includes('Resume') ? 'bg-blue-500/20' : 'bg-violet-500/20'}`}>
                                                        {item.title.includes('Resume') ? <FileText className="w-6 h-6 text-blue-400" /> : <Video className="w-6 h-6 text-violet-400" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium">{item.title}</div>
                                                        <div className="text-gray-500 text-sm">{item.target} • {item.date}</div>
                                                    </div>
                                                </div>
                                                <Badge className={`${item.statusColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : item.statusColor === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-green-500/20 text-green-400'} border-0`}>
                                                    {item.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {item.status === 'In Review' && <Clock className="w-3 h-3 mr-1" />}
                                                    {item.status}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}
