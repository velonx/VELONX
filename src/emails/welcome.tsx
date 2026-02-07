import { Heading, Link, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface WelcomeEmailProps {
    userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
    <EmailLayout preview="Welcome to VELONX - Start Building!">
        <Heading style={heading}>Welcome to VELONX, {userName}! 🚀</Heading>

        <Text style={paragraph}>
            We're thrilled to have you join our community of innovators, builders, and learners!
        </Text>

        <Text style={paragraph}>
            VELONX is your platform to:
        </Text>

        <ul>
            <li style={listItem}>
                <strong>Build Real Projects:</strong> Work on impactful projects that matter
            </li>
            <li style={listItem}>
                <strong>Connect with Mentors:</strong> Learn from experienced professionals
            </li>
            <li style={listItem}>
                <strong>Join Events:</strong> Participate in hackathons, workshops, and competitions
            </li>
            <li style={listItem}>
                <strong>Grow Your Skills:</strong> Track your progress and level up
            </li>
        </ul>

        <Text style={paragraph}>
            Ready to dive in?
        </Text>

        <Link
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/dashboard`}
            style={button}
        >
            Go to Dashboard
        </Link>

        <Text style={paragraph}>
            Need help getting started? Check out our{' '}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/resources`} style={link}>
                resources page
            </Link>{' '}
            or reach out to our community.
        </Text>

        <Text style={paragraph}>
            Happy building!
            <br />
            The VELONX Team
        </Text>
    </EmailLayout>
);

const listItem = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '8px',
};

const link = {
    color: '#219EBC',
    textDecoration: 'underline',
};

export default WelcomeEmail;
