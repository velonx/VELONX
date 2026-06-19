import { Heading, Link, Text } from '@react-email/components';
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
            Here is what you can accomplish on VELONX:
        </Text>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '24px 0' }}>
            <tbody>
                <tr>
                    <td style={featureIconCol}>🚀</td>
                    <td style={featureTextCol}>
                        <strong style={featureTitle}>Build Real Projects</strong>
                        <span style={featureDesc}>Collaborate on real-world projects, build your portfolio, and gain hands-on experience.</span>
                    </td>
                </tr>
                <tr>
                    <td style={featureIconCol}>🤝</td>
                    <td style={featureTextCol}>
                        <strong style={featureTitle}>Connect with Mentors</strong>
                        <span style={featureDesc}>Get guidance from experienced professionals in the industry to accelerate your career growth.</span>
                    </td>
                </tr>
                <tr>
                    <td style={featureIconCol}>📅</td>
                    <td style={featureTextCol}>
                        <strong style={featureTitle}>Join Tech Events</strong>
                        <span style={featureDesc}>Access exclusive hackathons, masterclasses, and workshops to stay ahead of the curve.</span>
                    </td>
                </tr>
                <tr>
                    <td style={featureIconCol}>🏆</td>
                    <td style={featureTextCol}>
                        <strong style={featureTitle}>Earn XP & Badges</strong>
                        <span style={featureDesc}>Track your progress, earn experience points (XP), collect badges, and climb the leaderboard.</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <div style={roadmapCard}>
            <Text style={roadmapHeader}>Your Onboarding Journey 🗺️</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '30px', padding: '8px 0' }}>
                            <span style={stepCircle}>1</span>
                        </td>
                        <td style={roadmapStepText}>Complete your Profile</td>
                    </tr>
                    <tr>
                        <td style={{ width: '30px', padding: '8px 0' }}>
                            <span style={stepCircle}>2</span>
                        </td>
                        <td style={roadmapStepText}>Browse and Join a Project</td>
                    </tr>
                    <tr>
                        <td style={{ width: '30px', padding: '8px 0' }}>
                            <span style={stepCircle}>3</span>
                        </td>
                        <td style={roadmapStepText}>Book your first Mentor Session</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Text style={paragraph}>
            Ready to dive in?
        </Text>

        <Link
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/dashboard`}
            style={button}
        >
            Go to Dashboard
        </Link>

        <Text style={paragraph}>
            Need help getting started? Check out our{' '}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/resources`} style={link}>
                resources page
            </Link>{' '}
            or reach out to our community.
        </Text>

        <Text style={paragraph}>
            Happy building!
            <br />
            <strong>The VELONX Team</strong>
        </Text>
    </EmailLayout>
);

const featureIconCol = {
    padding: '12px 16px 12px 0',
    verticalAlign: 'top',
    fontSize: '24px',
    width: '40px',
};

const featureTextCol = {
    padding: '12px 0',
    verticalAlign: 'top',
};

const featureTitle = {
    display: 'block',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 4px',
};

const featureDesc = {
    display: 'block',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '20px',
};

const roadmapCard = {
    backgroundColor: '#F0F7FF',
    border: '1px solid #D0E5FF',
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '32px 0',
};

const roadmapHeader = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 16px',
};

const stepCircle = {
    display: 'block',
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#226CE0',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    lineHeight: '24px',
};

const roadmapStepText = {
    padding: '8px 0 8px 12px',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '600',
    verticalAlign: 'middle',
};

const link = {
    color: '#226CE0',
    textDecoration: 'underline',
};

export default WelcomeEmail;
