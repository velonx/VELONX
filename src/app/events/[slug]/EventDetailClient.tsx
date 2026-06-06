"use client";

import { useState, useEffect } from "react";
import { useEvent } from "@/lib/api/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Video, ArrowLeft, AlertCircle, CheckCircle2, Trophy, Star, Gift, Award, Medal, Zap, Share2, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { computeRegistrationStatus, getRegistrationButtonText } from "@/lib/utils/event-helpers";
import { useEventRegistration } from "@/lib/hooks/useEventRegistration";
import RegistrationConfirmDialog from "@/components/events/RegistrationConfirmDialog";
import UnregisterConfirmDialog from "@/components/events/UnregisterConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarExportMenu } from "@/components/events/CalendarExportMenu";

interface EventDetailClientProps {
    slug: string;
    initialEvent: any;
}

export default function EventDetailClient({ slug, initialEvent }: EventDetailClientProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { data: eventData, loading: hookLoading, error: hookError, refetch } = useEvent(slug);
    const [copied, setCopied] = useState(false);
    const { register, unregister, isRegistering } = useEventRegistration();
    const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
    const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    // Prefer client hook data, fall back to initial server-rendered data
    const event = eventData || initialEvent;
    const loading = hookLoading && !event;
    const error = hookError && !event;

    const isRegistered = event?.isUserRegistered || false;

    type EventReward = { id: string; title: string; description: string; iconType: string; rankRequired: number | null; quantity: number | null; order: number };
    const [rewards, setRewards] = useState<EventReward[]>([]);
    useEffect(() => {
        if (!event?.id) return;
        fetch(`/api/events/${event.id}/rewards`)
            .then(r => r.json())
            .then(j => { if (j.success) setRewards(j.data); })
            .catch(() => {});
    }, [event?.id]);

    const getRewardIcon = (iconType: string) => {
        switch (iconType) {
            case 'trophy':      return <Trophy className="w-7 h-7 text-[#FFB703]" />;
            case 'star':        return <Star className="w-7 h-7 text-[#F9A8D4]" />;
            case 'gift':        return <Gift className="w-7 h-7 text-[#6EE7B7]" />;
            case 'certificate': return <Award className="w-7 h-7 text-[#A78BFA]" />;
            case 'medal':       return <Medal className="w-7 h-7 text-orange-400" />;
            case 'zap':         return <Zap className="w-7 h-7 text-purple-400" />;
            default:            return <Trophy className="w-7 h-7 text-[#FFB703]" />;
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

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-[#7C3AED]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#7C3AED] border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-5">
                <AlertCircle className="w-14 h-14 text-red-500" />
                <h2 className="text-3xl font-bold">Event not found</h2>
                <p className="text-muted-foreground">The event could not be retrieved.</p>
                <Link href="/events" className="inline-flex items-center gap-2 px-7 py-3 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </Link>
            </div>
        );
    }

    const attendeeCount = event._count?.attendees || 0;
    const registrationStatus = computeRegistrationStatus(event, attendeeCount);
    const buttonText = getRegistrationButtonText(isRegistered, registrationStatus);
    const eventDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : null;

    const howLines = event.howItWorks
        ? event.howItWorks.split('\n').filter((l: string) => l.trim().length > 0)
        : [];

    const parseLine = (line: string) => {
        const ci = line.indexOf(':');
        const di = line.indexOf('-');
        const idx = ci !== -1 && ci < 50 ? ci : di !== -1 && di < 50 ? di : -1;
        if (idx !== -1) return { title: line.substring(0, idx).trim(), desc: line.substring(idx + 1).trim() };
        return { title: line, desc: "" };
    };

    const formatDate = (d: Date) =>
        d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const formatTime = (d: Date) =>
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const dateDisplay = endDate
        ? `${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : formatDate(eventDate);

    const typeLabel = event.type === 'HACKATHON' ? 'Hackathon' : event.type === 'WORKSHOP' ? 'Workshop' : 'Webinar';
    const bannerLabel = event.type === 'HACKATHON' ? 'V-HACK' : event.type === 'WORKSHOP' ? 'WORKSHOP' : 'WEBINAR';

    const displayButtonText = (buttonText === 'Register Now' && event.type === 'WEBINAR') ? 'Set Reminder 🔔' : buttonText;

    const RegisterBtn = ({ full = false, lg = false }: { full?: boolean; lg?: boolean }) => {
        const baseClass = cn(
            "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 cursor-pointer border-none",
            lg ? "px-8 py-4 text-base" : "px-6 py-3 text-sm",
            full && "w-full"
        );

        if (isRegistered) {
            return (
                <button
                    onClick={() => setShowUnregisterDialog(true)}
                    className={cn(baseClass, "bg-linear-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-lg shadow-green-500/20")}
                >
                    <CheckCircle2 className="w-4 h-4" /> Registered ✓
                </button>
            );
        }

        if (!registrationStatus.isOpen) {
            return (
                <button disabled className={cn(baseClass, "bg-muted text-muted-foreground opacity-60 cursor-not-allowed")}>
                    Registration Closed
                </button>
            );
        }

        return (
            <button
                onClick={handleRegisterClick}
                disabled={isRegistering}
                className={cn(baseClass, "bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#7C3AED]/30")}
                style={{ boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 4px 15px rgba(0,0,0,0.3)" }}
            >
                {isRegistering ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                    <>{displayButtonText} ⚡</>
                )}
            </button>
        );
    };

    return (
        <div className="min-h-screen text-foreground" style={{ background: "var(--background)" }}>
            {/* ── Animated mesh background ── */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-80"
                    style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 60%)", animation: "mesh-drift 20s ease-in-out infinite alternate" }} />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-80"
                    style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.10) 0%, transparent 60%)", animation: "mesh-drift 25s ease-in-out infinite alternate-reverse" }} />
            </div>

            {/* ── Back button ── */}
            <div className="relative z-10 pt-20 pb-4">
                <div className="max-w-7xl mx-auto px-8">
                    <Link href="/events"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Events
                    </Link>
                </div>
            </div>

            {/* ── Main 2.5fr / 1fr layout ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-12 lg:gap-16">

                    {/* ══════════════ MAIN CONTENT ══════════════ */}
                    <main className="min-w-0">

                        {/* Banner */}
                        <div
                            className="relative w-full overflow-hidden flex items-center justify-center mb-9"
                            style={{
                                height: "280px",
                                borderRadius: "24px",
                                background: "var(--bg-tertiary, #121428)",
                                border: "1px solid rgba(124,58,237,0.30)",
                                boxShadow: "0 0 40px rgba(124,58,237,0.25), 0 0 80px rgba(124,58,237,0.10)",
                            }}
                        >
                            {event.imageUrl ? (
                                <>
                                    <Image
                                        src={event.imageUrl}
                                        alt={event.title}
                                        fill
                                        className="object-cover object-center"
                                        sizes="(max-width: 1024px) 100vw, 75vw"
                                        quality={90}
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                                </>
                            ) : (
                                <span
                                    className="select-none font-black uppercase tracking-widest"
                                    style={{
                                        fontFamily: "var(--font-heading, Inter)",
                                        fontSize: "clamp(2rem, 5vw, 4.5rem)",
                                        color: "rgba(255,255,255,0.08)",
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    {bannerLabel}
                                </span>
                            )}

                            {/* Status badge */}
                            <span
                                className={cn(
                                    "absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                    event.status === 'ONGOING'
                                        ? "badge-event badge-green badge-live"
                                        : event.status === 'UPCOMING'
                                        ? "badge-event badge-violet"
                                        : "bg-gray-500/10 border border-gray-500/20 text-gray-400"
                                    )}
                            >
                                {event.status === 'ONGOING' ? `LIVE ${typeLabel.toUpperCase()}` : `${event.status} ${typeLabel.toUpperCase()}`}
                            </span>

                            {/* Share button */}
                            <button
                                onClick={handleShare}
                                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center border border-white/20 bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-all cursor-pointer"
                                title={copied ? "Link copied!" : "Share event"}
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Title */}
                        <h1
                            style={{
                                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                                fontWeight: 900,
                                lineHeight: 1.2,
                                letterSpacing: "-0.02em",
                                marginBottom: "1rem",
                                color: "var(--foreground)",
                            }}
                        >
                            {event.title}
                        </h1>

                        {/* Meta chips */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { icon: <Calendar className="w-3.5 h-3.5" />, text: dateDisplay },
                                { icon: <Clock className="w-3.5 h-3.5" />, text: formatTime(eventDate) },
                                { icon: <MapPin className="w-3.5 h-3.5" />, text: event.location || 'Online' },
                                { icon: <Users className="w-3.5 h-3.5" />, text: `${attendeeCount}${event.maxSeats ? ` / ${event.maxSeats}` : ''} participants` },
                            ].map((chip, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                                    style={{
                                        background: "rgba(124,58,237,0.08)",
                                        borderColor: "rgba(124,58,237,0.20)",
                                        color: "var(--muted-foreground)",
                                    }}
                                >
                                    {chip.icon}{chip.text}
                                </span>
                            ))}
                        </div>

                        {/* About description */}
                        <p
                            style={{
                                color: "var(--muted-foreground)",
                                lineHeight: 1.75,
                                fontSize: "0.9375rem",
                                marginBottom: "2.5rem",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {event.description}
                        </p>

                        {/* ── Prizes / Rewards Bento Grid ── */}
                        {rewards.length > 0 && (
                            <div style={{ marginBottom: "2.5rem" }}>
                                <h2 className="ed-section-title">Prizes &amp; Rewards</h2>
                                <div className="ed-prize-grid">
                                    {rewards.map((r, i) => {
                                        const rankText = r.rankRequired
                                            ? r.rankRequired === 1
                                                ? "🥇 1st Place"
                                                : r.rankRequired === 2
                                                ? "🥈 2nd Place"
                                                : r.rankRequired === 3
                                                ? "🥉 3rd Place"
                                                : `🏆 Top ${r.rankRequired}`
                                            : "🎁 Event Perk";
                                        return (
                                            <div key={i} className="ed-prize-card">
                                                <div className="ed-prize-rank">{rankText}</div>
                                                <div className="ed-prize-amount">{getRewardIcon(r.iconType)}</div>
                                                <div className="ed-prize-title">{r.title}</div>
                                                {r.quantity && (
                                                    <div className="ed-prize-qty">Quantity: {r.quantity}</div>
                                                )}
                                                <p className="ed-prize-desc">{r.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── How it works / Timeline ── */}
                        {howLines.length > 0 && (
                            <div style={{ marginTop: "2rem" }}>
                                <h2 className="ed-section-title">Schedule &amp; Tracks</h2>
                                <div className="ed-timeline-list">
                                    {howLines.map((line: string, i: number) => {
                                        const { title, desc } = parseLine(line);
                                        return (
                                            <div key={i} className="ed-timeline-item">
                                                <div className="ed-timeline-dot" />
                                                <div className="ed-timeline-time">Step {i + 1}</div>
                                                <h3 className="ed-timeline-title">{title}</h3>
                                                {desc && <p className="ed-timeline-desc">{desc}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Organizer ── */}
                        {event.creator && (
                            <div
                                className="mt-12 flex items-center gap-4 p-5 rounded-2xl border"
                                style={{
                                    background: "rgba(255,255,255,0.02)",
                                    borderColor: "rgba(255,255,255,0.06)",
                                }}
                            >
                                <Avatar className="w-12 h-12 ring-2 ring-[#7C3AED]/30 shrink-0">
                                    <AvatarImage src={event.creator.image || undefined} />
                                    <AvatarFallback className="bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white font-bold">
                                        {event.creator.name?.[0] || 'V'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#A78BFA] mb-0.5">Organized by</p>
                                    <p className="font-bold text-foreground">{event.creator.name || 'Velonx Team'}</p>
                                    <p className="text-xs text-muted-foreground">Event Organizer</p>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* ══════════════ SIDEBAR ══════════════ */}
                    <aside className="lg:pt-0">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-5">

                            {/* Quick Details Card */}
                            <div
                                className="rounded-2xl border p-6"
                                style={{
                                    background: "rgba(255,255,255,0.025)",
                                    borderColor: "rgba(255,255,255,0.08)",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                }}
                            >
                                <h3 className="font-bold text-foreground text-base mb-5">Quick Details</h3>

                                <div className="flex flex-col gap-4 mb-6">
                                    {[
                                        { label: "Date", value: dateDisplay },
                                        { label: "Format", value: event.location || 'Online' },
                                        { label: "Type", value: typeLabel },
                                        {
                                            label: "Entry Fee",
                                            value: 'FREE',
                                            highlight: true,
                                        },
                                        ...(attendeeCount > 0 || event.maxSeats ? [{
                                            label: "Participants",
                                            value: `${attendeeCount}${event.maxSeats ? ` / ${event.maxSeats}` : ' registered'}`,
                                        }] : []),
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                                            <span className="text-muted-foreground">{item.label}:</span>
                                            <strong
                                                className={cn("text-right", item.highlight ? "text-[#10B981]" : "text-foreground")}
                                            >
                                                {item.value}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                {/* Seats progress bar */}
                                {event.maxSeats && (
                                    <div className="mb-6">
                                        <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                                            <div
                                                className="h-full rounded-full bg-linear-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-1000"
                                                style={{ width: `${Math.min((attendeeCount / event.maxSeats) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1.5">
                                            {Math.round((attendeeCount / event.maxSeats) * 100)}% seats filled
                                        </p>
                                    </div>
                                )}

                                {/* Register CTA */}
                                <RegisterBtn full />

                                {!registrationStatus.isOpen && (
                                    <p className="text-center text-xs text-red-400 mt-2">{registrationStatus.message}</p>
                                )}

                                {/* Calendar Export Button */}
                                <div className="mt-3">
                                    <CalendarExportMenu
                                        event={event}
                                        isRegistered={isRegistered}
                                        className="w-full h-11 rounded-full border border-white/10 hover:bg-white/5 bg-transparent text-foreground hover:text-foreground font-semibold flex items-center justify-center gap-2"
                                    />
                                </div>

                                {/* Join Meeting link (if registered) */}
                                {isRegistered && event.meetingLink && (
                                    <button
                                        onClick={() => window.open(event.meetingLink!, '_blank')}
                                        className="mt-3 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full border text-sm font-semibold transition-colors cursor-pointer"
                                        style={{
                                            borderColor: "rgba(16,185,129,0.4)",
                                            color: "#10B981",
                                            background: "rgba(16,185,129,0.05)",
                                        }}
                                    >
                                        <Video className="w-4 h-4" /> Join Meeting
                                    </button>
                                )}
                            </div>

                            {/* Community Perks Card */}
                            <div
                                className="rounded-2xl border p-6"
                                style={{
                                    background: "rgba(255,255,255,0.025)",
                                    borderColor: "rgba(255,255,255,0.08)",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                }}
                            >
                                <h3 className="font-bold text-foreground text-base mb-3">Community Perks</h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                    All successful project submissions automatically receive{" "}
                                    <strong className="text-[#A78BFA]">100 Velonx Coins (VX)</strong>{" "}
                                    which can be redeemed in the Swag Shop for hoodies, flasks, and stickers.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {["🎁 Swag", "🏅 Badges", "💰 VX Coins", "📜 Certificates"].map(perk => (
                                        <span key={perk}
                                            className="text-xs px-3 py-1 rounded-full border font-medium"
                                            style={{
                                                background: "rgba(124,58,237,0.08)",
                                                borderColor: "rgba(124,58,237,0.20)",
                                                color: "#A78BFA",
                                            }}
                                        >
                                            {perk}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Share Card */}
                            <div
                                className="rounded-2xl border p-5 flex items-center gap-4"
                                style={{
                                    background: "rgba(255,255,255,0.02)",
                                    borderColor: "rgba(255,255,255,0.06)",
                                }}
                            >
                                <button
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer hover:opacity-80"
                                    style={{
                                        background: "rgba(6,182,212,0.08)",
                                        borderColor: "rgba(6,182,212,0.25)",
                                        color: "#06B6D4",
                                    }}
                                >
                                    <Share2 className="w-4 h-4" />
                                    {copied ? "Link Copied!" : "Share Event"}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── Modals ── */}
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

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent className="max-w-md w-[calc(100%-2rem)] mx-auto rounded-2xl border border-border bg-card text-card-foreground">
                    <DialogHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-8 h-8 text-[#A78BFA]" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center">Sign in required</DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-2 text-center">
                            You must be signed in to register for this event.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-6">
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full h-12 font-semibold rounded-xl text-white border-none cursor-pointer"
                            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)" }}
                        >
                            Sign In
                        </Button>
                        <Button
                            onClick={() => router.push('/auth/signup')}
                            variant="outline"
                            className="w-full h-12 border-border text-foreground font-semibold rounded-xl hover:bg-muted cursor-pointer"
                        >
                            Create Account
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
