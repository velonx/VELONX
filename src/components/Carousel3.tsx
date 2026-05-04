"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import Image from "next/image";
import "./Carousel3.css";

const defaultSlides = [
    {
        name: "India",
        src: "https://images.unsplash.com/photo-1524492707947-54b025f190d7?q=80&w=2070&auto=format&fit=crop",
    },
    {
        name: "Japan",
        src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
    },
    {
        name: "Scotland",
        src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop",
    },
    {
        name: "Norway",
        src: "https://images.unsplash.com/photo-1513519107127-1bed33748e4c?q=80&w=2070&auto=format&fit=crop",
    },
    {
        name: "France",
        src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2070&auto=format&fit=crop",
        description: "France, in Western Europe, encompasses medieval cities, alpine villages and Mediterranean beaches. Paris, its capital, is famed for its fashion houses, classical art museums including the Louvre and monuments like the Eiffel Tower.",
    },
];

interface SlideData {
    name: string;
    src: string;
    description?: string;
}

interface Carousel3Props {
    title?: string;
    description?: string;
    slides?: SlideData[];
    type?: 'showcase' | 'testimonial';
}

export const Carousel3: React.FC<Carousel3Props> = ({
    title,
    description,
    slides = defaultSlides,
    type = 'showcase'
}) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const isHoveredRef = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const sectionRef = useRef<HTMLElement | null>(null);

    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (isHoveredRef.current) return;
            swiperRef.current?.slideNext(600);
        }, 1500);
    }, []);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startAutoPlay]);

    // Attach hover listeners after mount
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const onEnter = () => { isHoveredRef.current = true; };
        const onLeave = () => { isHoveredRef.current = false; };
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return (
        <section ref={sectionRef} className="page carousel-3-page">
            {title && <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">{title}</h2>}
            {description && <p className="section-desc text-muted-foreground text-lg mb-8 px-4 font-normal">{description}</p>}

            <Swiper
                grabCursor
                centeredSlides
                slidesPerView={"auto"}
                speed={600}
                effect="coverflow"
                loop
                pagination={{ clickable: true }}
                modules={[EffectCoverflow, Pagination, Mousewheel]}
                mousewheel={{ forceToAxis: true }}
                coverflowEffect={{
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                }}
                breakpoints={{
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 20
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 40
                    }
                }}
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide
                        key={`${slide?.name}-${index}`}
                        className={type === 'testimonial' ? 'bg-card border border-border overflow-hidden' : 'overflow-hidden'}
                    >
                        {type === 'showcase' && (
                            <Image
                                src={slide?.src}
                                alt={slide?.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        )}
                        <div className={`slide-content ${type === 'testimonial' ? 'p-8 flex flex-col justify-center items-center h-full relative z-10' : 'relative z-10'}`}>
                            {type === 'showcase' ? (
                                <>
                                    <h2 className="text-white drop-shadow-lg">{slide?.name || 'Untitled'}</h2>
                                    <a href="#" className="explore-btn">explore</a>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-primary/20 shadow-md relative">
                                        <Image
                                            src={slide?.src}
                                            alt={slide?.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                    <p className="text-foreground text-sm mb-4 leading-relaxed line-clamp-4 font-normal text-center italic">&quot;{slide?.description || 'No description'}&quot;</p>
                                    <h2 className="text-foreground text-lg mt-auto font-bold">{slide?.name || 'Anonymous'}</h2>
                                    <span className="text-primary text-xs font-semibold uppercase tracking-wider">Verified User</span>
                                </>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};
