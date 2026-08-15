import { Text } from '@react-email/components';
import {
    A,
    CTA,
    Card,
    DetailList,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Small,
    Signoff,
    cardText,
    cardTitle,
} from './base-layout';

interface EventConfirmationEmailProps {
    userName: string;
    eventTitle: string;
    eventDescription: string;
    eventDate: Date;
    eventLocation?: string;
    meetingLink?: string;
}

export const EventConfirmationEmail = ({
    userName,
    eventTitle,
    eventDescription,
    eventDate,
    eventLocation,
    meetingLink,
}: EventConfirmationEmailProps) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    }).format(eventDate);

    return (
        <EmailLayout
            preview={`Your seat is booked for ${eventTitle}`}
            eyebrow="Registration confirmed"
        >
            <H1>Your seat is booked</H1>

            <P>
                Hi {userName}, you&rsquo;re registered for <strong>{eventTitle}</strong>. Here are
                the details — add them to your calendar now so they don&rsquo;t slip.
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

            <Text style={cardText} className="vx-soft">
                {eventDescription}
            </Text>

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
                <CTA href={`${SITE_URL}/events`}>View event details</CTA>
            )}

            <P>We&rsquo;ll send a reminder 24 hours before it starts. See you there.</P>

            <Signoff />
        </EmailLayout>
    );
};

export default EventConfirmationEmail;
