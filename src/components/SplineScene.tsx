"use client";

import { useState, useEffect, useRef } from "react";

interface SplineSceneProps {
  scene?: string;
  className?: string;
  showPassword?: boolean;
  loginState?: "idle" | "success" | "error";
}

export default function SplineScene({
  className = "",
  showPassword = false,
  loginState = "idle",
}: SplineSceneProps) {
  const robotRef = useRef<HTMLDivElement>(null);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [bodyTilt, setBodyTilt] = useState({ x: 0, y: 0 });
  const [bodyPosition, setBodyPosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Track mouse movement for eyes and body
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return;

      const rect = robotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Eye movement (disabled when showing password)
      if (!showPassword) {
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalizedDistance = Math.min(distance / 200, 1);
        const maxEyeMove = 8;
        const moveX = (deltaX / (distance || 1)) * maxEyeMove * normalizedDistance;
        const moveY = (deltaY / (distance || 1)) * maxEyeMove * normalizedDistance;
        setEyePosition({ x: moveX, y: moveY });
      }

      // Body tilt (3D rotation)
      const maxBodyTilt = 8;
      const tiltX = (deltaX / window.innerWidth) * maxBodyTilt;
      const tiltY = (deltaY / window.innerHeight) * maxBodyTilt;
      setBodyTilt({ x: tiltX, y: -tiltY });

      // Body position (translation)
      const maxBodyMove = 15;
      const bodyMoveX = (deltaX / window.innerWidth) * maxBodyMove;
      const bodyMoveY = (deltaY / window.innerHeight) * maxBodyMove;
      setBodyPosition({ x: bodyMoveX, y: bodyMoveY });
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

  const eyeX = showPassword ? -10 : eyePosition.x;
  const eyeY = showPassword ? 0 : eyePosition.y;

  const getEyeColor = () => {
    switch (loginState) {
      case "success": return "from-green-400 to-green-600";
      case "error": return "from-red-400 to-red-600";
      default: return "from-cyan-400 to-cyan-600";
    }
  };

  const getMouth = () => {
    if (showPassword) {
      return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-400 rounded-full" />
      );
    }

    switch (loginState) {
      case "success":
        return (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <div className="w-20 h-10 border-b-[5px] border-green-400 rounded-b-[100%]" />
          </div>
        );
      case "error":
        return (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <div className="w-16 h-8 border-t-[5px] border-red-400 rounded-t-[100%]" />
          </div>
        );
      default:
        return (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-400 rounded-full" />
        );
    }
  };

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <div
        ref={robotRef}
        className="w-48 h-72 relative"
        style={{
          transform: `
            perspective(1000px) 
            rotateX(${bodyTilt.y}deg) 
            rotateY(${bodyTilt.x}deg)
            translateX(${bodyPosition.x}px)
            translateY(${bodyPosition.y}px)
          `,
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Robot Body - Oval Shape */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-36 rounded-[50%] bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-2xl overflow-hidden" style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}>
          {/* Body panel lines */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 border-2 border-gray-500/30 rounded-2xl" />
          
          {/* Body buttons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            <div className={`w-3 h-3 rounded-full ${
              loginState === "success" ? "bg-green-400" : 
              loginState === "error" ? "bg-red-400" : 
              "bg-cyan-400"
            } shadow-lg animate-pulse`} />
            <div className="w-3 h-3 rounded-full bg-gray-500 shadow-lg" />
          </div>

          {/* Arms */}
          <div className="absolute top-6 -left-7 w-8 h-20 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg" />
          <div className="absolute top-6 -right-7 w-8 h-20 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg" />
        </div>

        {/* Robot Head */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-2xl ${
            loginState === "success"
              ? "shadow-green-500/30"
              : loginState === "error"
              ? "shadow-red-500/30"
              : "shadow-cyan-500/20"
          } transition-all duration-300`}
        >
          {/* Inner Face */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] flex items-center justify-center overflow-hidden">
            {/* Eyes Container */}
            <div className="flex gap-6 mb-2">
              {/* Left Eye */}
              <div
                className={`w-11 h-11 rounded-full bg-gradient-to-br ${getEyeColor()} shadow-lg ${
                  loginState === "success"
                    ? "shadow-green-500/50"
                    : loginState === "error"
                    ? "shadow-red-500/50"
                    : "shadow-cyan-500/50"
                } flex items-center justify-center transition-all duration-300 ${
                  isBlinking || showPassword ? "scale-y-[0.1]" : "scale-y-100"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full bg-white transition-transform duration-75"
                  style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}
                />
              </div>

              {/* Right Eye */}
              <div
                className={`w-11 h-11 rounded-full bg-gradient-to-br ${getEyeColor()} shadow-lg ${
                  loginState === "success"
                    ? "shadow-green-500/50"
                    : loginState === "error"
                    ? "shadow-red-500/50"
                    : "shadow-cyan-500/50"
                } flex items-center justify-center transition-all duration-300 ${
                  isBlinking || showPassword ? "scale-y-[0.1]" : "scale-y-100"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full bg-white transition-transform duration-75"
                  style={{ transform: `translate(${eyeX}px, ${eyeY}px)` }}
                />
              </div>
            </div>

            {/* Mouth */}
            {getMouth()}

            {/* Cheek blush for success */}
            {loginState === "success" && (
              <>
                <div className="absolute bottom-14 left-5 w-7 h-4 rounded-full bg-pink-400/40 animate-pulse" />
                <div className="absolute bottom-14 right-5 w-7 h-4 rounded-full bg-pink-400/40 animate-pulse" />
              </>
            )}
          </div>

          {/* Antenna */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="w-1.5 h-10 bg-gradient-to-t from-gray-400 to-gray-300 rounded-full" />
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-br ${
                loginState === "success"
                  ? "from-green-400 to-green-500"
                  : loginState === "error"
                  ? "from-red-400 to-red-500"
                  : "from-cyan-400 to-violet-500"
              } -translate-x-1.5 animate-pulse shadow-lg ${
                loginState === "success"
                  ? "shadow-green-400/50"
                  : loginState === "error"
                  ? "shadow-red-400/50"
                  : "shadow-cyan-400/50"
              } transition-all duration-300`}
            />
          </div>

          {/* Side Lights */}
          <div
            className={`absolute top-1/2 -left-3 w-6 h-3 rounded-full bg-gradient-to-r ${
              loginState === "success"
                ? "from-green-500 to-green-400"
                : loginState === "error"
                ? "from-red-500 to-red-400"
                : "from-violet-500 to-violet-400"
            } animate-pulse shadow-lg transition-all duration-300`}
          />
          <div
            className={`absolute top-1/2 -right-3 w-6 h-3 rounded-full bg-gradient-to-l ${
              loginState === "success"
                ? "from-green-500 to-green-400"
                : loginState === "error"
                ? "from-red-500 to-red-400"
                : "from-violet-500 to-violet-400"
            } animate-pulse shadow-lg transition-all duration-300`}
            style={{ animationDelay: "0.5s" }}
          />

          {/* Eyebrows */}
          {loginState === "error" && (
            <>
              <div className="absolute top-11 left-7 w-7 h-1.5 bg-gray-400 rounded-full transform -rotate-12" />
              <div className="absolute top-11 right-7 w-7 h-1.5 bg-gray-400 rounded-full transform rotate-12" />
            </>
          )}
          {loginState === "success" && (
            <>
              <div className="absolute top-11 left-7 w-7 h-1.5 bg-green-400 rounded-full transform rotate-12" />
              <div className="absolute top-11 right-7 w-7 h-1.5 bg-green-400 rounded-full transform -rotate-12" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
