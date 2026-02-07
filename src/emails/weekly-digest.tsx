import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface WeeklyDigestEmailProps {
    userName: string;
    upcomingEvents: number;
    newProjects: number;
    xpGained: number;
    leaderboardPosition: number;
}

export const WeeklyDigestEmail = ({
    userName,
    upcomingEvents,
    newProjects,
    xpGained,
    leaderboardPosition,
}: WeeklyDigestEmailProps) => (
    <EmailLayout preview="Your VELONX week in review">
        <Heading style={heading}>Your Week in Review 📊</Heading>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
            Here's what's been happening on VELONX this week:
        </Text>

        <div style={statsContainer}>
            <div style={statCard}>
                <Text style={statNumber}>{upcomingEvents}</Text>
                <Text style={statLabel}>Upcoming Events</Text>
            </div>
            <div style={statCard}>
                <Text style={statNumber}>{newProjects}</Text>
                <Text style={statLabel}>New Projects</Text>
            </div>
            <div style={statCard}>
                <Text style={statNumber}>{xpGained}</Text>
                <Text style={statLabel}>XP Gained</Text>
            </div>
            <div style={statCard}>
                <Text style={statNumber}>#{leaderboardPosition}</Text>
                <Text style={statLabel}>Leaderboard</Text>
            </div>
        </div>

        {upcomingEvents > 0 && (
            <>
                <Text style={sectionTitle}>📅 Upcoming Events</Text>
                <Text style={paragraph}>
                    You have {upcomingEvents} event{upcomingEvents > 1 ? 's' : ''} coming up this week. Don't miss out!
                </Text>
                <Link
                    href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/events`}
                    style={secondaryButton}
                >
                    View Events
                </Link>
            </>
        )}

        {newProjects > 0 && (
            <>
                <Text style={sectionTitle}>🚀 New Projects</Text>
                <Text style={paragraph}>
                    {newProjects} new project{newProjects > 1 ? 's have' : ' has'} been added that match your interests. Check them out!
                </Text>
                <Link
                    href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/projects`}
                    style={secondaryButton}
                >
                    Browse Projects
                </Link>
            </>
        )}

        <Text style={sectionTitle}>🎯 Keep Growing</Text>
        <Text style={paragraph}>
            You've earned {xpGained} XP this week! Keep building, learning, and collaborating to climb the leaderboard.
        </Text>

        <Link
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/dashboard`}
            style={button}
        >
            Go to Dashboard
        </Link>

        <Text style={paragraph}>
            Have a productive week!
            <br />
            The VELONX Team
        </Text>

        <Text style={unsubscribeText}>
            Not interested in weekly updates?{' '}
            <Link
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/settings/notifications`}
                style={linkStyle}
            >
                Update your preferences
            </Link>
        </Text>
    </EmailLayout>
);

const statsContainer = {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    margin: '24px 0',
};

const statCard = {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center' as const,
};

const statNumber = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#219EBC',
    margin: '0',
    lineHeight: '1',
};

const statLabel = {
    fontSize: '13px',
    color: '#6b7280',
    margin: '8px 0 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
};

const sectionTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#023047',
    margin: '24px 0 12px',
};

const secondaryButton = {
    backgroundColor: 'transparent',
    border: '2px solid #219EBC',
    borderRadius: '8px',
    color: '#219EBC',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '10px 24px',
    margin: '12px 0',
};

const unsubscribeText = {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '24px 0 0',
    textAlign: 'center' as const,
};

const linkStyle = {
    color: '#219EBC',
    textDecoration: 'underline',
};

export default WeeklyDigestEmail;
