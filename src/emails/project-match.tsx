import { Section, Text } from '@react-email/components';
import {
    CTA,
    Card,
    EmailLayout,
    H1,
    P,
    SITE_URL,
    SectionLabel,
    Signoff,
    cardText,
    cardTitle,
    secondaryButton,
    theme,
} from './base-layout';
import { Link } from '@react-email/components';

interface MatchedProject {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    matchedSkills: string[];
}

interface ProjectMatchEmailProps {
    userName: string;
    matchedProjects: MatchedProject[];
}

export const ProjectMatchEmail = ({
    userName,
    matchedProjects,
}: ProjectMatchEmailProps) => (
    <EmailLayout
        preview={`${matchedProjects.length} project${
            matchedProjects.length === 1 ? '' : 's'
        } looking for your skills`}
        eyebrow="Matched to your skills"
    >
        <H1>
            {matchedProjects.length} project{matchedProjects.length === 1 ? '' : 's'} could use
            you
        </H1>

        <P>
            Hi {userName}, these teams are actively recruiting and their needs line up with
            what&rsquo;s on your profile.
        </P>

        {matchedProjects.map((project) => (
            <Card key={project.id}>
                <Text style={cardTitle} className="vx-ink">
                    {project.title}
                </Text>
                <Text style={{ ...cardText, marginBottom: '16px' }} className="vx-soft">
                    {project.description}
                </Text>

                {project.matchedSkills.length > 0 && (
                    <>
                        <SectionLabel>Your matching skills</SectionLabel>
                        <Section style={{ marginBottom: '14px' }}>
                            {project.matchedSkills.map((skill) => (
                                <span key={skill} style={matchTag}>
                                    {skill}
                                </span>
                            ))}
                        </Section>
                    </>
                )}

                {project.techStack.length > 0 && (
                    <>
                        <SectionLabel>Stack</SectionLabel>
                        <Section style={{ marginBottom: '16px' }}>
                            {project.techStack.map((tech) => (
                                <span key={tech} style={stackTag} className="vx-chip">
                                    {tech}
                                </span>
                            ))}
                        </Section>
                    </>
                )}

                <Link
                    href={`${SITE_URL}/projects`}
                    style={secondaryButton}
                    className="vx-btn-ghost"
                >
                    View project
                </Link>
            </Card>
        ))}

        <CTA href={`${SITE_URL}/projects`}>Browse the full project board</CTA>

        <P>
            Message the project owner when you apply — a two-line note about why you want in
            beats a silent request almost every time.
        </P>

        <Signoff />
    </EmailLayout>
);

const matchTag = {
    backgroundColor: theme.accentSoft,
    border: `1px solid ${theme.accentBorder}`,
    borderRadius: '999px',
    color: theme.accentInk,
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 700,
    margin: '0 6px 6px 0',
    padding: '4px 12px',
};

const stackTag = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '999px',
    color: theme.warmGray,
    display: 'inline-block',
    fontSize: '12px',
    margin: '0 6px 6px 0',
    padding: '4px 12px',
};

export default ProjectMatchEmail;
