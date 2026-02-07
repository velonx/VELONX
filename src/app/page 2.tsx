"use client";

import Link from "next/link";
import { ArrowRight, Play, Quote, Star, Twitter, Linkedin, Github, Code, Briefcase, Lightbulb, Users } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import toast from "react-hot-toast";
import FloatingNavDemo from "@/components/floating-navbar-demo";

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
        <div className="min-h-screen bg-white font-outfit">
            {/* Floating Navbar */}
            <FloatingNavDemo />
            
            {/* Hero Section */}
            <section className="relative min-h-[80vh] md:min-h-screen flex items-center pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
                {/* Background Blobs - Responsive sizing */}
                <div className="absolute w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-[#CFF5FF] top-[-100px] sm:top-[-150px] md:top-[-200px] right-[-100px] sm:right-[-150px] md:right-[-200px] blur-[60px] sm:blur-[70px] md:blur-[80px] opacity-60 animate-blob-float" />
                <div className="absolute w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] rounded-full bg-[#FEF3C7] bottom-[10%] left-[-50px] sm:left-[-75px] md:left-[-100px] blur-[60px] sm:blur-[70px] md:blur-[80px] opacity-60 animate-blob-float-delayed" />
                
                <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
                        <ScrollReveal>
                            <div className="space-y-6 sm:space-y-7 md:space-y-8 text-center lg:text-left">
                                {/* Small Label */}
                                <div className="inline-block">
                                    <span className="text-[#0891B2] text-xs sm:text-sm font-bold uppercase tracking-[0.1em] px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0891B2]/10 rounded-full">
                                        Welcome to Velonx
                                    </span>
                                </div>

                                {/* Main Headline - Responsive sizing */}
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.2] text-[#0F172A]" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}>
                                    Empowering the Next Gen
                                </h1>

                                {/* Subtext - Responsive sizing */}
                                <p className="text-[#64748B] text-base sm:text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                                    Velonx is the ultimate community for students and tech enthusiasts. We bridge the gap between learning and real-world application through mentorship, projects, and collaboration.
                                </p>

                                {/* Buttons - Touch-friendly sizing */}
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4 justify-center lg:justify-start">
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

                        {/* Hero Visual - Animated Logo with Orbits - Responsive sizing */}
                        <ScrollReveal>
                            <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center mt-8 lg:mt-0">
                                {/* Orbit Ring 1 - Spinning - Responsive sizing */}
                                <div className="absolute w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full border-2 border-[#06B6D4]/20 border-t-[#06B6D4] animate-spin-slow" style={{ animationDuration: '20s' }} />
                                
                                {/* Orbit Ring 2 - Reverse Spinning - Responsive sizing */}
                                <div className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] md:w-[625px] md:h-[625px] lg:w-[750px] lg:h-[750px] rounded-full border-2 border-[#F59E0B]/20 border-b-[#F59E0B] animate-spin-reverse" style={{ animationDuration: '25s' }} />

                                {/* Main Logo Circle - Responsive sizing */}
                                <div className="relative z-10 w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-white shadow-2xl shadow-[#0891B2]/20 flex items-center justify-center animate-float-logo">
                                    <img src="/logo.png" alt="Velonx" className="w-3/4 h-auto object-contain" />
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Why Velonx Section */}
            <ScrollReveal>
                <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
                        <div className="max-w-2xl mx-auto mb-12 sm:mb-16 md:mb-20">
                            <p className="text-gray-500 text-base sm:text-lg md:text-xl leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                                Velonx connects aspiring talent with real-world opportunities, fostering a future built on innovation, creativity, and meaningful collaboration. We bridge the gap between education and impact.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                            {[
                                {
                                    icon: <Briefcase className="w-10 h-10 sm:w-12 sm:h-12" />,
                                    title: "Real Projects",
                                    desc: "Dive into hands-on experiences that matter. Work on live industry challenges that build your portfolio and demonstrate your true potential to future employers.",
                                    color: "#3b82f6"
                                },
                                {
                                    icon: <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12" />,
                                    title: "Innovation",
                                    desc: "Push the boundaries of what's possible. We provide the tools and mentorship to turn bold ideas into groundbreaking solutions that shape tomorrow.",
                                    color: "#06b6d4"
                                },
                                {
                                    icon: <Users className="w-10 h-10 sm:w-12 sm:h-12" />,
                                    title: "Collaboration",
                                    desc: "Success is a team sport. Connect with a diverse community of peers and mentors, sharing knowledge to achieve greater heights together.",
                                    color: "#f97316"
                                },
                            ].map((feature, i) => (
                                <ScrollReveal key={i} delay={i * 150}>
                                    <div
                                        className="bg-white rounded-[20px] sm:rounded-[25px] md:rounded-[30px] p-6 sm:p-8 md:p-10 lg:p-12 text-center border border-gray-100 hover:shadow-2xl hover:-translate-y-2 sm:hover:-translate-y-4 transition-all duration-500 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1.5 transition-all" style={{ background: feature.color }} />
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-6 sm:mb-8 flex items-center justify-center transition-transform duration-400 group-hover:scale-110 group-hover:rotate-6" style={{ background: `${feature.color}14`, color: feature.color }}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-[#023047] text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>{feature.title}</h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>{feature.desc}</p>
                                        <a href="#" className="text-[#023047] font-semibold text-xs sm:text-sm border-b border-dashed border-[#023047] pb-0.5 inline-block hover:text-blue-600 transition-colors touch-target" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                            {i === 0 ? "Explore Projects" : i === 1 ? "See Innovation" : "Join the Community"}
                                        </a>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Community Showcase Section */}
            <ScrollReveal>
                <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 bg-[#F8FAFC]">
                    <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl text-[#023047] mb-3 sm:mb-4" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>Community Showcase</h2>
                                <p className="text-gray-500 text-sm sm:text-base" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>See what our members are building and achieving.</p>
                            </div>
                            <Link href="/projects" className="w-full md:w-auto">
                                <button 
                                    className="w-full md:w-auto touch-target bg-gradient-to-r from-[#0f2c59] to-[#1e40af] hover:brightness-110 text-white font-semibold rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm transition-all shadow-lg shadow-[#0f2c59]/30" 
                                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
                                    aria-label="View all community projects"
                                >
                                    View All Projects
                                </button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            {/* Project Card */}
                            <div className="bg-white rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-blue-500/5 group">
                                <div className="aspect-[16/9] bg-gray-100 relative">
                                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-1 sm:gap-1.5">
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400" />
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-200 to-transparent flex items-center justify-center px-8 sm:px-12">
                                        {/* Browser-like window preview */}
                                        <div className="w-full h-3/4 bg-white rounded-t-xl shadow-sm" />
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 md:p-8">
                                    <div className="flex gap-2 mb-3 sm:mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#219EBC] bg-[#219EBC]/5 px-2 py-1 rounded" style={{ fontFamily: "'Montserrat', sans-serif" }}>EdTech</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 bg-cyan-500/5 px-2 py-1 rounded" style={{ fontFamily: "'Montserrat', sans-serif" }}>React Native</span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl text-[#023047] mb-2" style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 600 }}>StudySync App</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>A collaborative study platform helping students organize group sessions efficiently.</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 6}`} alt="Core" />
                                                </div>
                                            ))}
                                        </div>
                                        <Link href="/projects/studysync" className="text-[#023047] text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all touch-target" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                            View Details <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Card */}
                            <div className="bg-[#023047] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] p-8 sm:p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-8 sm:top-10 md:top-12 right-8 sm:right-10 md:right-12 text-blue-400/20 group-hover:text-blue-400/30 transition-colors">
                                    <Quote className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rotate-180" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex gap-1 mb-6 sm:mb-8">
                                        {[1, 2, 3, 4, 5].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-lg sm:text-xl md:text-2xl leading-relaxed mb-8 sm:mb-10 md:mb-12" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
                                        "Velonx changed my career trajectory. The mentorship I received here helped me land my dream internship at a top tech firm."
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500 flex items-center justify-center font-bold text-base sm:text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        JM
                                    </div>
                                    <div>
                                        <div className="font-bold text-base sm:text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>James Miller</div>
                                        <div className="text-blue-300 text-xs sm:text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>CS Student, Stanford</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

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
