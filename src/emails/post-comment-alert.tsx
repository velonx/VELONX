import { Section, Text } from '@react-email/components';
import {
    CTA,
    EmailLayout,
    H1,
    P,
    SectionLabel,
    Signoff,
    theme,
} from './base-layout';

interface PostCommentAlertEmailProps {
    userName: string;
    commenterName: string;
    postExcerpt: string;
    commentExcerpt: string;
    postUrl: string;
    unsubscribeUrl?: string;
}

export const PostCommentAlertEmail = ({
    userName,
    commenterName,
    postExcerpt,
    commentExcerpt,
    postUrl,
    unsubscribeUrl,
}: PostCommentAlertEmailProps) => (
    <EmailLayout
        preview={`${commenterName} replied to your post`}
        eyebrow="New comment"
        unsubscribeUrl={unsubscribeUrl}
    >
        <H1>{commenterName} replied to your post</H1>

        <P>Hi {userName}, your post got a response in the community.</P>

        <Section style={quoteBlockMuted} className="vx-card">
            <SectionLabel>Your post</SectionLabel>
            <Text style={quoteText} className="vx-soft">
                {postExcerpt}
            </Text>
        </Section>

        <Section style={quoteBlockAccent} className="vx-card-accent">
            <SectionLabel>{commenterName} said</SectionLabel>
            <Text style={quoteText} className="vx-soft">
                {commentExcerpt}
            </Text>
        </Section>

        <CTA href={postUrl}>Read &amp; reply</CTA>

        <Signoff />
    </EmailLayout>
);

const quoteBlockMuted = {
    backgroundColor: theme.surfaceMuted,
    borderLeft: `3px solid ${theme.border}`,
    borderRadius: '4px 12px 12px 4px',
    margin: '18px 0',
    padding: '16px 20px',
};

const quoteBlockAccent = {
    backgroundColor: theme.accentSoft,
    borderLeft: `3px solid ${theme.accent}`,
    borderRadius: '4px 12px 12px 4px',
    margin: '18px 0',
    padding: '16px 20px',
};

const quoteText = {
    color: theme.warmGray,
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0',
};

export default PostCommentAlertEmail;
