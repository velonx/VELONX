"use client";

import { motion } from "framer-motion";
import { Rocket, Target, Users, Shield, Zap, Sparkles, Heart, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { HoverEffect } from "@/components/ui/card-hover-effect";

export default function AboutPage() {
    const stats = [
        { label: "Active Members", value: "5000+", icon: Users },
        { label: "Projects Built", value: "1200+", icon: Rocket },
        { label: "Partner Companies", value: "45+", icon: Target },
        { label: "Success Rate", value: "98%", icon: Zap },
    ];

    const coreValues = [
        {
            title: "Integrity",
            description: "Honesty and transparency in everything we do. We build trust through consistent actions and open communication.",
            link: "#values-integrity",
            icon: <Shield className="w-12 h-12" />,
        },
        {
            title: "Inclusion",
            description: "A welcoming space for all tech enthusiasts. We celebrate diversity and create opportunities for everyone.",
            link: "#values-inclusion",
            icon: <Heart className="w-12 h-12" />,
        },
        {
            title: "Impact",
            description: "Making a real difference in students' careers. We measure success by the lives we transform.",
            link: "#values-impact",
            icon: <Lightbulb className="w-12 h-12" />,
        },
    ];

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="py-20 bg-background overflow-hidden relative">
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        Our Story
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl text-foreground mb-8 leading-tight font-bold tracking-tight"
                    >
                        Empowering the <br />
                        <span className="text-primary">Next Generation</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed"
                    >
                        Velonx is more than a platform; it&apos;s a movement. We&apos;re building a community where students can learn, build, and grow together in the ever-evolving world of technology.
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
                                <Card className="border border-border shadow-xl shadow-black/5 rounded-[32px] bg-card text-center p-8 hover:scale-[1.02] transition-transform">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
                                    <div className="text-muted-foreground text-sm font-bold uppercase tracking-wider">{stat.label}</div>
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
                            <div className="aspect-square bg-muted rounded-[64px] overflow-hidden shadow-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"
                                    alt="Team collaboration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/20 rounded-[48px] -z-10" />
                        </div>
                        <div>
                            <h2 className="text-4xl mb-8 text-foreground font-bold">Our Mission &amp; <span className="text-primary">Vision</span></h2>
                            <div className="space-y-12">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-primary rounded-3xl shrink-0 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Accessibility in Education</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            We believe high-quality tech education should be accessible to everyone, regardless of their background or location.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-secondary rounded-3xl shrink-0 flex items-center justify-center text-primary-foreground shadow-lg shadow-secondary/30">
                                        <Rocket className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Incorporate Innovation</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Our platform encourages hands-on learning through real-world projects, fostering a culture of innovation and creativity.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-muted rounded-3xl shrink-0 flex items-center justify-center text-foreground shadow-lg border border-border">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Community First</h3>
                                        <p className="text-muted-foreground leading-relaxed">
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
            <section className="py-24 bg-muted/20 border-y border-border">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl mb-4 text-foreground font-bold">
                        The Core Values that <span className="text-primary">Drive Us</span>
                    </h2>
                    <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
                        Our principles guide every decision we make and every feature we build
                    </p>
                    <HoverEffect items={coreValues} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="bg-card border border-border rounded-[64px] p-12 md:p-20 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full -ml-48 -mb-48 group-hover:scale-110 transition-transform duration-1000" />

                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-8 relative z-10">Ready to start your journey?</h2>
                        <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
                            Join thousands of students who are already building the future on Velonx.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 relative z-10">
                            <button className="h-16 px-10 bg-primary text-primary-foreground font-black rounded-[24px] hover:bg-primary/90 transition-all text-lg shadow-lg shadow-primary/20">
                                Join the Community
                            </button>
                            <button className="h-16 px-10 bg-transparent border border-border text-foreground font-black rounded-[24px] hover:bg-muted transition-all text-lg">
                                Contact Our Team
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
