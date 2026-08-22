"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Calendar,
  Trophy,
  Award,
  ShoppingBag,
} from "lucide-react";
import ActivityProjectsList from "./ActivityProjectsList";
import ActivitySessionsList from "./ActivitySessionsList";
import ActivityEventsList from "./ActivityEventsList";
import ActivityBadgesGrid from "./ActivityBadgesGrid";
import SwagOrdersList from "@/components/dashboard/student/SwagOrdersList";

interface ActivityTabProps {
  userId: string;
  initialCategory?: string;
  projects: any[];
  mentorSessions: any[];
  loadingSessions: boolean;
  badges: any[];
  loadingBadges: boolean;
  onEditProject?: (project: any) => void;
  onReviewSession: (sessionId: string) => void;
  onCancelSession?: (sessionId: string) => void;
  onOpenBadge: (badge: any) => void;
}

export default function ActivityTab({
  userId,
  initialCategory = "projects",
  projects,
  mentorSessions,
  loadingSessions,
  badges,
  loadingBadges,
  onEditProject,
  onReviewSession,
  onCancelSession,
  onOpenBadge,
}: ActivityTabProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories = [
    { id: "projects", label: "My Projects", icon: FolderOpen, count: projects.length },
    { id: "sessions", label: "Mentor Sessions", icon: Calendar, count: mentorSessions.length },
    { id: "events", label: "Events & Hackathons", icon: Trophy },
    { id: "badges", label: "Badges & Credentials", icon: Award, count: badges.filter((b) => b.earned).length },
    { id: "orders", label: "Swag Redemptions", icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      {/* Category Selection Bar (Unstop Sub-Navigation) */}
      <div className="border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                    : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Category Content Area */}
      <div>
        {activeCategory === "projects" && (
          <ActivityProjectsList
            projects={projects}
            currentUserId={userId}
            onEditProject={onEditProject}
          />
        )}

        {activeCategory === "sessions" && (
          <ActivitySessionsList
            userId={userId}
            mentorSessions={mentorSessions}
            loadingSessions={loadingSessions}
            onReviewSession={onReviewSession}
            onCancelSession={onCancelSession}
          />
        )}

        {activeCategory === "events" && <ActivityEventsList userId={userId} />}

        {activeCategory === "badges" && (
          <ActivityBadgesGrid
            badges={badges}
            loadingBadges={loadingBadges}
            onOpenBadge={onOpenBadge}
          />
        )}

        {activeCategory === "orders" && (
          <div className="bg-card border border-border/70 rounded-3xl p-6 shadow-xs">
            <SwagOrdersList />
          </div>
        )}
      </div>
    </div>
  );
}
