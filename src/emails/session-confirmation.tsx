import { Heading, Link, Text } from '@react-email/components';
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
                Your mentorship session with <strong>{mentorName}</strong> has been confirmed! Here are the session details:
            </Text>

            <div style={sessionCard}>
                <Text style={sessionCardTitle}>Session Details</Text>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={detailIconCol}>👤</td>
                            <td style={detailTextCol}>Mentor: <strong>{mentorName}</strong></td>
                        </tr>
                        <tr>
                            <td style={detailIconCol}>📅</td>
                            <td style={detailTextCol}>{formattedDate}</td>
                        </tr>
                        <tr>
                            <td style={detailIconCol}>🔗</td>
                            <td style={detailTextCol}>Virtual meeting session link provided below</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Text style={paragraph}>
                Make sure to prepare any questions you'd like to discuss. Let's make this session as productive as possible!
            </Text>

            <div style={meetingContainer}>
                <Text style={{ ...paragraph, margin: '0 0 12px', fontWeight: '600' }}>
                    To join the live session, click below:
                </Text>
                <Link href={meetingLink} style={button}>
                    Join Meeting
                </Link>
                <Text style={smallText}>
                    Or copy the direct link: <Link href={meetingLink} style={linkStyle}>{meetingLink}</Link>
                </Text>
            </div>

            <div style={tipBox}>
                <Text style={tipTitle}>💡 Pro Tips for a Great Session:</Text>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={tipCheck}>✓</td>
                            <td style={tipText}>Prepare your questions and goals in advance</td>
                        </tr>
                        <tr>
                            <td style={tipCheck}>✓</td>
                            <td style={tipText}>Have your projects or code ready to screenshare</td>
                        </tr>
                        <tr>
                            <td style={tipCheck}>✓</td>
                            <td style={tipText}>Bring a notepad to take notes during the session</td>
                        </tr>
                        <tr>
                            <td style={tipCheck}>✓</td>
                            <td style={tipText}>Join the meeting 5 minutes early to test your setup</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Text style={{ ...paragraph, marginTop: '24px' }}>
                See you soon!
                <br />
                <strong>The VELONX Team</strong>
            </Text>
        </EmailLayout>
    );
};

const sessionCard = {
    backgroundColor: '#F0F7FF',
    border: '1px solid #D0E5FF',
    borderLeft: '5px solid #226CE0',
    padding: '24px',
    borderRadius: '12px',
    margin: '24px 0',
};

const sessionCardTitle = {
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

const tipBox = {
    backgroundColor: '#eff6ff',
    padding: '20px 24px',
    borderRadius: '12px',
    margin: '24px 0',
    borderLeft: '4px solid #226CE0',
};

const tipTitle = {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 12px',
};

const tipCheck = {
    width: '20px',
    fontSize: '14px',
    color: '#226CE0',
    fontWeight: 'bold',
    padding: '6px 0',
    verticalAlign: 'top',
};

const tipText = {
    fontSize: '13px',
    color: '#4B5563',
    padding: '6px 0 6px 8px',
    verticalAlign: 'top',
    lineHeight: '18px',
};

export default SessionConfirmationEmail;
