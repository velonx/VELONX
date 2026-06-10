import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeService } from "@/lib/services/badge.service";
import BadgeIcon, { BadgeCategory, BadgeRarity } from "@/components/badges/BadgeIcon";
import { CheckCircle2, Trophy, ArrowRight, ShieldCheck } from "lucide-react";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO and social media previews
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const badgeDetails = await BadgeService.getShareableBadgeDetails(id);

  if (!badgeDetails) {
    return {
      title: "Credential Not Found | Velonx",
      description: "This badge credential could not be found or verified on Velonx.",
    };
  }

  const title = `Verified Badge: ${badgeDetails.badgeName} earned by ${badgeDetails.studentName} | Velonx`;
  const description = `Official Velonx Credential: ${badgeDetails.studentName} (Level ${badgeDetails.studentLevel}) successfully unlocked the "${badgeDetails.badgeName}" badge. View their achievements.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Velonx",
      images: [
        {
          url: "/api/og/badge?id=" + id, // Fallback preview or metadata image URL
          width: 1200,
          height: 630,
          alt: badgeDetails.badgeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BadgeSharePage({ params }: SharePageProps) {
  const { id } = await params;
  const badgeDetails = await BadgeService.getShareableBadgeDetails(id);

  if (!badgeDetails) {
    notFound();
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Capitalize category helper
  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase().replace(/_/g, " ");
  };

  // Get color configurations for the ambient background glow
  const getGlowStyles = (rar: string) => {
    switch (rar) {
      case "LEGENDARY":
        return "from-pink-500/20 via-purple-500/20 to-indigo-500/20";
      case "EPIC":
        return "from-amber-500/20 via-orange-500/20 to-red-500/20";
      case "RARE":
        return "from-teal-500/20 via-cyan-500/20 to-indigo-500/20";
      case "COMMON":
      default:
        return "from-blue-500/20 via-slate-500/20 to-zinc-500/20";
    }
  };

  const glowClass = getGlowStyles(badgeDetails.badgeRarity);

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden font-sans">
      {/* Decorative background grid and glowing mesh circles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f11_1px,transparent_1px),linear-gradient(to_bottom,#0f0f11_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-linear-to-tr ${glowClass} blur-[120px] opacity-75 pointer-events-none -z-10`} />

      {/* Header logo / home link */}
      <header className="relative w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-xl font-black tracking-tighter bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent group-hover:text-white transition-colors">
            VELONX
          </span>
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800">
            CREST
          </span>
        </Link>
        <Link 
          href="/" 
          className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          Explore Platform <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-center p-6 z-10 my-8">
        <div className="relative w-full max-w-2xl bg-zinc-950/60 border border-zinc-900 rounded-4xl p-8 md:p-12 shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden flex flex-col items-center">
          
          {/* Accent lighting for the card */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent opacity-50" />
          
          {/* Certificate Badge Seal */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-10 shadow-inner">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Verified Achievement</span>
          </div>

          {/* Badge Visual Section */}
          <div className="mb-8 relative scale-110 md:scale-125 transition-transform">
            <BadgeIcon 
              name={badgeDetails.badgeName} 
              rarity={badgeDetails.badgeRarity as BadgeRarity} 
              category={badgeDetails.badgeCategory as BadgeCategory} 
              earned={true} 
              size="xl" 
            />
          </div>

          {/* Recipient Profile */}
          <div className="flex items-center gap-3 mb-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl px-5 py-2.5">
            {badgeDetails.studentImage ? (
              <img 
                src={badgeDetails.studentImage} 
                alt={badgeDetails.studentName} 
                className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700">
                {badgeDetails.studentName.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <div className="text-xs text-zinc-500 font-semibold leading-none mb-0.5">Earned By</div>
              <div className="text-sm font-black text-zinc-200 leading-none">
                {badgeDetails.studentName}
              </div>
            </div>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <div className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              Lvl {badgeDetails.studentLevel}
            </div>
          </div>

          {/* Badge Description */}
          <div className="text-center max-w-lg mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
              {badgeDetails.badgeName}
            </h1>
            <p className="text-zinc-400 text-base font-medium">
              {badgeDetails.badgeDescription}
            </p>
          </div>

          {/* Credential Data Table */}
          <div className="w-full bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden p-6 mb-10 text-sm">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="text-zinc-500 font-semibold block text-xs uppercase tracking-wider mb-1">Badge Category</span>
                <span className="text-zinc-200 font-bold">{formatCategory(badgeDetails.badgeCategory)}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block text-xs uppercase tracking-wider mb-1">Rarity Class</span>
                <span className="text-zinc-200 font-bold">{badgeDetails.badgeRarity}</span>
              </div>
              <div className="col-span-2 h-px bg-zinc-900" />
              <div>
                <span className="text-zinc-500 font-semibold block text-xs uppercase tracking-wider mb-1">Award Date</span>
                <span className="text-zinc-200 font-bold">{formatDate(badgeDetails.earnedAt)}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block text-xs uppercase tracking-wider mb-1">Verification Code</span>
                <span className="text-zinc-400 font-mono text-xs truncate block max-w-45">{badgeDetails.id}</span>
              </div>
            </div>
          </div>

          {/* Call to Action (CTA) */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link 
              href="/register" 
              className="flex-1 py-4 px-6 rounded-2xl bg-white text-black text-center font-extrabold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
            >
              Start Earning Badges <Trophy className="w-4.5 h-4.5 text-black" />
            </Link>
            <Link 
              href="/" 
              className="flex-1 py-4 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-center font-extrabold text-sm hover:bg-zinc-850 hover:border-zinc-700 transition-colors flex items-center justify-center cursor-pointer"
            >
              Learn More about Velonx
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full py-8 text-center text-xs text-zinc-600 z-10">
        <p>© {new Date().getFullYear()} Velonx Platform. All Rights Reserved. Verified Credential.</p>
      </footer>
    </div>
  );
}
