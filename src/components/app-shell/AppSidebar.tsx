"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronsLeft, ChevronsRight, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSidebarNav } from "./AppSidebarNav";
import { useSidebarState } from "./sidebar-context";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebarState();
  const [hovering, setHovering] = useState(false);

  // Pinned-collapsed sidebars auto-expand on hover and snap back on mouse leave.
  // A pinned-open sidebar is unaffected by hover either way.
  const effectiveCollapsed = collapsed && !hovering;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={cn(
          "hidden md:flex flex-col shrink-0 h-full border-r border-border bg-card/60 backdrop-blur-xl transition-[width] duration-200 ease-in-out overflow-hidden",
          effectiveCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AppSidebarNav collapsed={effectiveCollapsed} />
        </div>

        <div className="p-3 border-t border-border">
          {!effectiveCollapsed ? (
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

          <button
            onClick={toggleCollapsed}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
