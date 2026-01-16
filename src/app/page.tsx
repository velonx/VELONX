"use client";

import Link from "next/link";
import { ArrowRight, Play, Quote, Star, Twitter, Linkedin, Github, Code } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import toast from "react-hot-toast";

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
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-32 pb-20 grid-pattern-light overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal>
                            <div className="space-y-8">
                                {/* Main Headline */}
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-[#023047]">
                                    Empower Your <br /> Future in <span className="text-[#219EBC]">Tech</span>
                                </h1>

                                {/* Subtext */}
                                <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
                                    Join the premier student tech community focused on real-world projects, innovation, and collaboration. Build your portfolio and network with industry leaders.
                                </p>

                                {/* Buttons */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Link href="/auth/signup">
                                        <button
                                            onClick={handleJoinClick}
                                            className="coral-gradient coral-gradient-hover text-white font-bold rounded-xl px-8 py-4 text-base flex items-center gap-2 transition-all shadow-lg shadow-coral-500/25"
                                        >
                                            Join Community <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </Link>
                                    <button className="flex items-center gap-3 text-[#023047] font-bold px-6 py-4 hover:bg-gray-50 transition-all rounded-xl">
                                        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
                                            <Play className="w-4 h-4 fill-[#023047]" />
                                        </div>
                                        Watch Video
                                    </button>
                                </div>

                                {/* Stats Overlay */}
                                <div className="flex items-center gap-10 pt-8 border-t border-gray-100">
                                    <div>
                                        <div className="text-2xl font-bold text-[#023047]">12k+</div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Members</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[#023047]">500+</div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Projects</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[#023047]">50+</div>
                                        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Partners</div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Hero Illustration Wrapper */}
                        <ScrollReveal>
                            <div className="relative">
                                {/* Main Card */}
                                <div className="relative z-10 aspect-square rounded-[40px] bg-white shadow-2xl shadow-blue-500/10 border border-white flex items-center justify-center p-12 overflow-hidden">
                                    {/* Background soft glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#219EBC]/5 to-transparent" />
                                    <img src="/logo.png" alt="Velonx" className="w-full h-auto object-contain relative z-20" />
                                    <div className="absolute bottom-12 left-0 right-0 text-center">

                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-6 -left-12 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white flex items-center gap-3 animate-float-slow">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                        <Code className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-[#023047]">New Project</div>
                                        <div className="text-[10px] text-gray-400">AI Assistant Started</div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-6 -right-6 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Mentor" className="w-8 h-8 rounded-full" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-[#023047]">New Mentor</div>
                                        <div className="text-[10px] text-gray-400">Satwik joined</div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Why Velonx Section */}
            <ScrollReveal>
                <section className="relative py-28 bg-white">
                    <div className="container mx-auto px-4 text-center">
                        <div className="max-w-2xl mx-auto mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold text-[#023047] mb-6">Why Velonx?</h2>
                            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                                We provide the ecosystem you need to transition from student to professional through hands-on experience.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#126783]"><div className="w-6 h-4 border-2 border-blue-600 rounded-sm" /></div>,
                                    title: "Real Projects",
                                    desc: "Work on live projects that solve real-world problems. Gain experience that matters to recruiters."
                                },
                                {
                                    icon: <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-[#219EBC]"><div className="w-2 h-6 bg-cyan-500 rounded-full" /></div>,
                                    title: "Innovation",
                                    desc: "Access cutting-edge tools and resources. Push the boundaries of what's possible in tech."
                                },
                                {
                                    icon: <div className="w-12 h-12 rounded-2xl bg-coral-50 flex items-center justify-center text-[#FF7D61]"><div className="w-6 h-6 border-2 border-[#FF7D61] rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-[#FF7D61] rounded-full" /></div></div>,
                                    title: "Collaboration",
                                    desc: "Connect with peers and mentors globally. Build your network while building your skills."
                                },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-[32px] p-10 text-left border border-gray-50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group"
                                >
                                    <div className="mb-8">{feature.icon}</div>
                                    <h3 className="text-[#023047] text-2xl font-bold mb-4">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Community Showcase Section */}
            <ScrollReveal>
                <section className="relative py-28 bg-[#F8FAFC]">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-bold text-[#023047] mb-4">Community Showcase</h2>
                                <p className="text-gray-500">See what our members are building and achieving.</p>
                            </div>
                            <Link href="/projects">
                                <button className="px-6 py-2.5 rounded-xl border-2 border-[#023047] text-[#023047] font-bold text-sm hover:bg-[#023047] hover:text-white transition-all">
                                    View All Projects
                                </button>
                            </Link>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Project Card */}
                            <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-blue-500/5 group">
                                <div className="aspect-[16/9] bg-gray-100 relative">
                                    <div className="absolute top-4 left-4 flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-200 to-transparent flex items-center justify-center px-12">
                                        {/* Browser-like window preview */}
                                        <div className="w-full h-3/4 bg-white rounded-t-xl shadow-sm" />
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex gap-2 mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#219EBC] bg-[#219EBC]/5 px-2 py-1 rounded">EdTech</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 bg-cyan-500/5 px-2 py-1 rounded">React Native</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#023047] mb-2">StudySync App</h3>
                                    <p className="text-gray-500 text-sm mb-6">A collaborative study platform helping students organize group sessions efficiently.</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 6}`} alt="Core" />
                                                </div>
                                            ))}
                                        </div>
                                        <Link href="/projects/studysync" className="text-[#023047] text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Card */}
                            <div className="bg-[#023047] rounded-[40px] p-12 text-white flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-12 right-12 text-blue-400/20 group-hover:text-blue-400/30 transition-colors">
                                    <Quote className="w-24 h-24 rotate-180" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex gap-1 mb-8">
                                        {[1, 2, 3, 4, 5].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-xl md:text-2xl font-medium leading-relaxed mb-12">
                                        "Velonx changed my career trajectory. The mentorship I received here helped me land my dream internship at a top tech firm."
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center font-bold text-lg">
                                        JM
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">James Miller</div>
                                        <div className="text-blue-300 text-sm">CS Student, Stanford</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* CTA Section */}
            <ScrollReveal>
                <section className="relative py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#023047] via-[#126783] to-[#219EBC]" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
                                Ready to Launch Your <br /> Tech Journey?
                            </h2>
                            <p className="text-white/80 mb-12 text-lg md:text-xl">
                                Join thousands of students building the future today.
                            </p>
                            <Link href="/auth/signup">
                                <button
                                    onClick={handleJoinClick}
                                    className="coral-gradient coral-gradient-hover text-white font-bold rounded-xl px-10 py-5 text-lg transition-all shadow-2xl shadow-black/20"
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
