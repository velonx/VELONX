'use client';

import React from 'react';
import { Compass, Award, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PathCardProps {
  path: {
    id: string;
    title: string;
    description: string;
    level: string;
    duration: string;
    badgeName: string;
    badgeImageUrl: string;
    progress: number;
    completedModules: number;
    modules?: any[];
    isStarted: boolean;
    isCompleted: boolean;
    certificateEarned: boolean;
  };
  onSelect: (id: string) => void;
}

export const PathCard: React.FC<PathCardProps> = ({ path, onSelect }) => {
  const levelColors: Record<string, string> = {
    Beginner: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400',
    Intermediate: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    Advanced: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
  };

  const currentLevelColor = levelColors[path.level] || 'bg-gray-50 text-gray-600';
  const totalModules = path.modules?.length || 0;

  return (
    <div
      onClick={() => onSelect(path.id)}
      className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-[#226CE0]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#226CE0]"
      role="button"
      tabIndex={0}
      aria-label={`Learning path: ${path.title}, level ${path.level}, ${totalModules} modules`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(path.id);
        }
      }}
    >
      <div className="p-6 space-y-4">
        {/* Level and Duration */}
        <div className="flex justify-between items-center">
          <Badge className={`${currentLevelColor} font-black border-0 rounded-full px-3 py-1`}>
            {path.level}
          </Badge>
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            ⏱️ {path.duration}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-[#1A234A] dark:text-white group-hover:text-[#226CE0] transition-colors leading-snug">
            {path.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {path.description}
          </p>
        </div>

        {/* Skill Badge Reward Preview */}
        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/40">
          <div className="relative w-10 h-10 shrink-0 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-border/50 shadow-sm">
            {path.badgeImageUrl ? (
              <Image
                src={path.badgeImageUrl}
                alt={path.badgeName}
                width={36}
                height={36}
                className="object-contain"
                unoptimized
              />
            ) : (
              <Award className="w-6 h-6 text-orange-500" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              Earn Badge
            </span>
            <h4 className="text-xs font-bold text-[#1A234A] dark:text-white truncate">
              {path.badgeName}
            </h4>
          </div>
        </div>
      </div>

      {/* Progress & Actions */}
      <div className="p-6 pt-0 mt-auto border-t border-border/30">
        <div className="space-y-3 pt-4">
          {path.isStarted ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>{path.completedModules} of {totalModules} modules</span>
                <span>{path.progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#226CE0] to-[#8B5CF6] rounded-full transition-all duration-500"
                  style={{ width: `${path.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <Compass className="w-4 h-4 text-[#226CE0]" />
              <span>{totalModules} interactive module checkpoints</span>
            </div>
          )}

          <Button
            className={`w-full h-11 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              path.certificateEarned
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/10'
                : path.isCompleted
                ? 'bg-[#F0771A] hover:bg-[#D96510] text-white shadow-orange-500/10'
                : path.isStarted
                ? 'bg-[#226CE0] hover:bg-[#334DAF] text-white'
                : 'bg-background hover:bg-muted text-foreground border border-border'
            }`}
          >
            {path.certificateEarned ? (
              <>🎓 Credential Unlocked</>
            ) : path.isCompleted ? (
              <>⚡ Schedule Certificate Exam</>
            ) : path.isStarted ? (
              <>Resume Roadmap <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
            ) : (
              <>Start Roadmap <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
