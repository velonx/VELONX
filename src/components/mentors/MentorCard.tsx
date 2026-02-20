/**
 * MentorCard Component — Card7 Horizontal Layout
 * Premium horizontal card with image, details, and social icons
 */

'use client';

import React from 'react';
import { Linkedin, Github, Twitter, MessageCircle, Star } from 'lucide-react';
import type { Mentor } from '@/lib/api/types';

export interface MentorCardProps {
    mentor: Mentor;
    onBookSession: (mentor: Mentor) => void;
    onLinkedinClick: (mentorName: string) => void;
    index?: number;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face';

const socialIcons = [
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Github, label: 'GitHub' },
    { icon: Twitter, label: 'Twitter' },
    { icon: MessageCircle, label: 'Message' },
];

export const MentorCard: React.FC<MentorCardProps> = ({
    mentor,
    onBookSession,
    onLinkedinClick,
    index = 0,
}) => {
    return (
        <div className="card-7">
            <img
                src={mentor.imageUrl || PLACEHOLDER_IMAGE}
                alt={mentor.name}
                loading="lazy"
            />
            <div>
                {/* Availability badge */}
                <div
                    className={`card-7-badge ${mentor.available ? 'available' : 'busy'}`}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: mentor.available ? '#10b981' : '#f59e0b',
                            display: 'inline-block',
                        }}
                    />
                    {mentor.available ? 'Available' : 'Busy'}
                </div>

                <h2>{mentor.name}</h2>
                <h3>
                    {mentor.company}
                    {mentor.rating > 0 && (
                        <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Star style={{ width: 13, height: 13, fill: '#f59e0b', color: '#f59e0b' }} />
                            {mentor.rating.toFixed(1)}
                        </span>
                    )}
                </h3>
                <p>{mentor.bio}</p>

                <div className="socials">
                    {socialIcons.map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            onClick={() => {
                                if (label === 'LinkedIn') onLinkedinClick(mentor.name);
                                if (label === 'Message') onBookSession(mentor);
                            }}
                            aria-label={`${label} — ${mentor.name}`}
                            type="button"
                        >
                            <span className="social-icon-inner">
                                <Icon style={{ width: 22, height: 22 }} />
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

MentorCard.displayName = 'MentorCard';
