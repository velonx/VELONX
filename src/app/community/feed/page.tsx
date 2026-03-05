"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { secureFetch } from "@/lib/utils/csrf";
import { TrendingUp, Users, ImageIcon, LinkIcon, XIcon, Loader2Icon } from "lucide-react";
import { Feed } from "@/components/community/Feed";
import { FeedFilter } from "@/components/community/FeedFilter";
import { TrendingPosts } from "@/components/community/TrendingPosts";
import { useFeed } from "@/lib/hooks/useFeed";
import { useCommunityPosts } from "@/lib/hooks/useCommunityPosts";
import toast from "react-hot-toast";

export default function FeedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "FOLLOWING" | "GROUPS">("ALL");

  // Composer state
  const [showComposer, setShowComposer] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [linkUrls, setLinkUrls] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;
  const MAX_LINKS = 3;

  const { createPost, isCreating } = useCommunityPosts();
  const { refetch } = useFeed();

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      await createPost({
        content: postContent.trim(),
        visibility: 'PUBLIC',
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        linkUrls: linkUrls.length > 0 ? linkUrls : undefined,
      });
      setPostContent("");
      setImageUrls([]);
      setLinkUrls([]);
      setLinkInput("");
      setShowLinkInput(false);
      setShowComposer(false);
      toast.success("Post created successfully!");
      refetch();
    } catch (error) {
      // Error handled by hook
    }
  };

  const openComposer = () => {
    setShowComposer(true);
    setTimeout(() => composerRef.current?.focus(), 100);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setPostContent("");
    setImageUrls([]);
    setLinkUrls([]);
    setLinkInput("");
    setShowLinkInput(false);
  };

  // Image upload handler (same as PostComposer)
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} is too large (max 5MB)`);
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(uploadPromises);
      const uploadedUrls: string[] = [];
      for (const base64 of base64Images) {
        const response = await secureFetch('/api/user/profile/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder: 'community-posts' }),
        });
        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      setImageUrls(prev => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [imageUrls.length]);

  const addLink = useCallback(() => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    if (linkUrls.length >= MAX_LINKS) { toast.error(`Max ${MAX_LINKS} links`); return; }
    try {
      new URL(trimmed);
      setLinkUrls(prev => [...prev, trimmed]);
      setLinkInput("");
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
    }
  }, [linkInput, linkUrls.length]);

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
                <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
                <Button variant="outline" onClick={() => router.push("/auth/signup")}>Create Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-28 bg-background">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link href="/community" className="hover:text-foreground transition-colors">Community</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium">Feed</li>
        </ol>
      </nav>



      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <FeedFilter currentFilter={filter} onFilterChange={setFilter} />
              <Feed filter={filter} currentUserId={session.user?.id} />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Trending Posts
                </h3>
                <TrendingPosts limit={5} />
              </div>
              <Card>
                <CardContent className="py-6 space-y-3">
                  <Link href="/community/groups">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Users className="w-4 h-4" /> Browse Groups
                    </Button>
                  </Link>
                  <Link href="/community/search">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Users className="w-4 h-4" /> Search Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        disabled={isCreating || imageUrls.length >= MAX_IMAGES}
      />

      {/* Sticky Bottom Composer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          {showComposer ? (
            <div className="space-y-3">
              {/* Textarea */}
              <textarea
                ref={composerRef}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full px-4 py-3 text-sm border border-border/50 bg-muted/20 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-all"
                disabled={isCreating}
              />

              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group size-16 rounded-lg overflow-hidden border border-border/50">
                      <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="size-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Link Previews */}
              {linkUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {linkUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full text-xs border border-border/30">
                      <LinkIcon className="size-3 text-muted-foreground" />
                      <span className="truncate max-w-[200px] text-primary">{url}</span>
                      <button onClick={() => setLinkUrls(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-destructive">
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Link Input (toggled) */}
              {showLinkInput && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 text-sm border border-border/50 rounded-full bg-muted/20 focus:outline-none focus:ring-1 focus:ring-ring"
                    autoFocus
                  />
                  <Button type="button" variant="outline" size="sm" className="rounded-full px-3 text-xs" onClick={addLink} disabled={!linkInput.trim()}>
                    Add
                  </Button>
                </div>
              )}

              {/* Action bar: image + link buttons + cancel/post */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Image upload button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCreating || isUploadingImage || imageUrls.length >= MAX_IMAGES}
                  >
                    {isUploadingImage ? <Loader2Icon className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
                    <span className="text-xs hidden sm:inline">
                      {imageUrls.length > 0 ? `${imageUrls.length}/${MAX_IMAGES}` : "Image"}
                    </span>
                  </Button>

                  {/* Link button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2.5 rounded-full"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    disabled={linkUrls.length >= MAX_LINKS}
                  >
                    <LinkIcon className="size-4" />
                    <span className="text-xs hidden sm:inline">
                      {linkUrls.length > 0 ? `${linkUrls.length}/${MAX_LINKS}` : "Link"}
                    </span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground rounded-full text-xs"
                    onClick={closeComposer}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full px-5 font-semibold"
                    disabled={!postContent.trim() || isCreating || isUploadingImage}
                    onClick={handleCreatePost}
                  >
                    {isCreating ? (
                      <><Loader2Icon className="size-3.5 animate-spin mr-1" /> Posting...</>
                    ) : (
                      "Post"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed bar */
            <div className="flex items-center gap-3 cursor-pointer" onClick={openComposer}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {session.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 px-4 py-2.5 rounded-full bg-muted/60 border border-border/40 text-muted-foreground text-sm hover:bg-muted transition-colors">
                What&apos;s on your mind?
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
