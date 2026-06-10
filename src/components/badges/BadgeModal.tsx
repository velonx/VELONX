"use client";

import React, { useState } from "react";
import { X, Share2, Twitter, Linkedin, Check, Copy } from "lucide-react";
import BadgeIcon, { BadgeCategory, BadgeRarity } from "./BadgeIcon";

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    id: string;
    userBadgeId: string | null;
    name: string;
    description: string;
    imageUrl: string;
    category: BadgeCategory;
    xpReward: number;
    rarity: BadgeRarity;
    criteria: string;
    earned: boolean;
    earnedAt: string | null;
    progress: {
      current: number;
      target: number;
      percent: number;
    };
  } | null;
}

export default function BadgeModal({ isOpen, onClose, badge }: BadgeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !badge) return null;

  // Formatting date
  const formatUnlockDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  // Generate share URL and text
  const shareUrl = typeof window !== "undefined" && badge.userBadgeId
    ? `${window.location.origin}/share/badge/${badge.userBadgeId}`
    : "";

  const shareText = `Just unlocked the "${badge.name}" badge on Velonx! 🏆 Check out my verified achievement here:`;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  // Capitalize and format text helper
  const formatString = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase().replace(/_/g, " ");
  };

  const getRarityBadgeColor = (rar: BadgeRarity) => {
    switch (rar) {
      case "LEGENDARY": return "bg-pink-500/10 text-pink-400 border-pink-500/30";
      case "EPIC": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "RARE": return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      case "COMMON":
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-zinc-950/80 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl flex flex-col items-center text-center overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Glow Effects inside Modal */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl -z-10" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl -z-10" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Render */}
        <div className="mb-6 mt-4 relative">
          <BadgeIcon 
            name={badge.name} 
            rarity={badge.rarity} 
            category={badge.category} 
            earned={badge.earned} 
            size="xl" 
          />
          {badge.earned && (
            <span className="absolute -bottom-1 right-2 bg-emerald-500 text-white rounded-full p-1 border border-zinc-950 shadow-md">
              <Check className="w-4 h-4 stroke-3" />
            </span>
          )}
        </div>

        {/* Pills */}
        <div className="flex gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRarityBadgeColor(badge.rarity)}`}>
            {badge.rarity}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold border border-zinc-800 bg-zinc-900 text-zinc-300">
            {formatString(badge.category)}
          </span>
        </div>

        {/* Details */}
        <h2 className="text-2xl font-black text-white mb-2">{badge.name}</h2>
        <p className="text-zinc-400 text-sm mb-6 max-w-sm">{badge.description}</p>

        {/* Progress or Achievement Box */}
        {badge.earned ? (
          <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 mb-6">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Date Unlocked</span>
              <span>XP Awarded</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-200">
              <span>{formatUnlockDate(badge.earnedAt)}</span>
              <span className="text-amber-400 font-extrabold">+{badge.xpReward} XP</span>
            </div>
          </div>
        ) : (
          <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 mb-6 text-left">
            <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2">
              <span>Criteria Progress</span>
              <span>{badge.progress.current} / {badge.progress.target}</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${badge.progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Sharing Options (Only if Earned) */}
        {badge.earned && badge.userBadgeId && (
          <div className="w-full border-t border-zinc-900 pt-6 mt-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Share Credential</h4>
            <div className="flex gap-3 justify-center">
              
              {/* Copy URL */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all duration-200 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* Twitter */}
              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 hover:border-zinc-700 transition-all duration-200 cursor-pointer"
                title="Share on X (Twitter)"
              >
                <Twitter className="w-4.5 h-4.5 fill-current" />
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#0a66c2] hover:bg-zinc-850 hover:border-zinc-700 transition-all duration-200 cursor-pointer"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4.5 h-4.5 fill-current" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
