/**
 * ReferralStats Component
 * Feature: referral-xp-system
 * 
 * Displays referral statistics including total referrals, active referrals,
 * total XP earned, and milestone completion counts.
 * 
 * Requirements:
 * - 9.3: Display total and active referrals count
 * - 9.4: Display total XP earned from referrals
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReferralStatsData {
  totalReferrals: number;
  activeReferrals: number;
  totalXPEarned: number;
  milestones: {
    signups: number;
    profileCompletions: number;
    firstActivities: number;
  };
}

export interface ReferralStatsProps {
  className?: string;
}

/**
 * Stat card component for individual statistics
 */
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  iconColor: string;
}> = ({ icon, label, value, description, iconColor }) => (
  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
    <div className={cn('p-3 rounded-lg', iconColor)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  </div>
);

/**
 * ReferralStats Component
 * 
 * Fetches and displays referral statistics from the API.
 * Shows loading and error states.
 */
export const ReferralStats: React.FC<ReferralStatsProps> = ({ className }) => {
  const [stats, setStats] = useState<ReferralStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/referral/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch referral statistics');
        }

        const response_data = await response.json();
        setStats(response_data.data);
      } catch (err) {
        console.error('Error fetching referral stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
          <CardDescription>Loading your referral performance...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-lg border bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load your referral statistics. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Referral Statistics</CardTitle>
        <CardDescription>
          Track your referral performance and earned rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Referrals */}
          <StatCard
            icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
            label="Total Referrals"
            value={stats.totalReferrals}
            description="Users you've invited"
            iconColor="bg-blue-500/10"
          />

          {/* Active Referrals */}
          <StatCard
            icon={<UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />}
            label="Active Referrals"
            value={stats.activeReferrals}
            description="Completed their profile"
            iconColor="bg-green-500/10"
          />

          {/* Total XP Earned */}
          <StatCard
            icon={<Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
            label="XP Earned"
            value={stats.totalXPEarned.toLocaleString()}
            description="From all referrals"
            iconColor="bg-amber-500/10"
          />

          {/* Milestone Completions */}
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />}
            label="Milestones"
            value={stats.milestones.signups + stats.milestones.profileCompletions + stats.milestones.firstActivities}
            description={`${stats.milestones.signups} signups, ${stats.milestones.profileCompletions} profiles, ${stats.milestones.firstActivities} activities`}
            iconColor="bg-purple-500/10"
          />
        </div>
      </CardContent>
    </Card>
  );
};
