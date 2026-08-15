import { Text } from '@react-email/components';
import {
    A,
    CTA,
    Card,
    DetailList,
    EmailLayout,
    H1,
    H2,
    P,
    Small,
    Signoff,
    cardTitle,
    theme,
} from './base-layout';

interface SessionConfirmationEmailProps {
    userName: string;
    mentorName: string;
    sessionDate: Date;
    meetingLink: string;
}

const prep = [
    'Write down the two or three questions you most want answered.',
    'Have the project, code or resume you want feedback on open and ready to share.',
    'Join a few minutes early and check your mic and camera.',
    'Take notes — you will not remember the good parts otherwise.',
];

export const SessionConfirmationEmail = ({
    userName,
    mentorName,
    sessionDate,
    meetingLink,
}: SessionConfirmationEmailProps) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).format(sessionDate);

    return (
        <EmailLayout
            preview={`Your mentor session with ${mentorName} is confirmed`}
            eyebrow="Session confirmed"
        >
            <H1>You&rsquo;re booked with {mentorName}</H1>

            <P>
                Hi {userName}, your mentorship session is confirmed. Here&rsquo;s when and where —
                add it to your calendar so it doesn&rsquo;t sneak up on you.
            </P>

            <Card accent>
                <Text style={cardTitle} className="vx-ink">
                    Session details
                </Text>
                <DetailList
                    items={[
                        { icon: '👤', children: <>Mentor: <strong>{mentorName}</strong></> },
                        { icon: '🗓️', children: formattedDate },
                        { icon: '🔗', children: 'Online — join link below' },
                    ]}
                />
            </Card>

            <CTA href={meetingLink}>Join the session</CTA>

            <Small>
                Direct link:{' '}
                <A href={meetingLink} style={{ wordBreak: 'break-all' }}>
                    {meetingLink}
                </A>
            </Small>

            <H2>Get the most out of your 30 minutes</H2>

            {prep.map((tip) => (
                <Text key={tip} style={tipLine} className="vx-soft">
                    <span style={tipMark}>→</span>
                    {tip}
                </Text>
            ))}

            <P>
                Plans changed? Reschedule from your dashboard as early as you can — mentors give
                this time for free.
            </P>

            <Signoff />
        </EmailLayout>
    );
};

const tipLine = {
    borderTop: `1px solid ${theme.borderSoft}`,
    color: theme.warmGray,
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0',
    padding: '12px 0',
};

const tipMark = {
    color: theme.accent,
    fontWeight: 700,
    paddingRight: '10px',
};

export default SessionConfirmationEmail;
