'use client';

import { useEffect, useState } from 'react';
import { useCheckIn, useUserStreak } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Calendar } from 'lucide-react';

export function DailyCheckIn() {
  const { checkIn, loading, data: checkInData } = useCheckIn();
  const { data: streakData, refetch: refetchStreak } = useUserStreak();
  const [message, setMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto check-in on component mount (optional)
  useEffect(() => {
    const hasCheckedInToday = localStorage.getItem('lastCheckIn');
    const today = new Date().toDateString();
    
    if (hasCheckedInToday !== today) {
      handleCheckIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckIn = async () => {
    try {
      const response = await checkIn();
      setMessage(response.message || 'Check-in successful!');
      setShowSuccess(true);
      
      // Store check-in date in localStorage
      localStorage.setItem('lastCheckIn', new Date().toDateString());
      
      // Refetch streak data
      await refetchStreak();
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const currentStreak = checkInData?.currentStreak || streakData?.currentStreak || 0;
  const longestStreak = checkInData?.longestStreak || streakData?.longestStreak || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Streak
        </CardTitle>
        <CardDescription>
          Keep your learning streak alive by checking in daily
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Current Streak</span>
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Longest Streak</span>
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
          </Badge>
        </div>

        {showSuccess && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {message}
          </div>
        )}

        <Button 
          onClick={handleCheckIn} 
          disabled={loading}
          className="w-full"
          aria-label={loading ? 'Checking in...' : 'Check in for today'}
        >
          {loading ? 'Checking in...' : 'Check In Today'}
        </Button>

        {currentStreak >= 2 && (
          <p className="text-xs text-center text-muted-foreground">
            🎉 You earn {20} XP for each day you maintain your streak!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
