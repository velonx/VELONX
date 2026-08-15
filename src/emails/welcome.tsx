import { Section, Text } from '@react-email/components';
import {
    A,
    CTA,
    Card,
    EmailLayout,
    H1,
    H2,
    P,
    SITE_URL,
    Signoff,
    theme,
} from './base-layout';

interface WelcomeEmailProps {
    userName: string;
}

const steps = [
    {
        title: 'Fill in your profile',
        body: 'Skills, college and links. It takes two minutes and it is what our matching engine reads.',
    },
    {
        title: 'Join a live project',
        body: 'Real teams shipping real work — the fastest way to turn coursework into a portfolio.',
    },
    {
        title: 'Book a mentor session',
        body: 'Thirty minutes with someone who has already done the thing you are trying to do.',
    },
];

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
    <EmailLayout
        preview="Your VELONX account is ready — here are the first three things to do"
        eyebrow="Welcome aboard"
    >
        <H1>Welcome to VELONX, {userName}</H1>

        <P>
            You&rsquo;re in. VELONX is where students build things that count — shipping projects
            with teams, learning from mentors, and getting in front of the people who hire.
        </P>

        <P>Start with these three, in order:</P>

        {steps.map((step, index) => (
            <Card key={step.title}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} cellPadding={0} cellSpacing={0} role="presentation">
                    <tbody>
                        <tr>
                            <td style={stepNumberCol}>
                                <span style={stepNumber}>{index + 1}</span>
                            </td>
                            <td style={{ verticalAlign: 'top' }}>
                                <Text style={stepTitle} className="vx-ink">
                                    {step.title}
                                </Text>
                                <Text style={stepBody} className="vx-soft">
                                    {step.body}
                                </Text>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Card>
        ))}

        <CTA href={`${SITE_URL}/dashboard`}>Open my dashboard</CTA>

        <H2>What else is waiting for you</H2>

        <Section>
            <Text style={bulletLine} className="vx-soft">
                <strong style={{ color: theme.ink }} className="vx-ink">Events</strong> — hackathons, workshops and
                masterclasses you can join from anywhere.
            </Text>
            <Text style={bulletLine} className="vx-soft">
                <strong style={{ color: theme.ink }} className="vx-ink">Opportunities</strong> — internships and
                roles matched to the skills on your profile.
            </Text>
            <Text style={bulletLine} className="vx-soft">
                <strong style={{ color: theme.ink }} className="vx-ink">XP &amp; badges</strong> — proof of the work
                you&rsquo;ve done, visible on your public profile.
            </Text>
        </Section>

        <P>
            Stuck anywhere? The <A href={`${SITE_URL}/resources`}>resources hub</A> covers the
            basics, and <A href={`${SITE_URL}/support`}>support</A> answers everything else.
        </P>

        <Signoff />
    </EmailLayout>
);

const stepNumberCol = {
    verticalAlign: 'top' as const,
    width: '40px',
};

const stepNumber = {
    backgroundColor: theme.accent,
    borderRadius: '999px',
    color: '#FFFFFF',
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: 700,
    height: '26px',
    lineHeight: '26px',
    textAlign: 'center' as const,
    width: '26px',
};

const stepTitle = {
    color: theme.ink,
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '22px',
    margin: '2px 0 4px',
};

const stepBody = {
    color: theme.warmGray,
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0',
};

const bulletLine = {
    borderTop: `1px solid ${theme.borderSoft}`,
    color: theme.warmGray,
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0',
    padding: '12px 0',
};

export default WelcomeEmail;
