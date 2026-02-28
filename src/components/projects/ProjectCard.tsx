/**
 * ProjectCard Component
 * Feature: project-page-ui-improvements
 * 
 * Modern project card with image support, theme-aware colors, and compact design.
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
    CATEGORY_COLORS
} from '@/lib/types/project-page.types';
import { Github, ExternalLink, Loader2, User, CheckCircle2, Trophy } from 'lucide-react';

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

/**
 * Get category gradient colors for fallback backgrounds
 */
function getCategoryGradient(category: string) {
    switch (category) {
        case 'WEB_DEV':
            return 'from-blue-500 via-blue-600 to-cyan-600';
        case 'MOBILE':
            return 'from-purple-500 via-purple-600 to-violet-600';
        case 'AI_ML':
            return 'from-emerald-500 via-green-600 to-teal-600';
        case 'DATA_SCIENCE':
            return 'from-orange-500 via-amber-600 to-yellow-600';
        case 'DEVOPS':
            return 'from-red-500 via-rose-600 to-pink-600';
        case 'DESIGN':
            return 'from-pink-500 via-fuchsia-600 to-purple-600';
        default:
            return 'from-gray-500 via-gray-600 to-slate-600';
    }
}

/**
 * Get category icon emoji
 */
function getCategoryIcon(category: string) {
    switch (category) {
        case 'WEB_DEV':
            return '💻';
        case 'MOBILE':
            return '📱';
        case 'AI_ML':
            return '🤖';
        case 'DATA_SCIENCE':
            return '📊';
        case 'DEVOPS':
            return '⚙️';
        case 'DESIGN':
            return '🎨';
        default:
            return '📦';
    }
}

/**
 * Get status badge configuration (theme-aware)
 */
function getStatusConfig(status: string) {
    switch (status) {
        case 'IN_PROGRESS':
            return {
                label: 'Active',
                className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                showPulse: true,
            };
        case 'COMPLETED':
            return {
                label: 'Completed',
                className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                showPulse: false,
            };
        case 'PLANNING':
            return {
                label: 'Planning',
                className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                showPulse: false,
            };
        case 'ARCHIVED':
            return {
                label: 'Archived',
                className: 'bg-muted/50 text-muted-foreground border-border',
                showPulse: false,
            };
        default:
            return {
                label: status,
                className: 'bg-muted/50 text-muted-foreground border-border',
                showPulse: false,
            };
    }
}

/**
 * Get join button configuration based on user relationship
 */
function getJoinButtonConfig(status: UserProjectRelationship) {
    switch (status) {
        case 'owner':
            return {
                label: 'Your Project',
                variant: 'secondary' as const,
                disabled: true,
            };
        case 'member':
            return {
                label: 'Member',
                variant: 'secondary' as const,
                disabled: true,
            };
        case 'pending':
            return {
                label: 'Request Pending',
                variant: 'outline' as const,
                disabled: true,
            };
        default:
            return {
                label: 'Request to Join',
                variant: 'default' as const,
                disabled: false,
            };
    }
}

/**
 * ProjectCard Component
 */
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
    const joinButtonConfig = getJoinButtonConfig(joinRequestStatus);
    const categoryGradient = getCategoryGradient(project.category);
    const categoryIcon = getCategoryIcon(project.category);

    // Tech stack display logic
    const maxTechDisplay = 3;
    const displayTech = project.techStack.slice(0, maxTechDisplay);
    const remainingTech = Math.max(0, project.techStack.length - maxTechDisplay);
    const hasMoreTech = remainingTech > 0;

    // Team members
    const members = project.members || [];
    const memberCount = project._count?.members || members.length;

    // Check if project is seeking members
    const isSeekingMembers = memberCount < 3 && project.status === 'IN_PROGRESS';

    // Quick action buttons
    const hasGithub = !!project.githubUrl;
    const hasDemo = !!project.liveUrl;
    
    // Completion logic
    const isOwner = currentUserId === project.ownerId;
    const canComplete = isOwner && project.status === 'IN_PROGRESS' && !!onComplete;
    const isCompleted = project.status === 'COMPLETED';
    
    // Format completion date
    const completedAtDate = project.completedAt 
        ? new Date(project.completedAt) 
        : null;

    const handleCardClick = () => {
        onClick(project.id);
    };

    const handleJoinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!joinButtonConfig.disabled && !isJoining) {
            onJoinRequest(project.id);
        }
    };

    const handleCompleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (canComplete && !isCompleting && onComplete) {
            onComplete(project.id, project.title);
        }
    };

    const handleQuickActionClick = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
        }
    };

    return (
        <Card
            className={cn(
                'relative overflow-hidden cursor-pointer transition-all duration-300',
                'hover:shadow-xl hover:-translate-y-1',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'bg-card border border-border rounded-2xl'
            )}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${project.title}`}
        >
            {/* Image/Gradient Header */}
            <div className={cn(
                'relative h-24 sm:h-32 flex items-center justify-center overflow-hidden',
                !project.imageUrl && `bg-gradient-to-br ${categoryGradient}`
            )}>
                {project.imageUrl ? (
                    <>
                        <Image
                            src={project.imageUrl}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            quality={85}
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    </>
                ) : (
                    <span className="text-5xl sm:text-6xl opacity-90" aria-hidden="true">
                        {categoryIcon}
                    </span>
                )}

                {/* Category Badge - Top Left */}
                <div className="absolute top-2 left-2">
                    {project.category && (
                        <CategoryBadge category={project.category} size="sm" />
                    )}
                </div>

                {/* Status Badge - Top Right */}
                <div className="absolute top-2 right-2">
                    <Badge className={cn('text-xs border backdrop-blur-md', statusConfig.className)}>
                        {statusConfig.showPulse && (
                            <span className="relative flex h-2 w-2 mr-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        )}
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Seeking Members Badge - Bottom */}
                {isSeekingMembers && (
                    <div className="absolute bottom-2 left-2 right-2">
                        <Badge className="bg-orange-500/90 text-white border-0 text-xs backdrop-blur-md shadow-lg w-full justify-center">
                            🔍 Seeking Team Members
                        </Badge>
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {/* Title and Description */}
                <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold leading-tight line-clamp-2 text-foreground">
                        {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.description}
                    </p>
                </div>
                
                {/* Completion Badge and Timestamp for Completed Projects */}
                {isCompleted && completedAtDate && (
                    <div className="flex items-center gap-2 py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        <div className="flex-1">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                Completed on {completedAtDate.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5">
                    {displayTech.map((tech, index) => (
                        <Badge
                            key={`${tech}-${index}`}
                            variant="outline"
                            className="text-xs border-border"
                        >
                            {tech}
                        </Badge>
                    ))}
                    {hasMoreTech && (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                            +{remainingTech} more
                        </Badge>
                    )}
                </div>

                {/* Team & Metadata */}
                <div className="flex items-center justify-between pt-1">
                    {/* Team Avatars or Owner */}
                    <div className="flex items-center gap-2">
                        {members.length > 0 ? (
                            <TeamAvatarGroup 
                                members={members} 
                                maxDisplay={3} 
                                size="sm" 
                                ownerId={project.ownerId}
                            />
                        ) : project.owner ? (
                            <div className="flex items-center gap-2">
                                {project.owner.image ? (
                                    <div className="relative">
                                        <Image
                                            src={project.owner.image}
                                            alt={project.owner.name || 'Owner'}
                                            width={24}
                                            height={24}
                                            className="rounded-full border-2 border-yellow-400 ring-2 ring-yellow-400"
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
                                        />
                                        <div 
                                            className="absolute -bottom-0.5 -right-0.5 bg-yellow-400 rounded-full p-0.5 border border-white shadow-sm"
                                            aria-label="Project owner"
                                            title="Project owner"
                                        >
                                            <svg 
                                                className="w-2 h-2 text-white" 
                                                fill="currentColor" 
                                                viewBox="0 0 20 20"
                                                aria-hidden="true"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="w-6 h-6 rounded-full bg-yellow-50 border-2 border-yellow-400 ring-2 ring-yellow-400 flex items-center justify-center">
                                            <User className="w-3 h-3 text-yellow-600" />
                                        </div>
                                        <div 
                                            className="absolute -bottom-0.5 -right-0.5 bg-yellow-400 rounded-full p-0.5 border border-white shadow-sm"
                                            aria-label="Project owner"
                                            title="Project owner"
                                        >
                                            <svg 
                                                className="w-2 h-2 text-white" 
                                                fill="currentColor" 
                                                viewBox="0 0 20 20"
                                                aria-hidden="true"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <span className="text-xs text-muted-foreground">{project.owner.name || 'Anonymous'} <span className="text-yellow-600">(Owner)</span></span>
                            </div>
                        ) : null}
                    </div>

                    {/* Member Count */}
                    {memberCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer: Actions */}
            <div className="flex items-center justify-between gap-2 px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-border mt-2">
                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1">
                    {hasGithub && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => handleQuickActionClick(e, project.githubUrl!)}
                            aria-label={`View GitHub repository for ${project.title}`}
                            title="View GitHub repository"
                            className="h-8 w-8"
                        >
                            <Github className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    )}
                    {hasDemo && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => handleQuickActionClick(e, project.liveUrl!)}
                            aria-label={`View live demo for ${project.title}`}
                            title="View live demo"
                            className="h-8 w-8"
                        >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    )}
                </div>

                {/* Completion Button (for owners of IN_PROGRESS projects) or Join Request Button */}
                {canComplete ? (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleCompleteClick}
                        disabled={isCompleting}
                        className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                        aria-label={`Mark ${project.title} as complete`}
                    >
                        {isCompleting ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1.5" aria-hidden="true" />
                                Completing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-3 w-3 mr-1.5" aria-hidden="true" />
                                Mark Complete
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        variant={joinButtonConfig.variant}
                        size="sm"
                        onClick={handleJoinClick}
                        disabled={joinButtonConfig.disabled || isJoining}
                        className="h-9"
                        aria-label={`${joinButtonConfig.label} for ${project.title}`}
                    >
                        {isJoining ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1.5" aria-hidden="true" />
                                Joining...
                            </>
                        ) : (
                            joinButtonConfig.label
                        )}
                    </Button>
                )}
            </div>
        </Card>
    );
};

/**
 * Memoized ProjectCard to prevent unnecessary re-renders
 */
export const ProjectCard = React.memo(ProjectCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.project.id === nextProps.project.id &&
        prevProps.project.updatedAt === nextProps.project.updatedAt &&
        prevProps.joinRequestStatus === nextProps.joinRequestStatus &&
        prevProps.isJoining === nextProps.isJoining &&
        prevProps.currentUserId === nextProps.currentUserId &&
        prevProps.isCompleting === nextProps.isCompleting &&
        prevProps.onComplete === nextProps.onComplete
    );
});

ProjectCard.displayName = 'ProjectCard';
