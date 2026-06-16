"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Video, Clock, Briefcase, GraduationCap, Loader2, ExternalLink, MapPin, IndianRupee, Share2, Check, LogIn, X, Lock, CalendarClock } from 'lucide-react';
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { analytics } from "@/components/analytics";

export default function CareerPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("internships");
    const [internships, setInternships] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleShare = async (idOrSlug: string, originalId: string, title: string, type: 'internship' | 'job') => {
        const url = `${window.location.origin}/career/${idOrSlug}`;
        analytics.share('native', type, originalId);
        const shareData = {
            title,
            text: `Check out this ${type}: ${title}`,
            url,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            setCopiedId(originalId);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

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

        if (status !== "authenticated") {
            setPendingAction("Mock Interview");
            setShowLoginModal(true);
            return;
        }

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
        if (status !== "authenticated") {
            setPendingAction(title);
            setShowLoginModal(true);
            return;
        }
        analytics.jobApply(url, title);
        window.open(url, "_blank");
        toast.success(`Opening application for ${title}...`);
    };

    const handleLoginRedirect = () => {
        router.push(`/auth/login?callbackUrl=/career`);
    };

    const filteredInternships = internships.filter(item => {
        const query = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(query) ||
               item.company.toLowerCase().includes(query) ||
               item.location.toLowerCase().includes(query) ||
               item.requirements.some((req: string) => req.toLowerCase().includes(query));
    });

    const filteredJobs = jobs.filter(item => {
        const query = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(query) ||
               item.company.toLowerCase().includes(query) ||
               item.location.toLowerCase().includes(query) ||
               item.requirements.some((req: string) => req.toLowerCase().includes(query));
    });

    const renderOpportunityCard = (item: any, type: 'internship' | 'job') => {
        const initials = item.company ? item.company.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'CO';
        
        const logoColors = [
            '#A78BFA', // Violet
            '#22D3EE', // Cyan
            '#34D399', // Green
            '#FCD34D', // Yellow
            '#F9A8D4', // Pink
        ];
        const charCode = item.company ? item.company.charCodeAt(0) : 0;
        const logoColor = logoColors[charCode % logoColors.length];

        return (
            <article className="p-job-card" key={item.id}>
                {/* Logo wrapper */}
                {item.imageUrl ? (
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-white dark:bg-gray-800 p-2 shadow-md border border-border flex items-center justify-center relative">
                        <Image 
                            src={item.imageUrl} 
                            alt={item.company} 
                            width={56} 
                            height={56} 
                            className="object-contain" 
                        />
                    </div>
                ) : (
                    <div className="p-job-logo shrink-0" style={{ color: logoColor }}>
                        {initials}
                    </div>
                )}

                {/* Main info */}
                <div className="p-job-info-main">
                    <h2 className="p-job-title">
                        <Link href={`/career/${item.slug || item.id}`} className="hover:underline hover:text-primary transition-colors">
                            {item.title}
                        </Link>
                        {item.salary && (item.salary.includes('45,000') || item.salary.includes('LPA') || item.salary.includes('80,000')) && (
                            <span className="badge badge-cyan text-[10px] py-0.5 px-2 rounded-full font-bold ml-2">HOT</span>
                        )}
                    </h2>
                    <div className="p-job-details-meta">
                        <span className="font-semibold text-foreground">🏢 {item.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
                        {item.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.duration}</span>}
                        {item.salary && <span className="p-job-salary flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {item.salary}</span>}
                    </div>
                    {/* Deadline display */}
                    {item.deadline && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className={`text-xs font-semibold ${
                                new Date(item.deadline) < new Date() 
                                    ? 'text-red-500' 
                                    : 'text-muted-foreground'
                            }`}>
                                {new Date(item.deadline) < new Date() 
                                    ? `Deadline passed: ${new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` 
                                    : `Apply by: ${new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                }
                            </span>
                        </div>
                    )}
                    {item.requirements && item.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.requirements.slice(0, 3).map((req: string, idx: number) => (
                                <span key={idx} className="tag text-[10px] py-1 px-2.5 rounded-md font-medium">
                                    {req}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions Block */}
                <div className="p-job-action">
                    {(() => {
                        const isOpen = item.status === 'ACTIVE' && (!item.deadline || new Date(item.deadline) >= new Date());
                        return isOpen ? (
                            <span className="badge badge-green badge-live font-bold py-1 px-3.5 rounded-full text-[10px] tracking-wide">ACTIVE</span>
                        ) : (
                            <span className="badge font-bold py-1 px-3.5 rounded-full text-[10px] tracking-wide" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>CLOSED</span>
                        );
                    })()}
                    
                    <Link
                        href={`/career/${item.slug || item.id}`}
                        className="btn-redesign btn-redesign-primary btn-redesign-sm font-bold text-xs inline-flex items-center gap-1"
                    >
                        View Details <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                        onClick={() => handleShare(item.slug || item.id, item.id, item.title, type)}
                        title={copiedId === item.id ? 'Link copied!' : 'Share'}
                        className="btn-redesign btn-redesign-secondary btn-redesign-sm p-2 rounded-lg flex items-center justify-center hover:bg-muted"
                        type="button"
                    >
                        {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : (
                            <Share2 className="w-4 h-4 text-muted-foreground" />
                        )}
                    </button>
                </div>
            </article>
        );
    };

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Login Required Modal */}
            {showLoginModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.55)" }}
                    onClick={() => setShowLoginModal(false)}
                >
                    <div
                        className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-1.5 w-full bg-linear-to-r from-[#fb923c] to-[#f97316]" />

                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="px-8 py-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                                <Lock className="w-8 h-8 text-primary" />
                            </div>

                            <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
                            <p className="text-muted-foreground text-sm mb-1">
                                You need to be logged in to apply for
                            </p>
                            <p className="text-primary font-semibold text-base mb-6">
                                &ldquo;{pendingAction}&rdquo;
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleLoginRedirect}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-base shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Login to Apply
                                </button>
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="w-full h-11 text-muted-foreground hover:text-foreground font-medium transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground mt-5">
                                Don&apos;t have an account?{" "}
                                <button
                                    onClick={() => router.push("/auth/signup?callbackUrl=/career")}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Sign up for free
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Hero */}
            <header className="relative pt-16 pb-12 bg-background overflow-hidden text-center" aria-labelledby="page-title">
                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                    <span className="p-section-label">DEMOCRATIZING PLACEMENTS</span>
                    <h1 id="page-title" className="p-display-1">
                        Opportunities <span className="gradient-text font-black">Hub</span>
                    </h1>
                    <p className="text-muted-foreground max-w-150 mt-4 text-base md:text-lg leading-relaxed">
                        Vetted internships and entry-level developer roles with verified stipends and fair, skill-first selection rounds.
                    </p>
                </div>
            </header>

            {/* Filter Chips & Search Toolbar */}
            <section className="pb-8 bg-background" aria-labelledby="filters-heading">
                <div className="container mx-auto px-4">
                    <h2 id="filters-heading" className="sr-only">Opportunity Filters</h2>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-border pb-8">
                        <div className="p-filter-chips justify-center md:justify-start">
                            <button
                                onClick={() => setActiveTab("internships")}
                                className={`p-filter-chip ${activeTab === "internships" ? "active" : ""}`}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4" /> Internships
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("jobs")}
                                className={`p-filter-chip ${activeTab === "jobs" ? "active" : ""}`}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" /> Jobs
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("mock")}
                                className={`p-filter-chip ${activeTab === "mock" ? "active" : ""}`}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <Video className="w-4 h-4" /> Mock Interview
                                </span>
                            </button>
                        </div>

                        {activeTab !== "mock" && (
                            <div className="p-search-bar">
                                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, tech stack, or company..."
                                    aria-label="Search opportunities"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="py-12 bg-muted/10">
                <div className="container mx-auto px-4">
                    {activeTab === "mock" && (
                        <div className="max-w-2xl mx-auto py-8">
                            <div className="p-mentor-card p-8 border border-border relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-3xl rounded-full -ml-20 -mb-20" />

                                <div className="text-center mb-8 relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                                        <Video className="w-8 h-8 text-[#f97316]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">Apply for Mock Interview</h2>
                                    <p className="text-muted-foreground mt-1">Practice with real interview questions</p>
                                </div>

                                <form onSubmit={handleMockSchedule} className="space-y-6 relative z-10 text-left">
                                    <div className="space-y-2">
                                        <Label className="text-foreground font-semibold">Email Address *</Label>
                                        <Input
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={mockFormData.email}
                                            onChange={(e) => setMockFormData({ ...mockFormData, email: e.target.value })}
                                            className="bg-background border-border text-foreground h-11 rounded-lg"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-foreground font-semibold">Preferred Date *</Label>
                                            <Input
                                                type="date"
                                                value={mockFormData.preferredDate}
                                                onChange={(e) => setMockFormData({ ...mockFormData, preferredDate: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="bg-background border-border text-foreground h-11 rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-foreground font-semibold">Time Slot *</Label>
                                            <Input
                                                type="time"
                                                value={mockFormData.preferredTime}
                                                onChange={(e) => setMockFormData({ ...mockFormData, preferredTime: e.target.value })}
                                                className="bg-background border-border text-foreground h-11 rounded-lg"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-foreground font-semibold">Interview Type *</Label>
                                        <select
                                            value={mockFormData.interviewType}
                                            onChange={(e) => setMockFormData({ ...mockFormData, interviewType: e.target.value })}
                                            className="w-full flex h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
                                        >
                                            <option value="TECHNICAL_FRONTEND">Technical (Frontend)</option>
                                            <option value="TECHNICAL_BACKEND">Technical (Backend)</option>
                                            <option value="DSA">Data Structures & Algorithms</option>
                                            <option value="SYSTEM_DESIGN">System Design</option>
                                            <option value="BEHAVIORAL">Behavioral / HR</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-foreground font-semibold">Experience Level *</Label>
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
                                                    <div className="text-center py-2.5 px-3 border rounded-lg cursor-pointer border-border peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary text-muted-foreground font-medium transition-all">
                                                        {level.charAt(0) + level.slice(1).toLowerCase()}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-redesign btn-redesign-primary text-base font-bold w-full py-3 h-12 flex items-center justify-center mt-8 gap-2"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                                        ) : (
                                            "Submit Application"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === "internships" && (
                        <div>
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : filteredInternships.length > 0 ? (
                                <div className="p-job-list">
                                    {filteredInternships.map((internship) => renderOpportunityCard(internship, 'internship'))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-card rounded-2xl border border-border italic text-muted-foreground shadow-sm">
                                    No internships available at the moment. Try a different query!
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "jobs" && (
                        <div>
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : filteredJobs.length > 0 ? (
                                <div className="p-job-list">
                                    {filteredJobs.map((job) => renderOpportunityCard(job, 'job'))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-card rounded-2xl border border-border italic text-muted-foreground shadow-sm">
                                    No jobs available at the moment. Try a different query!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
