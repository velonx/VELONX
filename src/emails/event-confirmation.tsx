import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph } from './base-layout';

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
        <EmailLayout preview={`You're registered for ${eventTitle}`}>
            <Heading style={heading}>You're All Set! 🎉</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
                You've successfully registered for <strong>{eventTitle}</strong>.
            </Text>

            <div style={eventCard}>
                <Text style={eventCardTitle}>{eventTitle}</Text>
                <Text style={eventCardDetail}>📅 {formattedDate}</Text>
                {eventLocation && <Text style={eventCardDetail}>📍 {eventLocation}</Text>}
                {meetingLink && <Text style={eventCardDetail}>🔗 Virtual event</Text>}
            </div>

            <Text style={paragraph}>{eventDescription}</Text>

            {meetingLink && (
                <>
                    <Link href={meetingLink} style={button}>
                        Join Meeting
                    </Link>
                    <Text style={smallText}>
                        Meeting Link: <Link href={meetingLink} style={linkStyle}>{meetingLink}</Link>
                    </Text>
                </>
            )}

            <Link
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/events`}
                style={button}
            >
                View Event Details
            </Link>

            <Text style={paragraph}>
                We'll send you a reminder 24 hours before the event starts.
            </Text>

            <Text style={paragraph}>
                See you there!
                <br />
                The VELONX Team
            </Text>
        </EmailLayout>
    );
};

const eventCard = {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    borderLeft: '4px solid #219EBC',
};

const eventCardTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#023047',
    margin: '0 0 12px',
};

const eventCardDetail = {
    fontSize: '14px',
    color: '#374151',
    margin: '4px 0',
};

const smallText = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '12px 0',
};

const linkStyle = {
    color: '#219EBC',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
};

export default EventConfirmationEmail;
