import { Text } from '@react-email/components';
import {
    CTA,
    Card,
    Chip,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Signoff,
    cardText,
    cardTitle,
    theme,
} from './base-layout';

interface ProjectInviteEmailProps {
    inviteeName: string;
    inviterName: string;
    projectTitle: string;
    projectDescription: string;
}

const perks = [
    'Ship something real you can put at the top of your portfolio',
    'Work alongside builders who push you a little',
    'Earn XP and badges that show up on your public profile',
    'Collect peer feedback you can point recruiters at',
];

export const ProjectInviteEmail = ({
    inviteeName,
    inviterName,
    projectTitle,
    projectDescription,
}: ProjectInviteEmailProps) => (
    <EmailLayout
        preview={`${inviterName} invited you to build ${projectTitle}`}
        eyebrow="Project invitation"
    >
        <H1>{inviterName} wants you on the team</H1>

        <P>
            Hi {inviteeName}, you&rsquo;ve been invited to collaborate on a project on VELONX.
        </P>

        <Card accent>
            <Text style={cardTitle} className="vx-ink">
                {projectTitle}
            </Text>
            <Text style={{ ...cardText, marginBottom: '14px' }} className="vx-soft">
                {projectDescription}
            </Text>
            <Chip tone="neutral">Invited by {inviterName}</Chip>
        </Card>

        <P>What you get out of it:</P>

        {perks.map((perk) => (
            <Text key={perk} style={perkLine} className="vx-soft">
                <span style={perkMark}>→</span>
                {perk}
            </Text>
        ))}

        <CTA href={`${SITE_URL}/projects`}>Review the invitation</CTA>

        <P>
            Not the right fit? Decline it — the owner will see your answer either way, and a
            quick no is better than silence.
        </P>

        <Signoff />
    </EmailLayout>
);

const perkLine = {
    borderTop: `1px solid ${theme.borderSoft}`,
    color: theme.warmGray,
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0',
    padding: '12px 0',
};

const perkMark = {
    color: theme.accent,
    fontWeight: 700,
    paddingRight: '10px',
};

export default ProjectInviteEmail;
