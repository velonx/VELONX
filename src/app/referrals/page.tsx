/**
 * Referral Dashboard Page
 * Feature: referral-xp-system
 * 
 * Main page for viewing referral code, statistics, and history.
 * Requires authentication.
 * 
 * Requirements:
 * - 9.1: Provide referral dashboard accessible from user profile
 * - 9.2: Display referral code and link
 * - 9.3: Display total referrals count
 * - 9.4: Display total XP earned
 * - 9.5: Display list of recent referrals
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReferralCodeDisplay } from "@/components/referral/ReferralCodeDisplay";
import { ReferralStats } from "@/components/referral/ReferralStats";
import { ReferralHistoryList } from "@/components/referral/ReferralHistoryList";
import { Share2, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Referral Dashboard | VELONX",
  description: "Track your referrals and earn XP rewards by inviting others to join VELONX",
};

export default async function ReferralDashboardPage() {
  // Authenticate user
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch user's referral code
  let user;
  try {
    user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        referralCode: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="bg-card border border-border rounded-3xl shadow-lg p-12 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Unable to Load Referral Dashboard</h1>
            <p className="text-muted-foreground mb-6">
              We encountered an error while loading your referral information. Please try again later.
            </p>
            <a
              href="/dashboard/student"
              className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where user is not found
  if (!user) {
    redirect("/auth/login");
  }

  // Handle case where user doesn't have a referral code (shouldn't happen)
  if (!user.referralCode) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="bg-card border border-border rounded-3xl shadow-lg p-12 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Referral Code Not Available</h1>
            <p className="text-muted-foreground mb-6">
              Your referral code is being generated. Please refresh the page in a moment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate referral link
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://velonx.in'}/register?ref=${user.referralCode}`;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-card/50 border border-border flex items-center justify-center">
              <Share2 className="w-6 h-6 text-foreground" />
            </div>
            <h1 className="text-4xl font-black text-foreground">Referral Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Invite friends to join VELONX and earn XP rewards when they complete milestones
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Referral Code Display */}
          <div className="bg-card border border-border rounded-3xl shadow-lg p-6">
            <ReferralCodeDisplay code={user.referralCode} link={referralLink} />
          </div>

          {/* Referral Statistics */}
          <div className="bg-card border border-border rounded-3xl shadow-lg p-6">
            <ReferralStats />
          </div>

          {/* Referral History */}
          <div className="bg-card border border-border rounded-3xl shadow-lg p-6">
            <ReferralHistoryList />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-foreground font-bold">Earn 25 XP</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              When someone signs up using your referral code
            </p>
          </div>
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-foreground font-bold">Earn 50 XP</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              When your referral completes their profile
            </p>
          </div>
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h3 className="text-foreground font-bold">Earn 75 XP</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              When your referral completes their first activity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
