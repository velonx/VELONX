"use client";

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShowcaseModal, ProjectData } from "./ShowcaseModal";
import "./ParallaxGallery.css";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export interface SlideData {
    name: string;
    src: string;
    category?: string;
    dateMonth?: string;
    dateDay?: string;
    description?: string;
    link?: string;
}

interface ParallaxGalleryProps {
    title?: string;
    description?: string;
    slides?: SlideData[];
}

export const ParallaxGallery: React.FC<ParallaxGalleryProps> = ({
    title,
    description,
    slides = [],
}) => {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<SlideData | null>(null);

    const handleProjectClick = (project: SlideData) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            if (!containerRef.current || !sectionRef.current) return;

            const container = containerRef.current;

            // Calculate total scroll distance needed
            const totalWidth = container.scrollWidth;
            const viewportWidth = window.innerWidth;
            const moveDistance = totalWidth - viewportWidth;

            gsap.to(container, {
                x: -moveDistance,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: () => `+=${totalWidth}`,
                    pin: true,
                    scrub: 1, // Smooth scrub effect (1 second catchup)
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, [slides]);

    return (
        <section ref={sectionRef} className="cinematic-gallery-section text-foreground relative h-[80vh] min-h-[500px] overflow-hidden flex flex-col justify-center py-12">
            <div className="cinematic-gallery-container flex items-center h-min w-max px-4 md:px-12 gap-6 md:gap-10 will-change-transform" ref={containerRef}>

                {/* Intro Slide */}
                <div className="cinematic-slide flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] flex flex-col justify-center relative">
                    <div className="max-w-2xl z-10 relative">
                        <div className="w-16 h-1 bg-primary mb-6 rounded-full"></div>
                        {title && <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-4">{title}</h2>}
                        {description && <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">{description}</p>}
                    </div>
                </div>

                {/* Image Slides */}
                {slides.map((slide, i) => (
                    <div 
                        key={`${slide?.name}-${i}`} 
                        className="cinematic-slide flex-shrink-0 aspect-[4/3] h-[55vh] min-h-[260px] max-h-[480px] rounded-xl relative overflow-hidden group bg-[#050505] shadow-2xl border border-white/10 cursor-pointer"
                        onClick={() => handleProjectClick(slide)}
                    >

                        {/* High-Contrast / Cinematic Filter Overlays */}
                        <div className="absolute inset-0 bg-red-900/10 mix-blend-color-burn z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-0" />

                        {/* Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={slide?.src}
                            alt={slide?.name || 'Showcase Image'}
                            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out grayscale-[0.2] contrast-[1.1] brightness-90 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
                        />

                        {/* Gradients for Text Legibility & Mood */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-10 w-1/2" />

                        {/* Content */}
                        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 z-20 flex justify-between items-end">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-2xl translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                {slide?.name || 'Untitled'}
                            </h3>
                            <span className="text-primary font-mono text-xl tracking-widest font-bold">
                                {(i + 1).toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <ShowcaseModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                project={selectedProject as ProjectData | null} 
            />
        </section>
    );
};
