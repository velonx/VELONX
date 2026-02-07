"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FlipTextProps {
    words: string[];
    duration?: number;
    className?: string;
}

export function FlipText({ words, duration = 3000, className }: FlipTextProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipping(true);

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % words.length);
                setIsFlipping(false);
            }, 600); // Half of the flip animation duration
        }, duration);

        return () => clearInterval(interval);
    }, [words.length, duration]);

    return (
        <div className={cn("inline-block relative", className)}>
            <span
                className={cn(
                    "inline-block transition-all duration-600 ease-in-out",
                    isFlipping ? "animate-flip-out opacity-0 scale-y-0" : "animate-flip-in opacity-100 scale-y-100"
                )}
                style={{
                    transformOrigin: "center center",
                    backfaceVisibility: "hidden",
                }}
            >
                {words[currentIndex]}
            </span>
        </div>
    );
}
