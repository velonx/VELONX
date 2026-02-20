"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Mousewheel } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
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
    return (
        <section className="page carousel-3-page">
            {title && <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Amatic SC', cursive" }}>{title}</h2>}
            {description && <p className="section-desc text-muted-foreground text-lg mb-8 px-4" style={{ fontFamily: "'Indie Flower', cursive" }}>{description}</p>}

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
            >
                {slides.map((slide, index) => (
                    <SwiperSlide
                        key={`${slide.name}-${index}`}
                        style={{
                            backgroundImage: type === 'showcase' ? `url(${slide.src})` : 'none',
                            backgroundColor: type === 'testimonial' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                            border: type === 'testimonial' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                        }}
                    >
                        <div className={`slide-content ${type === 'testimonial' ? 'p-8 flex flex-col justify-center items-center h-full' : ''}`}>
                            {type === 'showcase' ? (
                                <>
                                    <h2 className="text-white drop-shadow-lg">{slide.name}</h2>
                                    <a href="#" className="explore-btn">explore</a>
                                </>
                            ) : (
                                <>
                                    <p className="text-white text-sm mb-4 leading-relaxed line-clamp-4" style={{ fontFamily: "'Indie Flower', cursive" }}>"{slide.description}"</p>
                                    <h2 className="text-white text-lg mt-auto">{slide.name}</h2>
                                    <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Verified User</span>
                                </>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};
