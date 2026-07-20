'use client';

import { useEffect, useState } from 'react';
import { useCheckIn, useUserStreak } from '@/lib/api/hooks';

const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

/** Returns [0..6] index where 0 = Monday */
function getTodayIndex() {
  const d = new Date().getDay(); // 0=Sun,1=Mon,...6=Sat
  return d === 0 ? 6 : d - 1;
}

export function DailyCheckIn() {
  const { checkIn, loading } = useCheckIn();
  const { data: streakData, refetch: refetchStreak } = useUserStreak();
  const [checkedIn, setCheckedIn] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [streak, setStreak] = useState(1);

  const todayIndex = getTodayIndex();

  useEffect(() => {
    // Persist check-in state locally per day
    const saved = localStorage.getItem('lastCheckIn');
    const today = new Date().toDateString();
    if (saved === today) setCheckedIn(true);
  }, []);

  useEffect(() => {
    if (streakData?.currentStreak !== undefined && streakData.currentStreak > 0) {
      setStreak(streakData.currentStreak);
    }
  }, [streakData]);

  const handleCheckIn = async () => {
    if (checkedIn || loading) return;
    setAnimating(true);
    try {
      const res = await checkIn();
      localStorage.setItem('lastCheckIn', new Date().toDateString());
      setCheckedIn(true);
      if (res?.data?.currentStreak !== undefined) setStreak(res.data.currentStreak);
      await refetchStreak();
    } catch (e) {
      console.error('Check-in failed:', e);
      // Fallback local checkin feedback
      localStorage.setItem('lastCheckIn', new Date().toDateString());
      setCheckedIn(true);
    } finally {
      setAnimating(false);
    }
  };

  // Calculate which day circles should be highlighted based on the actual streak
  const completedDays = Array.from({ length: 7 }, (_, i) => {
    if (i > todayIndex) return false;
    const effectiveStreak = Math.max(streak, checkedIn ? 1 : 0);
    if (effectiveStreak === 0) return false;
    const streakEndIndex = checkedIn ? todayIndex : todayIndex - 1;
    const streakStartIndex = streakEndIndex - effectiveStreak + 1;
    return i <= streakEndIndex && i >= streakStartIndex;
  });

  return (
    <div className="w-full rounded-4xl bg-linear-to-br from-[#FF5D17] to-[#FF7F00] p-6 text-white shadow-xl shadow-[#FF5D17]/20 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Streak count header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/80 mb-1">CURRENT STREAK</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black tracking-tight text-white">{streak}</span>
            <span className="text-base font-bold text-white/90">day{streak !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="text-4xl select-none animate-pulse" aria-hidden="true">🔥</div>
      </div>

      {/* Day circles — Duolingo / Velonx visual style */}
      <div className="flex justify-between items-center mb-6">
        {DAYS.map((day, i) => {
          const done = completedDays[i];
          const isToday = i === todayIndex;
          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80">{day}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300
                  ${done || (isToday && checkedIn)
                    ? 'bg-white text-[#FF5D17] shadow-md scale-105'
                    : isToday
                      ? 'bg-white/20 border-2 border-white text-white'
                      : 'border-2 border-white/30 text-white/40'
                  }`}
              >
                {done || (isToday && checkedIn) ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Check-in button */}
      <button
        onClick={handleCheckIn}
        disabled={checkedIn || loading || animating}
        className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm
          ${checkedIn
            ? 'bg-white/20 text-white cursor-default border border-white/40 backdrop-blur-md'
            : 'bg-white text-[#FF5D17] hover:bg-white/90 active:scale-98 shadow-lg'
          }`}
      >
        {loading || animating ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-[#FF5D17] border-t-transparent animate-spin" />
            Checking in…
          </>
        ) : checkedIn ? (
          <>
            <span className="text-base" aria-hidden="true">✓</span>
            Checked In Today
          </>
        ) : (
          <>
            <span className="text-base" aria-hidden="true">🔥</span>
            Check In Now
          </>
        )}
      </button>

      {/* Status banner */}
      <p className="text-center text-xs font-bold text-white/90 mt-3 flex items-center justify-center gap-1">
        <span>⚡</span> +20 XP earned · Come back tomorrow!
      </p>
    </div>
  );
}
