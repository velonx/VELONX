import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface SessionConfirmationEmailProps {
    userName: string;
    mentorName: string;
    sessionDate: Date;
    meetingLink: string;
}

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
        <EmailLayout preview={`Mentorship session confirmed with ${mentorName}`}>
            <Heading style={heading}>Session Confirmed! 🎯</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
                Your mentorship session with <strong>{mentorName}</strong> has been confirmed!
            </Text>

            <div style={sessionCard}>
                <Text style={sessionCardTitle}>Session Details</Text>
                <Text style={sessionCardDetail}>👤 Mentor: {mentorName}</Text>
                <Text style={sessionCardDetail}>📅 {formattedDate}</Text>
                <Text style={sessionCardDetail}>🔗 Virtual Meeting</Text>
            </div>

            <Text style={paragraph}>
                Prepare any questions you'd like to discuss with your mentor. Make the most of this opportunity to learn and grow!
            </Text>

            <Link href={meetingLink} style={button}>
                Join Session
            </Link>

            <Text style={smallText}>
                Meeting Link: <Link href={meetingLink} style={linkStyle}>{meetingLink}</Link>
            </Text>

            <div style={tipBox}>
                <Text style={tipTitle}>💡 Pro Tips:</Text>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li style={tipItem}>Prepare questions in advance</li>
                    <li style={tipItem}>Have your projects ready to share</li>
                    <li style={tipItem}>Take notes during the session</li>
                    <li style={tipItem}>Join 5 minutes early</li>
                </ul>
            </div>

            <Text style={paragraph}>
                See you soon!
                <br />
                The VELONX Team
            </Text>
        </EmailLayout>
    );
};

const sessionCard = {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    borderLeft: '4px solid #219EBC',
};

const sessionCardTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#023047',
    margin: '0 0 12px',
};

const sessionCardDetail = {
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

const tipBox = {
    backgroundColor: '#eff6ff',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0',
    borderLeft: '4px solid #3b82f6',
};

const tipTitle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: '0 0 4px',
};

const tipItem = {
    fontSize: '14px',
    color: '#374151',
    margin: '4px 0',
};

export default SessionConfirmationEmail;
