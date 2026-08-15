import { CTA, Card, Chip, EmailLayout, H1, P, SITE_URL, Signoff } from './base-layout';

interface DirectMessageEmailProps {
    receiverName: string;
    senderName: string;
}

/**
 * Deliberately excludes the message body — the notification says who wrote,
 * never what they wrote. Reading happens in the app.
 */
export const DirectMessageEmail = ({
    receiverName,
    senderName,
}: DirectMessageEmailProps) => (
    <EmailLayout
        preview={`${senderName} sent you a message on VELONX`}
        eyebrow="New message"
    >
        <H1>{senderName} sent you a message</H1>

        <P>Hi {receiverName}, you have an unread message waiting in your inbox.</P>

        <Card accent>
            <P style={{ margin: '0 0 12px', fontSize: '15px' }}>
                <strong>{senderName}</strong> messaged you on VELONX. Open the conversation to
                read it and reply.
            </P>
            <Chip tone="neutral">Unread</Chip>
        </Card>

        <CTA href={`${SITE_URL}/messages`}>View Message</CTA>

        <P>
            We only email you about the first message from someone each day, so your inbox
            stays calm.
        </P>

        <Signoff />
    </EmailLayout>
);

export default DirectMessageEmail;
