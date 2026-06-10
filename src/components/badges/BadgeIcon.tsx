"use client";

import React from "react";
import { 
  FolderOpen, 
  Calendar, 
  Users, 
  Flame, 
  MessageSquare, 
  BookOpen, 
  Briefcase, 
  Share2, 
  Award,
  Lock
} from "lucide-react";

export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type BadgeCategory = 
  | "PROJECT" 
  | "EVENT" 
  | "MENTOR" 
  | "STREAK" 
  | "COMMUNITY" 
  | "BLOG" 
  | "CAREER" 
  | "REFERRAL" 
  | "MILESTONE";

interface BadgeIconProps {
  name: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  earned: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function BadgeIcon({
  name,
  rarity,
  category,
  earned,
  size = "md",
  className = ""
}: BadgeIconProps) {
  // Size dimensions map
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28",
    xl: "w-40 h-40"
  };

  const iconSizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-16 h-16"
  };

  // Select category icon
  const getCategoryIcon = (cat: BadgeCategory, sizeClass: string) => {
    switch (cat) {
      case "PROJECT":
        return <FolderOpen className={sizeClass} />;
      case "EVENT":
        return <Calendar className={sizeClass} />;
      case "MENTOR":
        return <Users className={sizeClass} />;
      case "STREAK":
        return <Flame className={sizeClass} />;
      case "COMMUNITY":
        return <MessageSquare className={sizeClass} />;
      case "BLOG":
        return <BookOpen className={sizeClass} />;
      case "CAREER":
        return <Briefcase className={sizeClass} />;
      case "REFERRAL":
        return <Share2 className={sizeClass} />;
      case "MILESTONE":
      default:
        return <Award className={sizeClass} />;
    }
  };

  // Style configs based on Rarity
  const getRarityConfig = (rar: BadgeRarity, isEarned: boolean) => {
    if (!isEarned) {
      return {
        bgGradient: "from-muted/40 to-muted/10",
        borderColor: "border-muted-foreground/20",
        shadow: "",
        badgeClass: "text-muted-foreground opacity-60",
        glowColor: "rgba(120, 120, 120, 0.1)",
        polygonPoints: "50,5 95,25 95,75 50,95 5,75 5,25" // Hexagon
      };
    }

    switch (rar) {
      case "LEGENDARY":
        return {
          bgGradient: "from-pink-500 via-purple-600 to-indigo-600 animate-legendary-gradient",
          borderColor: "border-pink-300",
          shadow: "shadow-[0_0_25px_rgba(236,72,153,0.5)]",
          badgeClass: "text-white",
          glowColor: "rgba(236, 72, 153, 0.45)",
          polygonPoints: "50,3 97,38 79,92 21,92 3,38" // Pentagram / Star Shield
        };
      case "EPIC":
        return {
          bgGradient: "from-amber-400 via-orange-500 to-red-600",
          borderColor: "border-amber-300",
          shadow: "shadow-[0_0_15px_rgba(245,158,11,0.4)]",
          badgeClass: "text-white",
          glowColor: "rgba(245, 158, 11, 0.2)",
          polygonPoints: "50,3 92,20 92,80 50,97 8,80 8,20" // Shield/Hexagon
        };
      case "RARE":
        return {
          bgGradient: "from-teal-400 to-indigo-600",
          borderColor: "border-teal-300",
          shadow: "shadow-[0_0_12px_rgba(45,212,191,0.3)]",
          badgeClass: "text-white",
          glowColor: "rgba(45, 212, 191, 0.15)",
          polygonPoints: "50,5 95,50 50,95 5,50" // Diamond
        };
      case "COMMON":
      default:
        return {
          bgGradient: "from-blue-500 to-slate-700",
          borderColor: "border-blue-300",
          shadow: "shadow-md",
          badgeClass: "text-white",
          glowColor: "rgba(59, 130, 246, 0.1)",
          polygonPoints: "50,5 90,15 90,85 50,95 10,85 10,15" // Classic Shield
        };
    }
  };

  const config = getRarityConfig(rarity, earned);

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
      {/* Local keyframe animations for high-fidelity glowing and floating effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes legendary-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes legendary-glow {
          0%, 100% { transform: scale(0.9); opacity: 0.55; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes badge-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        .animate-legendary-glow {
          animation: legendary-glow 4s ease-in-out infinite;
        }
        .animate-legendary-gradient {
          background-size: 200% 200%;
          animation: legendary-gradient 8s ease infinite;
        }
        .animate-badge-hover:hover {
          animation: badge-float 3.5s ease-in-out infinite;
        }
      `}} />

      {/* Outer Glow Ring */}
      {earned && (
        <div 
          className={`absolute inset-0 rounded-full blur-xl opacity-60 transition-all duration-500 scale-90 ${
            rarity === "LEGENDARY" ? "animate-legendary-glow" : ""
          }`}
          style={{ 
            background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)` 
          }}
        />
      )}

      {/* SVG Badge Shape */}
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full drop-shadow-xl transition-all duration-300 ${
          earned ? "hover:scale-110 cursor-pointer animate-badge-hover" : "filter grayscale"
        }`}
      >
        <defs>
          <linearGradient id={`grad-${name.replace(/\s+/g, "-")}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={`stop-${rarity.toLowerCase()}-start`} style={{ stopColor: rarity === "LEGENDARY" ? "#ec4899" : rarity === "EPIC" ? "#fbbf24" : rarity === "RARE" ? "#2dd4bf" : "#3b82f6" }} />
            <stop offset="50%" className={`stop-${rarity.toLowerCase()}-mid`} style={{ stopColor: rarity === "LEGENDARY" ? "#8b5cf6" : rarity === "EPIC" ? "#f97316" : rarity === "RARE" ? "#6366f1" : "#475569" }} />
            <stop offset="100%" className={`stop-${rarity.toLowerCase()}-end`} style={{ stopColor: rarity === "LEGENDARY" ? "#4f46e5" : rarity === "EPIC" ? "#dc2626" : rarity === "RARE" ? "#4f46e5" : "#1e293b" }} />
          </linearGradient>
          
          <filter id="inner-shadow">
            <feOffset dx="0" dy="3"/>
            <feGaussianBlur stdDeviation="3" result="offset-blur"/>
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
            <feFlood floodColor="black" floodOpacity="0.6" result="color"/>
            <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
            <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
          </filter>
        </defs>

        {/* Outer Border Layer */}
        <polygon
          points={config.polygonPoints}
          fill="none"
          stroke={earned ? "currentColor" : "rgba(156, 163, 175, 0.3)"}
          strokeWidth="3.5"
          className={config.badgeClass}
        />

        {/* Inner Colored/Gradient Body */}
        <polygon
          points={config.polygonPoints}
          fill={`url(#grad-${name.replace(/\s+/g, "-")})`}
          filter="url(#inner-shadow)"
          className="scale-[0.9] origin-center"
        />

        {/* Inner Border Accent */}
        {earned && (
          <polygon
            points={config.polygonPoints}
            fill="none"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.25"
            className="scale-[0.85] origin-center"
          />
        )}
      </svg>

      {/* Centered Icon Overlay */}
      <div className={`absolute flex items-center justify-center ${config.badgeClass}`}>
        {!earned ? (
          <Lock className="w-5 h-5 text-muted-foreground/80" />
        ) : (
          getCategoryIcon(category, iconSizeMap[size])
        )}
      </div>
    </div>
  );
}
