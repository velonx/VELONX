"use client";

import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, LogIn, Search, X, Plus, LayoutGrid, BarChart3, Clock, RotateCcw } from 'lucide-react';
import AddEventForm from "@/components/events/AddEventForm";
import EventsGrid from "@/components/events/EventsGrid";
import { EventsPagination } from "@/components/events/EventsPagination";
import toast from "react-hot-toast";
import { useEvents } from "@/lib/api/hooks";
import { useEventFilters } from "@/lib/hooks/useEventFilters";
import { useEventRegistration } from "@/lib/hooks/useEventRegistration";
import { useKeyboardNavigation, useFocusReturn } from "@/lib/hooks/useKeyboardNavigation";
import { cn } from "@/lib/utils";

// Canvas Particles Component for Premium Mesh Background
const CanvasParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = window.innerHeight);

        const handleResize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        const particles = Array.from({ length: 45 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            size: Math.random() * 2.5 + 0.5,
            sx: Math.random() * 0.4 - 0.2,
            sy: Math.random() * 0.4 - 0.2,
            color: Math.random() > 0.5 ? "rgba(34, 108, 224, 0.25)" : "rgba(240, 119, 26, 0.23)",
        }));

        let animationFrameId: number;
        const render = () => {
            ctx.clearRect(0, 0, W, H);
            particles.forEach((p) => {
                p.x += p.sx;
                p.y += p.sy;
                if (p.x < 0 || p.x > W) p.sx *= -1;
                if (p.y < 0 || p.y > H) p.sy *= -1;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// Lazy load heavy components for better performance (Requirement 6.9, 6.10)
const RegistrationConfirmDialog = lazy(() => import("@/components/events/RegistrationConfirmDialog"));
const UnregisterConfirmDialog = lazy(() => import("@/components/events/UnregisterConfirmDialog"));

// Loading fallback component
const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm font-semibold">Loading...</p>
        </div>
    </div>
);

function EventsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isAdmin = session?.user?.role === "ADMIN";
    const [currentStatus, setCurrentStatus] = useState<"active" | "completed">("active");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [showAddEventDialog, setShowAddEventDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
    const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);
    const [eventToRegister, setEventToRegister] = useState<any | null>(null);
    const [eventToUnregister, setEventToUnregister] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<"all" | "hackathon" | "workshop" | "webinar">("all");

    // Refs for keyboard navigation
    const searchInputRef = useRef<HTMLInputElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // Use event registration hook
    const { register, unregister, isRegistering } = useEventRegistration();

    // Use event filters hook for pagination and filter state
    const { filters, setPage, setPageSize } = useEventFilters();

    // Fetch events from API with pagination and category type
    const { data: upcomingEvents, loading, pagination, refetch } = useEvents({
        status: currentStatus === 'active' ? 'ACTIVE' : 'COMPLETED',
        type: activeCategory !== 'all' ? (activeCategory.toUpperCase() as any) : undefined,
        page: filters.page,
        pageSize: filters.pageSize,
    });

    // Focus return for modals
    useFocusReturn(showRegistrationDialog);
    useFocusReturn(showUnregisterDialog);
    useFocusReturn(showLoginDialog);
    useFocusReturn(showAddEventDialog);

    // Keyboard shortcuts
    useKeyboardNavigation({
        shortcuts: [
            {
                key: '/',
                handler: (e) => {
                    e.preventDefault();
                    // Focus search input if it exists
                    if (searchInputRef.current) {
                        searchInputRef.current.focus();
                        toast.success('Search focused - start typing to search events');
                    }
                },
                description: 'Focus search input',
            },
            {
                key: 'Escape',
                handler: () => {
                    // Close any open modals
                    if (showRegistrationDialog) {
                        setShowRegistrationDialog(false);
                        setEventToRegister(null);
                    } else if (showUnregisterDialog) {
                        setShowUnregisterDialog(false);
                        setEventToUnregister(null);
                    } else if (showLoginDialog) {
                        setShowLoginDialog(false);
                    } else if (showAddEventDialog) {
                        setShowAddEventDialog(false);
                    }
                },
                description: 'Close modal or dialog',
            },
        ],
        enableFocusTracking: true,
    });

    const handleRegister = async (eventId: string, eventTitle: string) => {
        // Check if user is logged in
        if (!session) {
            setShowLoginDialog(true);
            return;
        }

        // Find the event and show confirmation dialog
        const event = upcomingEvents?.find(e => e.id === eventId);
        if (event) {
            setEventToRegister(event);
            setShowRegistrationDialog(true);
        }
    };

    const handleConfirmRegistration = async () => {
        if (!eventToRegister) return;

        try {
            await register(eventToRegister.id, eventToRegister.title);
            setShowRegistrationDialog(false);
            setEventToRegister(null);
            refetch(); // Refresh the events list
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    const handleUnregister = async (eventId: string, eventTitle?: string) => {
        if (!session) {
            setShowLoginDialog(true);
            return;
        }

        // Find the event and show confirmation dialog
        const event = upcomingEvents?.find(e => e.id === eventId);
        if (event) {
            setEventToUnregister(event);
            setShowUnregisterDialog(true);
        }
    };

    const handleConfirmUnregistration = async () => {
        if (!eventToUnregister) return;

        try {
            await unregister(eventToUnregister.id, eventToUnregister.title);
            setShowUnregisterDialog(false);
            setEventToUnregister(null);
            refetch(); // Refresh the events list
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    const handleAddToCalendar = (eventTitle: string) => {
        toast.success(`"${eventTitle}" added to your calendar.`);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        toast.success(`Selected date: ${date.toDateString()}`);
    };

    const handleAddEvent = () => {
        setShowAddEventDialog(true);
    };

    const handleEventAdded = () => {
        toast.success("Event created successfully! It will appear on the calendar.");
        setShowAddEventDialog(false);
        refetch(); // Refresh the events list
    };

    // Helper function to check if user is registered for an event
    const isUserRegistered = (eventId: string) => {
        if (!Array.isArray(upcomingEvents)) return false;
        const event = upcomingEvents.find(e => e.id === eventId);
        return (event as any)?.isUserRegistered || false;
    };

    // Filter events based on search query
    const filteredEvents = Array.isArray(upcomingEvents) ? upcomingEvents.filter(event => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            event.title.toLowerCase().includes(query) ||
            event.description?.toLowerCase().includes(query) ||
            (event as any).category?.toLowerCase().includes(query)
        );
    }) : [];

    return (
        <div className="relative min-h-screen pt-16 md:pt-24 bg-background overflow-hidden">
            {/* Background Canvas Particles */}
            <CanvasParticles />

            {/* Hero Section - Redesigned Page Hero */}
            <section className="relative pt-12 pb-8 md:pt-16 md:pb-12 text-center z-10 animate-fade-in" role="banner">
                <div className="container mx-auto px-4 max-w-4xl relative">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#29292B] dark:text-[#FFFBDB] leading-none">
                        Upcoming Events
                    </h1>
                    <p className="text-[#7582B3] dark:text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mt-4 leading-relaxed">
                        Compete, learn, build, and showcase your skills alongside tech talent from across India. Accelerate your career growth path.
                    </p>
                </div>
            </section>

            {/* Search and Filters Bar - Redesigned matching events.html and mockup */}
            <section className="relative pb-6 z-10" role="region" aria-label="Search and filter options">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Filter Chips (Categories + Statuses in a single clean row) */}
                        <div className="flex flex-wrap items-center gap-2" id="filter-chips">
                            {[
                                { id: 'all', label: 'All Events' },
                                { id: 'hackathon', label: 'Hackathons' },
                                { id: 'workshop', label: 'Workshops' },
                                { id: 'webinar', label: 'Webinars' }
                            ].map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => {
                                        setActiveCategory(chip.id as any);
                                        setPage(1); // Reset page on filter change
                                        toast.success(`Showing ${chip.label}`);
                                    }}
                                    className={cn(
                                        "px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer border",
                                        activeCategory === chip.id
                                            ? "bg-[#226CE0]/10 border-[#226CE0]/40 text-[#226CE0] dark:text-[#226CE0]"
                                            : "bg-[#FFFFFF] dark:bg-card border-border text-[#7582B3] dark:text-gray-400 hover:border-[#226CE0]/30 hover:text-[#226CE0]"
                                    )}
                                >
                                    {chip.label}
                                </button>
                            ))}

                            <div className="w-px h-6 bg-border mx-1 hidden sm:block" role="presentation" />

                            {[
                                { id: 'active', label: 'Active' },
                                { id: 'completed', label: 'Past' }
                            ].map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => {
                                        setCurrentStatus(chip.id as any);
                                        setPage(1); // Reset page on status change
                                        toast.success(`Showing ${chip.label} events`);
                                    }}
                                    className={cn(
                                        "px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer border",
                                        currentStatus === chip.id
                                            ? "bg-[#F0771A]/10 border-[#F0771A]/40 text-[#F0771A] dark:text-[#F0771A]"
                                            : "bg-[#FFFFFF] dark:bg-card border-border text-[#7582B3] dark:text-gray-400 hover:border-[#F0771A]/30 hover:text-[#F0771A]"
                                    )}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar & Admin Add Event Button */}
                        <div className="flex items-center gap-3 max-w-md w-full">
                            <div className="relative flex-1">
                                <div className="flex items-center gap-2 bg-[#FFFFFF] dark:bg-card border border-border rounded-full px-4 py-2.5 focus-within:border-[#226CE0]/50 focus-within:ring-4 focus-within:ring-[#226CE0]/10 transition-all">
                                    <Search className="w-4 h-4 text-[#7582B3]" aria-hidden="true" />
                                    <input
                                        ref={searchInputRef}
                                        type="search"
                                        placeholder="Search events, workshops, panels..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none text-[#1A234A] dark:text-white placeholder:text-[#7582B3] dark:placeholder:text-gray-500 text-sm"
                                        aria-label="Search events"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-[#7582B3] hover:text-[#1A234A] dark:hover:text-white transition-colors cursor-pointer"
                                            aria-label="Clear search"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={handleAddEvent}
                                    className="shrink-0 h-10 px-4 bg-[#F0771A] hover:bg-[#e0650d] text-white text-xs font-bold rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-[#F0771A]/10 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add Event
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

             <div className="h-px bg-border z-10 relative" role="separator" aria-hidden="true" />

            {/* Main Content */}
            <section
                className="py-8 md:py-12 lg:py-16 animate-on-scroll relative z-10"
                id="main-content"
                ref={mainContentRef}
                tabIndex={-1}
                role="main"
                aria-label="Events content"
            >
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Keyboard shortcut hint */}
                    <div className="sr-only" role="status" aria-live="polite">
                        Press forward slash (/) to focus search. Press Escape to close modals.
                    </div>

                    <div className="w-full" role="region" aria-label="Events list">
                        <div className="space-y-6 md:space-y-8 animate-fade-in-up">
                            <EventsGrid
                                events={filteredEvents}
                                isLoading={loading}
                                skeletonCount={filters.pageSize}
                                onRegister={(eventId: string) => {
                                    const event = upcomingEvents?.find(e => e.id === eventId);
                                    if (event) {
                                        handleRegister(eventId, event.title);
                                    }
                                }}
                                onUnregister={(eventId: string) => {
                                    const event = upcomingEvents?.find(e => e.id === eventId);
                                    handleUnregister(eventId, event?.title);
                                }}
                                isRegistered={isUserRegistered}
                                emptyState={
                                    <div className="text-center py-12 md:py-20 text-[#7582B3] dark:text-gray-400" role="status">
                                        <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50 text-[#226CE0]" aria-hidden="true" />
                                        <p className="text-lg md:text-xl font-bold text-[#1A234A] dark:text-white">
                                            {searchQuery ? `No events matching "${searchQuery}"` : `No ${currentStatus} events found`}
                                        </p>
                                        <p className="text-sm mt-2">
                                            {searchQuery ? 'Try a different search term' : 'Check back later for new events!'}
                                        </p>
                                    </div>
                                }
                            />

                            {/* Pagination Controls */}
                            {pagination && pagination.totalCount > 0 && (
                                <EventsPagination
                                    currentPage={filters.page}
                                    totalPages={pagination.totalPages}
                                    pageSize={filters.pageSize}
                                    totalCount={pagination.totalCount}
                                    onPageChange={setPage}
                                    onPageSizeChange={setPageSize}
                                    variant="pagination"
                                    isLoading={loading}
                                    scrollToTop={true}
                                    className="pb-4 md:pb-8"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Add Event Dialog Overlay */}
             {showAddEventDialog && (
                 <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <AddEventForm
                             open={showAddEventDialog}
                             onOpenChange={setShowAddEventDialog}
                             onEventAdded={handleEventAdded}
                        />
                    </div>
                </div>
            )}

            {/* Login Required Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="max-w-md w-[calc(100%-2rem)] mx-auto card-glass-redesign border border-border rounded-2xl text-foreground">
                    <DialogHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-[#226CE0]/10 flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-8 h-8 text-[#226CE0]" />
                        </div>
                        <DialogTitle className="text-2xl font-bold tracking-tight text-[#1A234A] dark:text-white text-center">Sign In Required</DialogTitle>
                        <DialogDescription className="text-[#7582B3] dark:text-gray-400 mt-2">
                            You need to be logged in to register for events. Please sign in or create an account to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-6">
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full h-12 bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold rounded-xl shadow-lg shadow-[#F0771A]/20 cursor-pointer"
                        >
                            Sign In
                        </Button>
                        <Button
                            onClick={() => router.push('/auth/signup')}
                            variant="outline"
                            className="w-full h-12 border-2 border-border hover:border-[#226CE0] hover:text-[#226CE0] text-[#1A234A] dark:text-white font-bold rounded-xl cursor-pointer"
                        >
                            Create Account
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Registration Confirmation Dialog */}
            <Suspense fallback={null}>
                <RegistrationConfirmDialog
                    event={eventToRegister}
                    isOpen={showRegistrationDialog}
                    onClose={() => {
                        setShowRegistrationDialog(false);
                        setEventToRegister(null);
                    }}
                    onConfirm={handleConfirmRegistration}
                    isLoading={isRegistering}
                />
            </Suspense>

            {/* Unregister Confirmation Dialog */}
            <Suspense fallback={null}>
                <UnregisterConfirmDialog
                    event={eventToUnregister}
                    isOpen={showUnregisterDialog}
                    onClose={() => {
                        setShowUnregisterDialog(false);
                        setEventToUnregister(null);
                    }}
                    onConfirm={handleConfirmUnregistration}
                    isLoading={isRegistering}
                />
            </Suspense>
        </div>
    );
}

export default function EventsClient() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <EventsPage />
        </Suspense>
    );
}
