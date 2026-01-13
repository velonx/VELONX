"use client";

import { motion } from "framer-motion";
import { Lightbulb, Eye, Zap, ArrowRight, Users, Award, Calendar } from "lucide-react";
import Link from "next/link";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const } }
};


const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

// Team data
const teamMembers = [
    { name: "Sarah Chen", role: "CEO & Founder", image: "/team-placeholder.png" },
    { name: "Marcus Johnson", role: "Creative Director", image: "/team-placeholder.png" },
    { name: "Emily Rodriguez", role: "Lead Developer", image: "/team-placeholder.png" },
    { name: "David Kim", role: "UX Strategist", image: "/team-placeholder.png" },
    { name: "Priya Patel", role: "Design Lead", image: "/team-placeholder.png" },
    { name: "Alex Turner", role: "Tech Architect", image: "/team-placeholder.png" },
];

// Values data
const values = [
    {
        icon: Lightbulb,
        title: "Innovation",
        description: "We push boundaries and explore new possibilities, never settling for the conventional approach."
    },
    {
        icon: Eye,
        title: "Transparency",
        description: "Open communication and honest collaboration form the foundation of every project we undertake."
    },
    {
        icon: Zap,
        title: "Speed",
        description: "We move fast without compromising quality, delivering exceptional results on time, every time."
    },
];

// Stats data
const stats = [
    { number: "10+", label: "Years Experience", icon: Calendar },
    { number: "200+", label: "Projects Delivered", icon: Award },
    { number: "50+", label: "Industry Awards", icon: Award },
    { number: "30+", label: "Team Members", icon: Users },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 lg:px-12 bg-[#F6F6F6]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.p
                                variants={fadeInUp}
                                className="text-[#219EBC] text-sm font-medium tracking-widest uppercase mb-6"
                            >
                                About Us
                            </motion.p>
                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#080806] leading-[1.1] mb-8"
                            >
                                Crafting digital experiences that matter.
                            </motion.h1>
                            <motion.p
                                variants={fadeInUp}
                                className="text-[#5C625E] text-lg font-medium leading-relaxed max-w-lg"
                            >
                                We are a team of designers, developers, and strategists passionate about creating
                                meaningful digital products that connect brands with their audiences.
                            </motion.p>
                        </motion.div>

                        {/* Right - Hero Image/Shape */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#219EBC] via-[#A5C7CD] to-[#8B7A52] relative">
                                {/* Abstract geometric shapes */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 rounded-full bg-white/20 absolute top-8 right-8" />
                                    <div className="w-32 h-32 rounded-xl bg-[#080806]/10 absolute bottom-12 left-12 rotate-12" />
                                    <div className="w-24 h-24 rounded-full bg-[#8B7A52]/40 absolute top-1/2 left-1/3" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Strip */}
            <section className="py-16 px-6 lg:px-12 bg-white border-y border-[#E8E8E8]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-semibold text-[#8B7A52] mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-[#5C625E] text-sm font-medium uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="py-24 px-6 lg:px-12 bg-[#F6F6F6]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid lg:grid-cols-12 gap-12 lg:gap-20"
                    >
                        {/* Left Label */}
                        <motion.div variants={fadeInUp} className="lg:col-span-3">
                            <p className="text-[#219EBC] text-sm font-medium tracking-widest uppercase sticky top-32">
                                Our Mission
                            </p>
                        </motion.div>

                        {/* Right Content */}
                        <motion.div variants={fadeInUp} className="lg:col-span-9">
                            <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#080806] leading-snug mb-8">
                                We bridge the gap between design and technology, creating seamless digital
                                experiences that drive business growth.
                            </p>
                            <p className="text-[#5C625E] text-lg font-medium leading-relaxed max-w-2xl">
                                Our approach combines strategic thinking with creative execution. We believe
                                that great design is not just about aesthetics—it&apos;s about solving real problems
                                for real people. Every pixel, every interaction, every line of code serves a purpose.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Team Grid Section */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="mb-16">
                            <p className="text-[#219EBC] text-sm font-medium tracking-widest uppercase mb-4">
                                The Team
                            </p>
                            <h2 className="text-3xl md:text-4xl font-semibold text-[#080806]">
                                Meet the people behind the magic
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {teamMembers.map((member, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-square rounded-xl overflow-hidden bg-[#F0F0F0] mb-5">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#080806] mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-[#5C625E] text-sm font-medium">
                                        {member.role}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section - Dark */}
            <section className="py-24 px-6 lg:px-12 bg-[#080806]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="mb-16 text-center max-w-2xl mx-auto">
                            <p className="text-[#219EBC] text-sm font-medium tracking-widest uppercase mb-4">
                                Our Values
                            </p>
                            <h2 className="text-3xl md:text-4xl font-semibold text-white">
                                The principles that guide everything we do
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            className="grid md:grid-cols-3 gap-8"
                        >
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="p-8 rounded-xl border border-white/10 bg-white/5"
                                >
                                    <value.icon className="w-10 h-10 text-[#219EBC] mb-6" strokeWidth={1.5} />
                                    <h3 className="text-xl font-semibold text-white mb-4">
                                        {value.title}
                                    </h3>
                                    <p className="text-white/60 font-medium leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-24 px-6 lg:px-12 bg-[#F6F6F6]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#080806] mb-8"
                        >
                            Ready to build the future?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-[#5C625E] text-lg font-medium mb-12 max-w-xl mx-auto"
                        >
                            Let&apos;s collaborate and create something extraordinary together.
                            Your next big idea deserves the best execution.
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link href="/contact">
                                <button className="px-8 py-4 bg-[#080806] text-white font-semibold rounded-lg hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2">
                                    Start a Project <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <Link href="/projects">
                                <button className="px-8 py-4 border-2 border-[#080806] text-[#080806] font-semibold rounded-lg hover:bg-[#080806] hover:text-white transition-colors">
                                    View Our Work
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
