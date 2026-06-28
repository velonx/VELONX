"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, ArrowRight, LogIn } from 'lucide-react';
import toast from "react-hot-toast";
import { useMentors } from "@/lib/api/hooks";
import BookingDialog from "@/components/mentors/BookingDialog";
import { MentorCard } from "@/components/mentors/MentorCard";
import { BoneyardLoader, MentorCardSkeleton } from "@/components/boneyard";

export default function MentorsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [selectedTag, setSelectedTag] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
    const [showBookingDialog, setShowBookingDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const tags = ["All", "Frontend", "Backend", "AI/ML", "Mobile", "DevOps", "Design"];

    // Fetch mentors from API
    const { data: mentors, loading } = useMentors({ pageSize: 50 });

    const filteredMentors = mentors?.filter(mentor => {
        const matchesTag = selectedTag === "All" || mentor.expertise.some(exp =>
            exp.toLowerCase().includes(selectedTag.toLowerCase())
        );
        const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    }) || [];

    const handleConnect = async (mentor: any) => {
        // Check if user is logged in
        if (!session) {
            setShowLoginDialog(true);
            return;
        }

        // Open booking dialog
        setSelectedMentor(mentor);
        setShowBookingDialog(true);
    };

    const handleBookingSuccess = () => {
        setShowBookingDialog(false);
        setSelectedMentor(null);
    };

    const handleLinkedin = (mentorName: string) => {
        toast.success(`Opening ${mentorName}'s LinkedIn profile...`);
    };

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <header className="relative pt-16 pb-12 bg-background overflow-hidden text-center" aria-labelledby="page-title">
                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                    <span className="p-section-label">1:1 MENTORSHIP ENGINE</span>
                    <h1 id="page-title" className="p-display-1">
                        Elite Tech <span className="gradient-text font-black">Mentors</span>
                    </h1>
                    <p className="text-muted-foreground max-w-150 mt-4 text-base md:text-lg leading-relaxed">
                        Get direct access to seasoned engineers, designers, and hiring guides from the world's most successful tech companies.
                    </p>
                </div>
            </header>

            {/* Filters and Search toolbar */}
            <section className="pb-8 bg-background" aria-labelledby="filters-heading">
                <div className="container mx-auto px-4">
                    <h2 id="filters-heading" className="sr-only">Mentor Filters</h2>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-border pb-8">
                        <div className="p-filter-chips justify-center md:justify-start">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`p-filter-chip ${selectedTag === tag ? 'active' : ''}`}
                                    aria-label={`Filter mentors by ${tag}`}
                                    aria-pressed={selectedTag === tag}
                                >
                                    {tag === 'All' ? 'All Domains' : tag}
                                </button>
                            ))}
                        </div>

                        <div className="p-search-bar">
                            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search mentors by name, company, or skill..."
                                aria-label="Search mentors"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mentors Grid */}
            <section className="py-12 bg-muted/10">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <BoneyardLoader skeleton={MentorCardSkeleton} count={8} columns={4} label="Loading mentors" gridClassName="p-mentor-grid" />
                    ) : filteredMentors.length > 0 ? (
                        <div className="p-mentor-grid">
                            {filteredMentors.map((mentor, index) => (
                                <MentorCard
                                    key={mentor.id}
                                    mentor={mentor}
                                    onBookSession={handleConnect}
                                    onLinkedinClick={handleLinkedin}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-card rounded-2xl border border-border italic text-muted-foreground shadow-sm">
                            No mentors found matching your search. Try different keywords!
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="p-mentor-card p-10 text-center relative overflow-hidden border border-border">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-3xl rounded-full -ml-20 -mb-20" />

                        <h2 className="text-3xl font-bold mb-4 relative z-10 text-foreground">Want to become a Mentor?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto relative z-10 text-lg">
                            Share your knowledge and help the next generation of tech leaders. Join our elite pool of mentors today.
                        </p>
                        <div className="relative z-10 flex justify-center">
                            <button
                                onClick={() => router.push('/apply-mentor')}
                                className="btn-redesign btn-redesign-primary text-base px-8 py-3.5 font-bold inline-flex items-center gap-2"
                                aria-label="Apply to become a mentor"
                            >
                                Apply to Mentor <ArrowRight className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Dialog */}
            {selectedMentor && (
                <BookingDialog
                    open={showBookingDialog}
                    onOpenChange={setShowBookingDialog}
                    mentor={selectedMentor}
                    onSuccess={handleBookingSuccess}
                />
            )}

            {/* Login Required Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="max-w-md bg-background rounded-4xl p-6 border border-border">
                    <DialogHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-8 h-8 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-foreground">
                            Login Required
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2">
                            You need to be logged in to book mentor sessions. Please sign in or create an account to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            onClick={() => router.push('/auth/login')}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push('/auth/signup')}
                            className="w-full h-12 border-2 border-border hover:border-primary text-foreground font-bold rounded-xl transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
