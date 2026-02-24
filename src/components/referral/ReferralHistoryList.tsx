/**
 * ReferralHistoryList Component
 * Feature: referral-xp-system
 * 
 * Displays a list of referrals with milestone completion status,
 * XP earned, and pagination support.
 * 
 * Requirements:
 * - 9.5: Display list of recent referrals with milestone status
 * - 10.1: Show referee details
 * - 10.2: Show milestone completion status
 * - 10.3: Support milestone type filtering
 * - 10.4: Support pagination
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReferralHistoryEntry {
  id: string;
  refereeName: string;
  refereeImage: string;
  signupDate: string;
  profileCompleted: boolean;
  firstActivityCompleted: boolean;
  firstActivityType?: string;
  totalXPEarned: number;
}

export interface ReferralHistoryData {
  referrals: ReferralHistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReferralHistoryListProps {
  className?: string;
}

type MilestoneFilter = 'all' | 'signup' | 'profile' | 'activity';

/**
 * Get initials from name for avatar fallback
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Format activity type for display
 */
const formatActivityType = (type?: string): string => {
  if (!type) return '';
  
  const typeMap: Record<string, string> = {
    event_registration: 'Event Registration',
    project_completion: 'Project Completion',
    mentor_session: 'Mentor Session',
    group_join: 'Group Join'
  };
  
  return typeMap[type] || type;
};

/**
 * Milestone status indicator component
 */
const MilestoneStatus: React.FC<{
  completed: boolean;
  label: string;
  detail?: string;
}> = ({ completed, label, detail }) => (
  <div className="flex items-center gap-2">
    {completed ? (
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
    ) : (
      <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    )}
    <div className="flex flex-col">
      <span className={cn(
        'text-xs font-medium',
        completed ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {label}
      </span>
      {detail && completed && (
        <span className="text-xs text-muted-foreground">{detail}</span>
      )}
    </div>
  </div>
);

/**
 * ReferralHistoryList Component
 * 
 * Fetches and displays referral history with filtering and pagination.
 */
export const ReferralHistoryList: React.FC<ReferralHistoryListProps> = ({ className }) => {
  const [data, setData] = useState<ReferralHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<MilestoneFilter>('all');

  const fetchHistory = async (page: number, milestoneType: MilestoneFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        milestoneType: milestoneType
      });

      const response = await fetch(`/api/referral/history?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral history');
      }

      const response_data = await response.json();
      setData(response_data.data);
    } catch (err) {
      console.error('Error fetching referral history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage, filter);
  }, [currentPage, filter]);

  const handleFilterChange = (value: MilestoneFilter) => {
    setFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Loading your referral history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg border bg-muted animate-pulse" />
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
          <CardTitle>Referral History</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load your referral history. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { referrals, pagination } = data;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>
              {pagination.total} total referral{pagination.total !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          
          {/* Filter */}
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by milestone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Milestones</SelectItem>
              <SelectItem value="signup">Signups Only</SelectItem>
              <SelectItem value="profile">Profile Complete</SelectItem>
              <SelectItem value="activity">First Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No referrals found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Share your referral code to start earning XP!
            </p>
          </div>
        ) : (
          <>
            {/* Referral List */}
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={referral.refereeImage} alt={referral.refereeName} />
                      <AvatarFallback>{getInitials(referral.refereeName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {referral.refereeName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        <span>Joined {formatDate(referral.signupDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <MilestoneStatus
                      completed={true}
                      label="Signed Up"
                    />
                    <MilestoneStatus
                      completed={referral.profileCompleted}
                      label="Profile"
                    />
                    <MilestoneStatus
                      completed={referral.firstActivityCompleted}
                      label="First Activity"
                      detail={referral.firstActivityType ? formatActivityType(referral.firstActivityType) : undefined}
                    />
                  </div>

                  {/* XP Earned */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      <Trophy className="h-3 w-3 mr-1" aria-hidden="true" />
                      +{referral.totalXPEarned} XP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
