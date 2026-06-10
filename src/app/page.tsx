"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import toast from "react-hot-toast";




// ─── Magnetic Hover Wrapper ───────────────────────────────────────────────────
const Magnetic = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 18, stiffness: 180, mass: 0.6 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((clientX - centerX) * 0.35);
        y.set((clientY - centerY) * 0.35);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className="inline-block"
        >
            {children}
        </motion.div>
    );
};



// ─── Solid Background for Hero ──────────────────────────────────────────────────
const MeshGradientHero = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Base background */}
        <div className="absolute inset-0 bg-background" />
        {/* Noise overlay for premium texture */}
        <div className="absolute inset-0 opacity-[0.025]"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 grid-pattern-light dark:opacity-0 opacity-40" />
    </div>
);

// ─── Canvas Particles ──────────────────────────────────────────────────────────
const CanvasParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = window.innerHeight);
        const handleResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
        window.addEventListener("resize", handleResize);
        const particles = Array.from({ length: 35 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            size: Math.random() * 2 + 0.5,
            sx: Math.random() * 0.3 - 0.15, sy: Math.random() * 0.3 - 0.15,
            color: Math.random() > 0.5 ? "rgba(34,108,224,0.20)" : "rgba(240,119,26,0.10)",
        }));
        let animId: number;
        let paused = false;
        const render = () => {
            if (paused) return;
            ctx.clearRect(0, 0, W, H);
            particles.forEach((p) => {
                p.x += p.sx; p.y += p.sy;
                if (p.x < 0 || p.x > W) p.sx *= -1;
                if (p.y < 0 || p.y > H) p.sy *= -1;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            animId = requestAnimationFrame(render);
        };
        const handleVisibility = () => {
            paused = document.hidden;
            if (!paused) render();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        render();
        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("visibilitychange", handleVisibility);
            cancelAnimationFrame(animId);
        };
    }, []);
    return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none" />;
};


// ─── Four-Pointed Star ─────────────────────────────────────────────────────────
const FourPointedStar = ({ className, size = 16, fill = "currentColor" }: { className?: string; size?: number; fill?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M12 0L15.5 8.5L24 12L15.5 15.5L12 24L8.5 15.5L0 12L8.5 8.5Z" fill={fill} />
    </svg>
);

// ─── Section Wrapper with staggered fade-in ────────────────────────────────────
const SectionReveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <motion.section
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
    >
        {children}
    </motion.section>
);

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ label, title, subtitle }: { label?: string; title: React.ReactNode; subtitle?: string }) => (
    <div className="text-center max-w-2xl mx-auto mb-16">
        {label && <span className="section-label-redesign">{label}</span>}
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-3 text-[#1A234A] dark:text-white">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-4 text-base leading-relaxed">{subtitle}</p>}
    </div>
);


// ─── Main Export ───────────────────────────────────────────────────────────────
export default function Home() {
    const [showStickyCTA, setShowStickyCTA] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleJoinClick = () => toast.success("Opening sign up — let's build your future! 🚀");

    useEffect(() => {
        const handleScroll = () => {
            setShowStickyCTA(window.scrollY > window.innerHeight * 0.3);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans overflow-x-hidden relative text-foreground transition-colors duration-300">
            {/* Persistent background particles */}
            <CanvasParticles />

            {/* ── Sticky CTA Bar ── */}
            <AnimatePresence>
                {showStickyCTA && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl px-4 py-3 flex items-center justify-between gap-4 md:hidden"
                    >
                        <p className="text-sm font-bold text-foreground leading-tight">Join 15,000+ students building their future</p>
                        <Link href="/auth/signup" onClick={handleJoinClick}>
                            <motion.button
                                className="btn-redesign btn-redesign-primary text-xs font-bold py-2.5 px-5 shrink-0 shadow-lg"
                                whileTap={{ scale: 0.96 }}
                            >
                                Join Free →
                            </motion.button>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* ==================== 1. HERO SECTION ==================== */}
            <header className="relative pt-28 pb-16 md:pt-36 md:pb-24 flex items-center justify-center z-10 overflow-hidden">
                <MeshGradientHero />
                <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_1.45fr] gap-10 items-center relative z-10">
                    {/* Left: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 36 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col text-left space-y-6"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#226ce0]/25 bg-[#226ce0]/5 text-xs font-semibold text-[#226ce0] w-fit backdrop-blur-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#f0771a] animate-pulse" />
                            India&apos;s #1 Student Tech Career Platform
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl md:text-[54px] lg:text-[64px] font-black tracking-tight leading-[1.1] text-[#29292B] dark:text-[#FFFBDB]">
                            Your Future<br />
                            Has No Limits.<br />
                            <motion.span
                                className="text-[#226ce0] inline-block"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                            >
                                We&apos;re Here to<br />Build It.
                            </motion.span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.45 }}
                            className="text-muted-foreground text-base leading-relaxed max-w-lg"
                        >
                            Velonx empowers Tier-2 &amp; Tier-3 college students with opportunities, mentorship, hackathons, projects, and a community that helps you grow.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.55 }}
                            className="flex flex-wrap gap-4 pt-2"
                        >
                            <Link href="/auth/signup" onClick={handleJoinClick} data-cursor="link">
                                <Magnetic>
                                    <motion.button
                                        className="btn-redesign btn-redesign-primary text-base font-bold shadow-lg"
                                        whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(240,119,26,0.5)" }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    >
                                        Join Free — Build Your Future
                                    </motion.button>
                                </Magnetic>
                            </Link>
                            <Link href="/career" data-cursor="link">
                                <Magnetic>
                                    <motion.button
                                        className="btn-redesign btn-redesign-secondary text-base font-semibold"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    >
                                        Explore Opportunities
                                    </motion.button>
                                </Magnetic>
                            </Link>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.65 }}
                            className="flex items-center gap-4 pt-1"
                        >
                            <div className="flex items-center -space-x-2.5">
                                {[
                                    { initials: "KS", bg: "bg-blue-500" },
                                    { initials: "AR", bg: "bg-orange-500" },
                                    { initials: "RI", bg: "bg-emerald-600" },
                                    { initials: "PI", bg: "bg-purple-500" },
                                    { initials: "+", bg: "bg-amber-400" },
                                ].map((avatar, i) => (
                                    <div
                                        key={i}
                                        className={`w-9 h-9 rounded-full ${avatar.bg} border-2 border-background flex items-center justify-center text-white text-[10px] font-black shadow-sm select-none`}
                                        style={{ zIndex: 5 - i }}
                                    >
                                        {avatar.initials}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-[#1A234A] dark:text-white leading-tight">Trusted by students</span>
                                <div className="flex items-center gap-0.5" aria-label="4.9 out of 5 stars">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-xs text-muted-foreground ml-1 font-semibold">4.9</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Hero Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full flex items-center justify-center select-none"
                    >
                        <Image
                            src="/hero.jpeg"
                            alt="Students building projects and growing their careers with Velonx"
                            width={720}
                            height={540}
                            priority
                            className="w-full max-w-145 lg:max-w-160 h-auto object-contain rounded-2xl"
                        />
                    </motion.div>
                </div>
            </header>




            {/* ==================== 4. HOW IT WORKS ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        title={<>How <span className="text-[#226ce0]">Velonx</span> Works</>}
                        subtitle="From joining the platform to landing your first placement — here is exactly what happens."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            {
                                number: "01", title: "Create Profile",
                                description: "Sign up free, specify your college and career goals. Your builder profile displays proof-of-work.",
                                image: "/profile.jpeg",
                                color: { circleBg: "bg-[#e6effe] dark:bg-blue-950/40", text: "text-[#226ce0] dark:text-blue-400", border: "border-[#226ce0]/20 dark:border-blue-900/40", borderLine: "border-blue-400/50 dark:border-blue-500/30", hover: "hover:shadow-[0_20px_40px_rgba(34,108,224,0.12)] hover:border-[#226ce0]/30" }
                            },
                            {
                                number: "02", title: "Build & Ship",
                                description: "Ship open-source projects, collaborate in team sprints, and accumulate VX coins.",
                                image: "/build.jpeg",
                                color: { circleBg: "bg-[#fef2e6] dark:bg-amber-950/40", text: "text-[#f0771a] dark:text-amber-400", border: "border-[#f0771a]/20 dark:border-amber-900/40", borderLine: "border-amber-400/50 dark:border-amber-500/30", hover: "hover:shadow-[0_20px_40px_rgba(240,119,26,0.12)] hover:border-[#f0771a]/30" }
                            },
                            {
                                number: "03", title: "Get Mentored",
                                description: "Book direct 1:1 sessions with industry engineers for mock interviews, resume critiques, and roadmaps.",
                                image: "/mentor.jpeg",
                                color: { circleBg: "bg-[#ecfaf2] dark:bg-emerald-950/40", text: "text-[#10b981] dark:text-emerald-400", border: "border-[#10b981]/20 dark:border-emerald-900/40", borderLine: "border-emerald-400/50 dark:border-emerald-500/30", hover: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] hover:border-[#10b981]/30" }
                            },
                            {
                                number: "04", title: "Get Placed",
                                description: "Apply through our direct blind-screening pipeline where companies evaluate skills over college tiers.",
                                image: "/placement.jpeg",
                                color: { circleBg: "bg-[#f5f0fb] dark:bg-purple-950/40", text: "text-[#a855f7] dark:text-purple-400", border: "border-[#a855f7]/20 dark:border-purple-900/40", borderLine: "", hover: "hover:shadow-[0_20px_40px_rgba(168,85,247,0.12)] hover:border-[#a855f7]/30" }
                            }
                        ].map((step, idx) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center text-center space-y-5"
                            >
                                {/* Step number + connector */}
                                <div className="relative w-full flex justify-center items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black z-10 border shadow-sm ${step.color.circleBg} ${step.color.text} ${step.color.border}`}>
                                        {step.number}
                                    </div>
                                    {idx < 3 && (
                                        <div className="absolute left-[50%] right-[-50%] top-1/2 -translate-y-1/2 md:flex items-center hidden pointer-events-none z-0 px-8">
                                            <div className="grow overflow-hidden flex items-center">
                                                <motion.div
                                                    initial={{ width: "0%" }}
                                                    whileInView={{ width: "100%" }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, delay: idx * 0.2 + 0.3, ease: "easeInOut" }}
                                                    className={`border-t-2 border-dashed ${step.color.borderLine} w-full origin-left`}
                                                />
                                            </div>
                                            <motion.svg
                                                initial={{ opacity: 0, scale: 0 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ type: "spring", stiffness: 300, damping: 10, delay: idx * 0.2 + 0.9 }}
                                                className={`w-2.5 h-2.5 ${step.color.text} -ml-1`}
                                                fill="currentColor" viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </motion.svg>
                                        </div>
                                    )}
                                </div>

                                {/* Illustration card */}
                                <motion.div
                                    className={`w-full bg-white dark:bg-[#101626] border border-slate-100 dark:border-slate-800/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 aspect-[4/3.2] flex items-center justify-center cursor-pointer ${step.color.hover}`}
                                    whileHover={{ scale: 1.03, y: -4 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    <motion.div
                                        className="w-full h-full relative"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                        <Image
                                            src={step.image}
                                            alt={step.title}
                                            width={400}
                                            height={300}
                                            className="w-full h-full object-contain select-none"
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Text */}
                                <div className="space-y-2 px-2">
                                    <h3 className="text-lg font-black leading-tight text-[#1A234A] dark:text-white">{step.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Proof of Work Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col md:flex-row items-center gap-6 p-4 md:py-3.5 md:px-6 rounded-2xl bg-[#fef7f2] dark:bg-amber-950/10 border border-[#f0771a]/10 shadow-sm mt-16 max-w-4xl mx-auto"
                    >
                        <div className="flex items-center gap-3 shrink-0">
                            <svg className="w-6 h-6 text-[#f0771a] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                            <span className="font-black tracking-wider text-xs text-[#1A234A] dark:text-amber-500 uppercase">Proof of Work</span>
                        </div>
                        <div className="hidden md:block w-px h-5 bg-[#f0771a]/15 dark:bg-amber-900/30" />
                        <p className="text-xs md:text-sm text-gray-600 dark:text-slate-300 font-medium text-center md:text-left leading-relaxed">
                            Every project. Every contribution. Every step forward — visible, verifiable, valuable.
                        </p>
                    </motion.div>
                </div>
            </SectionReveal>

            {/* ==================== 5. PROJECTS SHOWCASE ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        label="Proof of Work"
                        title="Develop Projects That Matter"
                        subtitle="Ditch dry resumes. Build high-quality tech products, collaborate with other students, and gain industry feedback."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                tag: "Web Dev", tagColor: "bg-[#226CE0]/10 text-[#226CE0] dark:bg-[#226CE0]/20 dark:text-[#7096D1]",
                                stars: "⭐ 42", title: "DevClans — Teammate Finder",
                                desc: "A real-time workspace for developers to find hackathon team members matching complementary stack profiles. Powered by WebSockets.",
                                author: "Suresh P. (LPU)", hoverShadow: "hover:shadow-[0_20px_40px_rgba(34,108,224,0.1)] hover:border-[#226ce0]/30"
                            },
                            {
                                tag: "Blockchain", tagColor: "bg-[#F0771A]/10 text-[#F0771A] dark:bg-[#F0771A]/20 dark:text-orange-400",
                                stars: "⭐ 58", title: "SolPay Checkout SDK",
                                desc: "Minimalist drop-in React widget for merchants to accept instant USDC payments on Solana network with sub-second finality.",
                                author: "Sneha G. (KIIT)", hoverShadow: "hover:shadow-[0_20px_40px_rgba(240,119,26,0.1)] hover:border-[#f0771a]/30"
                            },
                            {
                                tag: "System Design", tagColor: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                                stars: "⭐ 37", title: "EduChain Certificates",
                                desc: "Decentralized registry built using Solidity smart contracts for universities to issue fraud-proof verifiable degree transcripts.",
                                author: "Rahul S. (VIT)", hoverShadow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] hover:border-emerald-500/30"
                            }
                        ].map((proj, idx) => (
                            <motion.div
                                key={proj.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.12 }}
                                className={`card-redesign card-glass-redesign flex flex-col h-full justify-between ${proj.hoverShadow} transition-all duration-300`}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`${proj.tagColor} text-[10px] font-bold py-1 px-3.5 rounded-full uppercase tracking-wider`}>{proj.tag}</span>
                                    <span className="text-xs bg-muted border border-border px-2.5 py-1 rounded-md text-muted-foreground flex items-center gap-1.5">{proj.stars}</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{proj.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{proj.desc}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-border/35 mt-auto">
                                    <span className="text-xs text-muted-foreground">{proj.author}</span>
                                    <Link href="/projects" className="text-primary hover:underline text-sm font-bold flex items-center gap-1">Explore <ArrowRight className="w-3.5 h-3.5" /></Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/projects">
                            <motion.button
                                className="btn-redesign btn-redesign-secondary font-bold text-sm"
                                whileHover={{ scale: 1.04, borderColor: "rgba(34,108,224,0.5)" }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Explore Student Projects Hub
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 6. HACKATHONS & EVENTS ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        label="Skill Battles"
                        title="National Hackathons & Events"
                        subtitle="Put your skills to the test in national hackathons and developer bootcamps. Earn VX coins, win cash prizes, and land interviews."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                image: "/event-vhack.png", badge: "LIVE", badgeColor: "bg-emerald-500", badgeAnimate: true,
                                date: "📅 June 15-18, 2026", loc: "📍 Online (Discord)",
                                title: "Velonx Summer Hackathon 2026",
                                desc: "A premium 72-hour national hackathon challenging student builders to create AI-powered solutions for local businesses. Over ₹1.5 Lakhs in prizes, custom swags, and placement calls.",
                                price: "FREE", strikethrough: "₹499", cta: "Register Now"
                            },
                            {
                                image: "/event-react.png", badge: "UPCOMING", badgeColor: "bg-primary", badgeAnimate: false,
                                date: "📅 June 22, 2026", loc: "📍 Live Zoom Session",
                                title: "Mastering React Server Components",
                                desc: "Deep dive into modern web architecture with NextJS experts. Hands-on coding workshop on optimizing load speeds, Server Actions, and rendering pipelines.",
                                price: "FREE", strikethrough: "₹999", cta: "Register Now"
                            },
                            {
                                image: "/event-maang.png", badge: "UPCOMING", badgeColor: "bg-primary", badgeAnimate: false,
                                date: "📅 June 29, 2026", loc: "📍 YouTube Live",
                                title: "Cracking Placements from Tier-3",
                                desc: "Panel discussion with senior engineers at Amazon, Google, and Uber. Get actionable strategies on building portfolios, cold emailing, and off-campus placements.",
                                price: "FREE", strikethrough: "", cta: "Set Reminder"
                            }
                        ].map((ev, idx) => (
                            <motion.div
                                key={ev.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.12 }}
                                className="card-redesign flex flex-col justify-between h-full bg-card shadow-lg hover:shadow-xl transition-all duration-300"
                                whileHover={{ y: -5 }}
                            >
                                <div>
                                    <div className="h-44 rounded-xl mb-6 relative overflow-hidden">
                                        <Image
                                            src={ev.image}
                                            alt={ev.title}
                                            width={480}
                                            height={176}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className={`absolute top-3 left-3 ${ev.badgeColor} text-white font-bold text-[9px] py-1 px-3 rounded-full ${ev.badgeAnimate ? "animate-pulse" : ""}`}>{ev.badge}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-4 font-semibold">
                                        <span>{ev.date}</span>
                                        <span>{ev.loc}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{ev.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{ev.desc}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-border/40 mt-auto">
                                    <div className="text-lg font-bold">
                                        {ev.price}
                                        {ev.strikethrough && <span className="text-xs text-muted-foreground line-through ml-2">{ev.strikethrough}</span>}
                                    </div>
                                    <Link href="/events">
                                        <motion.span
                                            className="btn-redesign btn-redesign-primary text-xs py-2.5 px-6 font-bold shadow-md cursor-pointer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            {ev.cta}
                                        </motion.span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 7. MENTORS SPOTLIGHT ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        label="Industry Guidance"
                        title="Book 1:1 Sessions with Top Mentors"
                        subtitle="Get direct, 1:1 mentorship from senior software engineers, designers, and managers. Get resume reviews, mock interviews, and career roadmaps."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { initials: "AK", name: "Aarav Kapoor", role: "Senior Software Engineer", company: "Google", tags: ["Systems", "Go / C++", "Cloud"], slots: "3 Slots Free This Week", slotColor: "text-primary", avatarColor: "bg-primary/10 border-primary/20 text-primary" },
                            { initials: "IS", name: "Isha Sharma", role: "Lead Product Manager", company: "Razorpay", tags: ["Roadmap", "Fintech", "Growth"], slots: "2 Slots Free This Week", slotColor: "text-accent", avatarColor: "bg-accent/10 border-accent/20 text-accent" },
                            { initials: "RN", name: "Rohan Nanda", role: "Senior Product Designer", company: "Cred", tags: ["Figma", "UX Flow", "Design Ops"], slots: "4 Slots Free This Week", slotColor: "text-emerald-500", avatarColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" },
                            { initials: "PP", name: "Pooja Patel", role: "Senior SDE", company: "Microsoft", tags: ["Mock", "Java", "DSA"], slots: "1 Slot Free This Week", slotColor: "text-purple-500", avatarColor: "bg-purple-500/10 border-purple-500/20 text-purple-500" },
                        ].map((mentor, idx) => (
                            <motion.div
                                key={mentor.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.12 }}
                                className="card-redesign flex flex-col items-center justify-between text-center bg-card shadow-md"
                                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(34,108,224,0.08)" }}
                            >
                                <div className="flex flex-col items-center">
                                    <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center text-3xl font-black mb-4 relative ${mentor.avatarColor}`}>
                                        {mentor.initials}
                                        <span className="absolute bottom-0 right-0 bg-muted border border-border text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm text-foreground">{mentor.company}</span>
                                    </div>
                                    <h3 className="text-lg font-bold">{mentor.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{mentor.role}</p>
                                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                                        {mentor.tags.map(t => (
                                            <span key={t} className="bg-muted px-2.5 py-1 rounded-md text-[9px] font-semibold text-muted-foreground">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full pt-4 border-t border-border/40 mt-6 flex flex-col gap-3">
                                    <span className={`text-[10px] font-bold flex items-center gap-1 justify-center ${mentor.slotColor}`}>📅 {mentor.slots}</span>
                                    <Link href="/mentors" className="w-full">
                                        <motion.button
                                            className="btn-redesign btn-redesign-primary text-xs py-2.5 px-4 font-bold shadow-md w-full justify-center"
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            Book Session
                                        </motion.button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 8. CURATED RESOURCES ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        label="Curated Guides"
                        title="Premium Developer Resources"
                        subtitle="Cheat sheets, roadmaps, and interview preparation guides compiled by engineers at top tech firms."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🌳", iconBg: "bg-primary/10", badge: "PDF Sheet", badgeColor: "bg-[#226CE0]/10 text-[#226CE0]",
                                title: "Ultimate 75 DSA Interview Sheet",
                                desc: "A highly curated set of 75 essential DSA problems covering arrays, trees, graphs, dynamic programming, and greedy algorithms. Includes solutions in C++, Java, and Python.",
                                downloads: "📥 12.4k downloads", resourceName: "DSA Interview Sheet"
                            },
                            {
                                icon: "🌐", iconBg: "bg-accent/10", badge: "Interactive", badgeColor: "bg-[#F0771A]/10 text-[#F0771A]",
                                title: "System Design Core Cheat Sheet",
                                desc: "Learn visual fundamentals of load balancers, caching strategies, horizontal/vertical scaling, database replication, and message queues.",
                                downloads: "📥 8.9k downloads", resourceName: "System Design Cheat Sheet"
                            },
                            {
                                icon: "🚀", iconBg: "bg-emerald-500/10", badge: "Roadmap", badgeColor: "bg-emerald-500/10 text-emerald-600",
                                title: "NextJS & React Premium Roadmap",
                                desc: "A comprehensive, industry-aligned learning map teaching hooks, state stores, performance optimization (LCP, INP), and NextJS Server Components.",
                                downloads: "📥 15.1k downloads", resourceName: "React/NextJS Roadmap"
                            }
                        ].map((res, idx) => (
                            <motion.div
                                key={res.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.12 }}
                                className="card-redesign flex flex-col h-full justify-between"
                                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(34,108,224,0.07)" }}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 rounded-xl ${res.iconBg} flex items-center justify-center`}>
                                            <span className="text-2xl">{res.icon}</span>
                                        </div>
                                        <span className={`${res.badgeColor} text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider`}>{res.badge}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{res.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{res.desc}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-border/40 mt-auto">
                                    <span className="text-[10px] text-muted-foreground">{res.downloads}</span>
                                    <Link href="/resources">
                                        <motion.button
                                            className="btn-redesign btn-redesign-primary text-xs py-2.5 px-6 font-bold shadow-md"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            Download Free
                                        </motion.button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 9. COMMUNITY DISCUSSION PREVIEW ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        {/* Left explanation */}
                        <div className="lg:col-span-7 space-y-6">
                            <span className="section-label-redesign">A Platform That Doesn&apos;t Sleep</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-[#1A234A] dark:text-white">Post, Chat, Connect &amp; Build Groups</h2>
                            <p className="text-muted-foreground text-lg">
                                Find study partners, organize localized chapters, share project updates, and discuss development issues with 15,000+ peers in active channels.
                            </p>
                            <div className="flex flex-col gap-4 text-sm font-semibold">
                                {[
                                    "5+ Specialized tech channels (AI, Web, Design, System Design)",
                                    "Simulated live study rooms with active code help",
                                    "Earn rewards points (VX) for active community feedback",
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -15 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">✔</span>
                                        <span>{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                            <Link href="/community" className="inline-block pt-4">
                                <motion.button
                                    className="btn-redesign btn-redesign-primary text-sm font-bold shadow-md"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    Join the Community Hub
                                </motion.button>
                            </Link>
                        </div>

                        {/* Right live preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="lg:col-span-5 w-full bg-card border border-border/50 rounded-3xl p-6 shadow-xl space-y-6 text-left"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-border/30">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Thread</span>
                                </div>
                                <span className="text-xs text-muted-foreground">12m ago</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-sm font-black text-primary">DK</div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Devendra Kumar</h4>
                                    <p className="text-[10px] text-muted-foreground">VIT Vellore · Builder</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                &quot;Anyone down to co-build a browser extension for developer productivity? Got the API ready, looking for a CSS wizard.&quot;
                            </p>
                            <div className="flex gap-2">
                                <span className="bg-primary/10 text-primary text-[9px] font-bold py-1 px-3 rounded-lg uppercase tracking-wider">#chapters</span>
                                <span className="bg-accent/10 text-accent text-[9px] font-bold py-1 px-3 rounded-lg uppercase tracking-wider">#collaboration</span>
                            </div>
                            <div className="space-y-3 pt-3 border-t border-border/30">
                                <div className="bg-muted/50 border border-border/40 p-3 rounded-xl flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-0.5">KS</div>
                                    <p className="text-xs text-muted-foreground">
                                        <strong className="text-foreground">Kunal S. (SRM):</strong> I&apos;m in! Let&apos;s build it with glassmorphism.
                                    </p>
                                </div>
                                <div className="bg-muted/50 border border-border/40 p-3 rounded-xl flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center text-[10px] font-bold text-emerald-600 shrink-0 mt-0.5">Y</div>
                                    <p className="text-xs text-muted-foreground">
                                        <strong className="text-foreground">You:</strong> Just joined the thread. Let&apos;s make a group!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 11. TESTIMONIALS ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        label="Success Stories"
                        title="Students Who Made It"
                        subtitle="Real students. Real outcomes. From Tier-3 colleges to top tech companies."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                badge: "✔ Placed at Razorpay — ₹22 LPA", badgeColor: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600",
                                quote: "\"I came from a no-name college in Bihar. Velonx's project hub and mentor sessions changed my life. Got a full-time offer in just 4 months.\"",
                                initials: "PN", name: "Priya Nair", sub: "Amrita University · SWE @ Razorpay",
                                avatarColor: "bg-primary/10 text-primary ring-primary/10"
                            },
                            {
                                badge: "✔ Won Solana Hackathon — ₹1.5L prize", badgeColor: "bg-amber-500/10 border border-amber-500/20 text-amber-600",
                                quote: "\"The hackathon community on Velonx is unreal. Found my co-founder here, won my first prize, and now we are building a startup together.\"",
                                initials: "DB", name: "Devraj Bansal", sub: "Thapar University · Co-founder @ BuildAI",
                                avatarColor: "bg-accent/10 text-accent ring-accent/10"
                            },
                            {
                                badge: "✔ Internship at Google via Velonx", badgeColor: "bg-purple-500/10 border border-purple-500/20 text-purple-600",
                                quote: "\"I had zero connections from my college. The blind-screen career pipeline at Velonx meant my college tag didn't matter — only my GitHub did.\"",
                                initials: "SK", name: "Simran Kaur", sub: "PEC Chandigarh · SWE Intern @ Google",
                                avatarColor: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/10"
                            }
                        ].map((t, idx) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.12 }}
                                className="card-redesign bg-card p-8 flex flex-col justify-between h-full shadow-md relative overflow-hidden"
                                whileHover={{ y: -5, boxShadow: "0 20px 50px rgba(34,108,224,0.07)" }}
                            >
                                <div className="absolute top-4 right-6 text-7xl font-serif text-muted/10 font-bold select-none">&quot;</div>
                                <div className={`flex items-center gap-2 text-[10px] font-bold py-1 px-3.5 rounded-full w-fit mb-6 ${t.badgeColor}`}>
                                    {t.badge}
                                </div>
                                <p className="text-muted-foreground text-sm italic leading-relaxed mb-8 relative z-10">{t.quote}</p>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ring-2 ${t.avatarColor}`}>{t.initials}</div>
                                    <div>
                                        <h4 className="text-sm font-black">{t.name}</h4>
                                        <p className="text-[10px] text-muted-foreground">{t.sub}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 12. LEADERBOARD TEASER ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Copy */}
                    <div className="space-y-6">
                        <span className="section-label-redesign">Gamified Progress</span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-[#1A234A] dark:text-white">Compete. Climb. Get Recognized.</h2>
                        <p className="text-muted-foreground text-lg">
                            Every project you ship, every hackathon you win, and every review you complete counts toward your VX Coin balance and leaderboard rank. Recruiting partners scan this leaderboard regularly.
                        </p>
                        <div className="flex flex-col gap-4 text-sm">
                            {[
                                { color: "border-primary text-primary", text: "Win hackathons — up to +2,000 VX per win" },
                                { color: "border-accent text-accent", text: "Ship projects — earn community upvotes + coins" },
                                { color: "border-emerald-500 text-emerald-600", text: "Land a job — one-time placement bonus coins" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -15 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="flex items-center gap-3 text-muted-foreground"
                                >
                                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${item.color}`}>✔</span>
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                        <Link href="/leaderboard" className="inline-block pt-4">
                            <motion.button
                                className="btn-redesign btn-redesign-primary text-sm font-bold shadow-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                View Full Leaderboard
                            </motion.button>
                        </Link>
                    </div>

                    {/* Right Leaderboard Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="w-full bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden text-left"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-border/30 bg-muted/30">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">THIS WEEK&apos;S TOP BUILDERS</p>
                                <h3 className="text-lg font-black mt-1">VX Leaderboard</h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Live
                            </div>
                        </div>
                        <div className="divide-y divide-border/30 px-6">
                            {[
                                { rank: "#1", rankColor: "text-amber-500", initials: "KS", avatarColor: "bg-amber-500/10 border-amber-500/30 text-amber-600", name: "Karthik Suresh", college: "BITS Pilani", coins: "6,150 VX" },
                                { rank: "#2", rankColor: "text-slate-400", initials: "AT", avatarColor: "bg-slate-400/10 border-slate-400/30 text-slate-500", name: "Ananya Tiwari", college: "NIT Silchar", coins: "4,820 VX" },
                                { rank: "#3", rankColor: "text-amber-700", initials: "RM", avatarColor: "bg-amber-700/10 border-amber-700/30 text-amber-800", name: "Rohan Mehta", college: "IIIT Hyderabad", coins: "4,310 VX" },
                            ].map((user, i) => (
                                <motion.div
                                    key={user.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="flex items-center justify-between py-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-base font-black w-6 text-center ${user.rankColor}`}>{user.rank}</span>
                                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-black ${user.avatarColor}`}>{user.initials}</div>
                                        <div>
                                            <h4 className="text-xs font-bold">{user.name}</h4>
                                            <p className="text-[9px] text-muted-foreground">{user.college}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">🏆 {user.coins}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="p-6 border-t border-border/30 bg-muted/10 text-center">
                            <Link href="/leaderboard" className="text-xs text-primary font-bold hover:underline">
                                See all 2,400+ ranked builders →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </SectionReveal>

            {/* ==================== 13. SWAG & REWARDS SHOP ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        label="Proof of Action"
                        title="Earn Coins. Unlock Premium Swag."
                        subtitle="Your contributions, hackathon wins, and leaderboard climbs translate directly into rewards. Build value and claim the gear."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { image: "/swag-hoodie.png", title: "Velonx Premium Hoodie", desc: "Comfortable heavy cotton pitch black hoodie featuring embroidered minimalist Velonx branding. Limit 1 per builder.", price: "2,000 VX" },
                            { image: "/swag-stickers.png", title: "Developer Sticker Pack", desc: "10 high-quality matte finish die-cut stickers for your laptop, featuring premium code, crypto, and developer humor memes.", price: "250 VX" },
                            { image: "/swag-flask.png", title: "Hydro Flask Bottle", desc: "Double-walled insulated stainless steel bottle to keep your drinks ice-cold during long coding sessions.", price: "1,200 VX" },
                        ].map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.12 }}
                                className="card-redesign bg-card flex flex-col justify-between h-full shadow-lg hover:shadow-xl transition-all duration-300"
                                whileHover={{ y: -5 }}
                            >
                                <div>
                                    <div className="h-44 rounded-xl mb-6 overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={480}
                                            height={176}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed mb-6">{item.desc}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-border/30 mt-auto">
                                    <span className="font-mono text-base font-black text-primary">{item.price}</span>
                                    <Link href="/swag">
                                        <motion.span
                                            className="btn-redesign btn-redesign-secondary text-xs py-2 px-5 font-bold cursor-pointer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            Claim Reward
                                        </motion.span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/swag">
                            <motion.button
                                className="btn-redesign btn-redesign-secondary font-bold text-sm"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Visit Rewards Shop
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 14. INSIGHTS & BLOG ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <SectionHeader
                        label="Community Wisdom"
                        title="Read Our Top Insights"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                tag: "Interview Prep", tagColor: "bg-[#226CE0]/10 text-[#226CE0]",
                                title: "How to Crack Off-Campus Roles in India",
                                desc: "A complete roadmap for Tier-3 college students to bypass standard campus hiring limitations and apply directly.",
                                meta: "June 1, 2026 · 5 min"
                            },
                            {
                                tag: "Career Paths", tagColor: "bg-[#F0771A]/10 text-[#F0771A]",
                                title: "Why Open Source is Your Golden Ticket",
                                desc: "How contributing to public GitHub repositories builds a real-world resume far stronger than any college brand.",
                                meta: "May 24, 2026 · 8 min"
                            },
                            {
                                tag: "System Design", tagColor: "bg-emerald-500/10 text-emerald-600",
                                title: "Mastering Microservices Architecture",
                                desc: "Visual breakdown of scalable systems design architectures for technical interviews at fast-growing unicorns.",
                                meta: "May 18, 2026 · 12 min"
                            }
                        ].map((post, idx) => (
                            <motion.div
                                key={post.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.12 }}
                                className="card-redesign bg-card flex flex-col h-full justify-between shadow-md"
                                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(34,108,224,0.07)" }}
                            >
                                <div>
                                    <div className="mb-4">
                                        <span className={`${post.tagColor} text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>{post.tag}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{post.title}</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed mb-6">{post.desc}</p>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-border/30 mt-auto text-[10px] text-muted-foreground">
                                    <span>{post.meta}</span>
                                    <Link href="/blog" className="text-primary font-bold hover:underline text-xs flex items-center gap-1">Read <ArrowRight className="w-3.5 h-3.5" /></Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 15. FAQ SECTION ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10">
                <div className="container mx-auto px-6 max-w-3xl">
                    <SectionHeader
                        label="Got Questions?"
                        title="Frequently Asked Questions"
                        subtitle="Everything you need to know about the platform, VX coins, and careers."
                    />

                    <div className="space-y-4">
                        {[
                            {
                                q: "Who is Velonx for?",
                                a: "Velonx is designed specifically for tech and software engineering students studying in Tier-2 and Tier-3 Indian colleges who want to build real-world skills, work on open-source projects, get industry mentorship, and unlock premium off-campus career opportunities."
                            },
                            {
                                q: "Is Velonx free for students?",
                                a: "Yes, Velonx is 100% free for students. All core learning resources, community cohorts, events, and job postings are completely free. You can earn Velonx Coins (VX) by being active, which can be redeemed for exclusive swags or mentor sessions."
                            },
                            {
                                q: "How do Velonx Coins (VX) work?",
                                a: "VX coins are our proof-of-work rewards. You earn them by contributing to open-source, winning hackathons, completing system design tasks, or climbing the leaderboard. You can redeem VX for 1:1 mentorship sessions, premium resume reviews, or physical swag from our store."
                            },
                            {
                                q: "How does the platform help with off-campus placements?",
                                a: "Most Tier-2/3 students are ignored by top recruiters due to lack of college brand value. Velonx partners directly with high-growth startups and tech giants. By ranking on our leaderboard and building verified projects, recruiters hire you based on your skill index profile rather than your resume."
                            },
                            {
                                q: "Do I need prior coding experience to join?",
                                a: "Not at all! We have step-by-step learning roadmaps and resources ranging from absolute beginner to advanced system design. Our active Discord community is always there to guide you."
                            },
                        ].map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <motion.div
                                    key={faq.q}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                                    className={`border rounded-2xl bg-card transition-all duration-200 ${isOpen ? "border-[#226ce0]/40 shadow-[0_8px_24px_rgba(34,108,224,0.08)]" : "border-border/50 hover:border-[#226ce0]/20"}`}
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${idx}`}
                                        className="w-full flex items-center justify-between cursor-pointer p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                                    >
                                        <h3 className="text-base font-black text-foreground pr-4">{faq.q}</h3>
                                        <motion.span
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="text-primary shrink-0"
                                            aria-hidden="true"
                                        >▼</motion.span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                id={`faq-answer-${idx}`}
                                                key="content"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                className="overflow-hidden"
                                            >
                                                <p className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </SectionReveal>

            {/* ==================== 16. FINAL CTA ==================== */}
            <SectionReveal className="py-20 border-t border-border/30 relative z-10 text-center">
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.div
                        className="card-redesign card-glass-redesign p-12 md:p-16 rounded-3xl relative overflow-hidden shadow-2xl"
                        whileHover={{ boxShadow: "0 32px 80px rgba(34,108,224,0.12)" }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Background ellipses */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                            <ellipse cx="180" cy="150" rx="220" ry="150" fill="#226CE0" opacity="0.08" />
                            <ellipse cx="720" cy="150" rx="220" ry="150" fill="#226CE0" opacity="0.06" />
                        </svg>


                        <div className="relative z-10 space-y-6">
                            {/* Shield icon */}
                            <motion.svg
                                width="56" height="56" viewBox="0 0 56 56" fill="none"
                                className="mx-auto block"
                                initial={{ scale: 0.5, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                <rect width="56" height="56" rx="18" fill="rgba(34,108,224,0.12)" stroke="rgba(34,108,224,0.25)" strokeWidth="1.5" />
                                <path d="M28 12C28 12 40 18 40 30L28 42L16 30C16 18 28 12 28 12Z" stroke="#226CE0" strokeWidth="2" strokeLinejoin="round" fill="rgba(34,108,224,0.1)" />
                                <circle cx="28" cy="30" r="4.5" fill="#226CE0" opacity="0.5" />
                            </motion.svg>

                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A234A] dark:text-white">Your College is Not Your Limit.</h2>
                            <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
                                Join students from across India who are building, competing, and landing their dream careers — regardless of where they study.
                            </p>
                            <div className="flex justify-center gap-4 flex-wrap pt-4">
                                <Link href="/auth/signup">
                                    <motion.button
                                        onClick={handleJoinClick}
                                        className="btn-redesign btn-redesign-primary text-base font-bold shadow-md"
                                        whileHover={{ scale: 1.06, boxShadow: "0 10px 40px rgba(240,119,26,0.5)" }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        Join Free Today
                                    </motion.button>
                                </Link>
                                <Link href="/leaderboard">
                                    <motion.button
                                        className="btn-redesign btn-redesign-secondary text-base font-semibold"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        See the Leaderboard
                                    </motion.button>
                                </Link>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">No credit card required · Free forever for students</p>
                        </div>
                    </motion.div>
                </div>
            </SectionReveal>
        </div>
    );
}
