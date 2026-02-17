"use client"

import { useState } from "react"
import { Shield, Users, FileText, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModerationLogs } from "./ModerationLogs"
import { Badge } from "@/components/ui/badge"

interface ModerationPanelProps {
  roomId?: string
  groupId?: string
  isModerator: boolean
}

/**
 * ModerationPanel Component
 * 
 * Dashboard for moderators to view and manage moderation activities
 * Displays logs, statistics, and quick actions
 * Only visible to users with moderator permissions
 * 
 * Requirements: 6.1, 6.2, 10.6
 */
export function ModerationPanel({ roomId, groupId, isModerator }: ModerationPanelProps) {
  const [activeTab, setActiveTab] = useState("logs")

  if (!isModerator) {
    return null
  }

  const contextType = roomId ? "room" : groupId ? "group" : "community"

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Shield className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Moderation Panel</h2>
            <p className="text-muted-foreground text-sm">
              Manage and monitor {contextType} moderation
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Shield className="size-3" />
          Moderator
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="size-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <AlertTriangle className="size-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="size-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Recent Moderation Actions</h3>
            <Button variant="outline" size="sm">
              Export Logs
            </Button>
          </div>
          <ModerationLogs roomId={roomId} groupId={groupId} limit={20} />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="text-muted-foreground text-sm">Flagged Content</div>
              <div className="mt-2 text-2xl font-bold">0</div>
              <div className="text-muted-foreground mt-1 text-xs">Last 7 days</div>
            </Card>
            <Card className="p-4">
              <div className="text-muted-foreground text-sm">Muted Users</div>
              <div className="mt-2 text-2xl font-bold">0</div>
              <div className="text-muted-foreground mt-1 text-xs">Currently active</div>
            </Card>
            <Card className="p-4">
              <div className="text-muted-foreground text-sm">Kicked Members</div>
              <div className="mt-2 text-2xl font-bold">0</div>
              <div className="text-muted-foreground mt-1 text-xs">Last 30 days</div>
            </Card>
            <Card className="p-4">
              <div className="text-muted-foreground text-sm">Total Actions</div>
              <div className="mt-2 text-2xl font-bold">0</div>
              <div className="text-muted-foreground mt-1 text-xs">All time</div>
            </Card>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            Statistics feature coming soon
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Member Management</h3>
            <Button variant="outline" size="sm">
              View All Members
            </Button>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            Member management feature coming soon
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
