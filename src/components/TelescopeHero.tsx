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
                src="/hero-light.webp"
                alt=""
                aria-hidden="true"
                fill
                className="hero-bg-image object-cover"
                style={{ opacity: theme === "light" ? 1 : 0 }}
                priority
            />

            {/* Dark-theme hero image */}
            <Image
                src="/hero-dark.webp"
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
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.1] text-black dark:text-foreground mb-4 drop-shadow-md" style={{ fontFamily: "var(--font-girassol), serif", fontWeight: 400 }}>Empowering the Gen</h1>

                <div className="max-w-3xl mx-auto p-4 sm:p-6 rounded-2xl bg-white/40 dark:bg-black/50 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg mb-12">
                    <p className="text-gray-900 dark:text-gray-200 text-lg sm:text-xl md:text-2xl leading-relaxed font-medium drop-shadow-sm">
                        Join a thriving Velonx community where students turn potential into impact. Build projects, learn from mentors, and launch your career.
                    </p>
                </div>

                <div className="flex items-center justify-center ">
                    <Link href="/auth/signup">
                        <button
                            className="touch-target bg-foreground text-background hover:opacity-90 font-bold rounded-full px-10 py-5 text-lg flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95 backdrop-blur-sm border border-border/50"
                        >
                            Start Your Journey <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};
