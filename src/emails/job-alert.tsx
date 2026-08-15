import { Section, Text } from '@react-email/components';
import {
    CTA,
    Card,
    Chip,
    DetailList,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    Signoff,
    cardTitle,
} from './base-layout';

interface JobAlertEmailProps {
    userName: string;
    title: string;
    company: string;
    location: string;
    type: 'JOB' | 'INTERNSHIP';
    applyUrl: string;
    slug?: string;
    opportunityId?: string;
    salary?: string;
    unsubscribeUrl?: string;
}

export const JobAlertEmail = ({
    userName,
    title,
    company,
    location,
    type,
    slug,
    opportunityId,
    salary,
    unsubscribeUrl,
}: JobAlertEmailProps) => {
    const kind = type === 'INTERNSHIP' ? 'internship' : 'role';

    return (
        <EmailLayout
            preview={`${title} at ${company} — new ${kind} on VELONX`}
            eyebrow={`New ${kind}`}
            unsubscribeUrl={unsubscribeUrl}
        >
            <Section style={{ marginBottom: '14px' }}>
                <Chip>{type === 'INTERNSHIP' ? '🎓 Internship' : '💼 Full-time'}</Chip>
            </Section>

            <H1>{title}</H1>

            <P>
                Hi {userName}, this one matches the skills on your profile. Openings like it
                usually close within a couple of weeks, so it&rsquo;s worth a look today.
            </P>

            <Card accent>
                <Text style={cardTitle} className="vx-ink">
                    {company}
                </Text>
                <DetailList
                    items={[
                        { icon: '📍', children: location },
                        ...(salary ? [{ icon: '💰', children: salary }] : []),
                        {
                            icon: '🧭',
                            children: type === 'INTERNSHIP' ? 'Internship' : 'Full-time role',
                        },
                    ]}
                />
            </Card>

            <CTA href={`${SITE_URL}/career/${slug || opportunityId}`}>
                See the role &amp; apply
            </CTA>

            <P>
                Tip: profiles with projects and a resume attached get shortlisted far more often
                — worth five minutes before you apply.
            </P>

            <Signoff />
        </EmailLayout>
    );
};

export default JobAlertEmail;
