"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate-visible");
                    entry.target.classList.remove("animate-hidden");
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.05,
            rootMargin: "0px 0px -100px 0px",
        });

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            const elements = document.querySelectorAll(".animate-on-scroll");
            elements.forEach((el) => {
                el.classList.add("animate-hidden");
                observer.observe(el);
            });
        }, 100);

        return () => {
            const elements = document.querySelectorAll(".animate-on-scroll");
            elements.forEach((el) => observer.unobserve(el));
        };
    }, [pathname]);

    return <>{children}</>;
}

