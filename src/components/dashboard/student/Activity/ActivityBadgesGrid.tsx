"use client";

import { useState, useMemo } from "react";
import { Search, Trophy, Sparkles, Award } from "lucide-react";
import BadgeIcon from "@/components/badges/BadgeIcon";

interface ActivityBadgesGridProps {
  badges: any[];
  loadingBadges: boolean;
  onOpenBadge: (badge: any) => void;
}

export default function ActivityBadgesGrid({
  badges,
  loadingBadges,
  onOpenBadge,
}: ActivityBadgesGridProps) {
  const [filter, setFilter] = useState<"ALL" | "EARNED" | "LOCKED">("ALL");
  const [rarityFilter, setRarityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      const matchesSearch =
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filter === "ALL" ? true : filter === "EARNED" ? b.earned : !b.earned;

      const matchesRarity =
        rarityFilter === "ALL" ? true : b.rarity?.toUpperCase() === rarityFilter;

      return matchesSearch && matchesStatus && matchesRarity;
    });
  }, [badges, filter, rarityFilter, searchQuery]);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "ALL"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            All Badges ({badges.length})
          </button>
          <button
            onClick={() => setFilter("EARNED")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "EARNED"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Earned ({earnedCount})
          </button>
          <button
            onClick={() => setFilter("LOCKED")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "LOCKED"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Locked ({badges.length - earnedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border/70 text-xs font-medium focus:ring-2 focus:ring-[#F0771A] outline-none"
          />
        </div>
      </div>

      {/* Badges Grid */}
      {loadingBadges ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-card border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="rounded-3xl bg-muted/20 border border-dashed border-border/80 p-12 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h4 className="text-base font-extrabold text-foreground mb-1">No badges found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredBadges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => onOpenBadge(badge)}
              className={`group flex flex-col items-center justify-between p-4 rounded-2xl border transition-all text-center cursor-pointer ${
                badge.earned
                  ? "bg-card border-border/80 hover:border-[#F0771A] hover:shadow-md"
                  : "bg-muted/20 border-border/40 opacity-70 hover:opacity-100 hover:border-border"
              }`}
            >
              <div className="w-full flex justify-end">
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    badge.rarity === "LEGENDARY"
                      ? "bg-amber-500/10 text-amber-500"
                      : badge.rarity === "EPIC"
                      ? "bg-purple-500/10 text-purple-500"
                      : badge.rarity === "RARE"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {badge.rarity}
                </span>
              </div>

              <div className="my-2">
                <BadgeIcon
                  name={badge.name}
                  rarity={badge.rarity}
                  category={badge.category}
                  earned={badge.earned}
                  size="md"
                />
              </div>

              <div className="w-full">
                <p className="text-xs font-extrabold text-foreground truncate group-hover:text-[#F0771A] transition-colors">
                  {badge.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                  {badge.earned ? "Unlocked" : "Locked"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
