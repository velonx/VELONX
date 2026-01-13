"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                    <ScrollReveal>
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Main Headline */}
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-gray-900">
                                <span className="text-[#219EBC] inline-block mb-2 italic">Student-driven</span>
                                <br />
                                <span className="inline-block mb-2">Innovating the Gap,</span>
                                <br />
                                <span className="text-[#E9C46A] inline-block">Building Futures</span>
                            </h1>

                            {/* Subtext with highlighted "real projects" */}
                            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                Velonx is a tech community where learners build{" "}
                                <span className="bg-[#219EBC]/10 text-[#219EBC] font-semibold px-2 py-0.5 rounded">real projects</span>, explore
                                emerging technologies, and grow together through collaboration.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <Link href="/auth/signup">
                                    <button className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold rounded-full px-8 py-4 text-lg flex items-center gap-2 transition-all shadow-lg shadow-[#219EBC]/25">
                                        Join Community <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                                <Link href="/projects">
                                    <button className="border-2 border-gray-300 text-gray-700 hover:border-[#219EBC] hover:text-[#219EBC] font-medium rounded-full px-8 py-4 text-lg transition-all">
                                        Explore Projects
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Stats Section */}
            <ScrollReveal>
                <section className="relative py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                            <div className="text-center p-6 rounded-2xl bg-gray-50 cursor-pointer transition-all border border-gray-100 hover:border-[#219EBC] hover:shadow-lg">
                                <div className="text-3xl md:text-4xl font-black text-[#219EBC] mb-1">1000+</div>
                                <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Community Members</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gray-50 cursor-pointer transition-all border border-gray-100 hover:border-[#E9C46A] hover:shadow-lg">
                                <div className="text-3xl md:text-4xl font-black text-[#E9C46A] mb-1">50+</div>
                                <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Projects Built</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gray-50 cursor-pointer transition-all border border-gray-100 hover:border-[#F4A261] hover:shadow-lg">
                                <div className="text-3xl md:text-4xl font-black text-[#F4A261] mb-1">30+</div>
                                <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Events Hosted</div>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-gray-50 cursor-pointer transition-all border border-gray-100 hover:border-[#219EBC] hover:shadow-lg">
                                <div className="text-3xl md:text-4xl font-black text-[#219EBC] mb-1">100%</div>
                                <div className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Free to Join</div>
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Features Section */}
            <ScrollReveal>
                <section className="relative py-28 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900">
                                <span className="text-[#219EBC]">Why</span> Join Velonx?
                            </h2>
                            <p className="text-gray-600 max-w-xl mx-auto text-lg">
                                Everything you need to accelerate your tech journey.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: "💻", title: "Real Projects", desc: "Build products that solve actual problems" },
                                { icon: "🎓", title: "Expert Mentors", desc: "Learn from industry professionals" },
                                { icon: "📚", title: "Free Resources", desc: "Curated roadmaps and tutorials" },
                                { icon: "🏆", title: "Gamification", desc: "Earn XP and climb leaderboards" },
                            ].map((feature, i) => (
                                <div key={i} className="bg-white rounded-2xl p-8 transition-all group cursor-pointer border border-gray-100 hover:border-[#219EBC] hover:shadow-xl">
                                    <div className="text-5xl mb-5 inline-block">{feature.icon}</div>
                                    <h3 className="text-gray-900 text-xl font-bold mb-3 group-hover:text-[#219EBC] transition-colors">{feature.title}</h3>
                                    <p className="text-gray-500">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </ScrollReveal>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* CTA Section */}
            <ScrollReveal>
                <section className="relative py-28 bg-[#219EBC] overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
                                Ready to Start Building?
                            </h2>
                            <p className="text-white/80 mb-10 text-xl">
                                Join thousands of students who are already building the future.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/auth/signup">
                                    <button className="bg-white hover:bg-gray-100 text-[#219EBC] font-semibold rounded-full px-8 py-4 text-lg transition-all shadow-lg">
                                        Get Started Free
                                    </button>
                                </Link>
                                <Link href="/events">
                                    <button className="border-2 border-white text-white hover:bg-white/10 font-medium rounded-full px-8 py-4 text-lg transition-all">
                                        Browse Events
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </ScrollReveal>
        </div>
    );
}
