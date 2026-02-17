"use client"

import { Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ModeratorBadgeProps {
  className?: string
  size?: "sm" | "default"
}

/**
 * ModeratorBadge Component
 * 
 * Displays a badge indicating moderator status
 * Used in user cards, chat messages, and member lists
 */
export function ModeratorBadge({ className, size = "default" }: ModeratorBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        size === "sm" && "text-xs px-1.5 py-0",
        className
      )}
    >
      <Shield className={cn("shrink-0", size === "sm" ? "size-2.5" : "size-3")} />
      <span>Mod</span>
    </Badge>
  )
}
