import { Heading, Link, Text } from '@react-email/components';
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
            Here is your weekly summary of events, projects, and activities happening on VELONX:
        </Text>

        {/* Stats Grid using a robust HTML table structure for wide client support */}
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '12px', margin: '16px 0 24px' }}>
            <tbody>
                <tr>
                    <td style={statCard}>
                        <Text style={statNumber}>{upcomingEvents}</Text>
                        <Text style={statLabel}>Upcoming Events</Text>
                    </td>
                    <td style={statCard}>
                        <Text style={statNumber}>{newProjects}</Text>
                        <Text style={statLabel}>New Projects</Text>
                    </td>
                </tr>
                <tr>
                    <td style={statCard}>
                        <Text style={statNumber}>{xpGained}</Text>
                        <Text style={statLabel}>XP Gained</Text>
                    </td>
                    <td style={statCard}>
                        <Text style={statNumber}>#{leaderboardPosition}</Text>
                        <Text style={statLabel}>Leaderboard Rank</Text>
                    </td>
                </tr>
            </tbody>
        </table>

        {upcomingEvents > 0 && (
            <div style={sectionContainer}>
                <Text style={sectionTitle}>📅 Upcoming Events</Text>
                <Text style={paragraph}>
                    You have {upcomingEvents} event{upcomingEvents > 1 ? 's' : ''} scheduled or available this week. Keep building your network and skills!
                </Text>
                <div style={{ margin: '12px 0 24px' }}>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/events`}
                        style={secondaryButton}
                    >
                        View Events Calendar
                    </Link>
                </div>
            </div>
        )}

        {newProjects > 0 && (
            <div style={sectionContainer}>
                <Text style={sectionTitle}>🚀 New Projects Matching Your Interests</Text>
                <Text style={paragraph}>
                    {newProjects} new collaboration project{newProjects > 1 ? 's have' : ' has'} been published this week. Browse through and join a team to build your portfolio.
                </Text>
                <div style={{ margin: '12px 0 24px' }}>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/projects`}
                        style={secondaryButton}
                    >
                        Explore Project Board
                    </Link>
                </div>
            </div>
        )}

        <div style={xpCard}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ fontSize: '24px', width: '36px', verticalAlign: 'middle' }}>🏆</td>
                        <td style={{ verticalAlign: 'middle' }}>
                            <Text style={{ ...paragraph, margin: 0, fontWeight: 'bold', color: '#03543F' }}>
                                XP Progress: You earned +{xpGained} XP this week!
                            </Text>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Link
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/dashboard`}
                style={button}
            >
                Go to Dashboard
            </Link>
        </div>

        <Text style={paragraph}>
            Have a productive week ahead!
            <br />
            <strong>The VELONX Team</strong>
        </Text>

        <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '36px', paddingTop: '24px' }}>
            <Text style={unsubscribeText}>
                Want to manage weekly updates?{' '}
                <Link
                    href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/settings/notifications`}
                    style={linkStyle}
                >
                    Update email preferences
                </Link>
            </Text>
        </div>
    </EmailLayout>
);

const statCard = {
    backgroundColor: '#F0F7FF',
    border: '1px solid #D0E5FF',
    padding: '24px 16px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    width: '50%',
};

const statNumber = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#226CE0',
    margin: '0',
    lineHeight: '1',
};

const statLabel = {
    fontSize: '11px',
    color: '#4B5563',
    margin: '8px 0 0',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
};

const sectionContainer = {
    borderLeft: '4px solid #226CE0',
    paddingLeft: '16px',
    margin: '24px 0',
};

const sectionTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 12px',
};

const xpCard = {
    backgroundColor: '#DEF7EC',
    border: '1px solid #BCF0DA',
    borderRadius: '12px',
    padding: '16px 20px',
    margin: '28px 0',
};

const secondaryButton = {
    backgroundColor: 'transparent',
    border: '2px solid #226CE0',
    borderRadius: '8px',
    color: '#226CE0',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '10px 24px',
    margin: '0',
};

const unsubscribeText = {
    color: '#9ca3af',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '20px 0 0',
    textAlign: 'center' as const,
};

const linkStyle = {
    color: '#226CE0',
    textDecoration: 'underline',
};

export default WeeklyDigestEmail;
