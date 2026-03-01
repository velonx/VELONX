"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FlipText } from "@/components/ui/flip-text";
import { useTheme } from "@/components/theme-provider";
import "./TelescopeHero.css";

gsap.registerPlugin(ScrollTrigger);

export const TelescopeHero = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!sectionRef.current || !contentRef.current) return;

        // Simple reveal animation on scroll
        gsap.to(contentRef.current, {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top center",
                end: "bottom center",
                scrub: 1,
            },
            opacity: 1,
            y: 0,
            duration: 1,
        });

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} className="hero-section relative overflow-hidden flex items-start justify-center min-h-screen">
            {/* Base background colour fallback */}
            <div className="absolute inset-0 z-0 bg-background" />

            {/* Light-theme hero image */}
            <Image
                src="/hero-light.jpeg"
                alt=""
                aria-hidden="true"
                fill
                className="hero-bg-image object-cover"
                style={{ opacity: theme === "light" ? 1 : 0 }}
                priority
            />

            {/* Dark-theme hero image */}
            <Image
                src="/hero-dark.jpeg"
                alt=""
                aria-hidden="true"
                fill
                className="hero-bg-image object-cover"
                style={{ opacity: theme === "dark" ? 1 : 0 }}
                priority
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 z-[2] opacity-40 bg-gradient-to-b from-transparent via-background/50 to-background" />

            {/* Content Layer */}
            <div
                ref={contentRef}
                className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center opacity-0 translate-y-20 pt-24"
            >
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight leading-[1.1] text-foreground mb-8" style={{ fontFamily: "var(--font-girassol), serif", fontWeight: 400 }}>
                    Empowering the Gen
                </h1>

                <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-12" style={{ fontFamily: "'Indie Flower', cursive", fontWeight: 400 }}>
                    Join a thriving community where students and tech enthusiasts transform their potential into impact. Connect with expert mentors, build real projects, and launch your dream career.
                </p>

                <div className="flex items-center justify-center">
                    <Link href="/auth/signup">
                        <button
                            className="touch-target bg-white/90 hover:bg-white text-gray-900 font-semibold rounded-full px-10 py-5 text-lg flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/30"
                            style={{ fontFamily: "'Indie Flower', cursive", fontWeight: 600 }}
                        >
                            Start Your Journey <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
