import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";
import { prisma } from "@/lib/prisma";
import GroupsClient from "./GroupsClient";

export const dynamic = "force-dynamic";

// Unique groups metadata with self-referencing canonical (fixing parent canonical bug)
export const metadata: Metadata = generatePageMetadata(
  "Community Groups | Velonx Connect",
  "Create or join groups around shared interests. Build communities, share posts, and collaborate with like-minded learners.",
  "/community/groups"
);

export default async function GroupsPage() {
  // Pre-fetch community groups on the server for crawler indexing
  const dbGroups = await prisma.communityGroup.findMany({
    take: 50,
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
    orderBy: { createdAt: "desc" },
  });

  const initialGroups = dbGroups.map((group) => ({
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
  }));

  return <GroupsClient initialGroups={initialGroups as any} />;
}
