import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph, highlight } from './base-layout';

interface VerifyEmailTemplateProps {
    userName: string;
    verificationUrl: string;
}

export const VerifyEmailTemplate = ({
    userName,
    verificationUrl,
}: VerifyEmailTemplateProps) => (
    <EmailLayout preview="Verify your VELONX email address">
        <Heading style={heading}>Verify Your Email, {userName}</Heading>

        <Text style={paragraph}>
            Thanks for signing up! Please verify your email address to complete your registration and unlock all VELONX features.
        </Text>

        <Link href={verificationUrl} style={button}>
            Verify Email Address
        </Link>

        <div style={highlight}>
            <Text style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                ⏰ This link will expire in 24 hours for security reasons.
            </Text>
        </div>

        <Text style={paragraph}>
            If you didn't create an account on VELONX, you can safely ignore this email.
        </Text>

        <Text style={smallText}>
            Or copy and paste this URL into your browser:{' '}
            <Link href={verificationUrl} style={linkStyle}>
                {verificationUrl}
            </Link>
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

export default VerifyEmailTemplate;
