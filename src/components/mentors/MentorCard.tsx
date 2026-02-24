/**
 * MentorCard Component — Card7 Horizontal Layout
 * Premium horizontal card with image, details, and social icons
 */

'use client';

import React from 'react';
import { Linkedin, Github, Twitter, MessageCircle, Star } from 'lucide-react';
import type { Mentor } from '@/lib/api/types';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface MentorCardProps {
    mentor: Mentor;
    onBookSession: (mentor: Mentor) => void;
    onLinkedinClick: (mentorName: string) => void;
    index?: number;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face';

interface SocialIconConfig {
    icon: typeof Linkedin;
    label: string;
    urlKey: 'linkedinUrl' | 'githubUrl' | 'twitterUrl' | null;
    getUrl: (mentor: Mentor) => string | null | undefined;
}

const socialIcons: SocialIconConfig[] = [
    {
        icon: Linkedin,
        label: 'LinkedIn',
        urlKey: 'linkedinUrl',
        getUrl: (mentor) => mentor.linkedinUrl,
    },
    {
        icon: Github,
        label: 'GitHub',
        urlKey: 'githubUrl',
        getUrl: (mentor) => mentor.githubUrl,
    },
    {
        icon: Twitter,
        label: 'Twitter',
        urlKey: 'twitterUrl',
        getUrl: (mentor) => mentor.twitterUrl,
    },
    {
        icon: MessageCircle,
        label: 'Message',
        urlKey: null,
        getUrl: () => null,
    },
];

export const MentorCard: React.FC<MentorCardProps> = ({
    mentor,
    onBookSession,
    onLinkedinClick,
    index = 0,
}) => {
    const handleSocialClick = (config: SocialIconConfig) => {
        const url = config.getUrl(mentor);
        
        // Handle special cases
        if (config.label === 'LinkedIn' && url) {
            onLinkedinClick(mentor.name);
            return;
        }
        
        if (config.label === 'Message') {
            onBookSession(mentor);
            return;
        }
        
        // Handle external social profile links
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

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
                    {socialIcons.map((config) => {
                        const { icon: Icon, label } = config;
                        const url = config.getUrl(mentor);
                        const isAvailable = label === 'Message' || !!url;
                        const isDisabled = !isAvailable;

                        const button = (
                            <button
                                key={label}
                                onClick={() => !isDisabled && handleSocialClick(config)}
                                aria-label={`${label} — ${mentor.name}`}
                                disabled={isDisabled}
                                type="button"
                                style={{
                                    opacity: isDisabled ? 0.4 : 1,
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <span className="social-icon-inner">
                                    <Icon style={{ width: 22, height: 22 }} />
                                </span>
                            </button>
                        );

                        // Wrap disabled icons with tooltip
                        if (isDisabled) {
                            return (
                                <Tooltip key={label}>
                                    <TooltipTrigger asChild>
                                        {button}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {label} profile not available
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return button;
                    })}
                </div>
            </div>
        </div>
    );
};

MentorCard.displayName = 'MentorCard';
