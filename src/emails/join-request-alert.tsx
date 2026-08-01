import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface JoinRequestAlertEmailProps {
    ownerName: string;
    requesterName: string;
    projectTitle: string;
    message?: string;
    reviewUrl: string;
}

export const JoinRequestAlertEmail = ({
    ownerName,
    requesterName,
    projectTitle,
    message,
    reviewUrl,
}: JoinRequestAlertEmailProps) => (
    <EmailLayout preview={`${requesterName} wants to join ${projectTitle}`}>
        <Heading style={heading}>New Join Request 🙌</Heading>

        <Text style={paragraph}>Hi {ownerName},</Text>

        <Text style={paragraph}>
            <strong>{requesterName}</strong> has requested to join your project:
        </Text>

        <div style={projectCard}>
            <Text style={projectCardTitle}>{projectTitle}</Text>
            {message ? (
                <Text style={projectCardDescription}>“{message}”</Text>
            ) : null}
            <div style={userTag}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '28px', fontSize: '16px' }}>👤</td>
                            <td style={userTagText}>Requested by: <strong>{requesterName}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <Text style={paragraph}>
            Review this request from your dashboard to accept the new member or decline it.
        </Text>

        <div style={{ margin: '24px 0' }}>
            <Link href={reviewUrl} style={button}>
                Review Join Request
            </Link>
        </div>

        <Text style={paragraph}>
            Happy building!
            <br />
            <strong>The VELONX Team</strong>
        </Text>
    </EmailLayout>
);

const projectCard = {
    backgroundColor: '#F0F7FF',
    border: '1px solid #D0E5FF',
    borderLeft: '5px solid #226CE0',
    padding: '24px',
    borderRadius: '12px',
    margin: '24px 0',
};

const projectCardTitle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 12px',
};

const projectCardDescription = {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '20px',
    margin: '0 0 16px',
    fontStyle: 'italic',
};

const userTag = {
    backgroundColor: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'inline-block',
};

const userTagText = {
    fontSize: '13px',
    color: '#4B5563',
    margin: '0',
};

export default JoinRequestAlertEmail;
