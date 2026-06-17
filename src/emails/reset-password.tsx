import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

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
            We received a request to reset the password associated with your VELONX account. If you made this request, please click the button below to secure a new password:
        </Text>

        <div style={{ margin: '24px 0' }}>
            <Link href={resetUrl} style={button}>
                Reset Password
            </Link>
        </div>

        <div style={warningAlert}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ fontSize: '18px', width: '24px', verticalAlign: 'middle' }}>⏰</td>
                        <td style={warningAlertText}>
                            For security reasons, this link will expire in <strong>1 hour</strong>.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Text style={paragraph}>
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and secure. If you believe your account has been compromised, please{' '}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/support`} style={linkStyle}>
                contact support
            </Link>.
        </Text>

        <Text style={smallText}>
            Or copy and paste this URL into your browser:{' '}
            <Link href={resetUrl} style={linkStyle}>
                {resetUrl}
            </Link>
        </Text>

        <Text style={paragraph}>
            Warm regards,
            <br />
            <strong>The VELONX Team</strong>
        </Text>
    </EmailLayout>
);

const warningAlert = {
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    padding: '16px 20px',
    margin: '24px 0',
};

const warningAlertText = {
    fontSize: '14px',
    color: '#92400e',
    margin: '0',
    verticalAlign: 'middle',
    lineHeight: '20px',
};

const smallText = {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '18px',
    margin: '24px 0 0',
};

const linkStyle = {
    color: '#226CE0',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
};

export default ResetPasswordEmail;
