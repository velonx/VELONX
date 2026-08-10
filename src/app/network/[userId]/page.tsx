import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata, siteConfig } from "@/lib/seo.config";
import { getProfileIndexability } from "@/lib/seo/profile-indexability";
import NetworkProfileClient from "./NetworkProfileClient";

export const dynamic = "force-dynamic";

/**
 * Profiles resolve by slug *or* ObjectId, so the same person is reachable at two
 * URLs. Everything below canonicalises to the slug form and only ever indexes
 * that one, so the ObjectId URL consolidates into it instead of competing.
 */
const profileSelect = {
  id: true,
  name: true,
  slug: true,
  image: true,
  coverImage: true,
  headline: true,
  bio: true,
  college: true,
  location: true,
  skills: true,
  graduationYear: true,
  xp: true,
  level: true,
  createdAt: true,
  linkedinUrl: true,
  githubUrl: true,
  twitterUrl: true,
  portfolioUrl: true,
  _count: {
    select: {
      communityPosts: true,
      projectsOwned: true,
      badges: true,
      followers: true,
      following: true,
    },
  },
  badges: {
    take: 6,
    orderBy: { earnedAt: "desc" },
    select: {
      earnedAt: true,
      badge: {
        select: {
          name: true,
          description: true,
          imageUrl: true,
          rarity: true,
          category: true,
        },
      },
    },
  },
  projectsOwned: {
    select: {
      id: true,
      title: true,
      description: true,
      techStack: true,
      status: true,
      imageUrl: true,
    },
  },
} as const;

type ProfileRecord = Awaited<ReturnType<typeof findProfile>>;

async function findProfile(userIdOrSlug: string) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(userIdOrSlug);

  if (isObjectId) {
    const byId = await prisma.user.findUnique({
      where: { id: userIdOrSlug },
      select: profileSelect,
    });
    if (byId) return byId;
  }

  return prisma.user.findUnique({
    where: { slug: userIdOrSlug },
    select: profileSelect,
  });
}

async function getProfile(userIdOrSlug: string) {
  try {
    return await findProfile(userIdOrSlug);
  } catch (err) {
    console.error("[NetworkProfile] Failed to load profile:", err);
    return null;
  }
}

/** Human-readable one-liner used for the meta description. */
function buildDescription(profile: NonNullable<ProfileRecord>): string {
  const name = profile.name || "This member";

  if (profile.bio?.trim()) {
    const bio = profile.bio.trim().replace(/\s+/g, " ");
    return bio.length > 155 ? `${bio.slice(0, 152)}...` : bio;
  }

  const parts: string[] = [];
  if (profile.headline?.trim()) parts.push(profile.headline.trim());
  if (profile.college?.trim()) parts.push(profile.college.trim());
  if (profile.location?.trim()) parts.push(profile.location.trim());
  if (profile.skills.length > 0) parts.push(`Skills: ${profile.skills.slice(0, 5).join(", ")}`);

  if (parts.length === 0) {
    return `View ${name}'s profile on Velonx — projects, badges, and connections.`;
  }

  return `${name} on Velonx. ${parts.join(" · ")}.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getProfile(userId);

  if (!profile) return { robots: { index: false, follow: false } };

  const name = profile.name || "Velonx Member";
  const title = profile.headline?.trim()
    ? `${name} — ${profile.headline.trim()} | Velonx`
    : `${name} | Velonx Network`;

  // Always canonicalise to the slug URL when one exists so the ObjectId variant
  // never gets indexed as a duplicate.
  const canonicalPath = `/network/${profile.slug || profile.id}`;

  const metadata = generatePageMetadata(
    title,
    buildDescription(profile),
    canonicalPath,
    profile.image || undefined
  );

  return {
    ...metadata,
    // Thin profiles stay out of the index but still pass link equity onward.
    robots: getProfileIndexability(profile)
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      ...metadata.openGraph,
      type: "profile",
    },
  };
}

function ProfileJsonLd({ profile }: { profile: NonNullable<ProfileRecord> }) {
  const url = `${siteConfig.url}/network/${profile.slug || profile.id}`;
  const sameAs = [
    profile.linkedinUrl,
    profile.githubUrl,
    profile.twitterUrl,
    profile.portfolioUrl,
  ].filter((link): link is string => Boolean(link?.trim()));

  // schema.org expects absolute URLs; avatars are often stored site-relative.
  const image = profile.image?.startsWith("http")
    ? profile.image
    : profile.image
      ? `${siteConfig.url}${profile.image.startsWith("/") ? "" : "/"}${profile.image}`
      : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.name || "Velonx Member",
      url,
      ...(image ? { image } : {}),
      ...(profile.headline ? { jobTitle: profile.headline } : {}),
      ...(profile.bio ? { description: profile.bio } : {}),
      ...(profile.skills.length > 0 ? { knowsAbout: profile.skills } : {}),
      ...(profile.college
        ? { alumniOf: { "@type": "EducationalOrganization", name: profile.college } }
        : {}),
      ...(profile.location
        ? { address: { "@type": "PostalAddress", addressLocality: profile.location } }
        : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await getProfile(userId);

  if (!profile) notFound();

  // Seed the client with everything that isn't viewer-specific, so the profile's
  // real content is server-rendered and crawlable. Connection state and mutual
  // connections depend on who's looking, so they start empty and the client's
  // fetch fills them in.
  const initialProfile = {
    id: profile.id,
    name: profile.name,
    slug: profile.slug,
    image: profile.image,
    coverImage: profile.coverImage,
    bio: profile.bio,
    headline: profile.headline,
    college: profile.college,
    graduationYear: profile.graduationYear,
    skills: profile.skills,
    location: profile.location,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    twitterUrl: profile.twitterUrl,
    portfolioUrl: profile.portfolioUrl,
    xp: profile.xp,
    level: profile.level,
    createdAt: profile.createdAt.toISOString(),
    _count: profile._count,
    connectionStatus: { status: "none" as const },
    mutualConnections: { count: 0, users: [] },
    connectionCount: 0,
    recentBadges: profile.badges.map((entry) => ({
      name: entry.badge.name,
      description: entry.badge.description,
      imageUrl: entry.badge.imageUrl,
      rarity: entry.badge.rarity,
      category: entry.badge.category,
      earnedAt: entry.earnedAt.toISOString(),
    })),
    projects: profile.projectsOwned,
    isOwnProfile: false,
  };

  return (
    <>
      <ProfileJsonLd profile={profile} />
      <NetworkProfileClient initialProfile={initialProfile} />
    </>
  );
}
