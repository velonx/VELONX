"use client"

import { useEffect, useState } from "react"
import { Shield, Flag, VolumeX, UserX, Pin, PinOff, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ModerationLogData } from "@/lib/types/community.types"

interface ModerationLogsProps {
  roomId?: string
  groupId?: string
  limit?: number
}

/**
 * ModerationLogs Component
 * 
 * Displays an audit log table of moderation actions
 * Shows moderator, action type, target, reason, and timestamp
 * 
 * Requirements: 10.6
 */
export function ModerationLogs({ roomId, groupId, limit = 50 }: ModerationLogsProps) {
  const [logs, setLogs] = useState<ModerationLogData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [roomId, groupId, limit])

  const fetchLogs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (roomId) params.append("roomId", roomId)
      if (groupId) params.append("groupId", groupId)
      params.append("limit", limit.toString())

      const response = await fetch(`/api/community/moderation/logs?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch moderation logs")
      }

      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching moderation logs:", error)
      setError(error instanceof Error ? error.message : "Failed to load logs")
    } finally {
      setIsLoading(false)
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "CONTENT_FLAG":
        return <Flag className="size-4 text-yellow-600" />
      case "USER_MUTE":
        return <VolumeX className="size-4 text-orange-600" />
      case "USER_KICK":
        return <UserX className="size-4 text-red-600" />
      case "POST_PIN":
        return <Pin className="size-4 text-blue-600" />
      case "POST_UNPIN":
        return <PinOff className="size-4 text-gray-600" />
      case "MESSAGE_DELETE":
      case "POST_DELETE":
        return <Trash2 className="size-4 text-red-600" />
      default:
        return <Shield className="size-4 text-gray-600" />
    }
  }

  const getActionLabel = (type: string) => {
    switch (type) {
      case "CONTENT_FLAG":
        return "Content Flagged"
      case "USER_MUTE":
        return "User Muted"
      case "USER_KICK":
        return "User Kicked"
      case "POST_PIN":
        return "Post Pinned"
      case "POST_UNPIN":
        return "Post Unpinned"
      case "MESSAGE_DELETE":
        return "Message Deleted"
      case "POST_DELETE":
        return "Post Deleted"
      default:
        return type
    }
  }

  const getActionVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "CONTENT_FLAG":
        return "outline"
      case "USER_MUTE":
      case "USER_KICK":
      case "MESSAGE_DELETE":
      case "POST_DELETE":
        return "destructive"
      case "POST_PIN":
      case "POST_UNPIN":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground text-sm">Loading moderation logs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <div className="text-destructive text-sm">{error}</div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          Retry
        </Button>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground text-sm">No moderation actions recorded yet.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Moderator</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.type)}
                    <Badge variant={getActionVariant(log.type)} className="whitespace-nowrap">
                      {getActionLabel(log.type)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-muted-foreground text-xs">
                    {log.targetId.slice(0, 8)}...
                  </code>
                </TableCell>
                <TableCell>
                  <code className="text-muted-foreground text-xs">
                    {log.moderatorId.slice(0, 8)}...
                  </code>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm">
                    {log.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {logs.length >= limit && (
        <div className="text-muted-foreground text-center text-sm">
          Showing {limit} most recent actions
        </div>
      )}
    </div>
  )
}
