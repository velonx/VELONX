import { Text } from '@react-email/components';
import {
    CTA,
    Card,
    Chip,
    EmailLayout,
    H1,
    P,
    Signoff,
    cardText,
    cardTitle,
} from './base-layout';

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
    <EmailLayout
        preview={`${requesterName} asked to join ${projectTitle}`}
        eyebrow="Join request"
    >
        <H1>{requesterName} wants to join your project</H1>

        <P>Hi {ownerName}, someone&rsquo;s asking to help build this one.</P>

        <Card accent>
            <Text style={cardTitle} className="vx-ink">
                {projectTitle}
            </Text>
            {message ? (
                <Text style={{ ...cardText, fontStyle: 'italic', marginBottom: '14px' }} className="vx-soft">
                    &ldquo;{message}&rdquo;
                </Text>
            ) : null}
            <Chip tone="neutral">Requested by {requesterName}</Chip>
        </Card>

        <P>
            Take a look at their profile and past work, then accept or decline. Replying within
            a day or two keeps momentum on your side.
        </P>

        <CTA href={reviewUrl}>Review the request</CTA>

        <Signoff />
    </EmailLayout>
);

export default JoinRequestAlertEmail;
