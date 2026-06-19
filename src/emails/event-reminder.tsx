import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

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

            <div style={reminderAlert}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ fontSize: '20px', width: '28px', verticalAlign: 'middle' }}>🔔</td>
                            <td style={reminderAlertText}>
                                <strong>{eventTitle}</strong> starts tomorrow!
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Text style={paragraph}>
                This is a quick reminder that you are registered to attend the following event:
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
                                <td style={detailTextCol}>Virtual event session link provided below</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {meetingLink ? (
                <div style={meetingContainer}>
                    <Text style={{ ...paragraph, margin: '0 0 12px', fontWeight: '600' }}>
                        To join the live stream or meeting room, click below:
                    </Text>
                    <Link href={meetingLink} style={button}>
                        Join Meeting
                    </Link>
                    <Text style={smallText}>
                        Or copy the direct link: <Link href={meetingLink} style={linkStyle}>{meetingLink}</Link>
                    </Text>
                </div>
            ) : (
                <div style={detailsContainer}>
                    <Text style={{ ...paragraph, margin: '0 0 12px' }}>
                        Need directions or want to read more about the schedule?
                    </Text>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/events`}
                        style={button}
                    >
                        View Event Details
                    </Link>
                </div>
            )}

            <Text style={{ ...paragraph, marginTop: '24px' }}>
                Looking forward to seeing you there!
                <br />
                <strong>The VELONX Team</strong>
            </Text>
        </EmailLayout>
    );
};

const reminderAlert = {
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    padding: '16px 20px',
    margin: '20px 0 28px',
};

const reminderAlertText = {
    fontSize: '15px',
    color: '#92400e',
    margin: '0',
    verticalAlign: 'middle',
    lineHeight: '20px',
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

const detailsContainer = {
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

export default EventReminderEmail;
