/**
 * ProjectModal Component
 * Full project details modal with focus trap and accessibility features.
 */

'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/utils';
import {
  ExtendedProject,
  UserProjectRelationship,
  CATEGORY_COLORS,
} from '@/lib/types/project-page.types';
import {
  Github,
  ExternalLink,
  Calendar,
  Target,
  Loader2,
  Crown,
} from 'lucide-react';

export interface ProjectModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinRequest: (projectId: string) => void;
  project?: ExtendedProject | null;
  joinRequestStatus?: UserProjectRelationship;
  isJoining?: boolean;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
      return { label: 'Active', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' };
    case 'COMPLETED':
      return { label: 'Completed', className: 'bg-blue-500/10 text-blue-400 border-blue-500/25' };
    case 'PLANNING':
      return { label: 'Planning', className: 'bg-amber-500/10 text-amber-500 border-amber-500/25' };
    case 'ARCHIVED':
      return { label: 'Archived', className: 'bg-muted/50 text-muted-foreground border-border' };
    default:
      return { label: status, className: 'bg-muted/50 text-muted-foreground border-border' };
  }
}

function getJoinButtonConfig(status: UserProjectRelationship) {
  switch (status) {
    case 'owner': return { label: 'Your Project', variant: 'secondary' as const, disabled: true };
    case 'member': return { label: 'Member', variant: 'secondary' as const, disabled: true };
    case 'pending': return { label: 'Request Pending', variant: 'outline' as const, disabled: true };
    default: return { label: 'Request to Join', variant: 'default' as const, disabled: false };
  }
}

function getInitials(name: string | null | undefined): string {
  if (!name || name.trim() === '') return 'UU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function ProjectModal({
  projectId,
  isOpen,
  onClose,
  onJoinRequest,
  project,
  joinRequestStatus = 'none',
  isJoining = false,
}: ProjectModalProps) {
  const titleId = 'project-modal-title';
  const descriptionId = 'project-modal-description';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const joinButtonConfig = getJoinButtonConfig(joinRequestStatus);

  const handleJoinClick = () => {
    if (!joinButtonConfig.disabled && !isJoining && projectId) {
      onJoinRequest(projectId);
    }
  };

  const openUrl = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  // ── Loading state ──────────────────────────────────────────────────────
  if (!project) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent aria-labelledby={titleId} aria-describedby={descriptionId}>
          <DialogHeader>
            <DialogTitle id={titleId}>Loading project…</DialogTitle>
            <DialogDescription id={descriptionId}>
              Please wait while we fetch the project details.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Loaded state ───────────────────────────────────────────────────────
  const statusConfig = getStatusConfig(project.status);
  const categoryConfig = project.category
    ? CATEGORY_COLORS[project.category]
    : CATEGORY_COLORS.OTHER;

  const members = project.members || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        {/* Coloured top border */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
          style={{ backgroundColor: categoryConfig.color }}
          aria-hidden="true"
        />

        <DialogHeader className="pt-2">
          <DialogTitle id={titleId} className="text-2xl font-bold">
            {project.title}
          </DialogTitle>
          <DialogDescription id={descriptionId}>
            <span className="sr-only">Full project details for {project.title}</span>
          </DialogDescription>
          <div className="flex items-center gap-2 flex-wrap">
            {project.category && <CategoryBadge category={project.category} size="sm" />}
            <Badge className={cn('text-xs border', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>Created {formatDate(project.createdAt)}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {project.description}
            </p>
          </div>

          <Separator />

          {/* Tech Stack */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, i) => (
                <Badge key={`${tech}-${i}`} variant="outline" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Team Members */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Team Members ({members.length})</h3>
            <div className="space-y-3">
              {members.map((member) => {
                const isOwner = member.userId === project.ownerId;
                const userName = member.user?.name || 'Unknown User';
                const userImage = member.user?.image;
                const initials = getInitials(userName);

                return (
                  <div
                    key={member.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border border-border',
                      isOwner && 'bg-amber-500/10 border-amber-500/30'
                    )}
                  >
                    <Avatar className="size-10">
                      {userImage && <AvatarImage src={userImage} alt={userName} />}
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{userName}</p>
                        {isOwner && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                            <Crown className="h-3 w-3 mr-1" aria-hidden="true" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      {member.role && (
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline & Outcomes */}
          {(project.createdAt || project.outcomes) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Timeline &amp; Outcomes</h3>
                {project.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Started</p>
                      <p className="text-sm text-muted-foreground">{formatDate(project.createdAt)}</p>
                    </div>
                  </div>
                )}
                {project.outcomes && (
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Outcomes</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{project.outcomes}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {project.githubUrl && (
                <Button variant="outline" onClick={() => openUrl(project.githubUrl!)} aria-label="View GitHub Repository">
                  <Github className="h-4 w-4 mr-2" aria-hidden="true" />
                  GitHub
                </Button>
              )}
              {project.liveUrl && (
                <Button variant="outline" onClick={() => openUrl(project.liveUrl!)} aria-label="View Live Demo">
                  <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                  Live Demo
                </Button>
              )}
            </div>

            <Button
              variant={joinButtonConfig.variant}
              onClick={handleJoinClick}
              disabled={joinButtonConfig.disabled || isJoining}
              aria-label={`${joinButtonConfig.label} for ${project.title}`}
            >
              {isJoining ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />Joining...</>
              ) : (
                joinButtonConfig.label
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

ProjectModal.displayName = 'ProjectModal';
