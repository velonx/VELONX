"use client";

import Link from "next/link";
import { ArrowRight, Quote, Star, Briefcase, Lightbulb, Users, Code, Eye, Smartphone, Palette } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import toast from "react-hot-toast";
import FloatingNavDemo from "@/components/floating-navbar-demo";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { OrganizationSchema } from "@/components/structured-data";
import { FlipText } from "@/components/ui/flip-text";
import "./tech-background.css";

export default function Home() {
    const handleJoinClick = () => {
        toast.success("Welcome! Redirecting you to sign up...");
    };

    const handleStatClick = (statLabel: string) => {
        toast.success(`You're viewing our ${statLabel}! We're growing every day.`);
    };

    const handleFeatureClick = (featureTitle: string) => {
        toast.success(`More details about ${featureTitle} coming soon!`);
    };

    return (
        <div className="min-h-screen bg-background font-outfit">
            <OrganizationSchema />
            {/* Floating Navbar */}
            <FloatingNavDemo />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] md:min-h-screen flex items-center pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/images/hero-background.png')",
                        }}
                    />
                    {/* Gradient Overlay for text readability - works in both light and dark mode */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
                    <div className="flex items-center justify-center">
                        <ScrollReveal>
                            <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center max-w-4xl">
                                {/* Small Label */}
                                <div className="inline-block">
                                    <span className="text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-400/10 backdrop-blur-sm rounded-full border border-cyan-400/20">
                                        Welcome to Velonx
                                    </span>
                                </div>

                                {/* Main Headline - Responsive sizing with animated text */}
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.2] text-white" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}>
                                    Empowering the Next Generation of{" "}
                                    <FlipText
                                        words={["Innovators", "Developers", "Creators", "Builders", "Leaders"]}
                                        className="text-white"
                                        duration={2500}
                                    />
                                </h1>

                                {/* Subtext - Responsive sizing */}
                                <p className="text-gray-100 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                                    Join a thriving community where students and tech enthusiasts transform their potential into impact. Connect with expert mentors, build real projects, and launch your dream career.
                                </p>

                                {/* Buttons - Touch-friendly sizing */}
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 justify-center">
                                    <Link href="/auth/signup" className="w-full sm:w-auto">
                                        <button
                                            onClick={handleJoinClick}
                                            className="w-full sm:w-auto touch-target bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-full px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0f2c59]/30"
                                            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                                            aria-label="Start your journey with Velonx"
                                        >
                                            Start Your Journey <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>


                    </div>
                </div>
            </section>

            {/* Why Velonx Section */}
            <ScrollReveal>
                <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-background">
                    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                            {[
                                {
                                    icon: <Users className="w-10 h-10 sm:w-12 sm:h-12" />,
                                    title: "Expert Mentors",
                                    desc: "Learn from industry professionals who've been there. Get personalized guidance, career advice, and technical expertise to accelerate your growth journey.",
                                    color: "#8b5cf6",
                                    link: "/mentors",
                                    linkText: "Meet Our Mentors"
                                },
                                {
                                    icon: <Briefcase className="w-10 h-10 sm:w-12 sm:h-12" />,
                                    title: "Real Projects",
                                    desc: "Build your portfolio with hands-on projects that matter. Work on real-world challenges, showcase your skills, and create impact-driven solutions.",
                                    color: "#3b82f6",
                                    link: "/projects",
                                    linkText: "Browse Projects"
                                },
                                {
                                    icon: <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12" />,
                                    title: "Career Growth",
                                    desc: "Launch your dream career with confidence. Access exclusive opportunities, interview prep resources, and direct connections to top companies.",
                                    color: "#f59e0b",
                                    link: "/career",
                                    linkText: "Explore Careers"
                                },
                            ].map((feature, i) => (
                                <ScrollReveal key={i} delay={i * 150}>
                                    <div
                                        className="bg-card rounded-[20px] sm:rounded-[25px] md:rounded-[30px] p-6 sm:p-8 md:p-10 lg:p-12 text-center border border-border hover:shadow-2xl hover:-translate-y-2 sm:hover:-translate-y-4 transition-all duration-500 group relative overflow-hidden"
                                    >
                                        {/* Animated gradient background on hover */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-transparent via-transparent to-transparent" style={{ background: `linear-gradient(135deg, transparent 0%, ${feature.color}10 100%)` }} />

                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 w-full h-1.5 transition-all" style={{ background: feature.color }} />

                                        {/* Icon container with enhanced styling */}
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-6 sm:mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-2xl" style={{ background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`, color: feature.color }}>
                                            {feature.icon}
                                            {/* Glow effect */}
                                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${feature.color}40` }} />
                                        </div>

                                        <h3 className="relative text-foreground text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
                                            {feature.title}
                                        </h3>

                                        <p className="relative text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 sm:mb-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                            {feature.desc}
                                        </p>

                                        <Link
                                            href={feature.link}
                                            className="relative inline-flex items-center gap-2 font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-300 hover:gap-3 group/link"
                                            style={{
                                                fontFamily: "'Montserrat', sans-serif",
                                                background: `${feature.color}15`,
                                                color: feature.color,
                                                border: `1.5px solid ${feature.color}30`
                                            }}
                                        >
                                            {feature.linkText}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-1">
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Community Showcase Section - Horizontal Scrolling Carousel */}
            <div className="w-full overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28">
                {/* Section Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-4" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 600 }}>
                        Community Showcase
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Discover amazing projects built by our talented community members
                    </p>
                </div>

                {/* Infinite Scrolling Showcase */}
                <div className="relative">
                    {/* Gradient Overlays for fade effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                    {/* Scrolling Container */}
                    <div className="flex gap-6 animate-marquee hover:pause-animation">
                        {/* Duplicate projects for seamless loop */}
                        {[...Array(2)].map((_, groupIndex) => (
                            <div key={groupIndex} className="flex gap-6 flex-shrink-0">
                                {/* Project 1: KeyRacer */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <a
                                        href="https://keyracer.in"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="relative h-[420px] rounded-3xl overflow-hidden border border-border bg-card shadow-xl modern-card-hover magnetic-glow">
                                            {/* Animated gradient background */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                            {/* Content */}
                                            <div className="relative p-8 h-full flex flex-col">
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        EdTech
                                                    </span>
                                                    <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        Skills Platform
                                                    </span>
                                                </div>

                                                {/* Icon Area */}
                                                <div className="flex-grow flex items-center justify-center mb-6">
                                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl scale-glow-hover">
                                                        <Code className="w-12 h-12 text-white" />
                                                    </div>
                                                </div>

                                                {/* Project Info */}
                                                <div>
                                                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-blue-500 transition-colors" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        KeyRacer
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        The ultimate typing, coding, hackathon, and professional skills hub. Master multiple skills all in one place.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>

                                {/* Project 2: AI Code Assistant */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <div className="relative h-[420px] rounded-3xl overflow-hidden border border-border bg-card shadow-xl modern-card-hover magnetic-glow">
                                        {/* Animated gradient background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        {/* Content */}
                                        <div className="relative p-8 h-full flex flex-col">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    AI/ML
                                                </span>
                                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    Developer Tools
                                                </span>
                                            </div>

                                            {/* Icon Area */}
                                            <div className="flex-grow flex items-center justify-center mb-6">
                                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl scale-glow-hover">
                                                    <Lightbulb className="w-12 h-12 text-white" />
                                                </div>
                                            </div>

                                            {/* Project Info */}
                                            <div>
                                                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-purple-500 transition-colors" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    AI Code Assistant
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    An intelligent code completion tool powered by advanced machine learning models, helping developers write better code faster.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Project 3: HealthTrack */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <div className="relative h-[420px] rounded-3xl overflow-hidden border border-border bg-card shadow-xl modern-card-hover magnetic-glow">
                                        {/* Animated gradient background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        {/* Content */}
                                        <div className="relative p-8 h-full flex flex-col">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    HealthTech
                                                </span>
                                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    Mobile App
                                                </span>
                                            </div>

                                            {/* Icon Area */}
                                            <div className="flex-grow flex items-center justify-center mb-6">
                                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl scale-glow-hover">
                                                    <Smartphone className="w-12 h-12 text-white" />
                                                </div>
                                            </div>

                                            {/* Project Info */}
                                            <div>
                                                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-500 transition-colors" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    HealthTrack
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    Mobile fitness tracking app with AI-powered insights and personalized workout recommendations for healthier living.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Project 4: DesignHub */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <div className="relative h-[420px] rounded-3xl overflow-hidden border border-border bg-card shadow-xl modern-card-hover magnetic-glow">
                                        {/* Animated gradient background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        {/* Content */}
                                        <div className="relative p-8 h-full flex flex-col">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    Design
                                                </span>
                                                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    Collaboration
                                                </span>
                                            </div>

                                            {/* Icon Area */}
                                            <div className="flex-grow flex items-center justify-center mb-6">
                                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl scale-glow-hover">
                                                    <Palette className="w-12 h-12 text-white" />
                                                </div>
                                            </div>

                                            {/* Project Info */}
                                            <div>
                                                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-orange-500 transition-colors" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    DesignHub
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                    Collaborative design platform for creative teams to share ideas, iterate on designs, and build amazing products together.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Modern Animated Testimonials Section */}
            <div className="w-full overflow-hidden py-12">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "'Great Vibes', cursive" }}>
                        What People Say
                    </h2>
                    <p className="text-muted-foreground text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Trusted by students and professionals worldwide
                    </p>
                </div>

                {/* Infinite Scrolling Testimonials */}
                <div className="relative">
                    {/* Gradient Overlays for fade effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                    {/* Scrolling Container */}
                    <div className="flex gap-6 animate-marquee hover:pause-animation">
                        {/* Duplicate testimonials for seamless loop */}
                        {[...Array(2)].map((_, groupIndex) => (
                            <div key={groupIndex} className="flex gap-6 flex-shrink-0">
                                {/* Testimonial 1 */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-blue-500/50 via-purple-500/50 to-pink-500/50 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300">
                                        <div className="bg-card backdrop-blur-xl rounded-3xl p-8 h-full border border-border/50 shadow-2xl transition-all duration-300 group-hover:shadow-blue-500/20">
                                            {/* Stars */}
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>

                                            {/* Quote */}
                                            <Quote className="w-8 h-8 text-muted-foreground/20 mb-4" />

                                            {/* Testimonial Text */}
                                            <p className="text-foreground text-sm leading-relaxed mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                Velonx is an incredibly innovative platform that has successfully spearheaded countless high-impact projects. The mentorship here is world-class.
                                            </p>

                                            {/* Author */}
                                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    TL
                                                </div>
                                                <div>
                                                    <h4 className="text-foreground font-semibold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        Tamara Lottering
                                                    </h4>
                                                    <p className="text-muted-foreground text-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        Lead UX Researcher
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 2 */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-cyan-500/50 via-teal-500/50 to-emerald-500/50 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 transition-all duration-300">
                                        <div className="bg-card backdrop-blur-xl rounded-3xl p-8 h-full border border-border/50 shadow-2xl transition-all duration-300 group-hover:shadow-cyan-500/20">
                                            {/* Stars */}
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>

                                            {/* Quote */}
                                            <Quote className="w-8 h-8 text-muted-foreground/20 mb-4" />

                                            {/* Testimonial Text */}
                                            <p className="text-foreground text-sm leading-relaxed mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                I have been absolutely blown away by what Velonx offers in terms of skills, dedication and commitment. Every project delivered beyond expectations.
                                            </p>

                                            {/* Author */}
                                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold">
                                                    MS
                                                </div>
                                                <div>
                                                    <h4 className="text-foreground font-semibold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        Muhammad Shahzar
                                                    </h4>
                                                    <p className="text-muted-foreground text-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        CEO, EnableAI
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 3 */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-orange-500/50 via-red-500/50 to-pink-500/50 hover:from-orange-500 hover:via-red-500 hover:to-pink-500 transition-all duration-300">
                                        <div className="bg-card backdrop-blur-xl rounded-3xl p-8 h-full border border-border/50 shadow-2xl transition-all duration-300 group-hover:shadow-orange-500/20">
                                            {/* Stars */}
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>

                                            {/* Quote */}
                                            <Quote className="w-8 h-8 text-muted-foreground/20 mb-4" />

                                            {/* Testimonial Text */}
                                            <p className="text-foreground text-sm leading-relaxed mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                You are hungry, talented, and prolific. A real asset to any team. Your willingness to learn and improve is admirable. You make hard work fun!
                                            </p>

                                            {/* Author */}
                                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                    KR
                                                </div>
                                                <div>
                                                    <h4 className="text-foreground font-semibold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        Karsten Rowe
                                                    </h4>
                                                    <p className="text-muted-foreground text-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        Director of Design
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial 4 */}
                                <div className="w-[380px] flex-shrink-0 group">
                                    <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-violet-500/50 via-purple-500/50 to-fuchsia-500/50 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 transition-all duration-300">
                                        <div className="bg-card backdrop-blur-xl rounded-3xl p-8 h-full border border-border/50 shadow-2xl transition-all duration-300 group-hover:shadow-violet-500/20">
                                            {/* Stars */}
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>

                                            {/* Quote */}
                                            <Quote className="w-8 h-8 text-muted-foreground/20 mb-4" />

                                            {/* Testimonial Text */}
                                            <p className="text-foreground text-sm leading-relaxed mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                Velonx transformed my career. The real-world projects and mentorship helped me land my dream job at a Fortune 500 company. Forever grateful!
                                            </p>

                                            {/* Author */}
                                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                                                    JM
                                                </div>
                                                <div>
                                                    <h4 className="text-foreground font-semibold text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        James Miller
                                                    </h4>
                                                    <p className="text-muted-foreground text-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                                        Software Engineer
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* CTA Section - Dark Theme */}
            <ScrollReveal>
                <section className="relative py-20 sm:py-24 md:py-28 lg:py-32 overflow-hidden">
                    {/* Dark gradient background matching the reference */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332] via-[#0f1419] to-[#1a2332]" />

                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }} />
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-5 md:mb-6 text-white leading-tight" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>
                                Ready to Launch Your Career?
                            </h2>
                            <p className="text-gray-400 mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                                Join thousands of students transforming their skills into real-world experience. Start building your future today.
                            </p>
                            <Link href="/auth/signup" className="inline-block w-full sm:w-auto">
                                <button
                                    onClick={handleJoinClick}
                                    className="w-full sm:w-auto touch-target bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-full px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                                    aria-label="Get started with Velonx for free"
                                >
                                    Get Started for Free
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </ScrollReveal>
        </div>
    );
}
