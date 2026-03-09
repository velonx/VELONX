"use client";

import React, { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import "./ParallaxGallery.css";

interface SlideData {
    name: string;
    src: string;
}

interface ParallaxGalleryProps {
    title?: string;
    description?: string;
    slides?: SlideData[];
}

function lerp(p1: number, p2: number, t: number): number {
    return p1 + (p2 - p1) * t;
}

function clamp(min: number, max: number, value: number): number {
    return Math.max(min, Math.min(max, value));
}

export const ParallaxGallery: React.FC<ParallaxGalleryProps> = ({
    title,
    description,
    slides = [],
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const rafRef = useRef<number | null>(null);
    const renderRef = useRef<(() => void) | null>(null);
    const scrollRef = useRef({ current: 0, target: 0, ease: 0.07 });
    const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
    const isHoveredRef = useRef(false);
    const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getLimit = useCallback(() => {
        if (!containerRef.current || !wrapperRef.current) return 0;
        return containerRef.current.scrollWidth - wrapperRef.current.clientWidth;
    }, []);

    // Auto-scroll: advance by ~280px every 1500ms, loop back smoothly at end
    const startAutoScroll = useCallback(() => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        autoScrollRef.current = setInterval(() => {
            if (isHoveredRef.current) return;
            const limit = getLimit();
            if (limit <= 0) return;
            const next = scrollRef.current.target + 280;
            scrollRef.current.target = next > limit ? 0 : next;
        }, 1500);
    }, [getLimit]);

    const applyParallax = useCallback(() => {
        if (!wrapperRef.current) return;
        const vw = wrapperRef.current.clientWidth;
        const viewportCenter = vw * 0.5;
        imagesRef.current.forEach((img) => {
            if (!img || !img.parentElement) return;
            const rect = img.parentElement.getBoundingClientRect();
            const elemCenter = rect.left + rect.width * 0.5;
            const t = clamp(-1, 1, (elemCenter - viewportCenter) / viewportCenter);
            img.style.transform = `translate3d(${-t * 10}%, 0, 0)`;
        });
    }, []);

    const render = useCallback(() => {
        const s = scrollRef.current;
        s.target = clamp(0, getLimit(), s.target);
        s.current = lerp(s.current, s.target, s.ease);
        if (containerRef.current) {
            containerRef.current.style.transform = `translateX(${-s.current}px)`;
        }
        applyParallax();
        if (renderRef.current) {
            rafRef.current = requestAnimationFrame(renderRef.current);
        }
    }, [applyParallax, getLimit]);

    useLayoutEffect(() => {
        renderRef.current = render;
    });

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const onWheel = (e: WheelEvent) => {
            scrollRef.current.target += e.deltaY;
        };
        const onMouseDown = (e: MouseEvent) => {
            dragRef.current = { active: true, startX: e.clientX, startScroll: scrollRef.current.target };
        };
        const onMouseMove = (e: MouseEvent) => {
            if (!dragRef.current.active) return;
            scrollRef.current.target = dragRef.current.startScroll - (e.clientX - dragRef.current.startX);
        };
        const onMouseUp = () => { dragRef.current.active = false; };
        const onTouchStart = (e: TouchEvent) => {
            dragRef.current = { active: true, startX: e.touches[0].clientX, startScroll: scrollRef.current.target };
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!dragRef.current.active) return;
            scrollRef.current.target = dragRef.current.startScroll - (e.touches[0].clientX - dragRef.current.startX);
        };
        const onTouchEnd = () => { dragRef.current.active = false; };

        const onMouseEnter = () => { isHoveredRef.current = true; };
        const onMouseLeave = () => { isHoveredRef.current = false; };

        wrapper.addEventListener("wheel", onWheel, { passive: true });
        wrapper.addEventListener("mousedown", onMouseDown);
        wrapper.addEventListener("mouseenter", onMouseEnter);
        wrapper.addEventListener("mouseleave", onMouseLeave);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        wrapper.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd);

        rafRef.current = requestAnimationFrame(render);
        startAutoScroll();

        return () => {
            wrapper.removeEventListener("wheel", onWheel);
            wrapper.removeEventListener("mousedown", onMouseDown);
            wrapper.removeEventListener("mouseenter", onMouseEnter);
            wrapper.removeEventListener("mouseleave", onMouseLeave);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            wrapper.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        };
    }, [render, startAutoScroll]);

    return (
        <section className="parallax-gallery-section">
            {(title || description) && (
                <div className="parallax-gallery-header">
                    {title && <h2 style={{ fontWeight: 700 }}>{title}</h2>}
                    {description && <p className="font-normal">{description}</p>}
                    <p className="parallax-gallery-hint">Scroll or drag to explore →</p>
                </div>
            )}

            <div className="parallax-gallery__wrapper" ref={wrapperRef}>
                <div className="parallax-gallery__container" ref={containerRef}>
                    {slides.map((slide, i) => (
                        <div key={`${slide.name}-${i}`} className="parallax-gallery__media">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                ref={(el) => { if (el) imagesRef.current[i] = el; }}
                                src={slide.src}
                                alt={slide.name}
                                className="parallax-gallery__image"
                                draggable={false}
                            />
                            <div className="parallax-gallery__label">
                                <span>{slide.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
