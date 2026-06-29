"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Video, Clock, Briefcase, GraduationCap, Loader2, ExternalLink, MapPin, IndianRupee, Share2, Check, LogIn, X, Lock, CalendarClock, Sparkles, Zap, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { BoneyardLoader, CareerCardSkeleton } from "@/components/boneyard";
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

    // AI Match tab state
    const [aiJobs, setAiJobs] = useState<any[]>([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSearchQuery, setAiSearchQuery] = useState("");
    const [aiSearchResults, setAiSearchResults] = useState<any[] | null>(null);
    const [aiSearchLoading, setAiSearchLoading] = useState(false);

    // AI Match Dashboard state
    const [aiView, setAiView] = useState<"dashboard" | "recommendations" | "target" | "search">("dashboard");
    const [allOpportunities, setAllOpportunities] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [targetAnalysis, setTargetAnalysis] = useState<any>(null);
    const [targetLoading, setTargetLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

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
        } else if (activeTab === "ai") {
            fetchAiRecommendations();
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

    // Fetch AI recommendations when switching to AI tab
    const fetchAiRecommendations = async () => {
        if (status !== "authenticated") return;
        setAiLoading(true);
        setAiSearchResults(null);
        setAiSearchQuery("");
        try {
            const response = await fetch("/api/ai/recommendations");
            if (!response.ok) throw new Error("Failed");
            const data = await response.json();
            setAiJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("AI recommendations error:", error);
            setAiJobs([]);
        } finally {
            setAiLoading(false);
        }
    };

    // Debounced AI search
    useEffect(() => {
        if (activeTab !== "ai") return;
        if (!aiSearchQuery.trim()) {
            setAiSearchResults(null);
            return;
        }
        const timer = setTimeout(async () => {
            setAiSearchLoading(true);
            try {
                const res = await fetch(`/api/ai/search?q=${encodeURIComponent(aiSearchQuery.trim())}`);
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setAiSearchResults(Array.isArray(data) ? data : []);
            } catch {
                setAiSearchResults([]);
            } finally {
                setAiSearchLoading(false);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [aiSearchQuery, activeTab]);

    // Fetch all active opportunities to target specifically
    const fetchAllOpportunities = async () => {
        try {
            const response = await fetch("/api/opportunities");
            const data = await response.json();
            if (data.success) {
                setAllOpportunities(data.data.filter((j: any) => j.status === "ACTIVE"));
            }
        } catch (error) {
            console.error("Error fetching all opportunities:", error);
        }
    };

    // Analyze fit for selected targeted opportunity
    const analyzeTargetJob = async (jobId: string) => {
        if (!jobId) return;
        setTargetLoading(true);
        setTargetAnalysis(null);
        try {
            const response = await fetch(`/api/ai/match/${jobId}`);
            const data = await response.json();
            setTargetAnalysis(data);
        } catch (error) {
            console.error("Error analyzing job:", error);
            toast.error("Failed to analyze job match");
        } finally {
            setTargetLoading(false);
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

            {/* Profile Completion Required Modal */}
            {showProfileModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.55)" }}
                    onClick={() => setShowProfileModal(false)}
                >
                    <div
                        className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-1.5 w-full bg-linear-to-r from-violet-500 to-cyan-500" />

                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="px-8 py-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
                                <Sparkles className="w-8 h-8 text-violet-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h2>
                            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                To unlock AI Career Match, you need to upload your resume PDF and complete your profile details (Name, Bio, Headline, College, Graduation Year, and Skills).
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setShowProfileModal(false);
                                        router.push("/settings");
                                    }}
                                    className="w-full h-12 bg-linear-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-bold rounded-xl text-base shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    Go to Profile Settings
                                </button>
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="w-full h-11 text-muted-foreground hover:text-foreground font-medium transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
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
                                onClick={async () => {
                                    if (status !== "authenticated") {
                                        setPendingAction("AI Match");
                                        setShowLoginModal(true);
                                        return;
                                    }
                                    setAiView("dashboard");
                                    // Fetch profile completeness status
                                    try {
                                        const response = await fetch("/api/user/profile");
                                        const resData = await response.json();
                                        if (resData.success) {
                                            const u = resData.data;
                                            const isComplete = !!(u.name && u.bio && u.image && u.headline && u.college && u.graduationYear && u.skills && u.skills.length > 0 && u.resumeUrl);
                                            if (!isComplete) {
                                                setShowProfileModal(true);
                                                return;
                                            }
                                        } else {
                                            setShowProfileModal(true);
                                            return;
                                        }
                                    } catch {
                                        setShowProfileModal(true);
                                        return;
                                    }
                                    setActiveTab("ai");
                                }}
                                className={`p-filter-chip ${activeTab === "ai" ? "active" : ""} relative`}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-violet-400" /> AI Match
                                </span>
                                <span className="absolute -top-1.5 -right-1.5 bg-linear-to-r from-violet-500 to-cyan-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">NEW</span>
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

                        {activeTab !== "mock" && activeTab !== "ai" && (
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
                        {activeTab === "ai" && (
                            <div className="p-search-bar" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.03)' }}>
                                <Sparkles className="w-5 h-5 text-violet-400 shrink-0" />
                                <input
                                    type="text"
                                    value={aiSearchQuery}
                                    onChange={(e) => setAiSearchQuery(e.target.value)}
                                    placeholder="Search with AI — e.g. React internship, backend dev..."
                                    aria-label="AI job search"
                                />
                                {aiSearchLoading && <Loader2 className="w-4 h-4 animate-spin text-violet-400 shrink-0" />}
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

                    {activeTab === "ai" && (
                        <div>
                            {/* Sub-view Header with Back Navigation */}
                            {aiView !== "dashboard" && (
                                <button
                                    onClick={() => setAiView("dashboard")}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold mb-6 border border-border px-3 py-1.5 rounded-xl transition-colors hover:bg-muted/30"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to AI Dashboard
                                </button>
                            )}

                            {/* 1. DASHBOARD VIEW */}
                            {aiView === "dashboard" && (
                                <div>
                                    <div className="mb-8 p-6 rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/5 to-cyan-500/5 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg mx-auto mb-4">
                                            <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                        </div>
                                        <h2 className="text-2xl font-black text-foreground">AI Career Hub</h2>
                                        <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                                            Vetted opportunities matching your unique skills, college, projects, and resume text.
                                        </p>
                                    </div>

                                    {/* Dashboard Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Smart Recommendations */}
                                        <div className="bg-card border border-border hover:border-violet-500/40 p-6 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-violet-500/5 group flex flex-col justify-between">
                                            <div>
                                                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <Sparkles className="w-6 h-6 text-violet-400" />
                                                </div>
                                                <h3 className="text-xl font-extrabold text-foreground mb-2">Smart Job Feed</h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                                    Get a personalized list of internships and jobs sorted dynamically by how well they match your skills and resume.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setAiView("recommendations");
                                                    fetchAiRecommendations();
                                                }}
                                                className="w-full py-3 bg-linear-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                                            >
                                                Get Recommendations <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Target Role Analysis */}
                                        <div className="bg-card border border-border hover:border-cyan-500/40 p-6 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-cyan-500/5 group flex flex-col justify-between">
                                            <div>
                                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <Zap className="w-6 h-6 text-cyan-400" />
                                                </div>
                                                <h3 className="text-xl font-extrabold text-foreground mb-2">Target Specific Job</h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                                    Select any active opportunity to check your selection chance, strengths, gaps, and get a direct custom tip.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setAiView("target");
                                                    fetchAllOpportunities();
                                                }}
                                                className="w-full py-3 bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                                            >
                                                Target Role Analysis <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* AI Job Search */}
                                        <div className="bg-card border border-border hover:border-emerald-500/40 p-6 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-emerald-500/5 group flex flex-col justify-between">
                                            <div>
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <Search className="w-6 h-6 text-emerald-400" />
                                                </div>
                                                <h3 className="text-xl font-extrabold text-foreground mb-2">AI Job Search</h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                                    Describe your ideal job in natural language (e.g. "Remote React Developer") and get matching roles.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setAiView("search");
                                                }}
                                                className="w-full py-3 bg-linear-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                                            >
                                                Start AI Search <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. SMART RECOMMENDATIONS VIEW */}
                            {aiView === "recommendations" && (
                                <div>
                                    <div className="mb-8 p-6 rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/5 to-cyan-500/5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-foreground">Smart Recommendations Feed</h2>
                                                <p className="text-xs text-muted-foreground">Opportunities sorted dynamically by fit</p>
                                            </div>
                                            <button
                                                onClick={fetchAiRecommendations}
                                                disabled={aiLoading}
                                                className="ml-auto flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
                                            >
                                                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                Refresh
                                            </button>
                                        </div>
                                    </div>

                                    {aiLoading && (
                                        <BoneyardLoader
                                            skeleton={CareerCardSkeleton}
                                            count={4}
                                            layout="list"
                                            label="AI is scoring matches..."
                                            gridClassName="p-job-list"
                                        />
                                    )}

                                    {!aiLoading && aiJobs.length === 0 && (
                                        <div className="text-center py-20 bg-card rounded-2xl border border-border">
                                            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-40" />
                                            <p className="text-muted-foreground font-medium">No recommendations found. Try completing your profile fields or uploading a resume PDF.</p>
                                        </div>
                                    )}

                                    {!aiLoading && aiJobs.length > 0 && (
                                        <div className="p-job-list">
                                            {aiJobs.map((item: any) => {
                                                const score = item.aiScore ?? 0;
                                                const verdict = item.verdict ?? "";
                                                const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#22d3ee' : score >= 40 ? '#facc15' : '#f87171';
                                                const scoreBg = score >= 80 ? 'rgba(74,222,128,0.1)' : score >= 60 ? 'rgba(34,211,238,0.1)' : score >= 40 ? 'rgba(250,204,21,0.1)' : 'rgba(248,113,113,0.1)';
                                                const type = item.type === 'INTERNSHIP' ? 'internship' : 'job';
                                                const initials = item.company ? item.company.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'CO';
                                                const logoColor = ['#A78BFA','#22D3EE','#34D399','#FCD34D','#F9A8D4'][(item.company?.charCodeAt(0) ?? 0) % 5];

                                                return (
                                                    <article className="p-job-card" key={item.id} style={{ borderLeft: `3px solid ${scoreColor}` }}>
                                                        <div className="flex flex-col items-center justify-center shrink-0 w-16 gap-1">
                                                            <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black text-lg leading-none" style={{ background: scoreBg, color: scoreColor, border: `1.5px solid ${scoreColor}40` }}>
                                                                {score}%
                                                            </div>
                                                            <span className="text-[9px] font-bold text-center leading-tight" style={{ color: scoreColor }}>
                                                                {verdict.split(' ')[0]}
                                                            </span>
                                                        </div>
                                                        {item.imageUrl ? (
                                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-gray-800 p-1.5 shadow-md border border-border flex items-center justify-center">
                                                                <Image src={item.imageUrl} alt={item.company} width={48} height={48} className="object-contain" />
                                                            </div>
                                                        ) : (
                                                            <div className="p-job-logo shrink-0 w-12 h-12 text-sm" style={{ color: logoColor }}>{initials}</div>
                                                        )}
                                                        <div className="p-job-info-main">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h2 className="p-job-title">
                                                                    <Link href={`/career/${item.slug || item.id}`} className="hover:underline hover:text-primary transition-colors">
                                                                        {item.title}
                                                                    </Link>
                                                                </h2>
                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: scoreBg, color: scoreColor }}>{verdict}</span>
                                                            </div>
                                                            <div className="p-job-details-meta">
                                                                <span className="font-semibold text-foreground">🏢 {item.company}</span>
                                                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
                                                                {item.salary && <span className="p-job-salary flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {item.salary}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="p-job-action">
                                                            <Link href={`/career/${item.slug || item.id}`} className="btn-redesign btn-redesign-primary btn-redesign-sm font-bold text-xs inline-flex items-center gap-1">
                                                                View Details <ExternalLink className="w-4 h-4" />
                                                            </Link>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. TARGET ROLE ANALYSIS VIEW */}
                            {aiView === "target" && (
                                <div>
                                    <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
                                        <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                                            Target A Specific Opportunity
                                        </h2>
                                        <div className="flex flex-col md:flex-row gap-4 items-end">
                                            <div className="flex-1 space-y-2 w-full text-left">
                                                <label htmlFor="target-select" className="text-sm font-semibold text-muted-foreground">Select Active Job or Internship</label>
                                                <select
                                                    id="target-select"
                                                    value={selectedJobId}
                                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                                    className="w-full flex h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
                                                >
                                                    <option value="">Choose role...</option>
                                                    {allOpportunities.map((op: any) => (
                                                        <option key={op.id} value={op.id}>
                                                            {op.title} at {op.company} ({op.type})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => analyzeTargetJob(selectedJobId)}
                                                disabled={targetLoading || !selectedJobId}
                                                className="py-3 px-6 h-11 w-full md:w-auto bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {targetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Match"}
                                            </button>
                                        </div>
                                    </div>

                                    {targetLoading && (
                                        <BoneyardLoader
                                            skeleton={CareerCardSkeleton}
                                            count={1}
                                            layout="list"
                                            label="AI is performing selection audit..."
                                            gridClassName="p-job-list"
                                        />
                                    )}

                                    {targetAnalysis && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Score Card */}
                                                <div className="bg-card border border-border p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
                                                    <h3 className="text-sm font-bold text-muted-foreground mb-4">MATCH SCORE</h3>
                                                    <div 
                                                        className="w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 font-black text-4xl mb-4"
                                                        style={{
                                                            borderColor: targetAnalysis.score >= 80 ? '#4ade80' : targetAnalysis.score >= 60 ? '#22d3ee' : targetAnalysis.score >= 40 ? '#facc15' : '#f87171',
                                                            color: targetAnalysis.score >= 80 ? '#4ade80' : targetAnalysis.score >= 60 ? '#22d3ee' : targetAnalysis.score >= 40 ? '#facc15' : '#f87171',
                                                            boxShadow: `0 0 20px ${targetAnalysis.score >= 80 ? 'rgba(74,222,128,0.1)' : targetAnalysis.score >= 60 ? 'rgba(34,211,238,0.1)' : targetAnalysis.score >= 40 ? 'rgba(250,204,21,0.1)' : 'rgba(248,113,113,0.1)'}`
                                                        }}
                                                    >
                                                        {targetAnalysis.score}%
                                                    </div>
                                                    <span className="text-lg font-black" style={{ color: targetAnalysis.score >= 80 ? '#4ade80' : targetAnalysis.score >= 60 ? '#22d3ee' : targetAnalysis.score >= 40 ? '#facc15' : '#f87171' }}>
                                                        {targetAnalysis.verdict}
                                                    </span>
                                                </div>

                                                {/* Strengths & Gaps */}
                                                <div className="bg-card border border-border p-6 rounded-3xl shadow-lg md:col-span-2 space-y-6 text-left">
                                                    <div>
                                                        <h4 className="text-sm font-black text-green-400 flex items-center gap-1.5 mb-3">
                                                            <CheckCircle2 className="w-4 h-4" /> KEY STRENGTHS
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {targetAnalysis.strengths.map((str: string, idx: number) => (
                                                                <li key={idx} className="text-sm text-foreground/90 flex items-start gap-2">
                                                                    <span className="text-green-400 mt-0.5">•</span>
                                                                    {str}
                                                                </li>
                                                            ))}
                                                            {targetAnalysis.strengths.length === 0 && (
                                                                <li className="text-sm text-muted-foreground italic">No strengths highlighted.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <hr className="border-border/50" />
                                                    <div>
                                                        <h4 className="text-sm font-black text-yellow-400 flex items-center gap-1.5 mb-3">
                                                            <AlertTriangle className="w-4 h-4" /> POTENTIAL GAPS
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {targetAnalysis.gaps.map((gap: string, idx: number) => (
                                                                <li key={idx} className="text-sm text-foreground/90 flex items-start gap-2">
                                                                    <span className="text-yellow-400 mt-0.5">•</span>
                                                                    {gap}
                                                                </li>
                                                            ))}
                                                            {targetAnalysis.gaps.length === 0 && (
                                                                <li className="text-sm text-green-400/90 font-medium flex items-center gap-1.5">✓ No critical gaps identified!</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>

                                                {/* Recommended Tip Card */}
                                                <div className="bg-linear-to-br from-violet-500/5 to-cyan-500/5 border border-violet-500/20 p-6 rounded-3xl md:col-span-3 flex gap-4 items-start shadow-md text-left">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
                                                        <Lightbulb className="w-5 h-5 text-violet-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-foreground mb-1">AI Recommendation Tip</h4>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{targetAnalysis.tip}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 4. AI JOB SEARCH VIEW */}
                            {aiView === "search" && (
                                <div>
                                    {aiSearchLoading && (
                                        <BoneyardLoader
                                            skeleton={CareerCardSkeleton}
                                            count={4}
                                            layout="list"
                                            label="AI is scanning and ranking roles..."
                                            gridClassName="p-job-list"
                                        />
                                    )}

                                    {!aiSearchLoading && (() => {
                                        const displayJobs = aiSearchResults ?? [];

                                        if (displayJobs.length === 0) {
                                            return (
                                                <div className="text-center py-20 bg-card rounded-2xl border border-border">
                                                    <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-40 animate-pulse" />
                                                    <p className="text-muted-foreground font-semibold">
                                                        {aiSearchQuery.trim()
                                                            ? `No matching jobs found for "${aiSearchQuery}"`
                                                            : "Enter keywords in the AI search bar above (e.g. 'React intern', 'node developer')"}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="p-job-list">
                                                {displayJobs.map((item: any) => {
                                                    const score = item.aiScore ?? 0;
                                                    const verdict = item.verdict ?? "";
                                                    const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#22d3ee' : score >= 40 ? '#facc15' : '#f87171';
                                                    const scoreBg = score >= 80 ? 'rgba(74,222,128,0.1)' : score >= 60 ? 'rgba(34,211,238,0.1)' : score >= 40 ? 'rgba(250,204,21,0.1)' : 'rgba(248,113,113,0.1)';
                                                    const type = item.type === 'INTERNSHIP' ? 'internship' : 'job';
                                                    const initials = item.company ? item.company.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'CO';
                                                    const logoColor = ['#A78BFA','#22D3EE','#34D399','#FCD34D','#F9A8D4'][(item.company?.charCodeAt(0) ?? 0) % 5];

                                                    return (
                                                        <article className="p-job-card" key={item.id} style={{ borderLeft: `3px solid ${scoreColor}` }}>
                                                            <div className="flex flex-col items-center justify-center shrink-0 w-16 gap-1">
                                                                <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black text-lg leading-none" style={{ background: scoreBg, color: scoreColor, border: `1.5px solid ${scoreColor}40` }}>
                                                                    {score}%
                                                                </div>
                                                                <span className="text-[9px] font-bold text-center leading-tight" style={{ color: scoreColor }}>
                                                                    {verdict.split(' ')[0]}
                                                                </span>
                                                            </div>
                                                            {item.imageUrl ? (
                                                                <div className="shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-gray-800 p-1.5 shadow-md border border-border flex items-center justify-center">
                                                                    <Image src={item.imageUrl} alt={item.company} width={48} height={48} className="object-contain" />
                                                                </div>
                                                            ) : (
                                                                <div className="p-job-logo shrink-0 w-12 h-12 text-sm" style={{ color: logoColor }}>{initials}</div>
                                                            )}
                                                            <div className="p-job-info-main">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h2 className="p-job-title">
                                                                        <Link href={`/career/${item.slug || item.id}`} className="hover:underline hover:text-primary transition-colors">
                                                                            {item.title}
                                                                        </Link>
                                                                    </h2>
                                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: scoreBg, color: scoreColor }}>{verdict}</span>
                                                                </div>
                                                                <div className="p-job-details-meta">
                                                                    <span className="font-semibold text-foreground">🏢 {item.company}</span>
                                                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
                                                                    {item.salary && <span className="p-job-salary flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {item.salary}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="p-job-action">
                                                                <Link href={`/career/${item.slug || item.id}`} className="btn-redesign btn-redesign-primary btn-redesign-sm font-bold text-xs inline-flex items-center gap-1">
                                                                    View Details <ExternalLink className="w-4 h-4" />
                                                                </Link>
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "internships" && (
                        <div>
                             {loading ? (
                                <BoneyardLoader
                                    skeleton={CareerCardSkeleton}
                                    count={3}
                                    layout="list"
                                    label="Loading internships"
                                    gridClassName="p-job-list"
                                />
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
                                <BoneyardLoader
                                    skeleton={CareerCardSkeleton}
                                    count={3}
                                    layout="list"
                                    label="Loading jobs"
                                    gridClassName="p-job-list"
                                />
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
