"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

interface FlagContentDialogProps {
  contentId: string
  contentType: "POST" | "MESSAGE"
  onFlagged?: () => void
  trigger?: React.ReactNode
}

/**
 * FlagContentDialog Component
 * 
 * Dialog for moderators to flag inappropriate content
 * Allows specifying a reason for the flag
 * 
 * Requirements: 6.1
 */
export function FlagContentDialog({
  contentId,
  contentType,
  onFlagged,
  trigger,
}: FlagContentDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFlag = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for flagging this content.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/community/moderation/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          contentType,
          reason: reason.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to flag content")
      }

      toast.success("Content flagged successfully. The author has been notified.")

      setOpen(false)
      setReason("")
      onFlagged?.()
    } catch (error) {
      console.error("Error flagging content:", error)
      toast.error(error instanceof Error ? error.message : "Failed to flag content")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Flag className="size-4" />
            <span>Flag</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag Content</DialogTitle>
          <DialogDescription>
            Flag this {contentType.toLowerCase()} as inappropriate. The author will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for flagging</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this content is inappropriate..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-24"
              disabled={isLoading}
            />
          </div>
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
            onClick={handleFlag}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Flagging..." : "Flag Content"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
