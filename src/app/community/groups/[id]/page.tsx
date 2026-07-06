import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { maskSensitiveData } from "@/lib/utils";
import GroupDetailClient from "./GroupDetailClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Dynamic metadata generation for individual group pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: groupId } = await params;
  try {
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { name: true, description: true },
    });

    if (!group) return {};

    return generatePageMetadata(
      `${group.name} | Velonx Connect`,
      group.description,
      `/community/groups/${groupId}`
    );
  } catch {
    return {};
  }
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: groupId } = await params;

  // Check auth
  const session = await auth();
  const userId = session?.user?.id;

  // Query group from DB
  const group = await prisma.communityGroup.findUnique({
    where: { id: groupId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          members: true,
          posts: true,
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  // Format group data
  const initialGroup = {
    id: group.id,
    name: group.name,
    description: group.description,
    isPrivate: group.isPrivate,
    imageUrl: group.imageUrl || undefined,
    ownerId: group.ownerId,
    ownerName: group.owner.name || "Unknown",
    ownerImage: group.owner.image || undefined,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    memberCount: group._count.members,
    postCount: group._count.posts,
  };

  // Fetch initial group members
  const dbMembers = await prisma.groupMember.findMany({
    where: { groupId },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          college: true,
        },
      },
    },
  });

  const initialMembers = dbMembers.map((m) => ({
    id: m.id,
    groupId: m.groupId,
    userId: m.userId,
    joinedAt: m.joinedAt.toISOString(),
    user: {
      id: m.user.id,
      name: m.user.name,
      email: userId ? (m.user.email || "") : "",
      image: m.user.image,
    },
  }));

  // Gating & Membership Check
  const isMember = initialMembers.some((m) => m.userId === userId) || group.ownerId === userId;
  const canViewFeed = !group.isPrivate || isMember;

  // Fetch group posts if allowed
  let initialPosts: any[] = [];
  if (canViewFeed) {
    const dbPosts = await prisma.communityPost.findMany({
      where: {
        groupId,
        // Anonymous/logged out users can only see public posts
        visibility: userId ? undefined : "PUBLIC",
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

    initialPosts = dbPosts.map((post) => {
      // Privacy masking for anonymous visitors
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
  }

  return (
    <GroupDetailClient
      groupId={groupId}
      initialGroup={initialGroup as any}
      initialMembers={initialMembers as any}
      initialPosts={initialPosts as any}
    />
  );
}
