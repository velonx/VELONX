/**
 * MentorCard Component
 * Premium vertical card with circular avatar, company badge overlap, and booking CTA
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Linkedin, Star } from 'lucide-react';
import type { Mentor } from '@/lib/api/types';

export interface MentorCardProps {
    mentor: Mentor;
    onBookSession: (mentor: Mentor) => void;
    onLinkedinClick: (mentorName: string) => void;
    index?: number;
}

export const MentorCard: React.FC<MentorCardProps> = ({
    mentor,
    onBookSession,
    onLinkedinClick,
    index = 0,
}) => {
    const initials = mentor.name
        ? mentor.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()
        : 'M';

    const avatarColors = [
        { bg: 'rgba(124, 58, 237, 0.15)', text: '#A78BFA' }, // Violet
        { bg: 'rgba(6, 182, 212, 0.15)', text: '#22D3EE' },  // Cyan
        { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399' }, // Green
        { bg: 'rgba(245, 158, 11, 0.15)', text: '#FCD34D' }, // Yellow
        { bg: 'rgba(236, 72, 153, 0.15)', text: '#F9A8D4' }, // Pink
    ];
    const colorIndex = index % avatarColors.length;
    const avatarStyle = avatarColors[colorIndex];

    const hasImage = !!mentor.imageUrl;

    return (
        <article className="p-mentor-card">
            {/* LinkedIn floating button */}
            {mentor.linkedinUrl && (
                <button
                    onClick={() => onLinkedinClick(mentor.name)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors touch-target"
                    aria-label={`LinkedIn profile of ${mentor.name}`}
                    type="button"
                >
                    <Linkedin className="w-4 h-4" />
                </button>
            )}

            {/* Avatar wrapper */}
            <div className="p-mentor-avatar-wrapper">
                {hasImage ? (
                    <div className="w-full h-full rounded-full border-[3px] border-border overflow-hidden relative">
                        <Image
                            src={mentor.imageUrl!}
                            alt={mentor.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                            priority={index < 4}
                        />
                    </div>
                ) : (
                    <div
                        className="p-mentor-img"
                        style={{
                            backgroundColor: avatarStyle.bg,
                            color: avatarStyle.text,
                            background: avatarStyle.bg
                        }}
                    >
                        {initials}
                    </div>
                )}
                {mentor.company && (
                    <div className="p-mentor-company-badge">
                        {mentor.company}
                    </div>
                )}
            </div>

            {/* Mentor Info */}
            <h2 className="p-mentor-name">{mentor.name}</h2>
            
            {/* Subtitle/Role */}
            <p className="p-mentor-role">
                {mentor.expertise[0] || 'Tech Mentor'}
                {mentor.rating > 0 && (
                    <span className="inline-flex items-center gap-0.5 ml-2 text-yellow-500 font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {mentor.rating.toFixed(1)}
                    </span>
                )}
            </p>

            {/* Expertise tags */}
            {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="p-mentor-tags">
                    {mentor.expertise.slice(0, 3).map((exp, i) => (
                        <span key={i} className="tag p-mentor-tag">
                            {exp}
                        </span>
                    ))}
                </div>
            )}

            {/* Card Footer */}
            <div className="p-mentor-footer">
                <div className="p-mentor-slots">
                    {mentor.available ? "📅 Slots Free This Week" : "📅 Fully Booked"}
                </div>
                <button
                    className="btn-redesign btn-redesign-primary btn-redesign-sm w-full font-bold"
                    onClick={() => onBookSession(mentor)}
                    type="button"
                >
                    Book Session
                </button>
            </div>
        </article>
    );
};

MentorCard.displayName = 'MentorCard';
