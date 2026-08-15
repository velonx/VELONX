import { Link, Section, Text } from '@react-email/components';
import {
    CTA,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Signoff,
    theme,
} from './base-layout';

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

const DigestSection = ({
    icon,
    title,
    ctaLabel,
    ctaHref,
    children,
}: {
    icon: string;
    title: string;
    ctaLabel: string;
    ctaHref: string;
    children: React.ReactNode;
}) => (
    <Section style={section} className="vx-card">
        <Text style={sectionHeading} className="vx-ink">
            <span style={sectionIcon}>{icon}</span>
            {title}
        </Text>
        {children}
        <Link href={ctaHref} style={sectionCta}>
            {ctaLabel} →
        </Link>
    </Section>
);

const DigestItem = ({
    href,
    title,
    meta,
}: {
    href?: string;
    title: string;
    meta?: string;
}) => (
    <Section style={itemRow}>
        {href ? (
            <Link href={href} style={itemLink} className="vx-ink">
                {title}
            </Link>
        ) : (
            <Text style={{ ...itemLink, margin: 0 }} className="vx-ink">
                {title}
            </Text>
        )}
        {meta ? (
            <Text style={itemMeta} className="vx-muted">
                {meta}
            </Text>
        ) : null}
    </Section>
);

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
    const cadence = frequency === 'DAILY' ? 'daily' : 'weekly';
    const hasContent =
        events.length > 0 ||
        projects.length > 0 ||
        resources.length > 0 ||
        blogPosts.length > 0 ||
        swagItems.length > 0;

    return (
        <EmailLayout
            preview={`Your ${cadence} VELONX digest — ${periodLabel.toLowerCase()}`}
            eyebrow={`${cadence} digest`}
            unsubscribeUrl={unsubscribeUrl}
        >
            <H1>What happened {periodLabel.toLowerCase()}</H1>

            {hasContent ? (
                <P>
                    Hi {userName} — everything new on VELONX, bundled into one email so your inbox
                    stays quiet.
                </P>
            ) : (
                <P>
                    Hi {userName} — quiet {frequency === 'DAILY' ? 'day' : 'week'}. Nothing new
                    worth your attention, so we&rsquo;ll keep this short.
                </P>
            )}

            {events.length > 0 && (
                <DigestSection
                    icon="🗓️"
                    title={`Events (${events.length})`}
                    ctaLabel="Browse all events"
                    ctaHref={`${SITE_URL}/events`}
                >
                    {events.map((event) => (
                        <DigestItem
                            key={event.id}
                            href={`${SITE_URL}/events/${event.id}`}
                            title={event.title}
                            meta={`${new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}${event.location ? ` · ${event.location}` : ''}`}
                        />
                    ))}
                </DigestSection>
            )}

            {projects.length > 0 && (
                <DigestSection
                    icon="🚀"
                    title={`Projects (${projects.length})`}
                    ctaLabel="View the project board"
                    ctaHref={`${SITE_URL}/projects`}
                >
                    {projects.map((project) => (
                        <DigestItem
                            key={project.id}
                            href={`${SITE_URL}/projects`}
                            title={project.title}
                            meta={project.status.replace('_', ' ').toLowerCase()}
                        />
                    ))}
                </DigestSection>
            )}

            {resources.length > 0 && (
                <DigestSection
                    icon="📚"
                    title={`Resources (${resources.length})`}
                    ctaLabel="Explore resources"
                    ctaHref={`${SITE_URL}/resources`}
                >
                    {resources.map((resource) => (
                        <DigestItem
                            key={resource.id}
                            href={`${SITE_URL}/resources`}
                            title={resource.title}
                            meta={`${resource.category} · ${resource.type}`}
                        />
                    ))}
                </DigestSection>
            )}

            {blogPosts.length > 0 && (
                <DigestSection
                    icon="✍️"
                    title={`Reading (${blogPosts.length})`}
                    ctaLabel="Read all posts"
                    ctaHref={`${SITE_URL}/blog`}
                >
                    {blogPosts.map((post) => (
                        <DigestItem
                            key={post.id}
                            href={`${SITE_URL}/blog/${post.slug || post.id}`}
                            title={post.title}
                            meta={post.excerpt}
                        />
                    ))}
                </DigestSection>
            )}

            {swagItems.length > 0 && (
                <DigestSection
                    icon="🎽"
                    title={`Swag drop (${swagItems.length})`}
                    ctaLabel="See what's available"
                    ctaHref={`${SITE_URL}/swag`}
                >
                    {swagItems.map((item) => (
                        <DigestItem key={item.id} title={item.name} />
                    ))}
                </DigestSection>
            )}

            {hasContent ? (
                <CTA href={`${SITE_URL}/dashboard/student`}>Open my dashboard</CTA>
            ) : (
                <CTA href={`${SITE_URL}/projects`} variant="secondary">
                    Find something to build
                </CTA>
            )}

            <Signoff />
        </EmailLayout>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const section = {
    backgroundColor: theme.surfaceMuted,
    border: `1px solid ${theme.border}`,
    borderRadius: '14px',
    margin: '20px 0',
    padding: '20px 24px',
};

const sectionHeading = {
    color: theme.ink,
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.6px',
    margin: '0 0 14px',
    textTransform: 'uppercase' as const,
};

const sectionIcon = {
    paddingRight: '8px',
};

const itemRow = {
    borderTop: `1px solid ${theme.borderSoft}`,
    padding: '12px 0',
};

const itemLink = {
    color: theme.ink,
    display: 'block',
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '22px',
    margin: '0 0 3px',
    textDecoration: 'none',
};

const itemMeta = {
    color: theme.muted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0',
};

const sectionCta = {
    color: theme.accent,
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: 700,
    marginTop: '14px',
    textDecoration: 'none',
};

export default DigestEmail;
