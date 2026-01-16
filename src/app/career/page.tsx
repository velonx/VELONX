"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Video, Calendar, CheckCircle, Clock, Sparkles, Briefcase, GraduationCap, ArrowRight, Loader2, Search, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function CareerPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("resume");

    const handleResumeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Award XP notification
        toast.success(
            (t) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold shadow-lg">
                        +50
                    </div>
                    <div>
                        <p className="font-bold">Resume Review XP Awarded!</p>
                        <p className="text-xs opacity-80">Your profile is getting stronger.</p>
                    </div>
                </div>
            ),
            { duration: 4000 }
        );

        toast.success("Resume submitted successfully! Redirecting to Career Assistant...");

        setTimeout(() => {
            window.open("https://keyracer.in/pages/career-chat-widget.html", "_blank");
            setIsSubmitting(false);
        }, 2000);
    };

    const handleMockSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Mock interview session requested! A mentor will confirm shortly.");
        setIsSubmitting(false);
    };

    const handleApplicationClick = (jobTitle: string) => {
        toast.success(`Opening details for ${jobTitle}...`);
    };

    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/30 px-4 py-2 text-sm font-medium text-[#219EBC] mb-6 mx-auto">
                            <Briefcase className="w-4 h-4" />
                            Career Accelerator
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
                            Launch Your <span className="text-[#219EBC]">Tech Career</span>
                        </h1>
                        <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
                            Get resume reviews, mock interviews, and personalized career guidance from industry professionals.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() => window.open("https://keyracer.in/pages/career-chat-widget.html", "_blank")}
                                className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold rounded-full px-8 py-6 text-lg shadow-lg shadow-[#219EBC]/25"
                            >
                                <Sparkles className="w-5 h-5 mr-2" /> Get Resume Feedback
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Services Tabs */}
            <section className="py-16 animate-on-scroll bg-gray-50">
                <div className="container mx-auto px-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-gray-100 border border-gray-200 p-1.5">
                                <TabsTrigger value="resume" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <FileText className="w-4 h-4" /> Resume Review
                                </TabsTrigger>
                                <TabsTrigger value="mock" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <Video className="w-4 h-4" /> Mock Interview
                                </TabsTrigger>
                                <TabsTrigger value="status" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <Clock className="w-4 h-4" /> My Applications
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="resume">
                            <div className="max-w-2xl mx-auto">
                                <Card className="bg-white border border-gray-200 shadow-xl overflow-hidden">
                                    <div className="h-2 bg-[#219EBC]" />
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                            <Upload className="w-8 h-8 text-[#219EBC]" />
                                        </div>
                                        <CardTitle className="text-gray-900 text-2xl">Submit Your Resume</CardTitle>
                                        <CardDescription className="text-gray-600">Get personalized feedback from industry experts</CardDescription>
                                    </CardHeader>
                                    <form onSubmit={handleResumeSubmit}>
                                        <CardContent className="space-y-6">
                                            <div
                                                className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-[#219EBC]/50 hover:bg-blue-50/30 transition-all cursor-pointer group relative"
                                                onClick={() => document.getElementById('resume-upload')?.click()}
                                            >
                                                <input
                                                    id="resume-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) toast.success(`File "${file.name}" imported successfully!`);
                                                    }}
                                                />
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-[#219EBC] transition-colors" />
                                                <p className="text-gray-900 font-semibold mb-2">Click or drag & drop your resume here</p>
                                                <p className="text-gray-500 text-sm mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                                                <Button type="button" variant="outline" className="border-gray-200 text-gray-700 rounded-full group-hover:border-[#219EBC] group-hover:text-[#219EBC]">Browse Files</Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Target Role</Label>
                                                <Input placeholder="e.g. Frontend Developer, ML Engineer" className="bg-gray-50 border-gray-200 text-gray-900" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Additional Notes</Label>
                                                <Textarea placeholder="Any specific areas you'd like feedback on?" className="bg-gray-50 border-gray-200 text-gray-900" rows={3} />
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-full py-6 text-lg">
                                                {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</> : "Submit for Review"}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="mock">
                            <div className="max-w-2xl mx-auto">
                                <Card className="bg-white border border-gray-200 shadow-xl overflow-hidden">
                                    <div className="h-2 bg-[#F4A261]" />
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4 border border-orange-100">
                                            <Video className="w-8 h-8 text-[#F4A261]" />
                                        </div>
                                        <CardTitle className="text-gray-900 text-2xl">Schedule Mock Interview</CardTitle>
                                        <CardDescription className="text-gray-600">Practice with real interview questions</CardDescription>
                                    </CardHeader>
                                    <form onSubmit={handleMockSchedule}>
                                        <CardContent className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Preferred Date</Label>
                                                    <Input type="date" className="bg-gray-50 border-gray-200 text-gray-900" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gray-700">Time Slot</Label>
                                                    <Input type="time" className="bg-gray-50 border-gray-200 text-gray-900" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Interview Type</Label>
                                                <select className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#219EBC] text-gray-900">
                                                    <option>Technical (Frontend/Backend)</option>
                                                    <option>Data Structures & Algorithms</option>
                                                    <option>System Design</option>
                                                    <option>Behavioral / HR</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700">Experience Level</Label>
                                                <div className="flex gap-4">
                                                    {["Intern", "Junior", "Senior"].map((level) => (
                                                        <label key={level} className="flex-1">
                                                            <input type="radio" name="level" className="hidden peer" />
                                                            <div className="text-center py-2 border rounded-lg cursor-pointer border-gray-200 peer-checked:border-[#219EBC] peer-checked:bg-blue-50 peer-checked:text-[#219EBC] text-gray-600">
                                                                {level}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#F4A261] hover:bg-[#e78d45] text-white font-bold rounded-full py-6 text-lg">
                                                {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scheduling...</> : "Book Mock Session"}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="status">
                            <div className="grid gap-6">
                                {[
                                    { title: "Senior Frontend React Dev", company: "Google", status: "In Review", date: "Jan 12, 2026", color: "text-[#219EBC] bg-blue-50" },
                                    { title: "Full Stack Engineer", company: "Meta", status: "Scheduled", date: "Jan 15, 2026", color: "text-green-600 bg-green-50" },
                                    { title: "Junior UI/UX Designer", company: "Adobe", status: "Pending", date: "Jan 10, 2026", color: "text-orange-600 bg-orange-50" },
                                ].map((app, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleApplicationClick(app.title)}
                                        className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#219EBC] transition-colors">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#219EBC] transition-colors">{app.title}</h3>
                                                <p className="text-gray-500 font-medium">{app.company}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Applied on</p>
                                                <p className="text-sm font-semibold text-gray-700">{app.date}</p>
                                            </div>
                                            <Badge className={`${app.color} border-0 px-4 py-1.5 rounded-full font-bold`}>{app.status}</Badge>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#219EBC] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}


