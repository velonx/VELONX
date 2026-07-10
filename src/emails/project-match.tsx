import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout, button, heading, paragraph } from './base-layout';

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
    <EmailLayout preview="New project collaboration opportunities matched to your skills!">
        <Heading style={heading}>New Project Matches Found! 🚀</Heading>

        <Text style={paragraph}>Hi {userName},</Text>

        <Text style={paragraph}>
            Based on your skills, we found some exciting active projects on VELONX looking for collaborators. Check out these projects where you can make an impact:
        </Text>

        {matchedProjects.map((project) => (
            <div key={project.id} style={projectCard}>
                <Text style={projectCardTitle}>{project.title}</Text>
                <Text style={projectCardDescription}>{project.description}</Text>

                {/* Matched Skills Badge Section */}
                <div style={tagSection}>
                    <Text style={tagLabel}>Matched Skills:</Text>
                    <div style={tagsContainer}>
                        {project.matchedSkills.map((skill) => (
                            <span key={skill} style={matchedSkillBadge}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tech Stack Badge Section */}
                <div style={tagSection}>
                    <Text style={tagLabel}>Project Tech Stack:</Text>
                    <div style={tagsContainer}>
                        {project.techStack.map((tech) => (
                            <span key={tech} style={techBadge}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/projects`}
                        style={projectButton}
                    >
                        View Project & Contribute
                    </Link>
                </div>
            </div>
        ))}

        <div style={{ textAlign: 'center', margin: '32px 0 16px' }}>
            <Link
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/projects`}
                style={button}
            >
                Explore More Projects
            </Link>
        </div>

        <Text style={paragraph}>
            Building projects is one of the best ways to sharpen your skills, build your portfolio, and earn platform XP. Reach out to the project owners to start collaborating!
        </Text>

        <Text style={paragraph}>
            Happy building!
            <br />
            <strong>The VELONX Team</strong>
        </Text>
    </EmailLayout>
);

const projectCard = {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderLeft: '5px solid #FF7A00',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
};

const projectCardTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1A234A',
    margin: '0 0 8px',
};

const projectCardDescription = {
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: '20px',
    margin: '0 0 16px',
};

const tagSection = {
    margin: '8px 0',
};

const tagLabel = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#374151',
    margin: '0 0 4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
};

const tagsContainer = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    margin: '4px 0 8px',
};

const matchedSkillBadge = {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    border: '1px solid #FCD34D',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '6px',
    display: 'inline-block',
    marginBottom: '4px',
};

const techBadge = {
    backgroundColor: '#E5E7EB',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
    marginRight: '6px',
    display: 'inline-block',
    marginBottom: '4px',
};

const projectButton = {
    backgroundColor: '#226CE0',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '8px 16px',
};

export default ProjectMatchEmail;
