import { CTA, Card, Chip, EmailLayout, H1, P, SITE_URL, Signoff } from './base-layout';

interface ConnectionRequestEmailProps {
    receiverName: string;
    senderName: string;
    senderHeadline?: string;
}

export const ConnectionRequestEmail = ({
    receiverName,
    senderName,
    senderHeadline,
}: ConnectionRequestEmailProps) => (
    <EmailLayout
        preview={`${senderName} wants to connect with you on VELONX`}
        eyebrow="Connection request"
    >
        <H1>{senderName} wants to connect</H1>

        <P>
            Hi {receiverName}, you have a new connection request waiting in your network.
        </P>

        <Card accent>
            <P style={{ margin: '0 0 12px', fontSize: '15px' }}>
                <strong>{senderName}</strong>
                {senderHeadline ? ` — ${senderHeadline}` : ''} would like to join your network.
            </P>
            <Chip tone="neutral">Pending your response</Chip>
        </Card>

        <P>
            Take a look at their profile before you decide — the connections worth keeping are
            the ones you&rsquo;d actually message.
        </P>

        <CTA href={`${SITE_URL}/network?tab=requests`}>Review the request</CTA>

        <Signoff />
    </EmailLayout>
);

export default ConnectionRequestEmail;
