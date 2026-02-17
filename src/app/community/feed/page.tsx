"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare } from "lucide-react";
import { Feed } from "@/components/community/Feed";
import { FeedFilter } from "@/components/community/FeedFilter";
import { PostComposer } from "@/components/community/PostComposer";
import { TrendingPosts } from "@/components/community/TrendingPosts";
import { useFeed } from "@/lib/hooks/useFeed";
import toast from "react-hot-toast";

export default function FeedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "FOLLOWING" | "GROUPS">("ALL");
  const [showComposer, setShowComposer] = useState(false);

  // Fetch feed with current filter
  const { posts, loading, hasMore, loadMore, refetch } = useFeed({ filter });

  const handlePostCreated = () => {
    setShowComposer(false);
    refetch();
    toast.success("Post created successfully!");
  };

  if (!session) {
    return (
      <div className="min-h-screen pt-24 bg-background">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-bold mb-2">Sign in to view your feed</h3>
              <p className="text-muted-foreground mb-6">
                Create an account to follow users, join groups, and see personalized content.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => router.push("/auth/login")}>
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => router.push("/auth/signup")}>
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <li className="text-foreground font-medium">Feed</li>
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
              Your Feed
            </h1>
            <p 
              className="text-muted-foreground text-xl max-w-2xl mx-auto"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
            >
              Stay updated with posts from people you follow and groups you've joined.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Composer */}
              {!showComposer ? (
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setShowComposer(true)}
                >
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {session.user?.name?.[0] || "U"}
                      </div>
                      <div className="flex-1 px-4 py-2 rounded-full bg-muted text-muted-foreground">
                        What's on your mind?
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <PostComposer 
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowComposer(false)}
                />
              )}

              {/* Feed Filter */}
              <FeedFilter 
                currentFilter={filter}
                onFilterChange={setFilter}
              />

              {/* Feed */}
              <Feed 
                posts={posts}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMore}
                emptyMessage={
                  filter === "FOLLOWING" 
                    ? "Follow users to see their posts here"
                    : filter === "GROUPS"
                    ? "Join groups to see their posts here"
                    : "No posts yet. Start following users or join groups!"
                }
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Posts */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending Posts
                </h3>
                <TrendingPosts limit={5} />
              </div>

              {/* Quick Links */}
              <Card>
                <CardContent className="py-6 space-y-3">
                  <Link href="/community/rooms">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Browse Discussion Rooms
                    </Button>
                  </Link>
                  <Link href="/community/groups">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Users className="w-4 h-4" />
                      Discover Groups
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
