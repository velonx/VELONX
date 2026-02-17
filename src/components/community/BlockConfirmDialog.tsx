"use client"

import { useState } from "react"
import { Ban, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface BlockConfirmDialogProps {
  userId: string
  userName: string
  onBlocked?: () => void
  trigger?: React.ReactNode
}

/**
 * BlockConfirmDialog Component
 * 
 * Confirmation dialog for blocking a user
 * Explains the consequences of blocking
 * 
 * Requirements: 10.2
 */
export function BlockConfirmDialog({
  userId,
  userName,
  onBlocked,
  trigger,
}: BlockConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleBlock = async () => {
    setIsLoading(true)

    try {
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
      setOpen(false)
      onBlocked?.()
    } catch (error) {
      console.error("Error blocking user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to block user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            <Ban className="size-4" />
            <span>Block User</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle>Block {userName}?</DialogTitle>
              <DialogDescription>
                This action will prevent interactions with this user
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm">When you block {userName}:</p>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>They won't be able to see your posts or profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>They won't be able to send you messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Their content won't appear in your feed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>You can unblock them at any time from your settings</span>
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBlock}
            disabled={isLoading}
          >
            {isLoading ? "Blocking..." : "Block User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
