import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface JobAlertEmailProps {
    userName: string;
    title: string;
    company: string;
    location: string;
    type: 'JOB' | 'INTERNSHIP';
    applyUrl: string;
    salary?: string;
    unsubscribeUrl?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in';

export const JobAlertEmail = ({
    userName,
    title,
    company,
    location,
    type,
    applyUrl,
    salary,
    unsubscribeUrl,
}: JobAlertEmailProps) => (
    <EmailLayout preview={`New ${type === 'INTERNSHIP' ? 'internship' : 'job'}: ${title} at ${company}`}>
        <div style={badgeContainer}>
            <span style={type === 'INTERNSHIP' ? internBadge : jobBadge}>
                {type === 'INTERNSHIP' ? '🎓 Internship' : '💼 Job'}
            </span>
        </div>

        <Heading style={heading}>New {type === 'INTERNSHIP' ? 'Internship' : 'Job'} Alert 🚀</Heading>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
            A new {type === 'INTERNSHIP' ? 'internship' : 'job'} opportunity just dropped on VELONX — check it out before it's gone!
        </Text>

        {/* Opportunity Card */}
        <div style={card}>
            <Text style={jobTitle}>{title}</Text>
            <Text style={meta}>🏢 {company}</Text>
            <Text style={meta}>📍 {location}</Text>
            {salary && <Text style={meta}>💰 {salary}</Text>}
        </div>

        <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Link href={applyUrl} style={button}>
                View &amp; Apply →
            </Link>
        </div>

        <Text style={paragraph}>
            Not interested in job alerts?{' '}
            <Link
                href={unsubscribeUrl || `${SITE_URL}/settings/notifications`}
                style={linkStyle}
            >
                Update your email preferences
            </Link>
        </Text>
    </EmailLayout>
);

const badgeContainer = {
    textAlign: 'center' as const,
    marginBottom: '16px',
};

const jobBadge = {
    backgroundColor: '#EBF5FB',
    color: '#226CE0',
    borderRadius: '20px',
    padding: '4px 16px',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'inline-block',
};

const internBadge = {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    borderRadius: '20px',
    padding: '4px 16px',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'inline-block',
};

const card = {
    backgroundColor: '#F8FAFF',
    border: '1px solid #D0E5FF',
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '20px 0',
};

const jobTitle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 12px',
};

const meta = {
    fontSize: '14px',
    color: '#4B5563',
    margin: '4px 0',
};

const linkStyle = {
    color: '#226CE0',
    textDecoration: 'underline',
};

export default JobAlertEmail;
