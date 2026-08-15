import { Section, Text } from '@react-email/components';
import {
    CTA,
    Callout,
    EmailLayout,
    H1,
    H2,
    P,
    SITE_URL,
    Signoff,
    theme,
} from './base-layout';

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
    <EmailLayout
        preview={`Your week on VELONX: +${xpGained} XP and rank #${leaderboardPosition}`}
        eyebrow="Week in review"
    >
        <H1>Your week on VELONX</H1>

        <P>
            Hi {userName}, here&rsquo;s where things stand — and what&rsquo;s worth your time in
            the week ahead.
        </P>

        <table
            style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px', margin: '8px 0 12px' }}
            cellPadding={0}
            cellSpacing={0}
            role="presentation"
        >
            <tbody>
                <tr>
                    <td style={statCard} className="vx-card">
                        <Text style={statNumber}>{xpGained}</Text>
                        <Text style={statLabel} className="vx-muted">
                            XP this week
                        </Text>
                    </td>
                    <td style={statCard} className="vx-card">
                        <Text style={statNumber}>#{leaderboardPosition}</Text>
                        <Text style={statLabel} className="vx-muted">
                            Leaderboard
                        </Text>
                    </td>
                </tr>
                <tr>
                    <td style={statCard} className="vx-card">
                        <Text style={statNumber}>{upcomingEvents}</Text>
                        <Text style={statLabel} className="vx-muted">
                            Events ahead
                        </Text>
                    </td>
                    <td style={statCard} className="vx-card">
                        <Text style={statNumber}>{newProjects}</Text>
                        <Text style={statLabel} className="vx-muted">
                            New projects
                        </Text>
                    </td>
                </tr>
            </tbody>
        </table>

        {xpGained > 0 ? (
            <Callout icon="🏆" tone="success">
                You earned {xpGained} XP this week and you&rsquo;re sitting at #{leaderboardPosition}.
            </Callout>
        ) : (
            <Callout icon="🌱" tone="neutral">
                No XP yet this week. Joining one project or event is enough to get back on the
                board.
            </Callout>
        )}

        {upcomingEvents > 0 && (
            <Section>
                <H2>Events coming up</H2>
                <P>
                    {upcomingEvents} event{upcomingEvents > 1 ? 's are' : ' is'} open to you this
                    week — workshops and hackathons are the quickest XP on the platform.
                </P>
                <CTA href={`${SITE_URL}/events`} variant="secondary">
                    See the calendar
                </CTA>
            </Section>
        )}

        {newProjects > 0 && (
            <Section>
                <H2>Teams looking for people</H2>
                <P>
                    {newProjects} new project{newProjects > 1 ? 's' : ''} went live and{' '}
                    {newProjects > 1 ? 'are' : 'is'} recruiting collaborators.
                </P>
                <CTA href={`${SITE_URL}/projects`} variant="secondary">
                    Browse projects
                </CTA>
            </Section>
        )}

        <CTA href={`${SITE_URL}/dashboard`}>Open my dashboard</CTA>

        <Signoff />
    </EmailLayout>
);

const statCard = {
    backgroundColor: theme.surfaceMuted,
    border: `1px solid ${theme.border}`,
    borderRadius: '14px',
    padding: '22px 16px',
    textAlign: 'center' as const,
    width: '50%',
};

const statNumber = {
    color: theme.accent,
    fontFamily: '"Source Serif 4",Georgia,"Times New Roman",serif',
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: '1',
    margin: '0',
    textAlign: 'center' as const,
};

const statLabel = {
    color: theme.muted,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.9px',
    margin: '8px 0 0',
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
};

export default WeeklyDigestEmail;
