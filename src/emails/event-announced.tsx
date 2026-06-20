import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in';

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

    const typeBadgeText =
        eventType === 'HACKATHON'
            ? '⚡ Hackathon'
            : eventType === 'WORKSHOP'
            ? '🔧 Workshop'
            : '🎙️ Webinar';

    const viewUrl = `${SITE_URL}/events/${eventId}`;

    return (
        <EmailLayout preview={`New event: ${eventTitle} — ${formattedDate}`}>
            <div style={badgeContainer}>
                <span style={badge}>{typeBadgeText}</span>
            </div>

            <Heading style={heading}>New Event Just Announced 📅</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
                A new event has been published on VELONX. Don't miss out — spots may be limited!
            </Text>

            {/* Event Card */}
            <div style={card}>
                <Text style={eventTitle_style}>{eventTitle}</Text>
                <Text style={meta}>🗓️ {formattedDate}</Text>
                {location && <Text style={meta}>📍 {location}</Text>}
                {meetingLink && <Text style={meta}>🔗 Online event</Text>}
                <Text style={descText}>{eventDescription}</Text>
            </div>

            <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
                <Link href={viewUrl} style={button}>
                    View Event &amp; Register →
                </Link>
            </div>

            <Text style={paragraph}>
                Don't want event announcements?{' '}
                <Link
                    href={unsubscribeUrl || `${SITE_URL}/settings/notifications`}
                    style={linkStyle}
                >
                    Update your email preferences
                </Link>
            </Text>
        </EmailLayout>
    );
};

const badgeContainer = {
    textAlign: 'center' as const,
    marginBottom: '16px',
};

const badge = {
    backgroundColor: '#EDE9FE',
    color: '#5B21B6',
    borderRadius: '20px',
    padding: '4px 16px',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'inline-block',
};

const card = {
    backgroundColor: '#F5F3FF',
    border: '1px solid #DDD6FE',
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '20px 0',
};

const eventTitle_style = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 12px',
};

const meta = {
    fontSize: '14px',
    color: '#4B5563',
    margin: '4px 0',
};

const descText = {
    fontSize: '14px',
    color: '#6B7280',
    margin: '16px 0 0',
    lineHeight: '22px',
};

const linkStyle = {
    color: '#226CE0',
    textDecoration: 'underline',
};

export default EventAnnouncedEmail;
