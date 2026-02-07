"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Message sent! We'll get back to you soon.", {
            style: {
                borderRadius: '20px',
                background: '#023047',
                color: '#fff',
            },
            iconTheme: {
                primary: '#219EBC',
                secondary: '#fff',
            },
        });
    };

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="py-20 bg-background overflow-hidden relative">
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-foreground mb-8 leading-tight"
                    >
                        Get in <span className="text-[#219EBC]">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        Have a question about the platform or want to partner with us? We're here to help you grow.
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 -mt-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-background p-8 md:p-12 rounded-[56px] border border-border shadow-2xl shadow-black/5"
                        >
                            <h2 className="text-3xl font-black text-foreground mb-8">Send us a message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-4">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full h-16 bg-gray-50 border-0 rounded-3xl px-8 focus:ring-2 focus:ring-[#219EBC] transition-all outline-none text-foreground font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-4">Email</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full h-16 bg-gray-50 border-0 rounded-3xl px-8 focus:ring-2 focus:ring-[#219EBC] transition-all outline-none text-foreground font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-4">Subject</label>
                                    <select className="w-full h-16 bg-gray-50 border-0 rounded-3xl px-8 focus:ring-2 focus:ring-[#219EBC] transition-all outline-none text-foreground font-medium appearance-none">
                                        <option>General Inquiry</option>
                                        <option>Partnership</option>
                                        <option>Technical Support</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-4">Message</label>
                                    <textarea
                                        placeholder="How can we help you?"
                                        rows={5}
                                        className="w-full bg-gray-50 border-0 rounded-[32px] p-8 focus:ring-2 focus:ring-[#219EBC] transition-all outline-none text-foreground font-medium resize-none"
                                        required
                                    ></textarea>
                                </div>
                                <Button className="w-full h-16 bg-[#023047] hover:bg-[#054a6d] text-white font-black rounded-[24px] text-lg shadow-xl shadow-[#023047]/20 gap-2">
                                    Send Message <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </motion.div>

                        {/* Contact Info & Links */}
                        <div className="space-y-12">
                            {/* Contact Details */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="grid sm:grid-cols-2 gap-6"
                            >
                                <div className="bg-gray-50 p-8 rounded-[40px] border border-border">
                                    <div className="w-12 h-12 bg-[#219EBC]/10 rounded-2xl flex items-center justify-center text-[#219EBC] mb-6">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Email Us</p>
                                    <p className="text-foreground font-black">hello@velonx.com</p>
                                </div>
                                <div className="bg-gray-50 p-8 rounded-[40px] border border-border">
                                    <div className="w-12 h-12 bg-[#FFB703]/10 rounded-2xl flex items-center justify-center text-[#FFB703] mb-6">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Call Us</p>
                                    <p className="text-foreground font-black">+1 (555) 000-0000</p>
                                </div>
                                <div className="sm:col-span-2 bg-gray-50 p-8 rounded-[40px] border border-border flex items-center gap-8">
                                    <div className="w-16 h-16 bg-[#023047]/5 rounded-[24px] flex items-center justify-center text-[#023047] shrink-0">
                                        <MapPin className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Our Headquarters</p>
                                        <p className="text-foreground font-black text-lg">Silicon Valley, CA, USA</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section Links */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#219EBC]/5 p-10 rounded-[56px] border border-[#219EBC]/20"
                            >
                                <h3 className="text-2xl font-black text-[#023047] mb-8 flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6" />
                                    Useful Resources
                                </h3>
                                <div className="grid gap-4">
                                    {[
                                        { label: "About Velonx", path: "/about" },
                                        { label: "Terms of Service", path: "/terms" },
                                        { label: "Privacy Policy", path: "/privacy" },
                                        { label: "Blog & Updates", path: "/blog" },
                                    ].map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.path}
                                            className="flex items-center justify-between p-6 bg-background rounded-3xl group hover:bg-[#219EBC] hover:text-white transition-all shadow-sm"
                                        >
                                            <span className="font-bold">{link.label}</span>
                                            <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
