"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Sparkles, Filter, Loader2, ArrowRight, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { useMentors } from "@/lib/api/hooks";
import BookingDialog from "@/components/mentors/BookingDialog";
import { MentorCard } from "@/components/mentors/MentorCard";

export default function MentorsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [selectedTag, setSelectedTag] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [connectingId, setConnectingId] = useState<string | null>(null);
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
            mentor.company.toLowerCase().includes(searchQuery.toLowerCase());
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
        // Optionally refresh data or navigate to dashboard
    };

    const handleLinkedin = (mentorName: string) => {
        toast.success(`Opening ${mentorName}'s LinkedIn profile...`);
    };



    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="relative py-16 bg-background overflow-hidden">

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 border border-secondary/30 px-4 py-2 text-sm font-medium text-secondary mb-6 mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            <Sparkles className="w-4 h-4" />
                            Mentorship Program
                        </div>
                        <h1 className="text-4xl md:text-6xl mb-6 text-foreground" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}>
                            Connect with <span className="text-secondary">Industry Mentors</span>
                        </h1>
                        <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                            Get guidance from experienced professionals who have been in your shoes and succeeded.
                        </p>
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search mentors by name or expertise..."
                                className="pl-14 py-7 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground text-lg shadow-sm focus:ring-2 focus:ring-secondary/20"
                                aria-label="Search mentors by name or expertise"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />



            {/* Filters */}
            <section className="py-8 bg-background border-b border-border">
                <div className="container mx-auto px-4 sm:px-6 md:px-8">
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {tags.map((tag) => (
                            <Button
                                key={tag}
                                variant={selectedTag === tag ? "default" : "outline"}
                                onClick={() => setSelectedTag(tag)}
                                className={`touch-target rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all text-sm sm:text-base ${selectedTag === tag
                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
                                    : 'text-foreground hover:bg-muted border-border'
                                    }`}
                                aria-label={`Filter mentors by ${tag}`}
                                aria-pressed={selectedTag === tag}
                            >
                                {tag}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => toast.success("More filters coming soon!")}
                            className="touch-target rounded-full border-border text-foreground hover:bg-muted px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
                            aria-label="Show more filter options"
                        >
                            <Filter className="w-4 h-4 mr-2" aria-hidden="true" /> More Filters
                        </Button>
                    </div>
                </div>
            </section>

            {/* Mentors Grid */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    {filteredMentors.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <div className="text-center py-20 bg-card rounded-3xl border border-border italic text-muted-foreground shadow-sm">
                            No mentors found matching your search. Try different keywords!
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-3xl rounded-full -ml-20 -mb-20" />

                        <h2 className="text-3xl font-bold mb-4 relative z-10">Want to become a Mentor?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto relative z-10 text-lg">
                            Share your knowledge and help the next generation of tech leaders. Join our elite pool of mentors today.
                        </p>
                        <Button
                            onClick={() => router.push('/apply-mentor')}
                            className="touch-target bg-background hover:bg-muted text-foreground font-bold rounded-full px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg relative z-10"
                            aria-label="Apply to become a mentor"
                        >
                            Apply to Mentor <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                        </Button>
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
                <DialogContent className="max-w-md bg-background rounded-[32px]">
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
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
                        >
                            Sign In
                        </Button>
                        <Button
                            onClick={() => router.push('/auth/signup')}
                            variant="outline"
                            className="w-full h-12 border-2 border-border hover:border-primary text-foreground font-bold rounded-xl"
                        >
                            Create Account
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
