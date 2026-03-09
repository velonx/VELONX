'use client';

import { useEffect, useState } from 'react';
import { useCheckIn, useUserStreak } from '@/lib/api/hooks';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

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
  const [streak, setStreak] = useState(0);

  const todayIndex = getTodayIndex();

  useEffect(() => {
    // Persist check-in state locally per day
    const saved = localStorage.getItem('lastCheckIn');
    const today = new Date().toDateString();
    if (saved === today) setCheckedIn(true);
  }, []);

  useEffect(() => {
    if (streakData?.currentStreak !== undefined) {
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
    } finally {
      setAnimating(false);
    }
  };

  // Which day circles are "done": all days before today + today if checked in
  const completedDays = Array.from({ length: 7 }, (_, i) =>
    i < todayIndex || (i === todayIndex && checkedIn)
  );

  return (
    <div className="w-full rounded-[20px] bg-gradient-to-br from-orange-500 to-amber-400 p-5 text-white shadow-lg">
      {/* Streak count */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Current Streak</p>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-black leading-none">{streak}</span>
            <span className="text-base font-bold opacity-90 mb-1">day{streak !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="text-5xl select-none">🔥</div>
      </div>

      {/* Day circles — Duolingo style */}
      <div className="flex justify-between mb-5">
        {DAYS.map((day, i) => {
          const done = completedDays[i];
          const isToday = i === todayIndex;
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-75">{day}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300
                  ${done
                    ? 'bg-white text-orange-500 shadow-md scale-110'
                    : isToday
                      ? 'bg-white/30 border-2 border-white/60 text-white'
                      : 'bg-orange-700/40 text-orange-200'
                  }`}
              >
                {done ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Check-in button */}
      <button
        onClick={handleCheckIn}
        disabled={checkedIn || loading || animating}
        className={`w-full py-3 px-4 rounded-2xl font-black text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
          ${checkedIn
            ? 'bg-white/20 text-white cursor-default border-2 border-white/40'
            : 'bg-white text-orange-500 hover:bg-orange-50 active:scale-95 shadow-md hover:shadow-lg'
          }`}
      >
        {loading || animating ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
            Checking in…
          </>
        ) : checkedIn ? (
          <>
            <span className="text-base">✓</span>
            Checked In Today
          </>
        ) : (
          <>
            <span className="text-base">🔥</span>
            Check In
          </>
        )}
      </button>

      {checkedIn && (
        <p className="text-center text-xs font-bold opacity-75 mt-3">
          🎉 +20 XP earned · Come back tomorrow!
        </p>
      )}
    </div>
  );
}
