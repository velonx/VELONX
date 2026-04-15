/**
 * ProjectCard Component — redesigned
 * Modern card with 16:9 image header, clean typography, and premium hover effects.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from './CategoryBadge';
import { TeamAvatarGroup } from './TeamAvatarGroup';
import { cn } from '@/lib/utils';
import {
    ExtendedProject,
    UserProjectRelationship,
} from '@/lib/types/project-page.types';
import { Github, ExternalLink, Loader2, Users, CheckCircle2, Trophy, ArrowRight, Share2, Check } from 'lucide-react';

export interface ProjectCardProps {
    project: ExtendedProject;
    joinRequestStatus: UserProjectRelationship;
    onJoinRequest: (projectId: string) => void;
    onClick: (projectId: string) => void;
    isJoining?: boolean;
    currentUserId?: string;
    onComplete?: (projectId: string, projectTitle: string) => void;
    isCompleting?: boolean;
}

function getCategoryGradient(category: string) {
    switch (category) {
        case 'WEB_DEV': return 'from-blue-600 via-cyan-600 to-blue-700';
        case 'MOBILE': return 'from-purple-600 via-violet-600 to-purple-700';
        case 'AI_ML': return 'from-emerald-500 via-teal-600 to-green-700';
        case 'DATA_SCIENCE': return 'from-amber-500 via-orange-500 to-yellow-600';
        case 'DEVOPS': return 'from-rose-500 via-red-600 to-pink-700';
        case 'DESIGN': return 'from-pink-500 via-fuchsia-600 to-purple-700';
        default: return 'from-slate-500 via-slate-600 to-gray-700';
    }
}

function getCategoryIcon(category: string) {
    switch (category) {
        case 'WEB_DEV': return '💻';
        case 'MOBILE': return '📱';
        case 'AI_ML': return '🤖';
        case 'DATA_SCIENCE': return '📊';
        case 'DEVOPS': return '⚙️';
        case 'DESIGN': return '🎨';
        default: return '📦';
    }
}

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
        case 'pending': return { label: 'Request Pending', disabled: true, style: 'outline' };
        default: return { label: 'Request to Join', disabled: false, style: 'primary' };
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
}: ProjectCardProps) => {
    const statusConfig = getStatusConfig(project.status);
    const joinConfig = getJoinButtonConfig(joinRequestStatus);
    const gradient = getCategoryGradient(project.category);
    const icon = getCategoryIcon(project.category);
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
    const memberCount = project._count?.members || members.length;
    const isSeekingMembers = memberCount < 3 && project.status === 'IN_PROGRESS';

    const hasGithub = !!project.githubUrl;
    const hasDemo = !!project.liveUrl;

    const isOwner = currentUserId === project.ownerId;
    const canComplete = isOwner && project.status === 'IN_PROGRESS' && !!onComplete;
    const isCompleted = project.status === 'COMPLETED';
    const completedAt = project.completedAt ? new Date(project.completedAt) : null;

    const stop = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <Card
            className={cn(
                'group relative flex flex-col overflow-hidden cursor-pointer',
                'bg-card border border-border rounded-2xl',
                'transition-all duration-300',
                'hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1 hover:border-primary/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            )}
            onClick={() => onClick(project.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(project.id); } }}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${project.title}`}
        >
            {/* ── 16:9 Header ── */}
            <div className={cn(
                'relative w-full aspect-video overflow-hidden',
                !project.imageUrl && `bg-gradient-to-br ${gradient}`
            )}>
                {project.imageUrl ? (
                    <>
                        <Image
                            src={project.imageUrl}
                            alt={project.title}
                            fill
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            quality={90}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </>
                ) : (
                    <>
                        {/* Subtle noise pattern overlay */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E")' }} />
                        {/* Centered icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl drop-shadow-lg select-none" aria-hidden="true">{icon}</span>
                        </div>
                    </>
                )}

                {/* Category badge — top left */}
                <div className="absolute top-3 left-3 z-10">
                    {project.category && <CategoryBadge category={project.category} size="sm" />}
                </div>

                {/* Status badge — top right */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge className={cn('text-[11px] font-semibold border backdrop-blur-md px-2.5 py-0.5', statusConfig.className)}>
                        {statusConfig.pulse && (
                            <span className="relative flex h-1.5 w-1.5 mr-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                        )}
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Seeking members ribbon — bottom */}
                {isSeekingMembers && (
                    <div className="absolute bottom-0 inset-x-0 z-10">
                        <div className="bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-bold text-center py-1.5 tracking-wide">
                            🔍 Seeking Team Members
                        </div>
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col flex-1 p-4 gap-3">

                {/* Title + description */}
                <div>
                    <h3 className="text-base font-bold leading-snug line-clamp-2 text-foreground mb-1 group-hover:text-primary transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.description}
                    </p>
                </div>

                {/* Completed banner */}
                {isCompleted && completedAt && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/8 border border-blue-500/20 rounded-lg">
                        <Trophy className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                        <p className="text-[11px] font-medium text-blue-400">
                            Completed {completedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                )}

                {/* Tech stack */}
                {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {displayTech.map((tech, i) => (
                            <span
                                key={`${tech}-${i}`}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/8 text-primary border border-primary/15"
                            >
                                {tech}
                            </span>
                        ))}
                        {remaining > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                                +{remaining}
                            </span>
                        )}
                    </div>
                )}

                {/* Team row */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        {members.length > 0 ? (
                            <TeamAvatarGroup members={members} maxDisplay={3} size="sm" ownerId={project.ownerId} />
                        ) : project.owner ? (
                            <span className="text-xs text-muted-foreground">
                                By <span className="font-medium text-foreground">{project.owner.name || 'Anonymous'}</span>
                            </span>
                        ) : null}
                    </div>
                    {memberCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{memberCount}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center gap-2 px-4 pb-4 pt-0">
                {/* Quick links & Share */}
                <div className="flex items-center gap-1 mr-auto">
                    <button
                        onClick={handleShare}
                        title={copied ? 'Link copied!' : 'Share'}
                        aria-label={`Share ${project.title}`}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : (
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                        )}
                    </button>
                    {hasGithub && (
                        <button
                            onClick={(e) => { stop(e); window.open(project.githubUrl!, '_blank', 'noopener,noreferrer'); }}
                            aria-label="GitHub repository"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Github className="h-4 w-4" />
                        </button>
                    )}
                    {hasDemo && (
                        <button
                            onClick={(e) => { stop(e); window.open(project.liveUrl!, '_blank', 'noopener,noreferrer'); }}
                            aria-label="Live demo"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Primary CTA */}
                {canComplete ? (
                    <Button
                        size="sm"
                        onClick={(e) => { stop(e); if (!isCompleting && onComplete) onComplete(project.id, project.title); }}
                        disabled={isCompleting}
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg px-3"
                    >
                        {isCompleting ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Completing…</> : <><CheckCircle2 className="h-3 w-3 mr-1" />Mark Complete</>}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={(e) => { stop(e); if (!joinConfig.disabled && !isJoining) onJoinRequest(project.id); }}
                        disabled={joinConfig.disabled || isJoining}
                        className={cn(
                            'h-8 text-xs font-semibold rounded-lg px-3 transition-all',
                            joinConfig.style === 'primary' && !joinConfig.disabled
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                : 'bg-muted text-muted-foreground cursor-default'
                        )}
                        aria-label={joinConfig.label}
                    >
                        {isJoining ? (
                            <><Loader2 className="h-3 w-3 animate-spin mr-1" />Joining…</>
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
        </Card>
    );
};

export const ProjectCard = React.memo(ProjectCardComponent, (prev, next) =>
    prev.project.id === next.project.id &&
    prev.project.updatedAt === next.project.updatedAt &&
    prev.joinRequestStatus === next.joinRequestStatus &&
    prev.isJoining === next.isJoining &&
    prev.currentUserId === next.currentUserId &&
    prev.isCompleting === next.isCompleting &&
    prev.onComplete === next.onComplete
);

ProjectCard.displayName = 'ProjectCard';
