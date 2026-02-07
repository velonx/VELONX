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
import { HoverEffect } from "@/components/ui/card-hover-effect";

export default function CareerPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("mock");
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
            const response = await fetch('/api/mock-interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const careerServices = [
        {
            title: "Mock Interviews",
            description: "Practice with industry professionals and get real-time feedback on your interview performance. Build confidence before the real thing.",
            link: "#mock",
            icon: <Video className="w-12 h-12" />,
        },
        {
            title: "Resume Review",
            description: "Get your resume reviewed by experts and receive personalized feedback to make it stand out to recruiters.",
            link: "https://keyracer.in/pages/career-chat-widget.html",
            icon: <FileText className="w-12 h-12" />,
        },
        {
            title: "Career Mentorship",
            description: "Connect with experienced mentors who can guide you through your career journey and help you make informed decisions.",
            link: "/mentors",
            icon: <Users className="w-12 h-12" />,
        },
    ];

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="relative py-16 bg-background overflow-hidden">
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/30 px-4 py-2 text-sm font-medium text-[#219EBC] mb-6 mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            <Briefcase className="w-4 h-4" />
                            Career Accelerator
                        </div>
                        <h1 className="text-4xl md:text-6xl mb-6 text-foreground" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}>
                            Launch Your <span className="text-[#219EBC]">Tech Career</span>
                        </h1>
                        <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                            Practice interviews, explore internships, and discover job opportunities from top companies.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() => window.open("https://keyracer.in/pages/career-chat-widget.html", "_blank")}
                                className="bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-full px-8 py-6 text-lg shadow-lg shadow-[#0f2c59]/30"
                                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                            >
                                <Sparkles className="w-5 h-5 mr-2" /> Get Resume Feedback
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Career Services Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl text-foreground mb-4" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
                            Our <span className="text-[#219EBC]">Career Services</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                            Everything you need to accelerate your tech career journey
                        </p>
                    </div>
                    <HoverEffect items={careerServices} />
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Services Tabs */}
            <section className="py-16 animate-on-scroll bg-gray-50">
                <div className="container mx-auto px-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-gray-100 border border-border p-1.5">
                                <TabsTrigger value="mock" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <Video className="w-4 h-4" /> Mock Interview
                                </TabsTrigger>
                                <TabsTrigger value="internships" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <GraduationCap className="w-4 h-4" /> Internships
                                </TabsTrigger>
                                <TabsTrigger value="jobs" className="px-6 py-3 rounded-lg data-[state=active]:bg-[#219EBC] data-[state=active]:text-white font-medium gap-2">
                                    <Briefcase className="w-4 h-4" /> Jobs
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
                                                    className="bg-gray-50 border-border text-foreground" 
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
                                                        className="bg-gray-50 border-border text-foreground" 
                                                        required 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-foreground">Time Slot *</Label>
                                                    <Input 
                                                        type="time" 
                                                        value={mockFormData.preferredTime}
                                                        onChange={(e) => setMockFormData({ ...mockFormData, preferredTime: e.target.value })}
                                                        className="bg-gray-50 border-border text-foreground" 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground">Interview Type *</Label>
                                                <select 
                                                    value={mockFormData.interviewType}
                                                    onChange={(e) => setMockFormData({ ...mockFormData, interviewType: e.target.value })}
                                                    className="w-full flex h-10 rounded-md border border-border bg-gray-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#219EBC] text-foreground"
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
                                                <div className="flex gap-4">
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
                                                            <div className="text-center py-2 border rounded-lg cursor-pointer border-border peer-checked:border-[#219EBC] peer-checked:bg-blue-50 peer-checked:text-[#219EBC] text-muted-foreground">
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
                                        <Card key={internship.id} className="bg-background border border-border hover:shadow-lg transition-all">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-foreground text-lg">{internship.title}</CardTitle>
                                                        <CardDescription className="text-muted-foreground font-medium">{internship.company}</CardDescription>
                                                    </div>
                                                    {internship.imageUrl && (
                                                        <img src={internship.imageUrl} alt={internship.company} className="w-12 h-12 rounded-lg object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <Badge className="bg-blue-50 text-blue-600 border-0 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {internship.location}
                                                    </Badge>
                                                    {internship.duration && (
                                                        <Badge className="bg-purple-50 text-purple-600 border-0 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {internship.duration}
                                                        </Badge>
                                                    )}
                                                    {internship.salary && (
                                                        <Badge className="bg-green-50 text-green-600 border-0 flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" /> {internship.salary}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground text-sm line-clamp-3 mb-3">{internship.description}</p>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-foreground">Requirements:</p>
                                                    <ul className="text-xs text-muted-foreground space-y-1">
                                                        {internship.requirements.slice(0, 3).map((req: string, idx: number) => (
                                                            <li key={idx}>• {req}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button 
                                                    onClick={() => handleApply(internship.applyUrl, internship.title)}
                                                    className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-full"
                                                >
                                                    Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-background rounded-3xl border border-border">
                                    <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-muted-foreground italic">No internships available at the moment. Check back soon!</p>
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
                                        <Card key={job.id} className="bg-background border border-border hover:shadow-lg transition-all">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-foreground text-lg">{job.title}</CardTitle>
                                                        <CardDescription className="text-muted-foreground font-medium">{job.company}</CardDescription>
                                                    </div>
                                                    {job.imageUrl && (
                                                        <img src={job.imageUrl} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <Badge className="bg-blue-50 text-blue-600 border-0 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {job.location}
                                                    </Badge>
                                                    {job.salary && (
                                                        <Badge className="bg-green-50 text-green-600 border-0 flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" /> {job.salary}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground text-sm line-clamp-3 mb-3">{job.description}</p>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-foreground">Requirements:</p>
                                                    <ul className="text-xs text-muted-foreground space-y-1">
                                                        {job.requirements.slice(0, 3).map((req: string, idx: number) => (
                                                            <li key={idx}>• {req}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button 
                                                    onClick={() => handleApply(job.applyUrl, job.title)}
                                                    className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-full"
                                                >
                                                    Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-background rounded-3xl border border-border">
                                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-muted-foreground italic">No jobs available at the moment. Check back soon!</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}


