import { Text } from '@react-email/components';
import {
    A,
    CTA,
    Callout,
    Card,
    DetailList,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Small,
    Signoff,
    cardTitle,
} from './base-layout';

interface EventReminderEmailProps {
    userName: string;
    eventTitle: string;
    eventDate: Date;
    eventLocation?: string;
    meetingLink?: string;
}

export const EventReminderEmail = ({
    userName,
    eventTitle,
    eventDate,
    eventLocation,
    meetingLink,
}: EventReminderEmailProps) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).format(eventDate);

    return (
        <EmailLayout
            preview={`${eventTitle} starts tomorrow — here's everything you need`}
            eyebrow="Starts tomorrow"
        >
            <H1>Tomorrow: {eventTitle}</H1>

            <P>
                Hi {userName}, a quick nudge — you&rsquo;re registered for this one and it starts
                tomorrow.
            </P>

            <Card accent>
                <Text style={cardTitle} className="vx-ink">
                    {eventTitle}
                </Text>
                <DetailList
                    items={[
                        { icon: '🗓️', children: formattedDate },
                        ...(eventLocation ? [{ icon: '📍', children: eventLocation }] : []),
                        ...(meetingLink
                            ? [{ icon: '🔗', children: 'Online — join link below' }]
                            : []),
                    ]}
                />
            </Card>

            {meetingLink ? (
                <>
                    <CTA href={meetingLink}>Join the session</CTA>
                    <Small>
                        Direct link:{' '}
                        <A href={meetingLink} style={{ wordBreak: 'break-all' }}>
                            {meetingLink}
                        </A>
                    </Small>
                </>
            ) : (
                <CTA href={`${SITE_URL}/events`}>Check schedule &amp; directions</CTA>
            )}

            <Callout icon="💡" tone="neutral">
                Arrive a few minutes early, and bring one question you want answered — the people
                who ask get the most out of these.
            </Callout>

            <P>Can&rsquo;t make it? Cancel your spot so someone on the waitlist can take it.</P>

            <Signoff />
        </EmailLayout>
    );
};

export default EventReminderEmail;
