import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { maskSensitiveData } from "@/lib/utils";
import CommunityClient from "./CommunityClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = generatePageMetadata(
  "Developer Community | Velonx Connect",
  "Connect with like-minded developers, join focus groups, ask questions, share insights, and grow together inside the Velonx community.",
  "/community"
);

export default async function CommunityPage() {
  // Check auth
  const session = await auth();
  const userId = session?.user?.id;

  // Run a one-time DB migration to rename 'APi' to 'API'
  try {
    await prisma.communityGroup.updateMany({
      where: { name: "APi" },
      data: { name: "API" },
    });
  } catch (err) {
    console.error("Failed to rename group in database:", err);
  }

  // Fetch initial groups (up to 50)
  const dbGroups = await prisma.communityGroup.findMany({
    take: 50,
    include: {
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const initialGroups = dbGroups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    isPrivate: group.isPrivate,
    imageUrl: group.imageUrl || undefined,
    ownerId: group.ownerId,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    memberCount: group._count.members,
    postCount: group._count.posts,
  }));

  // Fetch initial posts (up to 30 public posts)
  const dbPosts = await prisma.communityPost.findMany({
    where: {
      visibility: "PUBLIC",
    },
    take: 30,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          college: true,
        },
      },
      _count: {
        select: {
          reactions: true,
          comments: true,
        },
      },
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
  });

  const initialPosts = dbPosts.map((post) => {
    // Mask sensitive content for anonymous visitors (including Googlebot)
    const content = userId ? post.content : maskSensitiveData(post.content);

    return {
      id: post.id,
      content,
      authorId: post.authorId,
      authorName: post.author.name || "Unknown",
      authorImage: post.author.image || undefined,
      authorCollege: post.author.college || undefined,
      groupId: post.groupId || undefined,
      visibility: post.visibility,
      imageUrls: post.imageUrls,
      linkUrls: post.linkUrls,
      isEdited: post.isEdited,
      isPinned: post.isPinned,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      score: post.upvotes - post.downvotes,
      reactionCount: post._count.reactions,
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  });

  // Fetch total count of all public discussions
  const totalPostsCount = await prisma.communityPost.count({
    where: {
      visibility: "PUBLIC",
    },
  });

  return (
    <CommunityClient
      initialPosts={initialPosts as any}
      initialGroups={initialGroups as any}
      totalPostsCount={totalPostsCount}
    />
  );
}
