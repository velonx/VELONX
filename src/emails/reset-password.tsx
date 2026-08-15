import {
    A,
    Callout,
    CTA,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Small,
    Signoff,
} from './base-layout';

interface ResetPasswordEmailProps {
    userName: string;
    resetUrl: string;
}

export const ResetPasswordEmail = ({
    userName,
    resetUrl,
}: ResetPasswordEmailProps) => (
    <EmailLayout
        preview="Reset your VELONX password — this link expires in 1 hour"
        eyebrow="Account security"
    >
        <H1>Set a new password</H1>

        <P>
            Hi {userName}, someone asked to reset the password for your VELONX account.
            If that was you, choose a new one here:
        </P>

        <CTA href={resetUrl}>Reset my password</CTA>

        <Callout icon="⏳">
            For your security, this link expires in 1 hour and can only be used once.
        </Callout>

        <P>
            If you didn&rsquo;t make this request, no action is needed — your current password
            still works. Seeing resets you didn&rsquo;t ask for?{' '}
            <A href={`${SITE_URL}/support`}>Tell our support team</A> and we&rsquo;ll lock things
            down with you.
        </P>

        <Small>
            Button not working? Paste this into your browser:{' '}
            <A href={resetUrl} style={{ wordBreak: 'break-all' }}>
                {resetUrl}
            </A>
        </Small>

        <Signoff />
    </EmailLayout>
);

export default ResetPasswordEmail;
