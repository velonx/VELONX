"use client"

import { useState } from "react"
import { VolumeX } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import toast from "react-hot-toast"

interface MuteUserDialogProps {
  userId: string
  userName: string
  roomId?: string
  groupId?: string
  onMuted?: () => void
  trigger?: React.ReactNode
}

const MUTE_DURATIONS = [
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "6 hours", value: 360 },
  { label: "12 hours", value: 720 },
  { label: "24 hours", value: 1440 },
  { label: "7 days", value: 10080 },
]

/**
 * MuteUserDialog Component
 * 
 * Dialog for moderators to mute users in rooms or groups
 * Allows specifying duration and reason for the mute
 * 
 * Requirements: 6.5
 */
export function MuteUserDialog({
  userId,
  userName,
  roomId,
  groupId,
  onMuted,
  trigger,
}: MuteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState<number>(30)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleMute = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/community/moderation/mute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          roomId,
          groupId,
          duration,
          reason: reason.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to mute user")
      }

      toast.success(`${userName} has been muted for ${MUTE_DURATIONS.find(d => d.value === duration)?.label || `${duration} minutes`}.`)

      setOpen(false)
      setReason("")
      setDuration(30)
      onMuted?.()
    } catch (error) {
      console.error("Error muting user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to mute user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <VolumeX className="size-4" />
            <span>Mute</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mute User</DialogTitle>
          <DialogDescription>
            Mute {userName} to prevent them from sending messages in this {roomId ? "room" : "group"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger id="duration" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {MUTE_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this user is being muted..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-20"
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
            onClick={handleMute}
            disabled={isLoading}
          >
            {isLoading ? "Muting..." : "Mute User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
