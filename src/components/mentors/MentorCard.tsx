/**
 * MentorCard Component
 * Modern, theme-aware card for displaying mentor information
 * with animations and availability status
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageCircle, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mentor } from '@/lib/api/types';

export interface MentorCardProps {
    mentor: Mentor;
    onBookSession: (mentor: Mentor) => void;
    onLinkedinClick: (mentorName: string) => void;
    index?: number;
}

/**
 * Get accent color based on index for visual variety
 */
function getAccentVariant(index: number): string {
    const variants = ['secondary', 'primary', 'accent'];
    return variants[index % 3];
}

/**
 * MentorCard Component
 */
export const MentorCard: React.FC<MentorCardProps> = ({
    mentor,
    onBookSession,
    onLinkedinClick,
    index = 0,
}) => {
    const accentVariant = getAccentVariant(index);
    const accentClass = {
        secondary: 'bg-secondary',
        primary: 'bg-primary',
        accent: 'bg-accent',
    }[accentVariant];

    const avatarFallbackClass = {
        secondary: 'bg-secondary/10 text-secondary',
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
    }[accentVariant];

    return (
        <Card
            className={cn(
                'bg-card border border-border overflow-hidden flex flex-col',
                'transition-all duration-300 ease-out',
                'hover:border-primary hover:shadow-2xl hover:-translate-y-2',
                'group'
            )}
        >
            {/* Accent Top Bar */}
            <div className={cn('h-2', accentClass)} />

            <CardHeader>
                <div className="flex items-start gap-4">
                    {/* Avatar with Availability Indicator */}
                    <div className="relative">
                        <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
                            {mentor.imageUrl && (
                                <AvatarImage src={mentor.imageUrl} alt={mentor.name} />
                            )}
                            <AvatarFallback className={cn('text-xl font-bold', avatarFallbackClass)}>
                                {mentor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>

                        {/* Availability Pulse Indicator */}
                        {mentor.available && (
                            <div className="absolute -bottom-0.5 -right-0.5">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-card"></span>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
                            {mentor.name}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium line-clamp-1">
                            {mentor.company}
                        </CardDescription>

                        {/* Stats Row */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {/* Rating */}
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-secondary text-secondary" />
                                <span className="text-sm font-bold text-foreground">{mentor.rating.toFixed(1)}</span>
                            </div>

                            {/* Sessions */}
                            <span className="text-muted-foreground text-sm">
                                • {mentor.totalSessions} sessions
                            </span>

                            {/* Availability Badge */}
                            {mentor.available ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                                    Available
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                                    Busy
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                        <Badge
                            key={skill}
                            className="bg-muted text-muted-foreground border-0 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>

                {/* Bio */}
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                    {mentor.bio}
                </p>
            </CardContent>

            <CardFooter className="gap-2 pt-0">
                {/* Book Session Button */}
                <Button
                    onClick={() => onBookSession(mentor)}
                    disabled={!mentor.available}
                    className={cn(
                        'flex-1 font-bold rounded-full py-5 sm:py-6 text-sm sm:text-base',
                        'bg-primary hover:bg-primary/90 text-primary-foreground',
                        'shadow-md shadow-primary/10',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-all duration-200'
                    )}
                    aria-label={`Book a session with ${mentor.name}`}
                >
                    <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                    {mentor.available ? 'Book Session' : 'Unavailable'}
                </Button>

                {/* LinkedIn Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onLinkedinClick(mentor.name)}
                    className="rounded-full border-border text-muted-foreground hover:text-blue-600 hover:border-blue-600 min-w-[44px] min-h-[44px] w-12 h-12"
                    aria-label={`View ${mentor.name}'s LinkedIn profile`}
                >
                    <Linkedin className="w-5 h-5" />
                </Button>
            </CardFooter>
        </Card>
    );
};

MentorCard.displayName = 'MentorCard';
