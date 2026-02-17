"use client"

import { useState } from "react"
import { Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface BlockUserButtonProps {
  userId: string
  userName: string
  isBlocked: boolean
  onBlockChange?: (blocked: boolean) => void
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
}

/**
 * BlockUserButton Component
 * 
 * Button to block or unblock a user
 * Shows confirmation dialog before blocking
 * 
 * Requirements: 10.2, 10.3
 */
export function BlockUserButton({
  userId,
  userName,
  isBlocked,
  onBlockChange,
  variant = "ghost",
  size = "sm",
}: BlockUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [blocked, setBlocked] = useState(isBlocked)

  const handleToggleBlock = async () => {
    setIsLoading(true)

    try {
      if (blocked) {
        // Unblock user
        const response = await fetch(`/api/community/block/${userId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to unblock user")
        }

        toast.success(`${userName} has been unblocked`)
        setBlocked(false)
        onBlockChange?.(false)
      } else {
        // Block user
        const response = await fetch("/api/community/block", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to block user")
        }

        toast.success(`${userName} has been blocked`)
        setBlocked(true)
        onBlockChange?.(true)
      }
    } catch (error) {
      console.error("Error toggling block:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update block status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={blocked ? "outline" : variant}
      size={size}
      onClick={handleToggleBlock}
      disabled={isLoading}
      className={blocked ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
    >
      {blocked ? (
        <>
          <CheckCircle className="size-4" />
          <span>Unblock</span>
        </>
      ) : (
        <>
          <Ban className="size-4" />
          <span>Block</span>
        </>
      )}
    </Button>
  )
}
