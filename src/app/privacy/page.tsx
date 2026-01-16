"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Shield,
            title: "Information We Collect",
            content: "We collect information you provide directly to us, such as when you create an account, participate in our interactive features, or communicate with us.",
            list: ["Email address", "User profile data", "Project submissions", "Interaction history"]
        },
        {
            icon: Eye,
            title: "How We Use Data",
            content: "Your data helps us personalize your experience, provide platform features, and improve our services for the entire community.",
            list: ["Personalizing your dashboard", "Sending community updates", "Awarding XP points", "Analytics & improvements"]
        },
        {
            icon: Lock,
            title: "Security Measures",
            content: "We implement robust security standards to protect your personal information from unauthorized access, alteration, or disclosure.",
            list: ["Encrypted data storage", "Secure API endpoints", "Regular security audits", "Access control management"]
        }
    ];

    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Header Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white text-center">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-16 h-16 bg-[#219EBC]/10 rounded-[20px] flex items-center justify-center mx-auto mb-6 text-[#219EBC]"
                    >
                        <Lock className="w-8 h-8" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
                    >
                        Privacy <span className="text-[#219EBC]">Policy</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg max-w-2xl mx-auto"
                    >
                        Last updated: January 16, 2025. Your privacy is our priority. We are committed to protecting your personal data and being transparent about how we use it.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-16">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="grid md:grid-cols-12 gap-8 items-start"
                            >
                                <div className="md:col-span-1 hidden md:block">
                                    <div className="w-12 h-12 bg-white shadow-lg border border-gray-100 rounded-2xl flex items-center justify-center text-[#219EBC]">
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="md:col-span-11 bg-gray-50/50 p-8 md:p-12 rounded-[40px] border border-gray-100">
                                    <h2 className="text-2xl font-black text-gray-900 mb-4">{section.title}</h2>
                                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">{section.content}</p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {section.list.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-gray-500 font-medium">
                                                <CheckCircle className="w-5 h-5 text-[#219EBC]" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Additional Details */}
                    <div className="mt-24 p-12 bg-[#023047] rounded-[48px] text-white">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center shrink-0">
                                <FileText className="w-12 h-12 text-[#219EBC]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3">Questions & Contact</h3>
                                <p className="text-gray-400 mb-6">
                                    If you have any questions about this Privacy Policy or our treatment of your personal data, please contact us at privacy@velonx.com.
                                </p>
                                <button className="px-8 py-3 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl transition-all">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
