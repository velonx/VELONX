"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECTS } from "@/lib/mock-data";
import { Github, Users, PlusCircle, CheckCircle, Clock, ArrowRight, ExternalLink, Sparkles, Code, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectsPage() {
    const runningProjects = PROJECTS.filter(p => p.status === "Running");
    const completedProjects = PROJECTS.filter(p => p.status === "Completed");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joiningProject, setJoiningProject] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        techStack: "",
        name: "",
        email: ""
    });

    const handleJoinProject = async (projectId: number, projectTitle: string) => {
        setJoiningProject(projectId);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`Request sent to join "${projectTitle}"! You'll receive an email soon.`);
        setJoiningProject(null);
    };

    const handleSubmitIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.name || !formData.email) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("🎉 Project idea submitted! Our team will review it within 48 hours.");
        setFormData({ title: "", description: "", techStack: "", name: "", email: "" });
        setIsSubmitting(false);
    };

    const handleViewCode = (projectTitle: string) => {
        toast.success(`Opening ${projectTitle} repository...`);
        // In real app, this would open GitHub link
    };

    const handleViewDemo = (projectTitle: string) => {
        toast.success(`Opening ${projectTitle} demo...`);
        // In real app, this would open demo link
    };

    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
                            Build <span className="bg-[#219EBC]/10 text-[#219EBC] px-3 py-1 rounded-lg">Real Projects</span> That Matter
                        </h1>
                        <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
                            Join active projects, collaborate with peers, and create solutions that make a difference.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button
                                className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold rounded-full px-8 py-6 text-lg shadow-lg shadow-[#219EBC]/25"
                                onClick={() => document.getElementById('submit-tab')?.click()}
                            >
                                <PlusCircle className="w-5 h-5 mr-2" /> Submit Idea
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Projects Tabs */}
            <section className="py-16 animate-on-scroll">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="running" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-gray-100 border border-gray-200 p-1.5">
                                <TabsTrigger value="running" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <Clock className="w-4 h-4" /> Running
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <CheckCircle className="w-4 h-4" /> Hall of Fame
                                </TabsTrigger>
                                <TabsTrigger id="submit-tab" value="submit" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#E9C46A] data-[state=active]:text-gray-900 font-medium gap-2">
                                    <PlusCircle className="w-4 h-4" /> Submit Idea
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="running">
                            <div className="grid md:grid-cols-2 gap-6">
                                {runningProjects.map((project, index) => (
                                    <Card key={project.id} className="bg-white border border-gray-200 hover:border-[#219EBC] hover:shadow-lg transition-all overflow-hidden">
                                        <div className={`h-1 ${index % 2 === 0 ? 'bg-gradient-to-r from-[#219EBC] to-[#6A96A0]' : 'bg-gradient-to-r from-[#E9C46A] to-[#F4A261]'}`} />
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Badge className="mb-2 bg-green-100 text-green-700 border-0">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />Active
                                                    </Badge>
                                                    <CardTitle className="text-gray-900 text-xl">{project.title}</CardTitle>
                                                </div>
                                                <Badge variant="outline" className="border-gray-300 text-gray-500">{project.deadline}</Badge>
                                            </div>
                                            <CardDescription className="text-gray-600">{project.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {project.stack?.map(tech => (
                                                    <Badge key={tech} className="bg-gray-100 text-gray-700 border-0">{tech}</Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {project.members?.map((member, i) => (
                                                        <div key={member} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${i % 2 === 0 ? 'bg-[#219EBC] text-white' : 'bg-[#E9C46A] text-gray-900'}`}>
                                                            {member.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-gray-400 text-sm">+2 more</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold rounded-full"
                                                onClick={() => handleJoinProject(project.id, project.title)}
                                                disabled={joiningProject === project.id}
                                            >
                                                {joiningProject === project.id ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Request...</>
                                                ) : (
                                                    <>Request to Join <ArrowRight className="w-4 h-4 ml-2" /></>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="completed">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {completedProjects.map((project, idx) => (
                                    <Card key={project.id} className="bg-white border border-gray-200 hover:border-[#219EBC] hover:shadow-lg transition-all overflow-hidden">
                                        <div className="h-32 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                                            <CheckCircle className="w-12 h-12 text-green-500" />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-gray-900">{project.title}</CardTitle>
                                            <CardDescription className="text-gray-600">{project.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.stack?.map(tech => (
                                                    <Badge key={tech} className="bg-gray-100 text-gray-700 border-0">{tech}</Badge>
                                                ))}
                                            </div>
                                            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                                <p className="text-sm text-green-700">📈 {project.outcome}</p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                                onClick={() => handleViewCode(project.title)}
                                            >
                                                <Github className="w-4 h-4 mr-2" /> Code
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                                onClick={() => handleViewDemo(project.title)}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" /> Demo
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="submit">
                            <div className="max-w-2xl mx-auto">
                                <Card className="bg-white border border-gray-200 shadow-lg">
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#219EBC] to-[#6A96A0] flex items-center justify-center mx-auto mb-4">
                                            <PlusCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <CardTitle className="text-gray-900 text-2xl">Submit Your Project Idea</CardTitle>
                                        <CardDescription className="text-gray-600">Share your innovation with the community</CardDescription>
                                    </CardHeader>
                                    <form onSubmit={handleSubmitIdea}>
                                        <CardContent className="space-y-5">
                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Project Title *</Label>
                                                <Input
                                                    placeholder="e.g. AI-Powered Study Buddy"
                                                    className="bg-gray-50 border-gray-200 text-gray-900"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Description *</Label>
                                                <Textarea
                                                    placeholder="What does your project do?"
                                                    className="bg-gray-50 border-gray-200 text-gray-900"
                                                    rows={4}
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Tech Stack</Label>
                                                <Input
                                                    placeholder="e.g. React, Python, TensorFlow"
                                                    className="bg-gray-50 border-gray-200 text-gray-900"
                                                    value={formData.techStack}
                                                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Your Name *</Label>
                                                    <Input
                                                        className="bg-gray-50 border-gray-200 text-gray-900"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Email *</Label>
                                                    <Input
                                                        type="email"
                                                        className="bg-gray-50 border-gray-200 text-gray-900"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                type="submit"
                                                className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold rounded-full py-5"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                                                ) : (
                                                    "Submit Idea for Review"
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}
