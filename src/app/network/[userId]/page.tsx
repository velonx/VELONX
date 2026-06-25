"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, GraduationCap, Calendar, ExternalLink, MessageSquare,
  UserPlus, UserCheck, UserX, Users, Trophy, Star, ArrowLeft,
  Linkedin, Github, Twitter, Globe, Clock,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

interface ProfileData {
  id: string;
  name: string | null;
  image: string | null;
  coverImage: string | null;
  bio: string | null;
  headline: string | null;
  college: string | null;
  graduationYear: number | null;
  skills: string[];
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  portfolioUrl: string | null;
  xp: number;
  level: number;
  createdAt: string;
  slug?: string | null;
  _count: {
    communityPosts: number;
    projectsOwned: number;
    badges: number;
    followers: number;
    following: number;
  };
  connectionStatus: {
    status: "none" | "pending_sent" | "pending_received" | "connected" | "self";
    connectionId?: string;
  };
  mutualConnections: {
    count: number;
    users: { id: string; name: string | null; image: string | null }[];
  };
  connectionCount: number;
  recentBadges: {
    name: string;
    description: string;
    imageUrl: string;
    rarity: string;
    category: string;
    earnedAt: string;
  }[];
  projects?: {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    status: string;
    imageUrl: string | null;
  }[];
  isOwnProfile: boolean;
}

const rarityColors: Record<string, string> = {
  COMMON: "from-slate-400 to-slate-500",
  RARE: "from-blue-400 to-blue-600",
  EPIC: "from-purple-400 to-purple-600",
  LEGENDARY: "from-amber-400 to-orange-500",
};

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "loading") return;

    async function fetchProfile() {
      try {
        const res = await secureFetch(`/api/users/${userId}`);
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          // URL rewrite to slug for SEO optimization
          if (data.data.slug && userId !== data.data.slug) {
            window.history.replaceState({}, "", `/network/${data.data.slug}`);
          }
        } else {
          toast.error("User not found");
          router.push("/network");
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId, authStatus, router]);

  const handleConnect = async () => {
    if (!profile) return;
    if (authStatus !== "authenticated") {
      toast.error("Please sign in to connect with other users");
      router.push("/auth/login");
      return;
    }
    setActionLoading(true);
    try {
      const res = await secureFetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profile.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Connection request sent!");
        setProfile((p) =>
          p ? { ...p, connectionStatus: { status: "pending_sent", connectionId: data.data.id } } : p
        );
      } else {
        toast.error(data.error?.message || "Failed");
      }
    } catch {
      toast.error("Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!profile?.connectionStatus.connectionId) return;
    if (authStatus !== "authenticated") {
      toast.error("Please sign in to accept connection requests");
      router.push("/auth/login");
      return;
    }
    setActionLoading(true);
    try {
      const res = await secureFetch(`/api/connections/${profile.connectionStatus.connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Connection accepted!");
        setProfile((p) =>
          p ? { ...p, connectionStatus: { ...p.connectionStatus, status: "connected" } } : p
        );
      }
    } catch {
      toast.error("Failed to accept");
    } finally {
      setActionLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-28">
        <div className="max-w-4xl mx-auto px-4">
          {/* Skeleton */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse">
            <div className="h-32 bg-linear-to-r from-muted to-muted/50" />
            <div className="px-6 pb-6">
              <div className="flex items-end -mt-10 gap-4">
                <div className="w-24 h-24 rounded-full bg-muted border-4 border-card" />
                <div className="flex-1 space-y-2 pb-2">
                  <div className="h-6 bg-muted rounded w-48" />
                  <div className="h-4 bg-muted rounded w-72" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="h-20 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const connStatus = profile.connectionStatus.status;

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-32 sm:h-40 relative w-full overflow-hidden">
            {profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-r from-primary/80 via-primary/50 to-primary/30 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-5 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-14 gap-4">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-card shadow-lg">
                <AvatarImage src={profile.image || ""} />
                <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white text-3xl font-black">
                  {profile.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {profile.name || "User"}
                </h1>
                {profile.headline && (
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base">{profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.location}
                    </span>
                  )}
                  {profile.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {profile.college}
                      {profile.graduationYear && ` '${String(profile.graduationYear).slice(-2)}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {profile.connectionCount} connection{profile.connectionCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-5">
              {connStatus === "none" && (
                <Button
                  onClick={handleConnect}
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )}
              {connStatus === "pending_sent" && (
                <Button
                  variant="outline"
                  disabled
                  className="rounded-xl font-bold border-amber-200 text-amber-600"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Request Sent
                </Button>
              )}
              {connStatus === "pending_received" && (
                <Button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Accept Request
                </Button>
              )}
              {connStatus === "connected" && (
                <Link href={`/messages/${profile.id}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </Link>
              )}
              {profile.isOwnProfile && (
                <Link href="/settings">
                  <Button variant="outline" className="rounded-xl font-bold">
                    Edit Profile
                  </Button>
                </Link>
              )}

              {/* Social Links */}
              <div className="flex gap-1 ml-auto">
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl text-muted-foreground hover:text-[#0077B5] hover:bg-[#0077B5]/10 transition-all">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {profile.twitterUrl && (
                  <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl text-muted-foreground hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Mutual Connections */}
            {!profile.isOwnProfile && profile.mutualConnections.count > 0 && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {profile.mutualConnections.users.slice(0, 3).map((u) => (
                    <Avatar key={u.id} className="w-6 h-6 border-2 border-card">
                      <AvatarImage src={u.image || ""} />
                      <AvatarFallback className="bg-muted text-[8px] font-bold">
                        {u.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span>
                  {profile.mutualConnections.count} mutual connection{profile.mutualConnections.count !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* About */}
            {profile.bio && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-lg font-black text-foreground mb-3">About</h2>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-lg font-black text-foreground mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="text-xs font-bold bg-primary/5 text-primary border-primary/15 hover:bg-primary/10 px-3 py-1.5 rounded-xl"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-lg font-black text-foreground mb-4">Projects</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.projects.map((project: any) => (
                    <div
                      key={project.id}
                      className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all"
                    >
                      <div>
                        {project.imageUrl && (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-32 object-cover rounded-lg mb-3 border border-border/50"
                          />
                        )}
                        <h3 className="font-bold text-foreground text-sm line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1">
                        {project.techStack?.slice(0, 3).map((tech: string) => (
                          <Badge
                            key={tech}
                            className="text-[9px] font-semibold bg-primary/5 text-primary border-primary/10 px-2 py-0.5 rounded-lg"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {profile.recentBadges.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-lg font-black text-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Badges ({profile._count.badges})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.recentBadges.map((badge) => (
                    <div
                      key={badge.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-linear-to-br ${
                          rarityColors[badge.rarity] || rarityColors.COMMON
                        } flex items-center justify-center text-white shadow-sm`}
                      >
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{badge.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{badge.rarity.toLowerCase()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Stats */}
          <div className="space-y-4">
            {/* Stats Card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-lg font-black text-foreground mb-3">Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="font-black text-foreground">{profile.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">XP</span>
                  <span className="font-black text-primary">{profile.xp.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <span className="font-black text-foreground">{profile._count.projectsOwned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posts</span>
                  <span className="font-black text-foreground">{profile._count.communityPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <span className="font-black text-foreground">{profile._count.followers}</span>
                </div>
              </div>
            </div>

            {/* Education */}
            {profile.college && (
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-lg font-black text-foreground mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education
                </h2>
                <p className="font-bold text-foreground">{profile.college}</p>
                {profile.graduationYear && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Class of {profile.graduationYear}
                  </p>
                )}
              </div>
            )}

            {/* Member Since */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-xs text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
