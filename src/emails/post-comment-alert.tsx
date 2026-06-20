import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface PostCommentAlertEmailProps {
    userName: string;
    commenterName: string;
    postExcerpt: string;
    commentExcerpt: string;
    postUrl: string;
    unsubscribeUrl?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in';

export const PostCommentAlertEmail = ({
    userName,
    commenterName,
    postExcerpt,
    commentExcerpt,
    postUrl,
    unsubscribeUrl,
}: PostCommentAlertEmailProps) => (
    <EmailLayout preview={`${commenterName} commented on your post`}>
        <Heading style={heading}>Someone Commented on Your Post 💬</Heading>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
            <strong>{commenterName}</strong> left a comment on your post. Join the conversation!
        </Text>

        {/* Post excerpt */}
        <div style={postCard}>
            <Text style={sectionLabel}>YOUR POST</Text>
            <Text style={quoteText}>"{postExcerpt}"</Text>
        </div>

        {/* Comment */}
        <div style={commentCard}>
            <Text style={sectionLabel}>💬 {commenterName.toUpperCase()} COMMENTED</Text>
            <Text style={quoteText}>"{commentExcerpt}"</Text>
        </div>

        <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Link href={postUrl} style={button}>
                View &amp; Reply →
            </Link>
        </div>

        <Text style={paragraph}>
            Don't want comment notifications?{' '}
            <Link
                href={unsubscribeUrl || `${SITE_URL}/settings/notifications`}
                style={linkStyle}
            >
                Update your email preferences
            </Link>
        </Text>
    </EmailLayout>
);

const postCard = {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderLeft: '4px solid #9CA3AF',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '16px 0',
};

const commentCard = {
    backgroundColor: '#EBF5FB',
    border: '1px solid #BFDBFE',
    borderLeft: '4px solid #226CE0',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '16px 0',
};

const sectionLabel = {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: '1px',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
};

const quoteText = {
    fontSize: '15px',
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: '22px',
    margin: '0',
};

const linkStyle = {
    color: '#226CE0',
    textDecoration: 'underline',
};

export default PostCommentAlertEmail;
