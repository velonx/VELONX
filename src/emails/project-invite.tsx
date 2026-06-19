import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface ProjectInviteEmailProps {
    inviteeName: string;
    inviterName: string;
    projectTitle: string;
    projectDescription: string;
}

export const ProjectInviteEmail = ({
    inviteeName,
    inviterName,
    projectTitle,
    projectDescription,
}: ProjectInviteEmailProps) => (
    <EmailLayout preview={`You've been invited to collaborate on ${projectTitle}`}>
        <Heading style={heading}>You've Got a Project Invite! 🚀</Heading>

        <Text style={paragraph}>Hi {inviteeName},</Text>

        <Text style={paragraph}>
            <strong>{inviterName}</strong> has invited you to join their team and collaborate on a project:
        </Text>

        <div style={projectCard}>
            <Text style={projectCardTitle}>{projectTitle}</Text>
            <Text style={projectCardDescription}>{projectDescription}</Text>
            <div style={userTag}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '28px', fontSize: '16px' }}>👤</td>
                            <td style={userTagText}>Invited by: <strong>{inviterName}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <Text style={paragraph}>
            By joining this team, you'll be able to:
        </Text>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0 24px' }}>
            <tbody>
                <tr>
                    <td style={checkCol}>⚡</td>
                    <td style={checkTextCol}>Build an impactful project for your portfolio</td>
                </tr>
                <tr>
                    <td style={checkCol}>⚡</td>
                    <td style={checkTextCol}>Collaborate with talented developers and creators</td>
                </tr>
                <tr>
                    <td style={checkCol}>⚡</td>
                    <td style={checkTextCol}>Earn platform XP and unlock achievement badges</td>
                </tr>
                <tr>
                    <td style={checkCol}>⚡</td>
                    <td style={checkTextCol}>Receive feedback and reviews on your collaboration</td>
                </tr>
            </tbody>
        </table>

        <div style={{ margin: '24px 0' }}>
            <Link
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/projects`}
                style={button}
            >
                View Project Invitation
            </Link>
        </div>

        <Text style={paragraph}>
            Happy coding!
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

const checkCol = {
    width: '24px',
    fontSize: '14px',
    padding: '8px 0',
    verticalAlign: 'middle',
};

const checkTextCol = {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '600',
    padding: '8px 0 8px 8px',
    verticalAlign: 'middle',
};

export default ProjectInviteEmail;
