"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECTS } from "@/lib/mock-data";
import { Github, Users, PlusCircle, CheckCircle, Clock, ArrowRight, ExternalLink, Sparkles, Code } from "lucide-react";

export default function ProjectsPage() {
    const runningProjects = PROJECTS.filter(p => p.status === "Running");
    const completedProjects = PROJECTS.filter(p => p.status === "Completed");

    return (
        <div className="min-h-screen pt-24">
            {/* Hero Section */}
            <section className="relative py-16 mesh-gradient-bg noise-overlay overflow-hidden">
                <div className="absolute top-20 right-[15%] w-[350px] h-[350px] orb orb-violet opacity-40" />
                <div className="absolute bottom-10 left-[10%] w-[250px] h-[250px] orb orb-yellow opacity-30" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full glow-badge px-4 py-2 text-sm font-medium text-cyan-300 mb-6">
                                <Sparkles className="w-4 h-4" />
                                Innovation Lab
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">
                                <span className="text-white inline-block text-vanish-line-1">Build Real</span> <span className="gradient-text-violet inline-block text-vanish-line-2">Projects</span> <span className="text-white inline-block text-vanish-line-3">That Matter</span>
                            </h1>
                            <p className="text-gray-400 text-lg mb-6">
                                Join active projects, collaborate with peers, and create solutions that make a difference.
                            </p>
                            <div className="flex gap-4">
                                <Button className="glow-button text-black font-semibold rounded-full px-6">
                                    <PlusCircle className="w-4 h-4 mr-2" /> Submit Idea
                                </Button>
                                <Button variant="outline" className="outline-glow text-white rounded-full px-6">
                                    Browse All
                                </Button>
                            </div>
                        </div>
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            <div className="glass rounded-2xl p-5 border border-white/10 animate-slide-in-left stagger-1 hover-lift">
                                <Code className="w-8 h-8 text-cyan-400 mb-3" />
                                <div className="text-2xl font-bold text-white">50+</div>
                                <div className="text-gray-500 text-sm">Projects Built</div>
                            </div>
                            <div className="glass rounded-2xl p-5 border border-white/10 mt-6 animate-slide-in-right stagger-2 hover-lift">
                                <Users className="w-8 h-8 text-violet-400 mb-3" />
                                <div className="text-2xl font-bold text-white">200+</div>
                                <div className="text-gray-500 text-sm">Contributors</div>
                            </div>
                            <div className="glass rounded-2xl p-5 border border-white/10 animate-slide-in-left stagger-3 hover-lift">
                                <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
                                <div className="text-2xl font-bold text-white">95%</div>
                                <div className="text-gray-500 text-sm">Completion</div>
                            </div>
                            <div className="glass rounded-2xl p-5 border border-white/10 mt-6 animate-slide-in-right stagger-4 hover-lift">
                                <Clock className="w-8 h-8 text-yellow-400 mb-3" />
                                <div className="text-2xl font-bold text-white">15</div>
                                <div className="text-gray-500 text-sm">Active Now</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Projects Tabs */}
            <section className="py-16 bg-[#080810]">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="running" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="glass border border-white/10 p-1.5">
                                <TabsTrigger value="running" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                    <Clock className="w-4 h-4" /> Running
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="px-6 py-3 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-medium gap-2">
                                    <CheckCircle className="w-4 h-4" /> Hall of Fame
                                </TabsTrigger>
                                <TabsTrigger value="submit" className="px-6 py-3 rounded-lg data-[state=active]:bg-yellow-500 data-[state=active]:text-black font-medium gap-2">
                                    <PlusCircle className="w-4 h-4" /> Submit Idea
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="running">
                            <div className="grid md:grid-cols-2 gap-6">
                                {runningProjects.map((project, index) => (
                                    <Card key={project.id} className={`glass border border-white/10 hover:border-cyan-500/30 transition-all overflow-hidden hover-lift animate-fade-in-up stagger-${index + 1}`}>
                                        <div className={`h-1 ${index % 2 === 0 ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`} />
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Badge className="mb-2 bg-green-500/20 text-green-400 border-0">
                                                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />Active
                                                    </Badge>
                                                    <CardTitle className="text-white text-xl">{project.title}</CardTitle>
                                                </div>
                                                <Badge variant="outline" className="border-white/20 text-gray-400">{project.deadline}</Badge>
                                            </div>
                                            <CardDescription className="text-gray-400">{project.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {project.stack?.map(tech => (
                                                    <Badge key={tech} className="bg-white/5 text-gray-300 border-0">{tech}</Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {project.members?.map((member, i) => (
                                                        <div key={member} className={`w-8 h-8 rounded-full border-2 border-[#080810] flex items-center justify-center text-xs font-bold ${i % 2 === 0 ? 'bg-cyan-500 text-black' : 'bg-violet-500 text-white'}`}>
                                                            {member.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-gray-500 text-sm">+2 more</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full glow-button text-black font-semibold rounded-full">
                                                Request to Join <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="completed">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {completedProjects.map((project, idx) => (
                                    <Card key={project.id} className={`glass border border-white/10 hover:border-green-500/30 transition-all overflow-hidden hover-lift animate-fade-in-up stagger-${idx + 1}`}>
                                        <div className="h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle className="w-12 h-12 text-green-500" />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-white">{project.title}</CardTitle>
                                            <CardDescription className="text-gray-400">{project.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.stack?.map(tech => (
                                                    <Badge key={tech} className="bg-white/5 text-gray-300 border-0">{tech}</Badge>
                                                ))}
                                            </div>
                                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                <p className="text-sm text-green-400">📈 {project.outcome}</p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="gap-2">
                                            <Button variant="outline" className="flex-1 rounded-full border-white/20 text-gray-300 hover:bg-white/5">
                                                <Github className="w-4 h-4 mr-2" /> Code
                                            </Button>
                                            <Button variant="outline" className="flex-1 rounded-full border-white/20 text-gray-300 hover:bg-white/5">
                                                <ExternalLink className="w-4 h-4 mr-2" /> Demo
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="submit">
                            <div className="max-w-2xl mx-auto">
                                <Card className="glass border border-white/10">
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                                            <PlusCircle className="w-8 h-8 text-black" />
                                        </div>
                                        <CardTitle className="text-white text-2xl">Submit Your Project Idea</CardTitle>
                                        <CardDescription className="text-gray-400">Share your innovation with the community</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Project Title *</Label>
                                            <Input placeholder="e.g. AI-Powered Study Buddy" className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Description *</Label>
                                            <Textarea placeholder="What does your project do?" className="bg-white/5 border-white/10 text-white" rows={4} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Tech Stack</Label>
                                            <Input placeholder="e.g. React, Python, TensorFlow" className="bg-white/5 border-white/10 text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Your Name *</Label>
                                                <Input className="bg-white/5 border-white/10 text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Email *</Label>
                                                <Input type="email" className="bg-white/5 border-white/10 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full glow-button-yellow text-black font-semibold rounded-full py-5">
                                            Submit Idea for Review
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}
