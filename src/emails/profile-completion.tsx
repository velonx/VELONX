import { Text } from '@react-email/components';
import {
    CTA,
    Callout,
    Card,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Signoff,
    theme,
} from './base-layout';

interface ProfileCompletionEmailProps {
    userName: string;
}

const unlocks = [
    {
        title: 'Job and internship matching',
        body: 'Our matcher reads your skills, projects and resume to surface openings meant for you. Blank fields mean no matches.',
    },
    {
        title: 'Being findable',
        body: 'Recruiters, mentors and project owners search by skill and college. A complete profile is how they land on yours.',
    },
    {
        title: 'Recommendations that fit',
        body: 'Learning paths, events and mentors picked from your actual interests instead of generic defaults.',
    },
];

export const ProfileCompletionEmail = ({ userName }: ProfileCompletionEmailProps) => (
    <EmailLayout
        preview="Two minutes on your profile unlocks matching, networking and recommendations"
        eyebrow="Finish your profile"
    >
        <H1>Your profile is almost there, {userName}</H1>

        <P>
            A few fields are still empty — and those fields are exactly what VELONX uses to
            connect you with work. Two minutes fixes it.
        </P>

        {unlocks.map((item) => (
            <Card key={item.title}>
                <Text style={itemTitle} className="vx-ink">
                    {item.title}
                </Text>
                <Text style={itemBody} className="vx-soft">
                    {item.body}
                </Text>
            </Card>
        ))}

        <Callout icon="🎯">
            Profiles with skills, a project and a resume get shortlisted several times more often
            than empty ones.
        </Callout>

        <CTA href={`${SITE_URL}/dashboard`}>Finish my profile</CTA>

        <P>Not sure what to write? Start with your skills — the rest gets easier from there.</P>

        <Signoff />
    </EmailLayout>
);

const itemTitle = {
    color: theme.ink,
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '22px',
    margin: '0 0 6px',
};

const itemBody = {
    color: theme.warmGray,
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
};

export default ProfileCompletionEmail;
