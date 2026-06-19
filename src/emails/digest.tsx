import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, paragraph } from './base-layout';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DigestEvent {
    id: string;
    title: string;
    date: Date;
    location?: string;
}

export interface DigestProject {
    id: string;
    title: string;
    status: string;
}

export interface DigestResource {
    id: string;
    title: string;
    category: string;
    type: string;
}

export interface DigestBlogPost {
    id: string;
    title: string;
    excerpt?: string;
    slug?: string;
}

export interface DigestSwag {
    id: string;
    name: string;
}

export interface DigestEmailProps {
    userName: string;
    frequency: 'DAILY' | 'WEEKLY';
    periodLabel: string; // e.g. "Today" or "This Week"
    events?: DigestEvent[];
    projects?: DigestProject[];
    resources?: DigestResource[];
    blogPosts?: DigestBlogPost[];
    swagItems?: DigestSwag[];
    unsubscribeUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in';

export const DigestEmail = ({
    userName,
    frequency,
    periodLabel,
    events = [],
    projects = [],
    resources = [],
    blogPosts = [],
    swagItems = [],
    unsubscribeUrl,
}: DigestEmailProps) => {
    const hasContent =
        events.length > 0 ||
        projects.length > 0 ||
        resources.length > 0 ||
        blogPosts.length > 0 ||
        swagItems.length > 0;

    return (
        <EmailLayout
            preview={`Your ${frequency === 'DAILY' ? 'daily' : 'weekly'} VELONX digest — ${periodLabel}`}
        >
            <Heading style={mainHeading}>
                Your {frequency === 'DAILY' ? 'Daily' : 'Weekly'} Digest 📬
            </Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            {hasContent ? (
                <Text style={paragraph}>
                    Here's what happened on VELONX {periodLabel.toLowerCase()}. We've bundled it all
                    into one email so your inbox stays clean.
                </Text>
            ) : (
                <Text style={paragraph}>
                    It was a quiet {frequency === 'DAILY' ? 'day' : 'week'} — nothing new to report.
                    Check back soon!
                </Text>
            )}

            {/* Events section */}
            {events.length > 0 && (
                <div style={section}>
                    <Text style={sectionHeading}>📅 New Events ({events.length})</Text>
                    {events.map((event) => (
                        <div key={event.id} style={itemRow}>
                            <Link
                                href={`${SITE_URL}/events/${event.id}`}
                                style={itemLink}
                            >
                                {event.title}
                            </Link>
                            <Text style={itemMeta}>
                                {new Date(event.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                                {event.location ? ` • ${event.location}` : ''}
                            </Text>
                        </div>
                    ))}
                    <Link href={`${SITE_URL}/events`} style={sectionCta}>
                        Browse all events →
                    </Link>
                </div>
            )}

            {/* Projects section */}
            {projects.length > 0 && (
                <div style={section}>
                    <Text style={sectionHeading}>🚀 Project Updates ({projects.length})</Text>
                    {projects.map((project) => (
                        <div key={project.id} style={itemRow}>
                            <Link
                                href={`${SITE_URL}/projects`}
                                style={itemLink}
                            >
                                {project.title}
                            </Link>
                            <Text style={itemMeta}>Status: {project.status.replace('_', ' ')}</Text>
                        </div>
                    ))}
                    <Link href={`${SITE_URL}/projects`} style={sectionCta}>
                        View projects →
                    </Link>
                </div>
            )}

            {/* Resources section */}
            {resources.length > 0 && (
                <div style={section}>
                    <Text style={sectionHeading}>📚 New Resources ({resources.length})</Text>
                    {resources.map((resource) => (
                        <div key={resource.id} style={itemRow}>
                            <Link
                                href={`${SITE_URL}/resources`}
                                style={itemLink}
                            >
                                {resource.title}
                            </Link>
                            <Text style={itemMeta}>
                                {resource.category} • {resource.type}
                            </Text>
                        </div>
                    ))}
                    <Link href={`${SITE_URL}/resources`} style={sectionCta}>
                        Explore resources →
                    </Link>
                </div>
            )}

            {/* Blog posts section */}
            {blogPosts.length > 0 && (
                <div style={section}>
                    <Text style={sectionHeading}>✍️ New Blog Posts ({blogPosts.length})</Text>
                    {blogPosts.map((post) => (
                        <div key={post.id} style={itemRow}>
                            <Link
                                href={`${SITE_URL}/blog/${post.slug || post.id}`}
                                style={itemLink}
                            >
                                {post.title}
                            </Link>
                            {post.excerpt && (
                                <Text style={itemMeta}>{post.excerpt}</Text>
                            )}
                        </div>
                    ))}
                    <Link href={`${SITE_URL}/blog`} style={sectionCta}>
                        Read all posts →
                    </Link>
                </div>
            )}

            {/* Swag section */}
            {swagItems.length > 0 && (
                <div style={section}>
                    <Text style={sectionHeading}>🎽 Swag Drop ({swagItems.length} new)</Text>
                    {swagItems.map((item) => (
                        <div key={item.id} style={itemRow}>
                            <Text style={itemLink}>{item.name}</Text>
                        </div>
                    ))}
                    <Link href={`${SITE_URL}/swag`} style={sectionCta}>
                        View swag →
                    </Link>
                </div>
            )}

            {hasContent && (
                <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
                    <Link href={`${SITE_URL}/dashboard/student`} style={button}>
                        Go to Dashboard
                    </Link>
                </div>
            )}

            <div style={footer}>
                <Text style={footerText}>
                    Want to change how often you receive these emails?{' '}
                    <Link
                        href={unsubscribeUrl || `${SITE_URL}/settings/notifications`}
                        style={footerLink}
                    >
                        Update your notification preferences
                    </Link>
                </Text>
            </div>
        </EmailLayout>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const mainHeading = {
    color: '#1A234A',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 20px',
    lineHeight: '36px',
};

const section = {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '20px 0',
};

const sectionHeading = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 16px',
};

const itemRow = {
    borderBottom: '1px solid #F3F4F6',
    paddingBottom: '12px',
    marginBottom: '12px',
};

const itemLink = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#226CE0',
    textDecoration: 'none',
    display: 'block',
    margin: '0 0 4px',
};

const itemMeta = {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0',
};

const sectionCta = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#226CE0',
    textDecoration: 'none',
    display: 'block',
    marginTop: '8px',
};

const footer = {
    borderTop: '1px solid #E5E7EB',
    marginTop: '32px',
    paddingTop: '24px',
};

const footerText = {
    color: '#9CA3AF',
    fontSize: '12px',
    textAlign: 'center' as const,
    margin: '0',
};

const footerLink = {
    color: '#226CE0',
    textDecoration: 'underline',
};

export default DigestEmail;
