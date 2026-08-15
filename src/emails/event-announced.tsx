import { Section, Text } from '@react-email/components';
import {
    CTA,
    Card,
    Chip,
    DetailList,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Signoff,
    cardText,
    cardTitle,
} from './base-layout';

interface EventAnnouncedEmailProps {
    userName: string;
    eventTitle: string;
    eventDescription: string;
    eventDate: Date;
    eventType: string;
    location?: string;
    meetingLink?: string;
    eventId: string;
    unsubscribeUrl?: string;
}

export const EventAnnouncedEmail = ({
    userName,
    eventTitle,
    eventDescription,
    eventDate,
    eventType,
    location,
    meetingLink,
    eventId,
    unsubscribeUrl,
}: EventAnnouncedEmailProps) => {
    const formattedDate = new Date(eventDate).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    const typeLabel =
        eventType === 'HACKATHON'
            ? '⚡ Hackathon'
            : eventType === 'WORKSHOP'
            ? '🛠️ Workshop'
            : '🎙️ Webinar';

    return (
        <EmailLayout
            preview={`New on VELONX: ${eventTitle} — ${formattedDate}`}
            eyebrow="New event"
            unsubscribeUrl={unsubscribeUrl}
        >
            <Section style={{ marginBottom: '14px' }}>
                <Chip>{typeLabel}</Chip>
            </Section>

            <H1>{eventTitle}</H1>

            <P>
                Hi {userName}, a new event just went live on VELONX. Registration is open now and
                seats usually go quickly.
            </P>

            <Card accent>
                <Text style={cardTitle} className="vx-ink">
                    Event details
                </Text>
                <DetailList
                    items={[
                        { icon: '🗓️', children: formattedDate },
                        ...(location ? [{ icon: '📍', children: location }] : []),
                        ...(meetingLink ? [{ icon: '🔗', children: 'Online event' }] : []),
                    ]}
                />
            </Card>

            <Text style={cardText} className="vx-soft">
                {eventDescription}
            </Text>

            <CTA href={`${SITE_URL}/events/${eventId}`}>Save my spot</CTA>

            <Signoff />
        </EmailLayout>
    );
};

export default EventAnnouncedEmail;
