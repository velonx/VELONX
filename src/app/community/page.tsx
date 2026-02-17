"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Hash,
  Lock,
  Globe
} from "lucide-react";
import { TrendingPosts } from "@/components/community/TrendingPosts";
import { useDiscussionRooms } from "@/lib/hooks/useDiscussionRooms";
import { useCommunityGroups } from "@/lib/hooks/useCommunityGroups";
import { RoomCardSkeleton } from "@/components/community/RoomCardSkeleton";

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Fetch recent rooms and groups for quick access
  const { rooms, loading: roomsLoading } = useDiscussionRooms({ limit: 3 });
  const { groups, loading: groupsLoading } = useCommunityGroups({ limit: 3 });

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
          <li className="text-foreground font-medium">Community</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 
              className="text-4xl md:text-6xl text-foreground"
              style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}
            >
              Welcome to the Community
            </h1>
            <p 
              className="text-muted-foreground text-xl max-w-2xl mx-auto"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
            >
              Connect with fellow learners, share knowledge, and build meaningful relationships through discussion rooms, groups, and posts.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/community/feed">
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                      <CardTitle className="text-lg">Your Feed</CardTitle>
                      <CardDescription>
                        See posts from people you follow and groups you've joined
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/community/rooms">
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                        <MessageSquare className="w-6 h-6 text-purple-500" />
                      </div>
                      <CardTitle className="text-lg">Discussion Rooms</CardTitle>
                      <CardDescription>
                        Join real-time conversations on topics you care about
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/community/groups">
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-emerald-500" />
                      </div>
                      <CardTitle className="text-lg">Groups</CardTitle>
                      <CardDescription>
                        Create or join groups around shared interests
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>

              {/* Active Discussion Rooms */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Active Discussion Rooms</h2>
                  <Link href="/community/rooms">
                    <Button variant="ghost" className="gap-2">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {roomsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <RoomCardSkeleton key={i} />
                    ))}
                  </div>
                ) : rooms && rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.slice(0, 3).map((room) => (
                      <Link key={room.id} href={`/community/rooms/${room.id}`}>
                        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Hash className="w-5 h-5 text-white" />
                              </div>
                              {room.isPrivate && (
                                <Badge variant="secondary" className="gap-1">
                                  <Lock className="w-3 h-3" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg line-clamp-1">{room.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {room.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{room.memberCount} members</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No active rooms yet. Be the first to create one!</p>
                      <Link href="/community/rooms">
                        <Button className="mt-4">Browse Rooms</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Popular Groups */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Popular Groups</h2>
                  <Link href="/community/groups">
                    <Button variant="ghost" className="gap-2">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {groupsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <RoomCardSkeleton key={i} />
                    ))}
                  </div>
                ) : groups && groups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.slice(0, 3).map((group) => (
                      <Link key={group.id} href={`/community/groups/${group.id}`}>
                        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
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
                            </div>
                            <CardTitle className="text-lg line-clamp-1">{group.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {group.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{group.memberCount} members</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No groups yet. Create one to get started!</p>
                      <Link href="/community/groups">
                        <Button className="mt-4">Browse Groups</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Posts */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">Trending Posts</h3>
                <TrendingPosts limit={5} />
              </div>

              {/* Community Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Be respectful and kind to all members</p>
                  <p>• Share knowledge and help others learn</p>
                  <p>• Keep discussions relevant and constructive</p>
                  <p>• Report inappropriate content to moderators</p>
                  <Link href="/community-guidelines">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Read full guidelines →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
