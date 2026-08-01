"use client";

import { useState, useEffect } from "react";
import { useEvent } from "@/lib/api/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Video, ArrowLeft, AlertCircle, CheckCircle2, Trophy, Star, Gift, Award, Medal, Zap, Share2, LogIn, ChevronDown, Mail } from 'lucide-react';
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
    const [openFaq, setOpenFaq] = useState<number | null>(null);

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

    type EventFAQ = { id: string; question: string; answer: string; order: number };
    const [faqs, setFaqs] = useState<EventFAQ[]>([]);
    useEffect(() => {
        if (!event?.id) return;
        fetch(`/api/events/${event.id}/faqs`)
            .then(r => r.json())
            .then(j => { if (j.success) setFaqs(j.data); })
            .catch(() => {});
    }, [event?.id]);

    // ── Countdown Timer ──
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    useEffect(() => {
        if (!event?.date || event.status !== 'UPCOMING') return;
        const target = new Date(event.date).getTime();
        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, target - now);
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [event?.date, event?.status]);

    const getRewardIcon = (iconType: string) => {
        switch (iconType) {
            case 'trophy':      return <span className="text-3xl select-none" role="img" aria-label="Trophy">🏆</span>;
            case 'star':        return <span className="text-3xl select-none" role="img" aria-label="Star">🌟</span>;
            case 'gift':        return <span className="text-3xl select-none" role="img" aria-label="Gift">🎁</span>;
            case 'certificate': return <span className="text-3xl select-none" role="img" aria-label="Certificate">📜</span>;
            case 'medal':       return <span className="text-3xl select-none" role="img" aria-label="Medal">🏅</span>;
            case 'zap':         return <span className="text-3xl select-none" role="img" aria-label="Zap">⚡</span>;
            default:            return <span className="text-3xl select-none" role="img" aria-label="Trophy">🏆</span>;
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
                    <div className="absolute inset-0 rounded-full border-4 border-[#F0771A]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#F0771A] border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-5">
                <AlertCircle className="w-14 h-14 text-red-500" />
                <h2 className="heading-section text-3xl">Event not found</h2>
                <p className="text-muted-foreground">The event could not be retrieved.</p>
                <Link href="/events" className="inline-flex items-center gap-2 px-7 py-3 bg-[#F0771A] text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
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

    const parseLine = (raw: string) => {
        // Strip common list prefixes the author may type (e.g. "1.", "2)", "-", "•")
        const line = raw.replace(/^\s*(?:\d+[.)]|[-•*])\s+/, '').trim();
        const ci = line.indexOf(':');
        // Only treat a spaced " - " as a title/description separator so hyphens
        // inside words (e.g. "Sign-up") don't split the title.
        const di = line.indexOf(' - ');
        if (ci !== -1 && ci < 60) return { title: line.substring(0, ci).trim(), desc: line.substring(ci + 1).trim() };
        if (di !== -1 && di < 60) return { title: line.substring(0, di).trim(), desc: line.substring(di + 3).trim() };
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

    const getTierColor = (rank: number | null) => {
        if (rank === 1) return '#FFD700';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return '#F0771A';
    };

    const RegisterBtn = ({ full = false, lg = false }: { full?: boolean; lg?: boolean }) => {
        const baseClass = cn(
            "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 cursor-pointer border-none",
            lg ? "px-8 py-4 text-base" : "px-6 py-3 text-sm",
            full && "w-full"
        );

        if (isRegistered && (registrationStatus.isOpen || registrationStatus.reason === 'capacity')) {
            return (
                <button
                    onClick={() => setShowUnregisterDialog(true)}
                    className={cn(baseClass, "bg-green-600 text-white hover:opacity-90 shadow-lg shadow-green-500/20")}
                >
                    <CheckCircle2 className="w-4 h-4" /> Registered ✓
                </button>
            );
        }

        if (!registrationStatus.isOpen) {
            return (
                <button disabled className={cn(baseClass, "bg-muted text-muted-foreground opacity-60 cursor-not-allowed")}>
                    {buttonText}
                </button>
            );
        }

        return (
            <button
                onClick={handleRegisterClick}
                disabled={isRegistering}
                className={cn(baseClass, "bg-[#F0771A] text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#F0771A]/20")}
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
        <div className="relative min-h-screen text-foreground" style={{ background: "var(--background)" }}>

            {/* ── Background Wave SVG ── */}
            <div className="absolute top-0 left-0 right-0 max-lg:hidden w-full z-0 pointer-events-none overflow-hidden" style={{ height: "870px" }}>
                <svg className="w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 850" fill="none" style={{ height: "870px" }}>
                    <path
                        className="animate-wave text-[#B6070A]/35 dark:text-[#F0771A]/15"
                        d="M1521.31 -102.047C1556.63 -169.559 1451.75 -243.522 1292.21 -189.037C1132.67 -134.552 990.67 -147.713 792.588 -202.946C440.163 -301.237 290.492 -271.972 67.804 -190.187C2.423 -166.731 -132.058 -99.8707 -147.186 -20.099C-166.042 79.592 150.334 69.9201 -4.71201 198.963C-159.757 328.005 -121.278 519.277 687.628 300.168C791.215 272.11 961.58 259.304 1111.68 348.863C1261.78 438.422 1401.16 411.353 1454.55 345.384C1568.96 203.989 1461.92 11.379 1521.31 -102.047Z"
                        fill="currentColor"
                    />
                </svg>
            </div>

            {/* ── Main layout container ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-24 max-lg:pb-32">

                {/* ══════════════ HERO BANNER ══════════════ */}
                <div className="relative w-full mb-8 max-lg:mb-6">
                    {event.imageUrl ? (
                        <div
                            className="relative w-full max-h-90 h-full max-w-7xl top-2 max-lg:top-0 max-lg:rounded-none rounded-2xl mx-auto overflow-hidden shadow-sm"
                            style={{ aspectRatio: "3 / 1" }}
                        >
                            {/* Blurred background layer */}
                            <div
                                className="absolute inset-0 bg-cover bg-center rounded-2xl"
                                style={{
                                    filter: "blur(16px) brightness(0.5)",
                                    backgroundImage: `url("${event.imageUrl}")`
                                }}
                            />
                            {/* Inner container to center-align the sharp image */}
                            <div className="max-w-270 max-lg:px-4 h-full relative mx-auto w-full flex items-center justify-center">
                                <div className="relative h-full inline-flex" style={{ aspectRatio: "3 / 1" }}>
                                    <img
                                        src={event.imageUrl}
                                        alt="Event banner"
                                        className="h-full w-auto object-contain z-10"
                                        loading="eager"
                                        style={{ aspectRatio: "3 / 1" }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="relative w-full max-h-90 h-full max-w-7xl top-2 max-lg:top-0 max-lg:rounded-none rounded-2xl mx-auto overflow-hidden flex items-center justify-center shadow-sm"
                            style={{ aspectRatio: "3 / 1", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
                        >
                            <span
                                className="select-none font-black uppercase tracking-widest"
                                style={{
                                    fontFamily: "var(--font-heading, Inter)",
                                    fontSize: "clamp(2rem, 5vw, 4.5rem)",
                                    color: "rgba(255,255,255,0.06)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {bannerLabel}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Title Section ── */}
                <div className="flex flex-col gap-3 mb-8 mt-12 max-lg:mt-6">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                            className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                            style={{ background: "#F0771A" }}
                        >
                            {typeLabel}
                        </span>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                event.status === 'ONGOING'
                                    ? "badge-event badge-green badge-live"
                                    : event.status === 'UPCOMING'
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                                    : "bg-gray-500/10 border border-gray-500/20 text-gray-400"
                            )}
                        >
                            {event.status === 'ONGOING' ? `LIVE` : event.status}
                        </span>
                    </div>
                    <h1 className="heading-section text-3xl sm:text-4xl leading-tight">
                        {event.title}
                    </h1>
                </div>

                {/* ── 2-column grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-10 lg:gap-14">

                    {/* ══════════════ MAIN CONTENT ══════════════ */}
                    <main className="min-w-0">

                        {/* ── Info Bar ── */}
                        <div className="ed-info-bar grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border mb-8"
                            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                        >
                            {[
                                { icon: <Calendar className="w-5 h-5 text-[#F0771A]" />, label: "Date", value: dateDisplay },
                                { icon: <Clock className="w-5 h-5 text-[#F0771A]" />, label: "Time", value: formatTime(eventDate) },
                                { icon: <MapPin className="w-5 h-5 text-[#F0771A]" />, label: "Location", value: event.location || 'Online' },
                                { icon: <Users className="w-5 h-5 text-[#F0771A]" />, label: "Participants", value: `${attendeeCount}${event.maxSeats ? ` / ${event.maxSeats}` : ''}` },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: "rgba(240,119,26,0.08)" }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</p>
                                        <p className="text-sm font-semibold text-foreground truncate">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── About Section ── */}
                        <div className="mb-10">
                            <h2 className="ed-section-title">About</h2>
                            <div className="ed-about-prose">
                                {event.description.split('\n').map((line: string, i: number) => {
                                    const trimmed = line.trim();

                                    // Horizontal rule
                                    if (/^[-]{3,}$/.test(trimmed) || /^[*]{3,}$/.test(trimmed)) {
                                        return <hr key={i} className="ed-about-hr" />;
                                    }

                                    // Empty line = spacer
                                    if (trimmed === '') {
                                        return <div key={i} className="h-3" />;
                                    }

                                    // Check if entire line is bold (heading-style)
                                    const headingMatch = trimmed.match(/^\*\*(.+)\*\*$/);
                                    if (headingMatch) {
                                        return (
                                            <h3 key={i} className="ed-about-heading">
                                                {headingMatch[1]}
                                            </h3>
                                        );
                                    }

                                    // Regular paragraph — parse inline bold
                                    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
                                    return (
                                        <p key={i} className="ed-about-text">
                                            {parts.map((part, j) => {
                                                const boldMatch = part.match(/^\*\*(.+)\*\*$/);
                                                if (boldMatch) {
                                                    return <strong key={j} className="text-foreground font-bold">{boldMatch[1]}</strong>;
                                                }
                                                return <span key={j}>{part}</span>;
                                            })}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Prizes / Rewards ── */}
                        {rewards.length > 0 && (
                            <div className="mb-8">
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
                                        const tierColor = getTierColor(r.rankRequired);
                                        return (
                                            <div key={i} className="ed-prize-card group"
                                                style={{
                                                    borderColor: `${tierColor}28`,
                                                }}
                                            >
                                                {/* Tier rank label */}
                                                <div className="ed-prize-rank" style={{ color: tierColor }}>{rankText}</div>
                                                
                                                {/* Icon container with soft backlight glow */}
                                                <div className="ed-prize-amount relative mb-3">
                                                    <div className="absolute inset-0 blur-lg rounded-full opacity-20 w-12 h-12 mx-auto transition-all duration-300 group-hover:opacity-40 group-hover:scale-110" 
                                                        style={{ background: tierColor }}
                                                    />
                                                    <div className="relative z-10 p-3 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/10 inline-flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                                        {getRewardIcon(r.iconType)}
                                                    </div>
                                                </div>

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

                        {/* ── Schedule & Tracks (Step Cards) ── */}
                        {howLines.length > 0 && (
                            <div className="mb-8">
                                <h2 className="ed-section-title">Your Journey: Steps to Participation</h2>
                                <div className="ed-steps-list">
                                    {howLines.map((line: string, i: number) => {
                                        const { title, desc } = parseLine(line);
                                        return (
                                            <div key={i} className="ed-step-card">
                                                <div className="ed-step-title">Step {i + 1}: {title}</div>
                                                {desc && (
                                                    <div className="ed-step-content">
                                                        <p>{desc}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Timeline ── */}
                        {(() => {
                            const shortMonth = (d: Date) => d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                            const fullRange = (start: Date, end: Date) =>
                                `${start.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' })}, ${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${end.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' })}, ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

                            const phases: { startDate: Date; endDate: Date; label: string }[] = [];

                            // Registration phase
                            const regEnd = event.registrationDeadline ? new Date(event.registrationDeadline) : eventDate;
                            phases.push({ startDate: new Date(), endDate: regEnd, label: 'Registration' });

                            // Event phase
                            if (endDate) {
                                phases.push({ startDate: eventDate, endDate, label: `${typeLabel} Period` });
                            } else {
                                const sameDay = new Date(eventDate);
                                sameDay.setHours(23, 59, 59);
                                phases.push({ startDate: eventDate, endDate: sameDay, label: `${typeLabel} Day` });
                            }

                            return phases.length > 0 ? (
                                <div className="mb-8">
                                    <h2 className="ed-section-title">Timeline</h2>
                                    <div className="flex flex-col gap-4">
                                        {phases.map((phase, i) => (
                                            <div key={i} className="ed-tl-row flex items-center gap-5 sm:gap-8">
                                                {/* Date badge */}
                                                <div className="ed-tl-badge shrink-0">
                                                    <div className="ed-tl-badge-top">{shortMonth(phase.startDate)}</div>
                                                    <div className="ed-tl-badge-bottom">{shortMonth(phase.endDate)}</div>
                                                </div>
                                                {/* Phase card */}
                                                <div className="ed-tl-card flex-1">
                                                    <div className="ed-tl-card-inner">
                                                        <p className="ed-tl-range">{fullRange(phase.startDate, phase.endDate)}</p>
                                                        <p className="ed-tl-label">{phase.label}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null;
                        })()}
                        {/* ── FAQs ── */}
                        {faqs.length > 0 && (
                            <div className="mb-8 mt-12">
                                <h2 className="ed-section-title">FAQs</h2>
                                <div className="flex flex-col border-t border-white/10 dark:border-white/5">
                                    {faqs.map((faq, idx) => {
                                        const isOpen = openFaq === idx;
                                        return (
                                            <div key={faq.id || idx} className="border-b border-white/10 dark:border-white/5 py-4">
                                                <button
                                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                                    className="w-full flex items-center justify-between text-left font-semibold text-foreground hover:text-[#FF8A3D] transition-colors py-2 group cursor-pointer"
                                                >
                                                    <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                                                    <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180 text-[#FF8A3D]")} />
                                                </button>
                                                <div
                                                    className={cn(
                                                        "overflow-hidden transition-all duration-300 ease-in-out max-h-0",
                                                        isOpen && "max-h-125 mt-3"
                                                    )}
                                                >
                                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap pl-1 pb-2">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </main>

                    {/* ══════════════ SIDEBAR ══════════════ */}
                    <aside className="lg:pt-0">
                        <div className="lg:sticky lg:top-24 flex flex-col gap-5">

                            {/* Registration Card */}
                            <div
                                className="ed-sidebar-card rounded-2xl border p-6"
                                style={{
                                    background: "rgba(255,255,255,0.025)",
                                    borderColor: "rgba(255,255,255,0.08)",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                }}
                            >
                                {/* Countdown Timer */}
                                {event.status === 'UPCOMING' && (
                                    <div className="mb-5">
                                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 text-center">Event starts in</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { val: countdown.days, label: 'Days' },
                                                { val: countdown.hours, label: 'Hrs' },
                                                { val: countdown.minutes, label: 'Min' },
                                                { val: countdown.seconds, label: 'Sec' },
                                            ].map((unit, i) => (
                                                <div key={i} className="ed-countdown-cell text-center">
                                                    <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums">{String(unit.val).padStart(2, '0')}</div>
                                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{unit.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Details */}
                                <h3 className="font-bold text-foreground text-base mb-4">Quick Details</h3>
                                <div className="flex flex-col gap-3.5 mb-5">
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
                                    <div className="mb-5">
                                        <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                                            <div
                                                className="h-full rounded-full bg-[#F0771A] transition-all duration-1000"
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

                            {/* Organizer Card (moved to sidebar) */}
                            {event.creator && (
                                <div
                                    className="ed-sidebar-card rounded-2xl border p-5"
                                    style={{
                                        background: "rgba(255,255,255,0.025)",
                                        borderColor: "rgba(255,255,255,0.08)",
                                    }}
                                >
                                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">Organized by</p>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-11 h-11 ring-2 ring-[#F0771A]/30 shrink-0">
                                            <AvatarImage src={event.creator.image || undefined} />
                                            <AvatarFallback className="bg-[#F0771A] text-white font-bold text-sm">
                                                {event.creator.name?.[0] || 'V'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-foreground text-sm">{event.creator.name || 'Velonx Team'}</p>
                                            <p className="text-xs text-muted-foreground">Event Organizer</p>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* Share Card */}
                            <div
                                className="ed-sidebar-card rounded-2xl border p-5 flex items-center gap-4"
                                style={{
                                    background: "rgba(255,255,255,0.02)",
                                    borderColor: "rgba(255,255,255,0.06)",
                                }}
                            >
                                <button
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer hover:opacity-80"
                                    style={{
                                        background: "rgba(240,119,26,0.08)",
                                        borderColor: "rgba(240,119,26,0.25)",
                                        color: "#F0771A",
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

            {/* ── Mobile sticky action bar (mobile only — desktop uses the sidebar CTA) ── */}
            <div
                className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center gap-4 px-4 py-3 border-t border-border"
                style={{
                    background: "color-mix(in srgb, var(--background) 92%, transparent)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
                }}
            >
                <div className="flex flex-col leading-tight shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Entry Fee</span>
                    <span className="text-base font-black text-[#10B981]">FREE</span>
                </div>
                <div className="flex-1 min-w-0">
                    <RegisterBtn full />
                    {!registrationStatus.isOpen && (
                        <p className="text-center text-[11px] text-red-400 mt-1 truncate">{registrationStatus.message}</p>
                    )}
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
                        <div className="w-16 h-16 rounded-full bg-[#F0771A]/10 flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-8 h-8 text-[#FF8A3D]" />
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
                            style={{ background: "#F0771A" }}
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
