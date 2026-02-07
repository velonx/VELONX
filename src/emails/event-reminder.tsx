import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph, highlight } from './base-layout';

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
        <EmailLayout preview={`Reminder: ${eventTitle} starts tomorrow!`}>
            <Heading style={heading}>Event Reminder ⏰</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <div style={highlight}>
                <Text style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#92400e' }}>
                    {eventTitle} starts tomorrow!
                </Text>
            </div>

            <Text style={paragraph}>
                Just a friendly reminder that you're registered for:
            </Text>

            <div style={eventCard}>
                <Text style={eventCardTitle}>{eventTitle}</Text>
                <Text style={eventCardDetail}>📅 {formattedDate}</Text>
                {eventLocation && <Text style={eventCardDetail}>📍 {eventLocation}</Text>}
                {meetingLink && <Text style={eventCardDetail}>🔗 Virtual event</Text>}
            </div>

            {meetingLink ? (
                <>
                    <Text style={paragraph}>
                        The event is virtual. Click the button below to join:
                    </Text>
                    <Link href={meetingLink} style={button}>
                        Join Meeting
                    </Link>
                </>
            ) : (
                <>
                    <Text style={paragraph}>
                        Make sure to arrive a few minutes early!
                    </Text>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/events`}
                        style={button}
                    >
                        View Event Details
                    </Link>
                </>
            )}

            <Text style={paragraph}>
                Looking forward to seeing you!
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

export default EventReminderEmail;
