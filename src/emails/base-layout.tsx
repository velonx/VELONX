import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in';

/**
 * Design tokens mirrored from the app theme (`src/app/globals.css`).
 * Editorial light theme — warm paper, soft ink, Velonx orange accent.
 */
export const theme = {
    paper: '#F5F5EE',
    surface: '#FFFFFF',
    surfaceMuted: '#FAFAF5',
    ink: '#16140F',
    warmGray: '#5E5B56',
    muted: '#8A8780',
    accent: '#F0771A',
    accentInk: '#B4530C',
    accentSoft: '#FDF1E6',
    accentBorder: '#F7D9BC',
    border: '#E6E4DC',
    borderSoft: '#EFEDE6',
    success: '#0E7C5A',
    successSoft: '#E8F5EF',
    successBorder: '#C3E4D6',
};

const sansStack =
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
const serifStack = '"Source Serif 4",Georgia,"Times New Roman",serif';

/**
 * Dark-mode + small-screen overrides. Honoured by Apple Mail, iOS Mail and
 * Outlook for Mac; clients that ignore it simply keep the light paper look.
 */
const responsiveStyles = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  a { color: ${theme.accent}; }
  @media (prefers-color-scheme: dark) {
    .vx-body, .vx-canvas { background-color: #131210 !important; }
    .vx-shell { background-color: #1A1916 !important; border-color: rgba(237,236,230,0.12) !important; }
    .vx-ink { color: #EDECE6 !important; }
    .vx-soft { color: #A8A5A0 !important; }
    .vx-muted { color: #8A8780 !important; }
    .vx-card { background-color: #211F1B !important; border-color: rgba(237,236,230,0.10) !important; }
    .vx-card-accent { background-color: #241C14 !important; border-color: rgba(240,119,26,0.28) !important; }
    .vx-btn { background-color: #EDECE6 !important; color: #16140F !important; }
    .vx-btn-ghost { border-color: rgba(237,236,230,0.28) !important; color: #EDECE6 !important; }
    .vx-rule { border-color: rgba(237,236,230,0.12) !important; }
    .vx-chip { background-color: rgba(237,236,230,0.08) !important; color: #EDECE6 !important; border-color: rgba(237,236,230,0.14) !important; }
  }
  @media only screen and (max-width: 620px) {
    .vx-content { padding: 28px 22px !important; }
    .vx-head, .vx-foot { padding-left: 22px !important; padding-right: 22px !important; }
    .vx-h1 { font-size: 25px !important; line-height: 32px !important; }
    .vx-btn { display: block !important; width: 100% !important; }
  }
`;

interface EmailLayoutProps {
    /** Inbox preview line — the first thing a reader sees after the subject. */
    preview: string;
    /** Small uppercase label above the headline, e.g. "Account security". */
    eyebrow?: string;
    /** Overrides the default "manage your email preferences" footer link. */
    unsubscribeUrl?: string;
    children: React.ReactNode;
}

export const EmailLayout = ({
    preview,
    eyebrow,
    unsubscribeUrl,
    children,
}: EmailLayoutProps) => (
    <Html lang="en">
        <Head>
            <meta name="color-scheme" content="light dark" />
            <meta name="supported-color-schemes" content="light dark" />
            <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
        </Head>
        <Preview>{preview}</Preview>
        <Body style={main} className="vx-body">
            {/* React Email wraps <Body> in a table cell, so the page canvas needs its
                own class for the dark-mode override to reach it. */}
            <Section style={canvas} className="vx-canvas">
                <Container style={shell} className="vx-shell">
                    {/* Accent hairline */}
                    <Section style={accentRule} />

                    {/* Header */}
                    <Section style={header} className="vx-head">
                        <table style={fullWidth} cellPadding={0} cellSpacing={0} role="presentation">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        <Link href={SITE_URL} style={logoLink}>
                                            <span style={logoVelon} className="vx-ink">
                                                velon
                                            </span>
                                            <span style={logoX}>x</span>
                                        </Link>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                                        <span style={tagline} className="vx-muted">
                                            Empowering the next gen
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    <Hr style={rule} className="vx-rule" />

                    {/* Content */}
                    <Section style={content} className="vx-content">
                        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
                        {children}
                    </Section>

                    <Hr style={rule} className="vx-rule" />

                    {/* Footer */}
                    <Section style={footer} className="vx-foot">
                        <Text style={footerLinks}>
                            <Link href={`${SITE_URL}/projects`} style={footerLink} className="vx-soft">
                                Projects
                            </Link>
                            <span style={footerDot}>·</span>
                            <Link href={`${SITE_URL}/events`} style={footerLink} className="vx-soft">
                                Events
                            </Link>
                            <span style={footerDot}>·</span>
                            <Link href={`${SITE_URL}/career`} style={footerLink} className="vx-soft">
                                Careers
                            </Link>
                            <span style={footerDot}>·</span>
                            <Link href={`${SITE_URL}/support`} style={footerLink} className="vx-soft">
                                Support
                            </Link>
                        </Text>

                        <Text style={footerText} className="vx-muted">
                            You&rsquo;re receiving this because you have a VELONX account.{' '}
                            <Link
                                href={unsubscribeUrl || `${SITE_URL}/settings/notifications`}
                                style={footerInlineLink}
                            >
                                Manage email preferences
                            </Link>
                            .
                        </Text>

                        <Text style={footerLegal} className="vx-muted">
                            © {new Date().getFullYear()} VELONX · Built with students, for students
                        </Text>
                    </Section>
                </Container>
            </Section>
        </Body>
    </Html>
);

/* ───────────────────────────── Shared primitives ─────────────────────────── */

export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <Text style={eyebrowText}>{children}</Text>
);

export const H1 = ({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <Heading as="h1" style={{ ...heading, ...style }} className="vx-ink vx-h1">
        {children}
    </Heading>
);

export const H2 = ({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <Heading as="h2" style={{ ...subheading, ...style }} className="vx-ink">
        {children}
    </Heading>
);

export const P = ({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <Text style={{ ...paragraph, ...style }} className="vx-soft">
        {children}
    </Text>
);

export const Small = ({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <Text style={{ ...smallText, ...style }} className="vx-muted">
        {children}
    </Text>
);

export const A = ({
    href,
    children,
    style,
}: {
    href: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => (
    <Link href={href} style={{ ...link, ...style }}>
        {children}
    </Link>
);

/** Primary (ink) or secondary (outlined) call to action. */
export const CTA = ({
    href,
    children,
    variant = 'primary',
    align = 'left',
}: {
    href: string;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    align?: 'left' | 'center';
}) => (
    <Section style={{ margin: '28px 0', textAlign: align }}>
        <Link
            href={href}
            style={variant === 'primary' ? button : secondaryButton}
            className={variant === 'primary' ? 'vx-btn' : 'vx-btn-ghost'}
        >
            {children}
        </Link>
    </Section>
);

/** Neutral or accent-highlighted content card. */
export const Card = ({
    children,
    accent = false,
    style,
}: {
    children: React.ReactNode;
    accent?: boolean;
    style?: React.CSSProperties;
}) => (
    <Section
        style={{ ...(accent ? accentCard : card), ...style }}
        className={accent ? 'vx-card-accent' : 'vx-card'}
    >
        {children}
    </Section>
);

/** Single-line notice with a leading glyph — used for expiries and reminders. */
export const Callout = ({
    icon,
    children,
    tone = 'accent',
}: {
    icon: string;
    children: React.ReactNode;
    tone?: 'accent' | 'neutral' | 'success';
}) => {
    const tones = {
        accent: {
            backgroundColor: theme.accentSoft,
            border: `1px solid ${theme.accentBorder}`,
            color: theme.accentInk,
        },
        neutral: {
            backgroundColor: theme.surfaceMuted,
            border: `1px solid ${theme.border}`,
            color: theme.warmGray,
        },
        success: {
            backgroundColor: theme.successSoft,
            border: `1px solid ${theme.successBorder}`,
            color: theme.success,
        },
    }[tone];

    return (
        <Section
            style={{ ...calloutBase, ...tones }}
            className={tone === 'neutral' ? 'vx-card' : undefined}
        >
            <table style={fullWidth} cellPadding={0} cellSpacing={0} role="presentation">
                <tbody>
                    <tr>
                        <td style={calloutIcon}>{icon}</td>
                        <td style={{ ...calloutText, color: tones.color }}>{children}</td>
                    </tr>
                </tbody>
            </table>
        </Section>
    );
};

/** Icon + text metadata rows (date, location, mentor, …). */
export const DetailList = ({
    items,
}: {
    items: Array<{ icon: string; children: React.ReactNode }>;
}) => (
    <table style={fullWidth} cellPadding={0} cellSpacing={0} role="presentation">
        <tbody>
            {items.map((item, index) => (
                <tr key={index}>
                    <td style={detailIconCol}>{item.icon}</td>
                    <td style={detailTextCol} className="vx-soft">
                        {item.children}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

/** Small pill label, e.g. an event type or opportunity kind. */
export const Chip = ({
    children,
    tone = 'accent',
}: {
    children: React.ReactNode;
    tone?: 'accent' | 'neutral';
}) => (
    <span style={tone === 'accent' ? accentChip : neutralChip} className={tone === 'neutral' ? 'vx-chip' : undefined}>
        {children}
    </span>
);

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Text style={sectionLabel}>{children}</Text>
);

export const Divider = () => <Hr style={{ ...rule, margin: '28px 0' }} className="vx-rule" />;

/** Sign-off used at the end of every email. */
export const Signoff = ({ children = 'The VELONX team' }: { children?: React.ReactNode }) => (
    <Text style={signoff} className="vx-soft">
        — {children}
    </Text>
);

/* ─────────────────────────────────── Styles ──────────────────────────────── */

const fullWidth = { width: '100%', borderCollapse: 'collapse' as const };

const main = {
    backgroundColor: theme.paper,
    fontFamily: sansStack,
    margin: '0',
    padding: '0',
};

const canvas = {
    backgroundColor: theme.paper,
    padding: '32px 12px',
    width: '100%',
};

const shell = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '18px',
    margin: '0 auto',
    maxWidth: '600px',
    overflow: 'hidden',
    padding: '0',
};

const accentRule = {
    backgroundColor: theme.accent,
    height: '3px',
    lineHeight: '3px',
    fontSize: '0',
};

const header = {
    padding: '24px 40px',
};

const logoLink = {
    textDecoration: 'none',
    fontFamily: sansStack,
    fontSize: '26px',
    fontWeight: 800,
    letterSpacing: '-1px',
    lineHeight: '1',
};

const logoVelon = { color: theme.ink };

const logoX = { color: theme.accent };

const tagline = {
    color: theme.muted,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.6px',
    textTransform: 'uppercase' as const,
};

const rule = {
    borderColor: theme.border,
    borderTop: `1px solid ${theme.border}`,
    margin: '0',
    width: '100%',
};

const content = {
    padding: '36px 40px',
};

const footer = {
    padding: '24px 40px 32px',
    textAlign: 'center' as const,
};

const footerLinks = {
    fontSize: '13px',
    margin: '0 0 14px',
    textAlign: 'center' as const,
};

const footerLink = {
    color: theme.warmGray,
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
};

const footerDot = {
    color: theme.border,
    padding: '0 8px',
};

const footerText = {
    color: theme.muted,
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0 0 10px',
    textAlign: 'center' as const,
};

const footerInlineLink = {
    color: theme.accent,
    textDecoration: 'underline',
};

const footerLegal = {
    color: theme.muted,
    fontSize: '11px',
    lineHeight: '16px',
    margin: '0',
    textAlign: 'center' as const,
};

const eyebrowText = {
    color: theme.accent,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.4px',
    margin: '0 0 12px',
    textTransform: 'uppercase' as const,
};

export const heading = {
    color: theme.ink,
    fontFamily: serifStack,
    fontSize: '29px',
    fontWeight: 400,
    letterSpacing: '-0.4px',
    lineHeight: '38px',
    margin: '0 0 18px',
};

export const subheading = {
    color: theme.ink,
    fontFamily: serifStack,
    fontSize: '19px',
    fontWeight: 400,
    lineHeight: '26px',
    margin: '28px 0 12px',
};

export const paragraph = {
    color: theme.warmGray,
    fontSize: '16px',
    lineHeight: '26px',
    margin: '0 0 16px',
};

export const smallText = {
    color: theme.muted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 12px',
};

export const link = {
    color: theme.accent,
    fontWeight: 600,
    textDecoration: 'underline',
};

export const button = {
    backgroundColor: theme.ink,
    borderRadius: '10px',
    color: theme.paper,
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.1px',
    padding: '14px 28px',
    textAlign: 'center' as const,
    textDecoration: 'none',
};

export const secondaryButton = {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    color: theme.ink,
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 600,
    padding: '11px 22px',
    textAlign: 'center' as const,
    textDecoration: 'none',
};

export const card = {
    backgroundColor: theme.surfaceMuted,
    border: `1px solid ${theme.border}`,
    borderRadius: '14px',
    margin: '20px 0',
    padding: '22px 24px',
};

export const accentCard = {
    backgroundColor: theme.accentSoft,
    border: `1px solid ${theme.accentBorder}`,
    borderRadius: '14px',
    margin: '20px 0',
    padding: '22px 24px',
};

export const cardTitle = {
    color: theme.ink,
    fontFamily: serifStack,
    fontSize: '19px',
    fontWeight: 400,
    lineHeight: '26px',
    margin: '0 0 10px',
};

export const cardText = {
    color: theme.warmGray,
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
};

export const metaText = {
    color: theme.muted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0',
};

const calloutBase = {
    borderRadius: '12px',
    margin: '20px 0',
    padding: '14px 18px',
};

const calloutIcon = {
    fontSize: '16px',
    lineHeight: '22px',
    verticalAlign: 'top',
    width: '26px',
};

const calloutText = {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '22px',
    verticalAlign: 'top',
};

const detailIconCol = {
    fontSize: '15px',
    padding: '5px 0',
    verticalAlign: 'top',
    width: '26px',
};

const detailTextCol = {
    color: theme.warmGray,
    fontSize: '14px',
    lineHeight: '22px',
    padding: '5px 0',
    verticalAlign: 'top',
};

const accentChip = {
    backgroundColor: theme.accentSoft,
    border: `1px solid ${theme.accentBorder}`,
    borderRadius: '999px',
    color: theme.accentInk,
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    padding: '4px 12px',
};

const neutralChip = {
    backgroundColor: theme.surfaceMuted,
    border: `1px solid ${theme.border}`,
    borderRadius: '999px',
    color: theme.warmGray,
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 12px',
};

const sectionLabel = {
    color: theme.muted,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
};

const signoff = {
    color: theme.warmGray,
    fontSize: '15px',
    lineHeight: '24px',
    margin: '24px 0 0',
};
