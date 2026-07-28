"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAV_ITEMS } from "./nav-items";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppSidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function AppSidebarNav({ collapsed = false, onNavigate }: AppSidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const isActive = (href: string, matchPrefix?: string) => {
    const prefix = matchPrefix ?? href;
    if (!pathname.startsWith(prefix)) return false;
    // Both "Explore Opportunities" and "Internships" point at /career;
    // disambiguate using the ?tab= query param.
    if (prefix === "/career") {
      const wantsInternships = href.includes("tab=internships");
      return wantsInternships ? activeTab === "internships" : activeTab !== "internships";
    }
    return true;
  };

  return (
    <nav className="flex flex-col gap-1">
      {APP_NAV_ITEMS.map((item) => {
        const active = isActive(item.href, item.matchPrefix);
        const Icon = item.icon;
        const link = (
          <Link
            key={item.href + item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all",
              collapsed && "justify-center px-0",
              active
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );

        if (!collapsed) return link;

        return (
          <Tooltip key={item.href + item.label}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
