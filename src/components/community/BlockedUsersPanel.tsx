"use client"

import { useEffect, useState } from "react"
import { Ban, UserX, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"

interface BlockedUser {
  id: string
  name: string
  email: string
  image?: string
  blockedAt: Date
}

/**
 * BlockedUsersPanel Component
 * 
 * Settings page section for managing blocked users
 * Displays list of blocked users with unblock action
 * 
 * Requirements: 10.2, 10.3
 */
export function BlockedUsersPanel() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBlockedUsers()
  }, [])

  const fetchBlockedUsers = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/community/block")

      if (!response.ok) {
        throw new Error("Failed to fetch blocked users")
      }

      const data = await response.json()
      setBlockedUsers(data.blockedUsers || [])
    } catch (error) {
      console.error("Error fetching blocked users:", error)
      toast.error("Failed to load blocked users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnblock = async (userId: string, userName: string) => {
    setUnblockingId(userId)

    try {
      const response = await fetch(`/api/community/block/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to unblock user")
      }

      toast.success(`${userName} has been unblocked`)
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error unblocking user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to unblock user")
    } finally {
      setUnblockingId(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
          <Ban className="size-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Blocked Users</h2>
          <p className="text-muted-foreground text-sm">
            Manage users you've blocked from interacting with you
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <UserX className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">No blocked users</p>
            <p className="text-muted-foreground text-sm">
              You haven't blocked anyone yet
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-sm">
                    Blocked on {formatDate(user.blockedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnblock(user.id, user.name)}
                disabled={unblockingId === user.id}
                className="text-green-600 hover:text-green-700"
              >
                {unblockingId === user.id ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Unblocking...</span>
                  </>
                ) : (
                  <span>Unblock</span>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
