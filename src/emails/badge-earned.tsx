import { Section, Text } from '@react-email/components';
import { CTA, EmailLayout, H1, P, SITE_URL, Signoff, theme } from './base-layout';

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
    <EmailLayout
        preview={`You earned the ${badgeName} badge (+${xpAwarded} XP)`}
        eyebrow="Achievement unlocked"
    >
        <H1>Nice work, {userName}</H1>

        <P>
            You just earned a new badge on VELONX. It&rsquo;s now on your public profile, where
            teammates and recruiters can see it.
        </P>

        <Section style={badgeCard} className="vx-card">
            <Section style={{ textAlign: 'center' }}>
                <span style={iconCircle}>{badgeIcon}</span>
                <Text style={badgeTitle} className="vx-ink">
                    {badgeName}
                </Text>
                <Text style={badgeDesc} className="vx-soft">
                    {badgeDescription}
                </Text>
                <span style={xpPill}>+{xpAwarded} XP</span>
            </Section>
        </Section>

        <P>
            Every project shipped, event attended and session completed moves you up the
            leaderboard. Keep the streak going.
        </P>

        <CTA href={`${SITE_URL}/dashboard`} align="center">
            View my badges
        </CTA>

        <Signoff />
    </EmailLayout>
);

const badgeCard = {
    backgroundColor: theme.surfaceMuted,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    margin: '24px 0',
    padding: '32px 24px',
    textAlign: 'center' as const,
};

const iconCircle = {
    backgroundColor: theme.accentSoft,
    border: `1px solid ${theme.accentBorder}`,
    borderRadius: '999px',
    display: 'inline-block',
    fontSize: '34px',
    height: '72px',
    lineHeight: '72px',
    textAlign: 'center' as const,
    width: '72px',
};

const badgeTitle = {
    color: theme.ink,
    fontFamily: '"Source Serif 4",Georgia,"Times New Roman",serif',
    fontSize: '24px',
    lineHeight: '32px',
    margin: '18px 0 6px',
    textAlign: 'center' as const,
};

const badgeDesc = {
    color: theme.warmGray,
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 18px',
    textAlign: 'center' as const,
};

const xpPill = {
    backgroundColor: theme.accent,
    borderRadius: '999px',
    color: '#FFFFFF',
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.8px',
    padding: '6px 16px',
    textTransform: 'uppercase' as const,
};

export default BadgeEarnedEmail;
