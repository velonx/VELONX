"use client";

import Link from "next/link";
import { ArrowRight, Quote, Star, Briefcase, Lightbulb, Users, Code, Eye, Smartphone, Palette } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import toast from "react-hot-toast";
import FloatingNavDemo from "@/components/floating-navbar-demo";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { OrganizationSchema } from "@/components/structured-data";
import { FlipText } from "@/components/ui/flip-text";
import dynamic from "next/dynamic";
import Image from "next/image";

const Carousel3 = dynamic(
    () => import("@/components/Carousel3").then(mod => ({ default: mod.Carousel3 })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full flex items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
            </div>
        ),
    }
);
import { TelescopeHero } from "@/components/TelescopeHero";
import { ParallaxGallery } from "@/components/ParallaxGallery";

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

            {/* Telescope Hero Section */}
            <TelescopeHero />

            {/* Why Velonx Section - Illustration Cards */}
            <ScrollReveal>
                <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden bg-background">

                    {/* Ambient gradient blob glows */}
                    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #925B3A55 0%, transparent 70%)', filter: 'blur(80px)' }} />
                    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #4C251A55 0%, transparent 70%)', filter: 'blur(80px)' }} />

                    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-start">

                            {/* Expert Mentors Card */}
                            <ScrollReveal delay={0}>
                                <div
                                    className="group relative rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-3"
                                    style={{
                                        height: '640px',
                                        border: '1px solid #925B3A30',
                                        boxShadow: '0 0 0 1px #925B3A10, 0 8px 32px #925B3A15',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px #925B3A40, 0 16px 48px #925B3A35';
                                        (e.currentTarget as HTMLDivElement).style.borderColor = '#925B3A60';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px #925B3A10, 0 8px 32px #925B3A15';
                                        (e.currentTarget as HTMLDivElement).style.borderColor = '#925B3A30';
                                    }}
                                >
                                    <Image
                                        src="/illustrations/mentor-light.jpg"
                                        alt="Expert Mentors"
                                        fill
                                        className="absolute inset-0 block dark:hidden object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <Image
                                        src="/illustrations/mentor-dark.jpg"
                                        alt="Expert Mentors"
                                        fill
                                        className="absolute inset-0 hidden dark:block object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />

                                    {/* Bottom gradient overlay */}
                                    <div className="absolute bottom-0 left-0 w-full h-2/5" style={{ background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 60%, transparent 100%)' }} />

                                    {/* Text pinned to bottom-center */}
                                    <div className="absolute bottom-0 left-0 w-full px-6 pb-6 text-center">
                                        <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground tracking-wide">
                                            Expert Mentors
                                        </h3>
                                        <p className="text-xs sm:text-sm leading-relaxed mb-4 text-muted-foreground">
                                            Learn from industry professionals who've been there. Get personalized guidance and expertise.
                                        </p>
                                        <Link href="/mentors" className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full transition-all duration-300 hover:gap-3"
                                            style={{ background: '#925B3A15', color: '#925B3A', border: '1px solid #925B3A40', boxShadow: '0 0 12px #925B3A20' }}>
                                            Meet Our Mentors <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Real Projects Card */}
                            <ScrollReveal delay={150}>
                                <div
                                    className="group relative rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-3"
                                    style={{
                                        height: '640px',
                                        border: '1px solid #190f0830',
                                        boxShadow: '0 0 0 1px #C47A4A10, 0 8px 32px #C47A4A15',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px #C47A4A40, 0 16px 48px #C47A4A35';
                                        (e.currentTarget as HTMLDivElement).style.borderColor = '#C47A4A60';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px #C47A4A10, 0 8px 32px #C47A4A15';
                                        (e.currentTarget as HTMLDivElement).style.borderColor = '#C47A4A30';
                                    }}
                                >
                                    <Image
                                        src="/illustrations/project-light.jpg"
                                        alt="Real Projects"
                                        fill
                                        className="absolute inset-0 block dark:hidden object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <Image
                                        src="/illustrations/project-dark.jpg"
                                        alt="Real Projects"
                                        fill
                                        className="absolute inset-0 hidden dark:block object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />

                                    <div className="absolute bottom-0 left-0 w-full h-2/5" style={{ background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 60%, transparent 100%)' }} />

                                    <div className="absolute bottom-0 left-0 w-full px-6 pb-6 text-center">
                                        <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground tracking-wide">
                                            Real Projects
                                        </h3>
                                        <p className="text-xs sm:text-sm leading-relaxed mb-4 text-muted-foreground">
                                            Build your portfolio with hands-on projects that matter. Work on real-world challenges and create impact.
                                        </p>
                                        <Link href="/projects" className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full transition-all duration-300 hover:gap-3 text-[#0f0e0e] dark:text-[#C47A4A] border border-[#472813]/40 dark:border-[#C47A4A]/40"
                                            style={{ background: '#C47A4A15', boxShadow: '0 0 12px #C47A4A20' }}>
                                            Browse Projects <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Career Growth Card */}
                            <ScrollReveal delay={300}>
                                <div
                                    className="group relative rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-3"
                                    style={{
                                        height: '640px',
                                        border: '1px solid #E8A87C30',
                                        boxShadow: '0 0 0 1px #E8A87C10, 0 8px 32px #E8A87C15',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px #E8A87C40, 0 16px 48px #E8A87C35';
                                        (e.currentTarget as HTMLDivElement).style.borderColor = '#E8A87C60';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px #E8A87C10, 0 8px 32px #E8A87C15';
                                        (e.currentTarget as HTMLDivElement).style.borderColor = '#E8A87C30';
                                    }}
                                >
                                    <Image
                                        src="/illustrations/community-light.jpg"
                                        alt="Career Growth"
                                        fill
                                        className="absolute inset-0 block dark:hidden object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <Image
                                        src="/illustrations/community-dark.jpg"
                                        alt="Career Growth"
                                        fill
                                        className="absolute inset-0 hidden dark:block object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />

                                    <div className="absolute bottom-0 left-0 w-full h-2/5" style={{ background: 'linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 60%, transparent 100%)' }} />

                                    <div className="absolute bottom-0 left-0 w-full px-6 pb-6 text-center">
                                        <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground tracking-wide">
                                            Career Growth
                                        </h3>
                                        <p className="text-xs sm:text-sm leading-relaxed mb-4 text-muted-foreground">
                                            Launch your dream career with confidence. Access exclusive opportunities and connections to top companies.
                                        </p>
                                        <Link href="/career" className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2 rounded-full transition-all duration-300 hover:gap-3"
                                            style={{ background: '#E8A87C15', color: '#E8A87C', border: '1px solid #E8A87C40', boxShadow: '0 0 12px #E8A87C20' }}>
                                            Explore Careers <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </ScrollReveal>

                        </div>
                    </div>
                </section>
            </ScrollReveal>


            {/* Community Showcase Section - GSAP Gallery */}
            <div className="w-full bg-gradient-to-b from-background via-[#1a1a2e] to-background">
                <ParallaxGallery
                    title="Community Showcase"
                    description="Discover amazing projects built by our talented community members"
                    slides={[
                        { name: "KeyRacer", src: "/keyracer.png", category: "Game Dev", dateMonth: "AUG", dateDay: "12", description: "A multiplayer typing racing game built to test and improve your typing speed against others in real-time.", link: "#" },
                        { name: "AI Career Agent", src: "/ai-career-agent.png", category: "AI Tools", dateMonth: "SEP", dateDay: "05", description: "An intelligent career assistant that provides personalized job recommendations and interview preparation.", link: "#" },
                        { name: "HealthTrack", src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop", category: "Health & Fitness", dateMonth: "OCT", dateDay: "22", description: "A comprehensive dashboard for tracking daily activities, nutrition, and overall wellness goals seamlessly.", link: "#" },
                        { name: "Tiffo", src: "https://images.unsplash.com/photo-1513519107127-1bed33748e4c?q=80&w=2070&auto=format&fit=crop", category: "Food Delivery", dateMonth: "NOV", dateDay: "15", description: "A localized food delivery ecosystem connecting talented home chefs directly with local food enthusiasts.", link: "#" },
                        { name: "local Mania", src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2070&auto=format&fit=crop", category: "Community", dateMonth: "DEC", dateDay: "01", description: "A community platform focused on discovering, organizing, and participating in vibrant local events.", link: "#" },
                    ]}
                />
            </div>

            {/* What People Say - Testimonials Carousel */}
            <div className="relative w-full py-4 sm:py-6 md:py-8 lg:py-10 bg-background overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-5 pointer-events-none">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="relative z-10">
                    <Carousel3
                        title="What People Say"
                        description="Trusted by students and professionals worldwide"
                        type="testimonial"
                        slides={[
                            { name: "Tamara Lottering", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop", description: "Velonx is an incredibly innovative platform that has successfully spearheaded countless high-impact projects. The mentorship here is world-class." },
                            { name: "Muhammad Shahzar", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop", description: "I have been absolutely blown away by what Velonx offers in terms of skills, dedication and commitment. Every project delivered beyond expectations." },
                            { name: "Karsten Rowe", src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop", description: "You are hungry, talented, and prolific. A real asset to any team. Your willingness to learn and improve is admirable. You make hard work fun!" },
                            { name: "James Miller", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop", description: "Velonx transformed my career. The real-world projects and mentorship helped me land my dream job at a Fortune 500 company. Forever grateful!" },
                            { name: "Sarah Chen", src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop", description: "The community at Velonx is unlike anything I've experienced. Supportive, driven, and always pushing boundaries. Truly a game-changer for my growth." },
                        ]}
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2 sm:my-4" />

            {/* CTA Section */}
            <ScrollReveal>
                <section className="relative pt-0 pb-6 sm:pt-2 sm:pb-10 md:pt-4 md:pb-12 lg:pt-6 lg:pb-14 overflow-hidden bg-background">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }} />
                    </div>


                    <div className="container mx-auto px-4 sm:px-3 md:px-4 lg:px-12 relative z-10 text-center py-2">
                        <div className="max-w-2xl mx-auto bg-card rounded-3xl p-3 sm:p-12 relative overflow-hidden border border-border shadow-2xl">
                            {/* Accent orbs */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -ml-16 -mb-16" />

                            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-5 text-foreground leading-tight font-bold relative z-10">
                                Ready to Launch Your Career?
                            </h2>
                            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base max-w-xl mx-auto leading-relaxed relative z-10">
                                Join thousands of students transforming their skills into real-world experience. Start building your future today.
                            </p>
                            <Link href="/auth/signup" className="inline-block w-full sm:w-auto relative z-10">
                                <button
                                    onClick={handleJoinClick}
                                    className="inline-flex items-center justify-center gap-2 transition-all bg-foreground text-background hover:opacity-90 font-bold rounded-full px-8 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base outline-none focus:ring-4 focus:ring-primary/30"
                                    aria-label="Get started with Velonx for free"
                                >
                                    Get Started for Free
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </ScrollReveal>
        </div>
    );
}
