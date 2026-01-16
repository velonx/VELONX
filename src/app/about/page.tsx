"use client";

import { motion } from "framer-motion";
import { Rocket, Target, Users, Shield, Zap, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
    const stats = [
        { label: "Active Members", value: "5000+", icon: Users },
        { label: "Projects Built", value: "1200+", icon: Rocket },
        { label: "Partner Companies", value: "45+", icon: Target },
        { label: "Success Rate", value: "98%", icon: Zap },
    ];

    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
                <div className="absolute top-20 left-10 w-64 h-64 bg-[#219EBC]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFB703]/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#219EBC]/10 border border-[#219EBC]/30 px-4 py-2 text-sm font-medium text-[#219EBC] mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Our Story
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight"
                    >
                        Empowering the <br />
                        <span className="text-[#219EBC]">Next Generation</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed"
                    >
                        Velonx is more than a platform; it's a movement. we're building a community where students can learn, build, and grow together in the ever-evolving world of technology.
                    </motion.p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 -mt-10 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-0 shadow-xl shadow-black/5 rounded-[32px] bg-white text-center p-8 hover:scale-[1.02] transition-transform">
                                    <div className="w-12 h-12 bg-[#219EBC]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#219EBC]">
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-gray-400 text-sm font-bold uppercase tracking-wider">{stat.label}</div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-square bg-gray-100 rounded-[64px] overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"
                                    alt="Team collaboration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#FFB703]/20 rounded-[48px] -z-10" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-8">Our Mission & <span className="text-[#219EBC]">Vision</span></h2>
                            <div className="space-y-12">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-[#219EBC] rounded-3xl shrink-0 flex items-center justify-center text-white shadow-lg shadow-[#219EBC]/30">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accessibility in Education</h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            We believe high-quality tech education should be accessible to everyone, regardless of their background or location.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-[#FFB703] rounded-3xl shrink-0 flex items-center justify-center text-white shadow-lg shadow-[#FFB703]/30">
                                        <Rocket className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Incorporate Innovation</h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            Our platform encourages hands-on learning through real-world projects, fostering a culture of innovation and creativity.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-[#023047] rounded-3xl shrink-0 flex items-center justify-center text-white shadow-lg shadow-[#023047]/30">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            Velonx is built on the foundation of community. We support each other, learn together, and grow as a collective.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-gray-900 mb-16">The Core Values that <span className="text-[#219EBC]">Drive Us</span></h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { title: "Integrity", desc: "Honesty and transparency in everything we do.", color: "#219EBC" },
                            { title: "Inclusion", desc: "A welcoming space for all tech enthusiasts.", color: "#FFB703" },
                            { title: "Impact", desc: "Making a real difference in students' careers.", color: "#023047" },
                        ].map((value, i) => (
                            <div key={i} className="bg-white p-12 rounded-[48px] shadow-xl shadow-black/5 hover-lift transition-all border border-gray-100">
                                <div className="w-4 h-20 rounded-full mx-auto mb-8" style={{ backgroundColor: value.color }} />
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="bg-[#023047] rounded-[64px] p-12 md:p-20 text-center text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#219EBC]/10 rounded-full -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFB703]/5 rounded-full -ml-48 -mb-48 group-hover:scale-110 transition-transform duration-1000" />

                        <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">Ready to start your journey?</h2>
                        <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
                            Join thousands of students who are already building the future on Velonx.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 relative z-10">
                            <button className="h-16 px-10 bg-white text-[#023047] font-black rounded-[24px] hover:bg-gray-100 transition-all text-lg shadow-2xl shadow-white/10">
                                Join the Community
                            </button>
                            <button className="h-16 px-10 bg-white/5 border border-white/20 text-white font-black rounded-[24px] hover:bg-white/10 transition-all text-lg">
                                Contact Our Team
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
