import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
    preview: string;
    children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
    <Html>
        <Head />
        <Preview>{preview}</Preview>
        <Body style={main}>
            <Container style={container}>
                {/* Header */}
                <Section style={header}>
                    <Heading style={logo}>VELONX</Heading>
                    <Text style={tagline}>Empowering the Next Gen</Text>
                </Section>

                {/* Content */}
                <Section style={content}>{children}</Section>

                {/* Footer */}
                <Section style={footer}>
                    <Text style={footerText}>
                        © {new Date().getFullYear()} VELONX. All rights reserved.
                    </Text>
                    <Text style={footerLinks}>
                        <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/about`} style={link}>
                            About
                        </Link>
                        {' • '}
                        <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/settings/notifications`} style={link}>
                            Email Preferences
                        </Link>
                        {' • '}
                        <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/support`} style={link}>
                            Support
                        </Link>
                    </Text>
                    <Text style={footerSmall}>
                        You're receiving this email because you have an account on VELONX.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const header = {
    padding: '32px 20px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #219EBC 0%, #023047 100%)',
};

const logo = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0',
    letterSpacing: '2px',
};

const tagline = {
    color: '#ffffff',
    fontSize: '14px',
    margin: '8px 0 0',
    opacity: '0.9',
};

const content = {
    padding: '32px 20px',
};

const footer = {
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '0',
};

const footerLinks = {
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '8px 0',
};

const footerSmall = {
    color: '#9ca3af',
    fontSize: '11px',
    lineHeight: '16px',
    margin: '16px 0 0',
};

const link = {
    color: '#219EBC',
    textDecoration: 'none',
};

// Common button style
export const button = {
    backgroundColor: '#219EBC',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
    margin: '16px 0',
};

// Common text styles
export const heading = {
    color: '#023047',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 16px',
    lineHeight: '32px',
};

export const paragraph = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px',
};

export const highlight = {
    backgroundColor: '#fef3c7',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0',
};
