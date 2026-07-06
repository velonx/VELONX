import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo.config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { maskSensitiveData, normalizeStylizedText, slugifyPost } from "@/lib/utils";
import ThreadClient from "./ThreadClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Helper to determine if a thread meets the SEO indexing quality bar
function getThreadIndexability(
  content: string,
  authorId: string,
  comments: { authorId: string; content: string }[]
): boolean {
  const normalized = normalizeStylizedText(content);
  const postWordCount = normalized.trim().split(/\s+/).filter(Boolean).length;
  
  const externalReplies = comments.filter(c => c.authorId !== authorId);
  const externalReplyCount = externalReplies.length;
  
  const totalExternalCommentsWordCount = externalReplies.reduce((acc, c) => {
    return acc + c.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  
  const totalWordCount = postWordCount + totalExternalCommentsWordCount;
  
  // Index if:
  // 1. Post is substantial on its own (>= 40 words)
  // 2. OR post has a real reply from a different user and total thread substance is at least 35 words
  // 3. OR post has multiple real replies (>= 2) from different users
  return postWordCount >= 40 || (externalReplyCount > 0 && totalWordCount >= 35) || externalReplyCount >= 2;
}

// Dynamic metadata generation with SEO Quality Gates & canonicals
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const postId = slug.split("-")[0];

  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        content: true,
        authorId: true,
        comments: {
          select: {
            authorId: true,
            content: true,
          },
        },
      },
    });

    if (!post) return {};

    const normalized = normalizeStylizedText(post.content);
    const isIndexable = getThreadIndexability(post.content, post.authorId, post.comments);
    const cleanedContent = normalized.replace(/(?:\s*#\w+)+\s*$/, "");
    let cleanSnippet = cleanedContent.slice(0, 150);
    // Correct common typos for a cleaner meta description snippet
    cleanSnippet = cleanSnippet
      .replace(/\bin there college\b/gi, "in their college")
      .replace(/\bthere college life\b/gi, "their college life");
    const descriptionSnippet = cleanSnippet + (cleanedContent.length > 150 ? "..." : "");

    // Generate canonical URL based on the server-side generated slug
    const canonicalSlug = slugifyPost(postId, post.content);
    const baseMetadata = generatePageMetadata(
      "Discussion | Velonx Connect",
      descriptionSnippet,
      `/community/t/${canonicalSlug}`
    );

    return {
      ...baseMetadata,
      robots: {
        index: isIndexable,
        follow: true,
        googleBot: {
          index: isIndexable,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch {
    return {};
  }
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postId = slug.split("-")[0];

  // Check auth
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch the main post
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          college: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
          isPrivate: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Gating access checks
  let hasAccess = false;
  if (post.visibility === "PUBLIC") {
    if (post.group && post.group.isPrivate) {
      if (userId) {
        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: post.groupId!,
              userId,
            },
          },
        });
        hasAccess = !!membership || post.authorId === userId;
      }
    } else {
      hasAccess = true;
    }
  } else if (post.visibility === "GROUP" && post.groupId) {
    if (post.group && !post.group.isPrivate) {
      hasAccess = true;
    } else {
      if (userId) {
        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: post.groupId,
              userId,
            },
          },
        });
        hasAccess = !!membership || post.authorId === userId;
      }
    }
  } else if (post.visibility === "FOLLOWERS") {
    if (userId) {
      if (post.authorId === userId) {
        hasAccess = true;
      } else {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: post.authorId,
            },
          },
        });
        hasAccess = !!follow;
      }
    }
  }

  if (!hasAccess) {
    notFound(); // Deny access quietly
  }

  // Cap initial comments for unauthenticated users
  const commentsLimit = userId ? 100 : 3;
  const dbComments = await prisma.postComment.findMany({
    where: {
      postId,
      parentId: null,
    },
    take: commentsLimit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          college: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format comments & mask sensitive info if unauthenticated
  const initialComments = dbComments.map((comment) => ({
    id: comment.id,
    content: userId ? comment.content : maskSensitiveData(comment.content),
    postId: comment.postId,
    authorId: comment.authorId,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: {
      id: comment.author.id,
      name: comment.author.name || "Unknown",
      image: comment.author.image || undefined,
      college: comment.author.college || undefined,
    },
  }));

  // Fetch related discussions (up to 5 other public posts)
  const dbRelated = await prisma.communityPost.findMany({
    where: {
      id: { not: postId },
      visibility: "PUBLIC",
      groupId: post.groupId || undefined,
    },
    take: 5,
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const relatedPosts = dbRelated.map((r) => ({
    id: r.id,
    content: r.content,
    slug: slugifyPost(r.id, r.content), // Server-computed slug
    author: {
      name: r.author.name || "Unknown",
    },
  }));

  // Format the main post content (apply sensitive data masking if logged out)
  const content = userId ? post.content : maskSensitiveData(post.content);

  const formattedPost = {
    id: post.id,
    content,
    slug: slugifyPost(post.id, post.content), // Server-computed slug
    authorId: post.authorId,
    authorName: post.author.name || "Unknown",
    authorImage: post.author.image || undefined,
    authorCollege: post.author.college || undefined,
    groupId: post.groupId || undefined,
    groupName: post.group?.name || undefined,
    visibility: post.visibility,
    imageUrls: post.imageUrls,
    linkUrls: post.linkUrls,
    isEdited: post.isEdited,
    isPinned: post.isPinned,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    score: post.upvotes - post.downvotes,
    commentCount: post._count.comments,
    reactionCount: post._count.reactions,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };

  // Structured Data (JSON-LD) for DiscussionForumPosting
  const normalizedSnippet = normalizeStylizedText(formattedPost.content);
  const cleanSnippet = normalizedSnippet.replace(/(?:\s*#\w+)+\s*$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": `https://velonx.in/community/t/${slug}`,
    "headline": cleanSnippet.slice(0, 80) + (cleanSnippet.length > 80 ? "..." : ""),
    "articleBody": normalizedSnippet,
    "author": {
      "@type": "Person",
      "name": formattedPost.authorName,
      "jobTitle": `Student Builder${formattedPost.authorCollege ? ` from ${formattedPost.authorCollege}` : ""}`,
    },
    "datePublished": formattedPost.createdAt,
    "dateModified": formattedPost.updatedAt,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/CommentAction",
      "userInteractionCount": formattedPost.commentCount,
    },
    "comment": initialComments.map((c) => ({
      "@type": "Comment",
      "text": c.content,
      "author": {
        "@type": "Person",
        "name": c.author.name,
      },
      "dateCreated": c.createdAt,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ThreadClient
        post={formattedPost}
        initialComments={initialComments}
        relatedPosts={relatedPosts}
        sessionUser={userId ? session.user : null}
        slug={slug}
      />
    </>
  );
}
