"use client";

import Link from "next/link";
import { ArrowRight, Quote, Star, Briefcase, Lightbulb, Users, Code, Eye, Smartphone, Palette } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import toast from "react-hot-toast";
import FloatingNavDemo from "@/components/floating-navbar-demo";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { OrganizationSchema } from "@/components/structured-data";
import { FlipText } from "@/components/ui/flip-text";
import { Carousel3 } from "@/components/Carousel3";
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

            {/* Why Velonx Section - Staggered Fade-In */}
            <ScrollReveal>
                <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-background">
                    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
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
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: feature.color }} />

                                        {/* Icon */}
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-6 sm:mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg" style={{ background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`, color: feature.color }}>
                                            {feature.icon}
                                        </div>

                                        <h3 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                                            {feature.title}
                                        </h3>

                                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
                                            {feature.desc}
                                        </p>

                                        <Link
                                            href={feature.link}
                                            className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-300 hover:gap-3"
                                            style={{
                                                background: `${feature.color}15`,
                                                color: feature.color,
                                                border: `1.5px solid ${feature.color}30`
                                            }}
                                        >
                                            {feature.linkText}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            </ScrollReveal>


            {/* Community Showcase Section - Parallax Gallery */}
            <div className="w-full py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-background via-[#1a1a2e] to-background overflow-hidden">
                <ParallaxGallery
                    title="Community Showcase"
                    description="Discover amazing projects built by our talented community members"
                    slides={[
                        { name: "KeyRacer", src: "https://images.unsplash.com/photo-1524492707947-54b025f190d7?q=80&w=2070&auto=format&fit=crop" },
                        { name: "AI Code Assistant", src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" },
                        { name: "HealthTrack", src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop" },
                        { name: "DesignHub", src: "https://images.unsplash.com/photo-1513519107127-1bed33748e4c?q=80&w=2070&auto=format&fit=crop" },
                        { name: "EcoTracker", src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2070&auto=format&fit=crop" },
                        { name: "DevConnect", src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2070&auto=format&fit=crop" },
                        { name: "StudyFlow", src: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=2070&auto=format&fit=crop" },
                    ]}
                />
            </div>


            {/* What People Say - Testimonials Carousel */}
            <div className="w-full py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-background via-[#1a1a2e] to-background overflow-hidden">
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
                            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-5 md:mb-6 text-white leading-tight font-bold">
                                Ready to Launch Your Career?
                            </h2>
                            <p className="text-gray-400 mb-8 sm:mb-10 md:mb-12 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                                Join thousands of students transforming their skills into real-world experience. Start building your future today.
                            </p>
                            <Link href="/auth/signup" className="inline-block w-full sm:w-auto">
                                <button
                                    onClick={handleJoinClick}
                                    className="w-full sm:w-auto touch-target bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-full px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                                    style={{ fontWeight: 600 }}
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
