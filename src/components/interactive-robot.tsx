"use client";

import { useState, useEffect, useRef } from "react";

interface InteractiveRobotProps {
    showPassword?: boolean;
    loginState?: "idle" | "success" | "error";
    size?: "sm" | "md" | "lg";
}

export default function InteractiveRobot({
    showPassword = false,
    loginState = "idle",
    size = "md"
}: InteractiveRobotProps) {
    const robotRef = useRef<HTMLDivElement>(null);
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [isBlinking, setIsBlinking] = useState(false);

    // Size configurations
    const sizes = {
        sm: { container: "w-32 h-32", eye: "w-8 h-8", pupil: "w-3 h-3", antenna: "w-3 h-3" },
        md: { container: "w-48 h-48", eye: "w-10 h-10", pupil: "w-3 h-3", antenna: "w-4 h-4" },
        lg: { container: "w-64 h-64", eye: "w-14 h-14", pupil: "w-4 h-4", antenna: "w-5 h-5" },
    };
    const s = sizes[size];

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!robotRef.current || showPassword) return;

            const rect = robotRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate angle and distance
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            // Limit eye movement range
            const maxMove = 8;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const normalizedDistance = Math.min(distance / 200, 1);

            const moveX = (deltaX / (distance || 1)) * maxMove * normalizedDistance;
            const moveY = (deltaY / (distance || 1)) * maxMove * normalizedDistance;

            setEyePosition({ x: moveX, y: moveY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [showPassword]);

    // Random blinking
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
            }
        }, 2000);
        return () => clearInterval(blinkInterval);
    }, []);

    // When showing password, look away
    const eyeX = showPassword ? -10 : eyePosition.x;
    const eyeY = showPassword ? 0 : eyePosition.y;

    // Emotion colors and expressions
    const getEyeColor = () => {
        switch (loginState) {
            case "success": return "from-green-400 to-green-600";
            case "error": return "from-red-400 to-red-600";
            default: return "from-cyan-400 to-cyan-600";
        }
    };

    const getMouthExpression = () => {
        switch (loginState) {
            case "success":
                return (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-6 border-b-4 border-green-400 rounded-b-full" />
                );
            case "error":
                return (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-5 border-t-4 border-red-400 rounded-t-full" />
                );
            default:
                return null;
        }
    };

    const getCheekBlush = () => {
        if (loginState === "success") {
            return (
                <>
                    <div className="absolute bottom-10 left-6 w-5 h-2 rounded-full bg-pink-400/40 animate-pulse" />
                    <div className="absolute bottom-10 right-6 w-5 h-2 rounded-full bg-pink-400/40 animate-pulse" />
                </>
            );
        }
        return null;
    };

    return (
        <div ref={robotRef} className={`${s.container} relative animate-float`}>
            {/* Robot Head - Main Circle */}
            <div className={`${s.container} rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 relative shadow-2xl ${loginState === "success" ? "shadow-green-500/30" : loginState === "error" ? "shadow-red-500/30" : "shadow-cyan-500/20"} transition-all duration-300`}>
                {/* Inner Face */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center overflow-hidden">
                    {/* Eyes Container */}
                    <div className="flex gap-6">
                        {/* Left Eye */}
                        <div
                            className={`${s.eye} rounded-full bg-gradient-to-br ${getEyeColor()} shadow-lg ${loginState === "success" ? "shadow-green-500/50" : loginState === "error" ? "shadow-red-500/50" : "shadow-cyan-500/50"} flex items-center justify-center transition-all duration-300 ${isBlinking ? "scale-y-[0.1]" : "scale-y-100"}`}
                        >
                            <div
                                className={`${s.pupil} rounded-full bg-white transition-transform duration-75`}
                                style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}
                            />
                        </div>
                        {/* Right Eye */}
                        <div
                            className={`${s.eye} rounded-full bg-gradient-to-br ${getEyeColor()} shadow-lg ${loginState === "success" ? "shadow-green-500/50" : loginState === "error" ? "shadow-red-500/50" : "shadow-cyan-500/50"} flex items-center justify-center transition-all duration-300 ${isBlinking ? "scale-y-[0.1]" : "scale-y-100"}`}
                            style={{ animationDelay: "0.3s" }}
                        >
                            <div
                                className={`${s.pupil} rounded-full bg-white transition-transform duration-75`}
                                style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}
                            />
                        </div>
                    </div>

                    {/* Mouth Expression */}
                    {getMouthExpression()}

                    {/* Cheek blush for happy state */}
                    {getCheekBlush()}

                    {/* Error X eyes overlay */}
                    {loginState === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex gap-6">
                                <div className="relative w-10 h-10">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl animate-pulse">😵</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Antenna */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-1 h-8 bg-gradient-to-t from-gray-400 to-gray-300" />
                    <div className={`${s.antenna} rounded-full bg-gradient-to-br ${loginState === "success" ? "from-green-400 to-green-500" : loginState === "error" ? "from-red-400 to-red-500" : "from-cyan-400 to-violet-500"} -translate-x-1.5 animate-pulse shadow-lg ${loginState === "success" ? "shadow-green-400/50" : loginState === "error" ? "shadow-red-400/50" : "shadow-cyan-400/50"} transition-all duration-300`} />
                </div>

                {/* Side Lights */}
                <div className={`absolute top-1/2 -left-3 w-6 h-3 rounded-full bg-gradient-to-r ${loginState === "success" ? "from-green-500 to-green-400" : loginState === "error" ? "from-red-500 to-red-400" : "from-violet-500 to-violet-400"} animate-pulse shadow-lg ${loginState === "success" ? "shadow-green-500/50" : loginState === "error" ? "shadow-red-500/50" : "shadow-violet-500/50"} transition-all duration-300`} />
                <div className={`absolute top-1/2 -right-3 w-6 h-3 rounded-full bg-gradient-to-l ${loginState === "success" ? "from-green-500 to-green-400" : loginState === "error" ? "from-red-500 to-red-400" : "from-violet-500 to-violet-400"} animate-pulse shadow-lg ${loginState === "success" ? "shadow-green-500/50" : loginState === "error" ? "shadow-red-500/50" : "shadow-violet-500/50"} transition-all duration-300`} style={{ animationDelay: "0.5s" }} />

                {/* Eyebrows for expressions */}
                {loginState === "error" && (
                    <>
                        <div className="absolute top-12 left-8 w-6 h-1 bg-gray-400 rounded-full transform -rotate-12" />
                        <div className="absolute top-12 right-8 w-6 h-1 bg-gray-400 rounded-full transform rotate-12" />
                    </>
                )}
                {loginState === "success" && (
                    <>
                        <div className="absolute top-12 left-8 w-6 h-1 bg-green-400 rounded-full transform rotate-12" />
                        <div className="absolute top-12 right-8 w-6 h-1 bg-green-400 rounded-full transform -rotate-12" />
                    </>
                )}
            </div>
        </div>
    );
}
