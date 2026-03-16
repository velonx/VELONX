"use client";

import { Card } from "@/components/ui/card";

interface UserStats {
  projectsOwned?: number;
  eventsAttended?: number;
  projectsMember?: number;
}

interface QuickActionsProps {
  userStats: UserStats;
}

export default function QuickActions({ userStats }: QuickActionsProps) {
  return (
    <section>
      <h3 className="text-xl md:text-2xl font-black text-foreground mb-6 md:mb-8">Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-50 shadow-sm text-center">
          <p className="text-3xl font-black text-foreground mb-2">{userStats?.projectsOwned || 0}</p>
          <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-widest">Projects Owned</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-black text-foreground mb-2">{userStats?.eventsAttended || 0}</p>
          <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-widest">Events Attended</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-black text-foreground mb-2">{userStats?.projectsMember || 0}</p>
          <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-widest">Projects Joined</p>
        </div>
      </div>
    </section>
  );
}
