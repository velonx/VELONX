"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Lock, 
  Globe, 
  UserPlus, 
  LogOut,
  Settings,
  Shield,
  Clock,
  FileText
} from "lucide-react";
import { GroupFeed } from "@/components/community/GroupFeed";
import { GroupMembers } from "@/components/community/GroupMembers";
import { GroupSettings } from "@/components/community/GroupSettings";
import { JoinRequestList } from "@/components/community/JoinRequestList";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";
import { useGroupMembers } from "@/lib/hooks/useGroupMembers";
import toast from "react-hot-toast";

export default function GroupDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  // Fetch group details
  const { groups, loading, joinGroup, requestJoinGroup, leaveGroup, refetch } = useCommunityGroups();
  const group = groups?.find(g => g.id === groupId);

  // Fetch group members
  const { members, loading: membersLoading } = useGroupMembers(groupId);

  // Check if user is a member or owner
  const isMember = members?.some(m => m.id === session?.user?.id);
  const isOwner = group?.ownerId === session?.user?.id;
  const isModerator = isOwner; // Simplified - should check moderators table

  useEffect(() => {
    if (!loading && !group) {
      toast.error("Group not found");
      router.push("/community/groups");
    }
  }, [group, loading, router]);

  const handleJoinGroup = async () => {
    if (!session) {
      toast.error("Please sign in to join groups");
      router.push("/auth/login");
      return;
    }

    setIsJoining(true);
    try {
      if (group?.isPrivate) {
        await requestJoinGroup(groupId);
        toast.success("Join request sent! The group owner will review it.");
      } else {
        await joinGroup(groupId);
        toast.success("Joined group successfully!");
      }
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      await leaveGroup(groupId);
      toast.success("Left group successfully");
      router.push("/community/groups");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave group");
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading || !group) {
    return (
      <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading group...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-background">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/community" className="hover:text-foreground transition-colors">
              Community
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/community/groups" className="hover:text-foreground transition-colors">
              Groups
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium truncate max-w-[200px]">{group.name}</li>
        </ol>
      </nav>

      {/* Group Header */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                <Badge variant={group.isPrivate ? "secondary" : "default"} className="gap-1">
                  {group.isPrivate ? (
                    <>
                      <Lock className="w-3 h-3" />
                      Private
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3" />
                      Public
                    </>
                  )}
                </Badge>
                {isModerator && (
                  <Badge variant="outline" className="gap-1">
                    <Shield className="w-3 h-3" />
                    {isOwner ? "Owner" : "Moderator"}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{group.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{group.postCount} posts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isMember ? (
                <Button 
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isJoining ? "Joining..." : group.isPrivate ? "Request to Join" : "Join Group"}
                </Button>
              ) : (
                <>
                  {!isOwner && (
                    <Button 
                      variant="outline"
                      onClick={handleLeaveGroup}
                      disabled={isLeaving}
                      className="gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLeaving ? "Leaving..." : "Leave Group"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {isMember ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
                <TabsTrigger value="feed" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Feed
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="w-4 h-4" />
                  Members
                </TabsTrigger>
                {isModerator && (
                  <>
                    <TabsTrigger value="requests" className="gap-2">
                      <Clock className="w-4 h-4" />
                      Requests
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="feed">
                <GroupFeed groupId={groupId} />
              </TabsContent>

              <TabsContent value="members">
                <GroupMembers 
                  groupId={groupId}
                  members={members || []}
                  loading={membersLoading}
                  isModerator={isModerator}
                />
              </TabsContent>

              {isModerator && (
                <>
                  <TabsContent value="requests">
                    <JoinRequestList groupId={groupId} />
                  </TabsContent>

                  <TabsContent value="settings">
                    <GroupSettings 
                      group={group}
                      onUpdate={() => refetch()}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">
                  {group.isPrivate ? "Private Group" : "Join to participate"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {group.isPrivate 
                    ? "This is a private group. Request to join to view posts and participate."
                    : "Join this group to view posts and participate in discussions."
                  }
                </p>
                <Button onClick={handleJoinGroup} disabled={isJoining} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {isJoining ? "Joining..." : group.isPrivate ? "Request to Join" : "Join Group"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
