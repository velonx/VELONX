"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Users, 
  Lock, 
  Globe, 
  UserPlus, 
  LogOut,
  Settings,
  Shield
} from "lucide-react";
import { RoomChat } from "@/components/community/RoomChat";
import { OnlineMembersList } from "@/components/community/OnlineMembersList";
import { useDiscussionRooms } from "@/lib/hooks/useDiscussionRooms";
import { useRoomMembers } from "@/lib/hooks/useRoomMembers";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RoomDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Fetch room details
  const { rooms, loading, joinRoom, leaveRoom, refetch } = useDiscussionRooms();
  const room = rooms?.find(r => r.id === roomId);

  // Fetch room members
  const { members, onlineMembers, loading: membersLoading } = useRoomMembers(roomId);

  // Check if user is a member
  const isMember = members?.some(m => m.id === session?.user?.id);
  const isModerator = room?.creatorId === session?.user?.id; // Simplified - should check moderators table

  useEffect(() => {
    if (!loading && !room) {
      toast.error("Room not found");
      router.push("/community/rooms");
    }
  }, [room, loading, router]);

  const handleJoinRoom = async () => {
    if (!session) {
      toast.error("Please sign in to join rooms");
      router.push("/auth/login");
      return;
    }

    setIsJoining(true);
    try {
      await joinRoom(roomId);
      toast.success("Joined room successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = async () => {
    setIsLeaving(true);
    try {
      await leaveRoom(roomId);
      toast.success("Left room successfully");
      router.push("/community/rooms");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave room");
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading || !room) {
    return (
      <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading room...</p>
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
            <Link href="/community/rooms" className="hover:text-foreground transition-colors">
              Rooms
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium truncate max-w-[200px]">{room.name}</li>
        </ol>
      </nav>

      {/* Room Header */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{room.name}</h1>
                <Badge variant={room.isPrivate ? "secondary" : "default"} className="gap-1">
                  {room.isPrivate ? (
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
                    Moderator
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{room.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{room.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{onlineMembers?.length || 0} online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isMember ? (
                <Button 
                  onClick={handleJoinRoom}
                  disabled={isJoining}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isJoining ? "Joining..." : "Join Room"}
                </Button>
              ) : (
                <>
                  {isModerator && (
                    <Button variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={handleLeaveRoom}
                    disabled={isLeaving}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLeaving ? "Leaving..." : "Leave Room"}
                  </Button>
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Area */}
              <div className="lg:col-span-3">
                <RoomChat roomId={roomId} />
              </div>

              {/* Sidebar - Members */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="online" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="online">
                          Online ({onlineMembers?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="all">
                          All ({members?.length || 0})
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="online" className="mt-4">
                        <OnlineMembersList 
                          members={onlineMembers || []}
                          loading={membersLoading}
                        />
                      </TabsContent>
                      <TabsContent value="all" className="mt-4">
                        <OnlineMembersList 
                          members={members || []}
                          loading={membersLoading}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">Join to participate</h3>
                <p className="text-muted-foreground mb-6">
                  You need to join this room to view messages and participate in discussions.
                </p>
                <Button onClick={handleJoinRoom} disabled={isJoining} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {isJoining ? "Joining..." : "Join Room"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
