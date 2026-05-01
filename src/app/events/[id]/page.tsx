"use client";

import { use, useEffect, useState } from "react";
import { useEvent } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    Video, 
    ArrowLeft, 
    Share2, 
    Check, 
    Sparkles, 
    AlertCircle, 
    ExternalLink,
    CheckCircle2,
    Trophy,
    Wrench,
    Tv,
    ArrowRight,
    Target,
    Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import toast from "react-hot-toast";
import { computeRegistrationStatus, getRegistrationButtonText } from "@/lib/utils/event-helpers";
import { useEventRegistration } from "@/lib/hooks/useEventRegistration";
import RegistrationConfirmDialog from "@/components/events/RegistrationConfirmDialog";
import UnregisterConfirmDialog from "@/components/events/UnregisterConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LogIn } from "lucide-react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const { data: event, loading, error, refetch } = useEvent(id);
    const [copied, setCopied] = useState(false);
    
    // Registration State
    const { register, unregister, isRegistering } = useEventRegistration();
    const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
    const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    // Reading Progress Bar
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const isRegistered = event?.isUserRegistered || false;

    const handleShare = async () => {
        if (!event) return;
        const url = window.location.href;
        const shareData = {
            title: event.title,
            text: `Join this event: ${event.title}`,
            url,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRegisterClick = () => {
        if (!session) {
            setShowLoginDialog(true);
            return;
        }
        setShowRegistrationDialog(true);
    };

    const handleUnregisterClick = () => {
        setShowUnregisterDialog(true);
    };

    const handleConfirmRegistration = async () => {
        if (!event) return;
        try {
            await register(event.id, event.title);
            setShowRegistrationDialog(false);
            refetch();
        } catch (err) {
            // Error handled in hook
        }
    };

    const handleConfirmUnregistration = async () => {
        if (!event) return;
        try {
            await unregister(event.id, event.title);
            setShowUnregisterDialog(false);
            refetch();
        } catch (err) {
            // Error handled in hook
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-[#050505]">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-[#219EBC]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#219EBC] animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-[#050505] text-white">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-3xl font-black mb-4 tracking-tight">Event Disconnected</h2>
                <p className="text-gray-400 mb-8">The event data could not be retrieved from the matrix.</p>
                <Link 
                    href="/events" 
                    className="px-8 h-14 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
                >
                    <ArrowLeft className="w-4 h-4" /> Reconnect to Events
                </Link>
            </div>
        );
    }

    const attendeeCount = event._count?.attendees || 0;
    const registrationStatus = computeRegistrationStatus(event, attendeeCount);
    const buttonText = getRegistrationButtonText(isRegistered, registrationStatus);
    const eventDate = new Date(event.date);

    const getTypeIcon = () => {
        switch (event.type) {
            case 'HACKATHON': return <Trophy className="w-5 h-5" />;
            case 'WORKSHOP': return <Wrench className="w-5 h-5" />;
            case 'WEBINAR': return <Tv className="w-5 h-5" />;
            default: return <Sparkles className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-[#219EBC]/30">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-[#219EBC] z-[100] origin-left shadow-[0_0_15px_rgba(33,158,188,0.5)]"
                style={{ scaleX }}
            />

            {/* Premium Sticky Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link 
                        href="/events" 
                        className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all font-bold uppercase tracking-[0.2em] text-[10px]"
                    >
                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-[#219EBC] transition-colors">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        Back to Events
                    </Link>
                    
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleShare}
                            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                            {copied ? 'Link Copied' : 'Share Event'}
                        </button>
                        
                        {isRegistered ? (
                            <Button
                                onClick={handleUnregisterClick}
                                className="h-11 px-8 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all rounded-full font-black text-[10px] uppercase tracking-widest"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Registered
                            </Button>
                        ) : (
                            <Button
                                onClick={handleRegisterClick}
                                disabled={!registrationStatus.isOpen || isRegistering}
                                className="h-11 px-8 bg-[#219EBC] text-white hover:bg-[#1a7a94] transition-all rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#219EBC]/20"
                            >
                                {isRegistering ? 'Processing...' : buttonText}
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 pt-32 pb-32 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-7 space-y-12">
                        <header className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-wrap gap-3"
                            >
                                <Badge className="bg-[#219EBC]/10 text-[#219EBC] border border-[#219EBC]/20 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                                    {getTypeIcon()} {event.type}
                                </Badge>
                                <Badge className="bg-secondary text-secondary-foreground border border-border px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest">
                                    {event.status}
                                </Badge>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="text-5xl md:text-8xl font-black leading-[0.95] tracking-tighter bg-gradient-to-br from-foreground via-foreground to-foreground/30 bg-clip-text text-transparent"
                            >
                                {event.title}
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.25em]"
                            >
                                <span className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-[#219EBC]" />
                                    {eventDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[#219EBC]" />
                                    {eventDate.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </motion.div>
                        </header>

                        {/* Hero Image / Video Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            className="relative aspect-video rounded-[48px] overflow-hidden group shadow-2xl shadow-primary/5 border border-border"
                        >
                            {event.imageUrl ? (
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#219EBC]/20 to-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="w-24 h-24 text-foreground/10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        </motion.div>

                        <div className="space-y-10">
                            <section className="space-y-6">
                                <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                                    <span className="w-8 h-[2px] bg-[#219EBC]" />
                                    Description
                                </h2>
                                <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:text-lg">
                                    <p>{event.description}</p>
                                </div>
                            </section>

                            {event.whoCanParticipate && (
                                <section className="space-y-6">
                                    <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                                        <span className="w-8 h-[2px] bg-[#219EBC]" />
                                        Eligibility
                                    </h2>
                                    <div className="p-8 rounded-[32px] bg-secondary/20 border border-border flex gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-[#219EBC]/10 flex items-center justify-center flex-shrink-0">
                                            <Target className="w-6 h-6 text-[#219EBC]" />
                                        </div>
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <p className="text-muted-foreground leading-relaxed italic">
                                                {event.whoCanParticipate}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {event.howItWorks && (
                                <section className="space-y-6">
                                    <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                                        <span className="w-8 h-[2px] bg-[#219EBC]" />
                                        How It Works
                                    </h2>
                                    <div className="p-8 rounded-[32px] bg-secondary/20 border border-border flex gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <p className="text-muted-foreground leading-relaxed">
                                                {event.howItWorks}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {event.creator && (
                                <section className="p-8 rounded-[32px] bg-secondary/30 border border-border flex items-center gap-6">
                                    <Avatar className="w-20 h-20 border-2 border-[#219EBC]">
                                        <AvatarImage src={event.creator.image || undefined} />
                                        <AvatarFallback className="bg-[#219EBC] text-white font-black text-xl">
                                            {event.creator.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#219EBC] uppercase tracking-widest mb-1">Organized By</p>
                                        <h3 className="text-xl font-black">{event.creator.name || 'Anonymous'}</h3>
                                        <p className="text-sm text-muted-foreground">Core Community Lead</p>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Meta & Actions */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32 space-y-8">
                            {/* Stats Card */}
                            <div className="p-10 rounded-[48px] bg-secondary/30 border border-border backdrop-blur-3xl space-y-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#219EBC]/10 blur-[80px] group-hover:bg-[#219EBC]/20 transition-all duration-700" />
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Connectivity</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="flex items-center gap-5 p-4 rounded-3xl bg-background/50 border border-border">
                                            <div className="w-12 h-12 rounded-2xl bg-[#219EBC]/10 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-[#219EBC]" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Location</p>
                                                <p className="font-bold text-sm">{event.location || 'Remote Access'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 p-4 rounded-3xl bg-background/50 border border-border">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-end mb-1">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Participants</p>
                                                        <p className="font-bold text-sm">
                                                            {attendeeCount} {event.maxSeats ? `/ ${event.maxSeats}` : '(No Limit)'}
                                                        </p>
                                                    </div>
                                                    {event.maxSeats && (
                                                        <span className="text-[10px] font-black text-muted-foreground">
                                                            {Math.round((attendeeCount / event.maxSeats) * 100)}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: event.maxSeats ? `${(attendeeCount / event.maxSeats) * 100}%` : '100%' }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className={cn(
                                                            "h-full bg-gradient-to-r from-[#219EBC] to-purple-500",
                                                            !event.maxSeats && "opacity-50"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {!isRegistered ? (
                                        <Button
                                            onClick={handleRegisterClick}
                                            disabled={!registrationStatus.isOpen || isRegistering}
                                            className="w-full h-16 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/5 group"
                                        >
                                            {isRegistering ? 'Connecting...' : buttonText}
                                            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-6 rounded-[24px] bg-green-500/10 border border-green-500/20 text-center">
                                                <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Access Granted</p>
                                                <p className="text-sm text-muted-foreground mb-6">You are successfully registered for this event.</p>
                                                
                                                {event.meetingLink && (
                                                    <Button
                                                        onClick={() => window.open(event.meetingLink!, '_blank')}
                                                        className="w-full h-14 bg-green-500 text-white hover:bg-green-600 transition-all rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                                                    >
                                                        <Video className="w-4 h-4" /> Join Virtual Space
                                                    </Button>
                                                )}
                                            </div>
                                            <button 
                                                onClick={handleUnregisterClick}
                                                className="w-full text-center text-[10px] font-bold text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest"
                                            >
                                                Revoke Registration
                                            </button>
                                        </div>
                                    )}
                                    
                                    {!registrationStatus.isOpen && (
                                        <p className="text-center text-xs text-red-500 font-bold uppercase tracking-widest animate-pulse">
                                            {registrationStatus.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Extra Info / Perks */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[32px] bg-secondary/30 border border-border text-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">NFT Drops</p>
                                    <p className="text-[9px] text-muted-foreground">Exclusives</p>
                                </div>
                                <div className="p-6 rounded-[32px] bg-secondary/30 border border-border text-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                                        <ExternalLink className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Proof</p>
                                    <p className="text-[9px] text-muted-foreground">Certification</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals & Dialogs */}
            <RegistrationConfirmDialog
                event={event}
                isOpen={showRegistrationDialog}
                onClose={() => setShowRegistrationDialog(false)}
                onConfirm={handleConfirmRegistration}
                isLoading={isRegistering}
            />

            <UnregisterConfirmDialog
                event={event}
                isOpen={showUnregisterDialog}
                onClose={() => setShowUnregisterDialog(false)}
                onConfirm={handleConfirmUnregistration}
                isLoading={isRegistering}
            />

            {/* Login Required Dialog */}
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="max-w-md bg-background border border-border text-foreground rounded-[32px]">
                    <DialogHeader className="text-center">
                        <div className="w-20 h-20 rounded-full bg-[#219EBC]/10 flex items-center justify-center mx-auto mb-6">
                            <LogIn className="w-10 h-10 text-[#219EBC]" />
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-center">Auth Required</DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2 text-center">
                            You must be authenticated to join this virtual session.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-8">
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full h-14 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-black rounded-2xl uppercase tracking-widest text-[10px]"
                        >
                            Sign In
                        </Button>
                        <Button
                            onClick={() => router.push('/auth/signup')}
                            variant="outline"
                            className="w-full h-14 border-border hover:bg-accent text-foreground font-black rounded-2xl uppercase tracking-widest text-[10px]"
                        >
                            Create Identity
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
