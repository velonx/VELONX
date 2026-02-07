import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph, highlight } from './base-layout';

interface ResetPasswordEmailProps {
    userName: string;
    resetUrl: string;
}

export const ResetPasswordEmail = ({
    userName,
    resetUrl,
}: ResetPasswordEmailProps) => (
    <EmailLayout preview="Reset your VELONX password">
        <Heading style={heading}>Reset Your Password</Heading>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
            We received a request to reset your password for your VELONX account. Click the button below to create a new password:
        </Text>

        <Link href={resetUrl} style={button}>
            Reset Password
        </Link>

        <div style={highlight}>
            <Text style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                ⏰ This link will expire in 1 hour for security reasons.
            </Text>
        </div>

        <Text style={paragraph}>
            If you didn't request a password reset, please ignore this email or{' '}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/support`} style={linkStyle}>
                contact support
            </Link>{' '}
            if you have concerns.
        </Text>

        <Text style={smallText}>
            Or copy and paste this URL into your browser:{' '}
            <Link href={resetUrl} style={linkStyle}>
                {resetUrl}
            </Link>
        </Text>

        <Text style={paragraph}>
            Best,
            <br />
            The VELONX Team
        </Text>
    </EmailLayout>
);

const smallText = {
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '16px 0 0',
};

const linkStyle = {
    color: '#219EBC',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
};

export default ResetPasswordEmail;
