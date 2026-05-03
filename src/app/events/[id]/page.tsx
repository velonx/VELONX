"use client";

import { use, useState, useEffect } from "react";
import { useEvent } from "@/lib/api/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import {
    Calendar, Clock, MapPin, Users, Video, ArrowLeft,
    Share2, Check, Sparkles, AlertCircle, CheckCircle2,
    Trophy, Wrench, Tv, Star, Gift, Globe, LogIn, Medal, Award, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { computeRegistrationStatus, getRegistrationButtonText } from "@/lib/utils/event-helpers";
import { useEventRegistration } from "@/lib/hooks/useEventRegistration";
import RegistrationConfirmDialog from "@/components/events/RegistrationConfirmDialog";
import UnregisterConfirmDialog from "@/components/events/UnregisterConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const { data: event, loading, error, refetch } = useEvent(id);
    const [copied, setCopied] = useState(false);
    const { register, unregister, isRegistering } = useEventRegistration();
    const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
    const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const isRegistered = event?.isUserRegistered || false;

    // Fetch rewards from DB
    type EventReward = { id: string; title: string; description: string; iconType: string; rankRequired: number | null; quantity: number | null; order: number };
    const [rewards, setRewards] = useState<EventReward[]>([]);
    useEffect(() => {
        if (!id) return;
        fetch(`/api/events/${id}/rewards`)
            .then(r => r.json())
            .then(j => { if (j.success) setRewards(j.data); })
            .catch(() => {});
    }, [id]);

    const getRewardIcon = (iconType: string) => {
        switch (iconType) {
            case 'trophy':      return <Trophy className="w-8 h-8 text-[#FFB703]" />;
            case 'star':        return <Star className="w-8 h-8 text-[#F9A8D4]" />;
            case 'gift':        return <Gift className="w-8 h-8 text-[#6EE7B7]" />;
            case 'certificate': return <Award className="w-8 h-8 text-[#219EBC]" />;
            case 'medal':       return <Medal className="w-8 h-8 text-orange-400" />;
            case 'zap':         return <Zap className="w-8 h-8 text-purple-400" />;
            default:            return <Trophy className="w-8 h-8 text-[#FFB703]" />;
        }
    };

    const handleShare = async () => {
        if (!event) return;
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: event.title, text: `Join: ${event.title}`, url }); } catch { }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRegisterClick = () => {
        if (!session) { setShowLoginDialog(true); return; }
        setShowRegistrationDialog(true);
    };

    const handleConfirmRegistration = async () => {
        if (!event) return;
        try { await register(event.id, event.title); setShowRegistrationDialog(false); refetch(); } catch { }
    };

    const handleConfirmUnregistration = async () => {
        if (!event) return;
        try { await unregister(event.id, event.title); setShowUnregisterDialog(false); refetch(); } catch { }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[#219EBC]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <AlertCircle className="w-14 h-14 text-red-500 mb-6" />
                <h2 className="text-3xl font-bold mb-3">Event not found</h2>
                <p className="text-muted-foreground mb-8">The event data could not be retrieved.</p>
                <Link href="/events" className="px-8 py-3 bg-[#219EBC] text-white rounded-full font-semibold flex items-center gap-2 hover:bg-[#1a7a94] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </Link>
            </div>
        );
    }

    const attendeeCount = event._count?.attendees || 0;
    const registrationStatus = computeRegistrationStatus(event, attendeeCount);
    const buttonText = getRegistrationButtonText(isRegistered, registrationStatus);
    const eventDate = new Date(event.date);

    const howLines = event.howItWorks
        ? event.howItWorks.split('\n').filter(l => l.trim().length > 0)
        : [];
    const whoLines = event.whoCanParticipate
        ? event.whoCanParticipate.split('\n').filter(l => l.trim().length > 0)
        : [];

    const parseLine = (line: string) => {
        const ci = line.indexOf(':');
        const di = line.indexOf('-');
        const idx = ci !== -1 && ci < 50 ? ci : di !== -1 && di < 50 ? di : -1;
        if (idx !== -1) return { title: line.substring(0, idx).trim(), desc: line.substring(idx + 1).trim() };
        return { title: line, desc: "" };
    };

    const getTypeLabel = () => {
        switch (event.type) {
            case 'HACKATHON': return 'Hackathon';
            case 'WORKSHOP': return 'Workshop';
            case 'WEBINAR': return 'Webinar';
            default: return event.type;
        }
    };

    const RegisterBtn = ({ size = "default", invert = false }: { size?: "default" | "lg"; invert?: boolean }) => {
        const base = size === "lg" ? "px-10 py-4 text-base font-bold" : "px-6 py-2.5 text-sm font-semibold";
        if (isRegistered) {
            return (
                <button onClick={() => setShowUnregisterDialog(true)}
                    className={`${base} rounded-full flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 transition-colors`}>
                    <CheckCircle2 className="w-4 h-4" /> Registered
                </button>
            );
        }
        const bg = invert
            ? "bg-white text-[#023047] hover:bg-gray-100"
            : "bg-[#219EBC] text-white hover:bg-[#1a7a94]";
        return (
            <button onClick={handleRegisterClick} disabled={!registrationStatus.isOpen || isRegistering}
                className={`${base} ${bg} rounded-full transition-colors disabled:opacity-50`}>
                {isRegistering ? 'Processing...' : buttonText}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Reading progress */}
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#219EBC] z-[100] origin-left" style={{ scaleX }} />


            {/* ── HERO ── */}
            <section className="relative pt-24 overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#4c1d95] to-[#be185d]">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white blur-[80px]" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#FFB703] blur-[120px]" />
                </div>
                <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-28 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            {getTypeLabel()} · {event.status}
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
                            {event.title}
                        </h1>
                        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                            {event.description?.split('\n')[0] || 'Join this exclusive event and level up your skills.'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {[
                                { icon: <Calendar className="w-4 h-4" />, text: eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) },
                                { icon: <Clock className="w-4 h-4" />, text: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) },
                                { icon: <MapPin className="w-4 h-4" />, text: event.location || 'Online' },
                                { icon: <Users className="w-4 h-4" />, text: `${attendeeCount}${event.maxSeats ? ` / ${event.maxSeats}` : ''} participants` },
                            ].map((chip, i) => (
                                <span key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full border border-white/20 text-sm">
                                    {chip.icon}{chip.text}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <RegisterBtn size="lg" invert />
                            <button onClick={handleShare}
                                className="px-10 py-4 rounded-full font-bold text-base border-2 border-white text-white hover:bg-white/10 transition-colors">
                                Share Event
                            </button>
                        </div>
                    </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" className="fill-background" />
                    </svg>
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section className="bg-background py-20">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">About this event</h2>
                        <div className="text-muted-foreground text-[17px] leading-[1.8] whitespace-pre-wrap">
                            {event.description}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border shadow-lg bg-card p-7 space-y-5">
                            <h3 className="font-bold text-card-foreground text-lg">Event Details</h3>
                            <div className="space-y-4 text-sm">
                                {[
                                    { icon: <Calendar className="w-4 h-4 text-[#219EBC]" />, label: 'Date', value: eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) },
                                    { icon: <Clock className="w-4 h-4 text-[#219EBC]" />, label: 'Time', value: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) },
                                    { icon: <MapPin className="w-4 h-4 text-[#219EBC]" />, label: 'Location', value: event.location || 'Online / Virtual' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">{item.icon}</div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                                            <p className="font-semibold text-card-foreground">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-[#219EBC]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Participants</p>
                                        <p className="font-semibold text-card-foreground">{attendeeCount}{event.maxSeats ? ` / ${event.maxSeats}` : ' registered'}</p>
                                        {event.maxSeats && (
                                            <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((attendeeCount / event.maxSeats) * 100, 100)}%` }}
                                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-[#219EBC] to-[#023047] rounded-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 space-y-3">
                                <div className="w-full flex">
                                    <RegisterBtn />
                                </div>
                                {!registrationStatus.isOpen && (
                                    <p className="text-center text-xs text-red-500 font-medium">{registrationStatus.message}</p>
                                )}
                                {isRegistered && event.meetingLink && (
                                    <button onClick={() => window.open(event.meetingLink!, '_blank')}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-green-500 text-green-500 font-semibold text-sm hover:bg-green-500/10 transition-colors">
                                        <Video className="w-4 h-4" /> Join Meeting
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            {howLines.length > 0 && (
                <section className="bg-muted/40 py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How it works</h2>
                            <p className="text-muted-foreground mt-3 text-[16px]">Every challenge follows these steps</p>
                        </div>
                        <div className="relative">
                            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-4 right-4 h-[2px] border-t-2 border-dashed border-border z-0" />
                            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(howLines.length, 4)} gap-6 relative z-10`}>
                                {howLines.map((line, i) => {
                                    const { title, desc } = parseLine(line);
                                    const isPink = i % 2 === 0;
                                    return (
                                        <div key={i}
                                            className={`rounded-2xl p-6 shadow-sm ${isPink
                                                ? 'bg-[#F9A8D4] dark:bg-[#9d3f6a]'
                                                : 'bg-[#6EE7B7] dark:bg-[#065f46]'
                                            }`}>
                                            <h4 className="font-bold text-[#023047] dark:text-white text-[16px] mb-2">{title}</h4>
                                            {desc && <p className="text-[#023047]/70 dark:text-white/80 text-[14px] leading-relaxed">{desc}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── WHO CAN PARTICIPATE ── */}
            {whoLines.length > 0 && (
                <section className="bg-background py-20">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Who can participate?</h2>
                        </div>
                        <div className="flex flex-col md:flex-row items-start justify-center gap-0">
                            {/* Root node */}
                            <div className="flex md:items-center md:justify-end w-full md:w-auto mb-6 md:mb-0">
                                <div className="bg-muted border border-border px-5 py-4 rounded-xl flex items-center gap-3 shadow-sm min-w-[220px]">
                                    <Globe className="w-5 h-5 text-[#219EBC] flex-shrink-0" />
                                    <span className="font-medium text-[14px] text-foreground">Open to everyone!</span>
                                </div>
                            </div>
                            {/* Connector */}
                            <div className="hidden md:flex items-center mx-0">
                                <div className="w-10 h-[2px] bg-[#F9A8D4]" />
                            </div>
                            {/* Branches */}
                            <div className="flex flex-col gap-5 relative w-full md:w-auto md:min-w-[420px]">
                                {whoLines.map((line, i, arr) => {
                                    const { title, desc } = parseLine(line);
                                    return (
                                        <div key={i} className="relative flex items-center">
                                            {arr.length > 1 && (
                                                <div className="hidden md:block">
                                                    <div className={`absolute -left-10 w-[2px] bg-[#F9A8D4] ${i === 0 ? 'top-1/2 bottom-[-2.5rem]' : i === arr.length - 1 ? 'top-[-2.5rem] bottom-1/2' : 'top-[-2.5rem] bottom-[-2.5rem]'}`} />
                                                    <div className="absolute -left-10 w-10 h-[2px] bg-[#F9A8D4] top-1/2 -translate-y-1/2" />
                                                </div>
                                            )}
                                            <div className="rounded-2xl p-5 w-full border border-border shadow-sm bg-gradient-to-r from-[#e0f7fa] to-[#fce4ec] dark:from-[#004d56] dark:to-[#5a0a36]">
                                                <h4 className="font-bold text-[#023047] dark:text-white text-[15px] mb-1">{title}</h4>
                                                {desc && <p className="text-gray-600 dark:text-gray-300 text-[13px] leading-relaxed">{desc}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── REWARDS ── */}
            {rewards.length > 0 && (
                <section className="py-24 relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#4c1d95] to-[#be185d]">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FFB703] blur-[120px]" />
                    </div>
                    <div className="relative max-w-5xl mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Rewards: Earn Recognition</h2>
                        <p className="text-white/70 text-[16px] mb-14">The more you build, the more you earn.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {rewards.map((r, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-left hover:bg-white/15 transition-colors">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5">{getRewardIcon(r.iconType)}</div>
                                    <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2 flex-wrap">
                                        {r.title}
                                        {r.rankRequired && (
                                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                                                Top {r.rankRequired}
                                            </span>
                                        )}
                                        {r.quantity && (
                                            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                                                ×{r.quantity}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-white/70 text-[14px] leading-relaxed">{r.description}</p>
                                </div>
                            ))}
                        </div>
                        <RegisterBtn size="lg" invert />
                    </div>
                </section>
            )}

            {/* ── ORGANIZER ── */}
            {event.creator && (
                <section className="bg-background py-16">
                    <div className="max-w-2xl mx-auto px-6 text-center">
                        <p className="text-xs font-bold text-[#219EBC] uppercase tracking-widest mb-5">Organized By</p>
                        <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-[#219EBC]/20">
                            <AvatarImage src={event.creator.image || undefined} />
                            <AvatarFallback className="bg-[#023047] text-white font-bold text-2xl">
                                {event.creator.name?.[0] || 'V'}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold text-foreground">{event.creator.name || 'Velonx Team'}</h3>
                        <p className="text-muted-foreground text-sm mt-1">Event Organizer</p>
                    </div>
                </section>
            )}

            {/* ── MODALS ── */}
            <RegistrationConfirmDialog event={event} isOpen={showRegistrationDialog} onClose={() => setShowRegistrationDialog(false)} onConfirm={handleConfirmRegistration} isLoading={isRegistering} />
            <UnregisterConfirmDialog event={event} isOpen={showUnregisterDialog} onClose={() => setShowUnregisterDialog(false)} onConfirm={handleConfirmUnregistration} isLoading={isRegistering} />

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="max-w-md bg-card border border-border text-card-foreground rounded-2xl">
                    <DialogHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-[#219EBC]/10 flex items-center justify-center mx-auto mb-5">
                            <LogIn className="w-8 h-8 text-[#219EBC]" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center text-card-foreground">Sign in required</DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2 text-center">
                            You must be signed in to register for this event.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-6">
                        <Button onClick={() => router.push('/auth/login')} className="w-full h-12 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold rounded-xl">Sign In</Button>
                        <Button onClick={() => router.push('/auth/signup')} variant="outline" className="w-full h-12 border-border text-foreground font-semibold rounded-xl hover:bg-muted">Create Account</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
