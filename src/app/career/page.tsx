"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Video, Calendar, CheckCircle, Clock, Briefcase, GraduationCap, ArrowRight, Loader2, Search, ChevronRight, ExternalLink, MapPin, DollarSign, Sparkles, FileText, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function CareerPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("internships");
    const [internships, setInternships] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [mockFormData, setMockFormData] = useState({
        email: "",
        preferredDate: "",
        preferredTime: "",
        interviewType: "TECHNICAL_FRONTEND",
        experienceLevel: "JUNIOR",
    });

    // Fetch opportunities
    useEffect(() => {
        if (activeTab === "internships") {
            fetchOpportunities("INTERNSHIP");
        } else if (activeTab === "jobs") {
            fetchOpportunities("JOB");
        }
    }, [activeTab]);

    const fetchOpportunities = async (type: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/opportunities?type=${type}`);
            const data = await response.json();

            if (data.success) {
                if (type === "INTERNSHIP") {
                    setInternships(data.data);
                } else {
                    setJobs(data.data);
                }
            }
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMockSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { getCSRFToken } = await import('@/lib/utils/csrf');
            const csrfToken = await getCSRFToken();

            const response = await fetch('/api/mock-interviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify(mockFormData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Mock interview application submitted! Admin will review shortly.");
                setMockFormData({
                    email: "",
                    preferredDate: "",
                    preferredTime: "",
                    interviewType: "TECHNICAL_FRONTEND",
                    experienceLevel: "JUNIOR",
                });
            } else {
                toast.error(data.error?.message || "Failed to submit application");
            }
        } catch (error) {
            console.error('Mock interview error:', error);
            toast.error("Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApply = (url: string, title: string) => {
        window.open(url, "_blank");
        toast.success(`Opening application for ${title}...`);
    };

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="relative py-16 bg-background overflow-hidden">

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground tracking-tight font-bold mb-6">
                            Launch Your <span className="text-[#219EBC]">Career</span>
                        </h1>
                        <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
                            Practice interviews, explore internships, and find job opportunities.
                        </p>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Services Tabs */}
            <section className="py-16 animate-on-scroll bg-background">
                <div className="container mx-auto px-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-muted border border-border p-1.5 rounded-xl">
                                <TabsTrigger value="internships" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <GraduationCap className="w-4 h-4" /> Internships
                                </TabsTrigger>
                                <TabsTrigger value="jobs" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <Briefcase className="w-4 h-4" /> Jobs
                                </TabsTrigger>
                                <TabsTrigger value="mock" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <Video className="w-4 h-4" /> Mock Interview
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="mock">
                            <div className="max-w-2xl mx-auto">
                                <Card className="bg-background border border-border shadow-xl overflow-hidden">
                                    <div className="h-2 bg-[#F4A261]" />
                                    <CardHeader className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4 border border-orange-100">
                                            <Video className="w-8 h-8 text-[#F4A261]" />
                                        </div>
                                        <CardTitle className="text-foreground text-2xl">Apply for Mock Interview</CardTitle>
                                        <CardDescription className="text-muted-foreground">Practice with real interview questions</CardDescription>
                                    </CardHeader>
                                    <form onSubmit={handleMockSchedule}>
                                        <CardContent className="space-y-5">
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Email Address *</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="your.email@example.com"
                                                    value={mockFormData.email}
                                                    onChange={(e) => setMockFormData({ ...mockFormData, email: e.target.value })}
                                                    className="bg-muted border-border text-foreground"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-foreground">Preferred Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={mockFormData.preferredDate}
                                                        onChange={(e) => setMockFormData({ ...mockFormData, preferredDate: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="bg-muted border-border text-foreground"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-foreground">Time Slot *</Label>
                                                    <Input
                                                        type="time"
                                                        value={mockFormData.preferredTime}
                                                        onChange={(e) => setMockFormData({ ...mockFormData, preferredTime: e.target.value })}
                                                        className="bg-muted border-border text-foreground"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Interview Type *</Label>
                                                <select
                                                    value={mockFormData.interviewType}
                                                    onChange={(e) => setMockFormData({ ...mockFormData, interviewType: e.target.value })}
                                                    className="w-full flex h-10 rounded-md border border-border bg-muted px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#219EBC] text-foreground"
                                                >
                                                    <option value="TECHNICAL_FRONTEND">Technical (Frontend)</option>
                                                    <option value="TECHNICAL_BACKEND">Technical (Backend)</option>
                                                    <option value="DSA">Data Structures & Algorithms</option>
                                                    <option value="SYSTEM_DESIGN">System Design</option>
                                                    <option value="BEHAVIORAL">Behavioral / HR</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Experience Level *</Label>
                                                <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                                                    {["INTERN", "JUNIOR", "SENIOR"].map((level) => (
                                                        <label key={level} className="flex-1">
                                                            <input
                                                                type="radio"
                                                                name="level"
                                                                value={level}
                                                                checked={mockFormData.experienceLevel === level}
                                                                onChange={(e) => setMockFormData({ ...mockFormData, experienceLevel: e.target.value })}
                                                                className="hidden peer"
                                                            />
                                                            <div className="text-center py-2 px-2 sm:px-0 border rounded-lg cursor-pointer border-border peer-checked:border-[#219EBC] peer-checked:bg-[#219EBC]/10 peer-checked:text-[#219EBC] text-muted-foreground transition-all">
                                                                {level.charAt(0) + level.slice(1).toLowerCase()}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#F4A261] hover:bg-[#e78d45] text-white font-bold rounded-full py-6 text-lg">
                                                {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</> : "Submit Application"}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="internships">
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" />
                                </div>
                            ) : internships.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {internships.map((internship) => (
                                        <Card key={internship.id} className="bg-card border-border hover:shadow-2xl hover:shadow-[#219EBC]/10 transition-all rounded-[2rem] overflow-hidden">
                                            <div className="h-1.5 w-full bg-gradient-to-r from-[#219EBC] to-blue-500" />
                                            <CardHeader className="p-6 sm:p-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <CardTitle className="text-foreground text-xl md:text-2xl mb-2 font-bold tracking-tight">{internship.title}</CardTitle>
                                                        <CardDescription className="text-muted-foreground font-medium text-sm md:text-base">{internship.company}</CardDescription>
                                                    </div>
                                                    {internship.imageUrl && (
                                                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white dark:bg-gray-800 p-2 shadow-md border border-border flex items-center justify-center">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={internship.imageUrl} alt={internship.company} className="w-full h-full object-contain" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <Badge className="bg-blue-500/10 text-blue-500 dark:text-blue-400 border-0 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {internship.location}
                                                    </Badge>
                                                    {internship.duration && (
                                                        <Badge className="bg-purple-500/10 text-purple-500 dark:text-purple-400 border-0 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {internship.duration}
                                                        </Badge>
                                                    )}
                                                    {internship.salary && (
                                                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" /> {internship.salary}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="px-6 sm:px-8">
                                                <p className="text-muted-foreground text-sm md:text-base line-clamp-3 mb-4 leading-relaxed">{internship.description}</p>
                                                <div className="space-y-2 bg-muted/50 p-4 rounded-xl border border-border">
                                                    <p className="text-sm font-semibold text-foreground">Requirements:</p>
                                                    <ul className="text-sm text-muted-foreground space-y-1.5">
                                                        {internship.requirements.slice(0, 3).map((req: string, idx: number) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-[#219EBC] mt-0.5">•</span>
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="px-6 sm:px-8 pb-8">
                                                <Button
                                                    onClick={() => handleApply(internship.applyUrl, internship.title)}
                                                    className="w-full bg-gradient-to-r from-orange-400 to-[#FFB703] hover:brightness-110 text-white font-bold rounded-xl h-12 text-base shadow-lg shadow-[#FFB703]/20 border border-orange-300 transition-all"
                                                >
                                                    Apply Now <ExternalLink className="w-5 h-5 ml-2" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-muted/50 rounded-3xl border border-border">
                                    <GraduationCap className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                                    <p className="text-muted-foreground text-lg font-medium">No internships available at the moment. Check back soon!</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="jobs">
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" />
                                </div>
                            ) : jobs.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {jobs.map((job) => (
                                        <Card key={job.id} className="bg-card border-border hover:shadow-2xl hover:shadow-[#219EBC]/10 transition-all rounded-[2rem] overflow-hidden">
                                            <div className="h-1.5 w-full bg-gradient-to-r from-[#219EBC] to-teal-400" />
                                            <CardHeader className="p-6 sm:p-8">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <CardTitle className="text-foreground text-xl md:text-2xl mb-2 font-bold tracking-tight">{job.title}</CardTitle>
                                                        <CardDescription className="text-muted-foreground font-medium text-sm md:text-base">{job.company}</CardDescription>
                                                    </div>
                                                    {job.imageUrl && (
                                                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white dark:bg-gray-800 p-2 shadow-md border border-border flex items-center justify-center">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={job.imageUrl} alt={job.company} className="w-full h-full object-contain" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <Badge className="bg-blue-500/10 text-blue-500 dark:text-blue-400 border-0 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {job.location}
                                                    </Badge>
                                                    {job.salary && (
                                                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" /> {job.salary}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="px-6 sm:px-8">
                                                <p className="text-muted-foreground text-sm md:text-base line-clamp-3 mb-4 leading-relaxed">{job.description}</p>
                                                <div className="space-y-2 bg-muted/50 p-4 rounded-xl border border-border">
                                                    <p className="text-sm font-semibold text-foreground">Requirements:</p>
                                                    <ul className="text-sm text-muted-foreground space-y-1.5">
                                                        {job.requirements.slice(0, 3).map((req: string, idx: number) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-[#219EBC] mt-0.5">•</span>
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="px-6 sm:px-8 pb-8">
                                                <Button
                                                    onClick={() => handleApply(job.applyUrl, job.title)}
                                                    className="w-full bg-gradient-to-r from-teal-400 to-[#219EBC] hover:brightness-110 text-white font-bold rounded-xl h-12 text-base shadow-lg shadow-[#219EBC]/20 border border-teal-300 transition-all"
                                                >
                                                    Apply Now <ExternalLink className="w-5 h-5 ml-2" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-muted/50 rounded-3xl border border-border">
                                    <Briefcase className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
                                    <p className="text-muted-foreground text-lg font-medium">No jobs available at the moment. Check back soon!</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Floating Action Button - Get Resume Feedback */}
            <button
                onClick={() => window.open("https://keyracer.in/pages/career-chat-widget.html", "_blank")}
                className="fixed bottom-8 right-8 z-50 group hover:scale-105 transition-transform"
                aria-label="Get Resume Feedback"
            >
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Button */}
                    <div className="relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Get Resume Feedback</span>
                    </div>
                </div>
            </button>
        </div>
    );
}


