/**
 * ProjectCard Component — redesigned to match projects.html
 * Text-focused glassmorphic card layout with distinct category badges and star ratings.
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { TeamAvatarGroup } from './TeamAvatarGroup';
import { cn } from '@/lib/utils';
import {
    ExtendedProject,
    UserProjectRelationship,
} from '@/lib/types/project-page.types';
import { Github, Loader2, ArrowRight, Share2, Check, Pencil } from 'lucide-react';

export interface ProjectCardProps {
    project: ExtendedProject;
    joinRequestStatus: UserProjectRelationship;
    onJoinRequest: (projectId: string) => void;
    onClick: (projectId: string) => void;
    isJoining?: boolean;
    currentUserId?: string;
    onComplete?: (projectId: string, projectTitle: string) => void;
    isCompleting?: boolean;
    onEdit?: (projectId: string) => void;
}

const getCategoryBadgeClass = (category: string) => {
    switch (category) {
        case 'AI_ML': return 'badge-violet';
        case 'WEB_DEV': return 'badge-cyan';
        case 'MOBILE': return 'badge-green';
        case 'DATA_SCIENCE': return 'badge-amber';
        case 'DEVOPS': return 'badge-violet';
        case 'DESIGN': return 'badge-pink';
        default: return 'bg-gray-500/10 border border-gray-500/20 text-gray-400';
    }
};

const getCategoryLabel = (category: string) => {
    switch (category) {
        case 'AI_ML': return 'AI / ML';
        case 'WEB_DEV': return 'Web Apps';
        case 'MOBILE': return 'Mobile Apps';
        case 'DATA_SCIENCE': return 'Web3 / Blockchain';
        case 'DEVOPS': return 'DevOps';
        case 'DESIGN': return 'Design';
        default: return 'Other Stack';
    }
};

function getStatusConfig(status: string) {
    switch (status) {
        case 'IN_PROGRESS':
            return { label: 'Active', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25', pulse: true };
        case 'COMPLETED':
            return { label: 'Completed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/25', pulse: false };
        case 'PLANNING':
            return { label: 'Planning', className: 'bg-amber-500/15 text-amber-500 border-amber-500/25', pulse: false };
        case 'ARCHIVED':
            return { label: 'Archived', className: 'bg-muted/50 text-muted-foreground border-border', pulse: false };
        default:
            return { label: status, className: 'bg-muted/50 text-muted-foreground border-border', pulse: false };
    }
}

function getJoinButtonConfig(status: UserProjectRelationship) {
    switch (status) {
        case 'owner': return { label: 'Your Project', disabled: true, style: 'secondary' };
        case 'member': return { label: 'Member', disabled: true, style: 'secondary' };
        case 'pending': return { label: 'Pending', disabled: true, style: 'outline' };
        default: return { label: 'Join 🚀', disabled: false, style: 'primary' };
    }
}

const ProjectCardComponent = ({
    project,
    joinRequestStatus,
    onJoinRequest,
    onClick,
    isJoining = false,
    currentUserId,
    onComplete,
    isCompleting = false,
    onEdit,
}: ProjectCardProps) => {
    const joinConfig = getJoinButtonConfig(joinRequestStatus);
    const categoryBadgeClass = getCategoryBadgeClass(project.category);
    const categoryLabel = getCategoryLabel(project.category);
    const [copied, setCopied] = React.useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/projects?id=${project.id}`;
        const shareData = {
            title: project.title,
            text: `Check out this project: ${project.title}`,
            url,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const displayTech = project.techStack.slice(0, 4);
    const remaining = Math.max(0, project.techStack.length - 4);

    const members = project.members || [];
    const isOwner = currentUserId === project.ownerId;
    const canComplete = isOwner && project.status === 'IN_PROGRESS' && !!onComplete;

    const stop = (e: React.MouseEvent) => e.stopPropagation();

    // Deterministic stable stars count based on project title
    const starCount = React.useMemo(() => {
        const code = project.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (code % 70) + 15; // 15 to 84 stars
    }, [project.title]);

    return (
        <div
            className="p-project-card group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => onClick(project.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(project.id); } }}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${project.title}`}
        >
            {/* Header: Badge & Star Count */}
            <div className="p-project-header">
                <span className={cn("badge-event", categoryBadgeClass)}>
                    {categoryLabel}
                </span>
                <div className="p-project-stars">⭐ {starCount}</div>
            </div>

            {/* Title & Description */}
            <h2 className="p-project-title group-hover:text-primary dark:group-hover:text-cyan-light transition-colors">
                {project.title}
            </h2>
            <p className="p-project-desc line-clamp-3">
                {project.description}
            </p>

            {/* Tech Stack Tags */}
            {project.techStack.length > 0 && (
                <div className="p-project-tags">
                    {displayTech.map((tech, i) => (
                        <span key={`${tech}-${i}`} className="p-tag">{tech}</span>
                    ))}
                    {remaining > 0 && (
                        <span className="p-tag">+{remaining}</span>
                    )}
                </div>
            )}

            {/* Footer: Avatars & CTA Actions */}
            <div className="p-project-footer" onClick={stop}>
                <div className="flex items-center gap-2">
                    {members.length > 0 ? (
                        <TeamAvatarGroup members={members} maxDisplay={3} size="sm" ownerId={project.ownerId} />
                    ) : project.owner ? (
                        <span className="text-xs text-muted-foreground">
                            By <span className="font-medium text-foreground">{project.owner.name || 'Anonymous'}</span>
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    {/* Share / Github Quick Links */}
                    <button
                        onClick={handleShare}
                        title={copied ? 'Link copied!' : 'Share'}
                        aria-label={copied ? 'Link copied!' : `Share ${project.title}`}
                        aria-live="polite"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : (
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                        )}
                    </button>
                    {project.githubUrl && (
                        <button
                            onClick={() => window.open(project.githubUrl!, '_blank', 'noopener,noreferrer')}
                            aria-label="GitHub repository"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Github className="h-4 w-4" />
                        </button>
                    )}
                    
                    {/* Edit Project (Owner only) */}
                    {isOwner && onEdit && (
                        <button
                            onClick={() => onEdit(project.id)}
                            aria-label={`Edit ${project.title}`}
                            title="Edit project"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}

                    {/* Primary Button */}
                    {canComplete ? (
                        <Button
                            size="sm"
                            onClick={() => { if (!isCompleting && onComplete) onComplete(project.id, project.title); }}
                            disabled={isCompleting}
                            className="btn-redesign btn-redesign-primary btn-redesign-sm font-semibold rounded-full"
                        >
                            {isCompleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Complete 🏆"}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => { if (!joinConfig.disabled && !isJoining) onJoinRequest(project.id); }}
                            disabled={joinConfig.disabled || isJoining}
                            className={cn(
                                'btn-redesign btn-redesign-sm font-semibold rounded-full transition-all',
                                joinConfig.style === 'primary' && !joinConfig.disabled
                                    ? 'btn-redesign-primary'
                                    : 'btn-redesign-secondary cursor-default'
                            )}
                        >
                            {isJoining ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <>
                                    {joinConfig.label}
                                    {joinConfig.style === 'primary' && !joinConfig.disabled && (
                                        <ArrowRight className="h-3 w-3 ml-1" />
                                    )}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProjectCard = React.memo(ProjectCardComponent, (prev, next) =>
    prev.project.id === next.project.id &&
    prev.project.updatedAt === next.project.updatedAt &&
    prev.joinRequestStatus === next.joinRequestStatus &&
    prev.isJoining === next.isJoining &&
    prev.currentUserId === next.currentUserId &&
    prev.isCompleting === next.isCompleting &&
    prev.onComplete === next.onComplete &&
    prev.onEdit === next.onEdit
);

ProjectCard.displayName = 'ProjectCard';
