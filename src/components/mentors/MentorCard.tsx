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
        { bg: 'rgba(34, 108, 224, 0.05)', text: '#226CE0', border: 'rgba(34, 108, 224, 0.25)', badgeBg: '#F1F5F9', badgeText: '#334155' }, // Blue theme (Google / grey badge)
        { bg: 'rgba(240, 119, 26, 0.05)', text: '#F0771A', border: 'rgba(240, 119, 26, 0.25)', badgeBg: '#FFEFE6', badgeText: '#D25E0A' },  // Orange theme (Razorpay / peach badge)
        { bg: 'rgba(16, 185, 129, 0.05)', text: '#10B981', border: 'rgba(16, 185, 129, 0.25)', badgeBg: '#ECFDF5', badgeText: '#047857' },  // Green theme (Cred / green badge)
        { bg: 'rgba(168, 85, 247, 0.05)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.25)', badgeBg: '#F3E8FF', badgeText: '#7E22CE' },  // Purple theme (Microsoft / purple badge)
    ];
    const colorIndex = index % avatarColors.length;
    const avatarStyle = avatarColors[colorIndex];

    const hasImage = !!mentor.imageUrl;

    const slotsMap = [3, 2, 4, 1];
    const slotCount = slotsMap[index % 4];
    const slotsText = mentor.available
        ? `${slotCount} ${slotCount === 1 ? 'Slot' : 'Slots'} Free This Week`
        : 'Fully Booked';

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
                    <div
                        className="w-full h-full rounded-full border-[3px] overflow-hidden relative"
                        style={{ borderColor: avatarStyle.border }}
                    >
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
                            background: avatarStyle.bg,
                            borderColor: avatarStyle.border,
                            borderWidth: '2px',
                        }}
                    >
                        {initials}
                    </div>
                )}
                {mentor.company && (
                    <div
                        className="p-mentor-company-badge"
                        style={{
                            backgroundColor: avatarStyle.badgeBg,
                            color: avatarStyle.badgeText,
                            borderColor: avatarStyle.border,
                        }}
                    >
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
                        <span key={i} className="p-mentor-tag">
                            {exp}
                        </span>
                    ))}
                </div>
            )}

            {/* Card Footer */}
            <div className="p-mentor-footer">
                <div className="p-mentor-slots" style={{ color: avatarStyle.text }}>
                    📅 {slotsText}
                </div>
                <button
                    className="btn-redesign btn-redesign-primary btn-redesign-sm w-fit mx-auto px-10 font-bold"
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
