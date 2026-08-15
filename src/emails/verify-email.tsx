import { A, Callout, CTA, EmailLayout, H1, P, Small, Signoff } from './base-layout';

interface VerifyEmailTemplateProps {
    userName: string;
    verificationUrl: string;
}

export const VerifyEmailTemplate = ({
    userName,
    verificationUrl,
}: VerifyEmailTemplateProps) => (
    <EmailLayout
        preview="Confirm your email to finish setting up your VELONX account"
        eyebrow="Confirm your email"
    >
        <H1>One tap and you&rsquo;re in, {userName}</H1>

        <P>
            Confirming your address activates your account — projects, mentor sessions,
            events and job alerts all unlock once it&rsquo;s done.
        </P>

        <CTA href={verificationUrl}>Confirm email address</CTA>

        <Callout icon="⏳">This link works for the next 24 hours, then it expires.</Callout>

        <P>
            Didn&rsquo;t sign up for VELONX? Ignore this email — nothing is created until the
            link is used.
        </P>

        <Small>
            Button not working? Paste this into your browser:{' '}
            <A href={verificationUrl} style={{ wordBreak: 'break-all' }}>
                {verificationUrl}
            </A>
        </Small>

        <Signoff />
    </EmailLayout>
);

export default VerifyEmailTemplate;
