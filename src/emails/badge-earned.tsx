import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface BadgeEarnedEmailProps {
    userName: string;
    badgeName: string;
    badgeDescription: string;
    badgeIcon?: string;
    xpAwarded: number;
}

export const BadgeEarnedEmail = ({
    userName,
    badgeName,
    badgeDescription,
    badgeIcon = '🏆',
    xpAwarded,
}: BadgeEarnedEmailProps) => (
    <EmailLayout preview={`Congratulations! You earned the ${badgeName} badge!`}>
        <Heading style={heading}>Congratulations, {userName}! 🎉</Heading>

        <Text style={paragraph}>
            Your hard work is paying off! You've unlocked a new achievement milestone and earned a new badge on the VELONX platform.
        </Text>

        <div style={badgeCard}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <tbody>
                    <tr>
                        <td>
                            <div style={iconCircle}>
                                <span style={iconSpan}>{badgeIcon}</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '16px 0 8px' }}>
                            <Text style={badgeTitle}>{badgeName}</Text>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0 16px 16px' }}>
                            <Text style={badgeDesc}>"{badgeDescription}"</Text>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px 0' }}>
                            <span style={xpBadge}>+{xpAwarded} XP Awarded</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Text style={paragraph}>
            Keep building, learning, and collaborating. Every project completed and event attended brings you closer to your goals and higher up the community leaderboard!
        </Text>

        <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Link
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/dashboard`}
                style={button}
            >
                View My Profile & Badges
            </Link>
        </div>

        <Text style={paragraph}>
            Show off your new badge to the community and keep leveling up!
            <br />
            <strong>The VELONX Team</strong>
        </Text>
    </EmailLayout>
);

const badgeCard = {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    border: '2px solid #E2E8F0',
    borderRadius: '16px',
    padding: '32px 24px',
    margin: '32px auto',
    maxWidth: '360px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const iconCircle = {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    background: 'linear-gradient(135deg, #FF9F43 0%, #FF5252 100%)',
    margin: '0 auto',
    boxShadow: '0 4px 10px rgba(255, 82, 82, 0.3)',
    textAlign: 'center' as const,
};

const iconSpan = {
    fontSize: '42px',
    lineHeight: '80px',
    display: 'inline-block',
    verticalAlign: 'middle',
};

const badgeTitle = {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0',
};

const badgeDesc = {
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#64748B',
    lineHeight: '20px',
    margin: '0',
};

const xpBadge = {
    display: 'inline-block',
    backgroundColor: '#DEF7EC',
    border: '1px solid #BCF0DA',
    color: '#03543F',
    fontSize: '13px',
    fontWeight: 'bold',
    borderRadius: '20px',
    padding: '6px 16px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
};

export default BadgeEarnedEmail;
