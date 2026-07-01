import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

interface ProfileCompletionEmailProps {
    userName: string;
}

export const ProfileCompletionEmail = ({ userName }: ProfileCompletionEmailProps) => (
    <EmailLayout preview="Complete your VELONX profile to unlock AI matching & networking!">
        <Heading style={heading}>Complete your profile, {userName}! 🚀</Heading>

        <Text style={paragraph}>
            We noticed your VELONX profile isn't fully complete yet. By taking just 2 minutes to complete it, you unlock powerful features designed to launch your career:
        </Text>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '24px 0' }}>
            <tbody>
                <tr>
                    <td style={featureIconCol}>🤖</td>
                    <td style={featureTextCol}>
                        <strong style={featureTitle}>AI Internship & Job Matching</strong>
                        <span style={featureDesc}>
                            Our AI algorithm matches your skills, college, projects, and resume text directly with the most relevant internship and job openings. Don't miss out on opportunities tailored just for you!
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style={featureIconCol}>🤝</td>
                    <td style={featureTextCol}>
                        <strong style={featureTitle}>Professional Networking</strong>
                        <span style={featureDesc}>
                            Connect with fellow developers, find project collaborators, and make yourself discoverable to mentors and recruiters on the VELONX platform.
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style={featureIconCol}>💡</td>
                    <td style={featureTextCol}>
                        <strong style={featureTitle}>Personalized Recommendations</strong>
                        <span style={featureDesc}>
                            Get customized learning paths, event suggestions, and mentor matching recommendations based on your profile interests.
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>

        <div style={infoCard}>
            <Text style={infoTitle}>Why complete your profile? 🎯</Text>
            <Text style={infoText}>
                The tech landscape is highly competitive. VELONX uses state-of-the-art AI matching to place your projects and credentials directly in front of hiring managers and potential collaborators. An incomplete profile means the matching engine won't have enough data to recommend you!
            </Text>
        </div>

        <div style={{ textAlign: 'center', margin: '32px 0' }}>
            <Link
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/dashboard`}
                style={button}
            >
                Complete My Profile Now
            </Link>
        </div>

        <Text style={paragraph}>
            If you have any questions or need help setting up your profile, feel free to reach out to our support team.
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
    color: '#4B5563',
    lineHeight: '20px',
};

const infoCard = {
    backgroundColor: '#F3F4F6',
    borderLeft: '4px solid #FF7A00',
    borderRadius: '4px 12px 12px 4px',
    padding: '16px 20px',
    margin: '24px 0',
};

const infoTitle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 8px',
};

const infoText = {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '20px',
    margin: '0',
};

export default ProfileCompletionEmail;
