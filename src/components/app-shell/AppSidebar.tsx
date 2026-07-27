"use client";

import Link from "next/link";
import { useState } from "react";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSidebarNav } from "./AppSidebarNav";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppSidebar() {
  const [hovering, setHovering] = useState(false);
  const collapsed = !hovering;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={cn(
          "hidden md:flex flex-col shrink-0 h-full border-r border-border bg-card/60 backdrop-blur-xl transition-[width] duration-200 ease-in-out overflow-hidden",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AppSidebarNav collapsed={collapsed} />
        </div>

        <div className="p-3 border-t border-border">
          {!collapsed ? (
            <Link
              href="/referrals"
              className="block rounded-2xl bg-accent/10 border border-accent/20 p-4 hover:bg-accent/15 transition-colors"
            >
              <Gift className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-bold text-foreground">Invite Friends &amp; Earn</p>
              <p className="text-xs text-muted-foreground mt-1">
                Track your referrals and earn XP rewards by inviting others to join VELONX.
              </p>
            </Link>
          ) : (
            <Link
              href="/referrals"
              className="flex items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 p-3 hover:bg-accent/15 transition-colors"
              aria-label="Invite Friends & Earn"
            >
              <Gift className="w-5 h-5 text-accent" />
            </Link>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
