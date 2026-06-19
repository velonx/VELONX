import { Heading, Link, Text } from '@react-email/components';
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
                You've successfully registered for <strong>{eventTitle}</strong>. Here are the event details:
            </Text>

            <div style={eventCard}>
                <Text style={eventCardTitle}>{eventTitle}</Text>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={detailIconCol}>📅</td>
                            <td style={detailTextCol}>{formattedDate}</td>
                        </tr>
                        {eventLocation && (
                            <tr>
                                <td style={detailIconCol}>📍</td>
                                <td style={detailTextCol}>{eventLocation}</td>
                            </tr>
                        )}
                        {meetingLink && (
                            <tr>
                                <td style={detailIconCol}>🔗</td>
                                <td style={detailTextCol}>Virtual meeting link provided below</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Text style={paragraph}>{eventDescription}</Text>

            {meetingLink && (
                <div style={meetingContainer}>
                    <Text style={{ ...paragraph, margin: '0 0 12px', fontWeight: '600' }}>
                        Join the virtual session:
                    </Text>
                    <Link href={meetingLink} style={button}>
                        Join Meeting
                    </Link>
                    <Text style={smallText}>
                        Or copy the direct link: <Link href={meetingLink} style={linkStyle}>{meetingLink}</Link>
                    </Text>
                </div>
            )}

            {!meetingLink && (
                <Link
                    href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/events`}
                    style={button}
                >
                    View Event Dashboard
                </Link>
            )}

            <Text style={{ ...paragraph, marginTop: '24px' }}>
                We'll send you a reminder 24 hours before the event starts. See you there!
            </Text>

            <Text style={paragraph}>
                Best regards,
                <br />
                <strong>The VELONX Team</strong>
            </Text>
        </EmailLayout>
    );
};

const eventCard = {
    backgroundColor: '#F0F7FF',
    border: '1px solid #D0E5FF',
    borderLeft: '5px solid #226CE0',
    padding: '24px',
    borderRadius: '12px',
    margin: '24px 0',
};

const eventCardTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 16px',
};

const detailIconCol = {
    width: '24px',
    fontSize: '16px',
    padding: '6px 0',
    verticalAlign: 'top',
};

const detailTextCol = {
    fontSize: '14px',
    color: '#374151',
    padding: '6px 0 6px 8px',
    verticalAlign: 'top',
    lineHeight: '20px',
};

const meetingContainer = {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '20px',
    margin: '24px 0',
};

const smallText = {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '18px',
    margin: '12px 0 0',
};

const linkStyle = {
    color: '#226CE0',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
};

export default EventConfirmationEmail;
