import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
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
            <strong>{inviterName}</strong> has invited you to collaborate on an exciting project!
        </Text>

        <div style={projectCard}>
            <Text style={projectCardTitle}>{projectTitle}</Text>
            <Text style={projectCardDescription}>{projectDescription}</Text>
            <Text style={projectCardMeta}>👤 Invited by: {inviterName}</Text>
        </div>

        <Text style={paragraph}>
            This is a great opportunity to:
        </Text>

        <ul>
            <li style={listItem}>Build something impactful</li>
            <li style={listItem}>Learn new skills</li>
            <li style={listItem}>Collaborate with talented peers</li>
            <li style={listItem}>Expand your portfolio</li>
        </ul>

        <Link
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/projects`}
            style={button}
        >
            View Project Invite
        </Link>

        <Text style={paragraph}>
            Ready to build something amazing?
            <br />
            The VELONX Team
        </Text>
    </EmailLayout>
);

const projectCard = {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    borderLeft: '4px solid #219EBC',
};

const projectCardTitle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#023047',
    margin: '0 0 12px',
};

const projectCardDescription = {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '20px',
    margin: '0 0 12px',
};

const projectCardMeta = {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0',
};

const listItem = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '8px',
};

export default ProjectInviteEmail;
