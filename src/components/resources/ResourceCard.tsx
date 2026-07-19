/**
 * ResourceCard Component
 * Redesigned to match resources.html
 * Text-focused glassmorphic card layout with category-based emoji icons and download stats.
 */

'use client';

import React from 'react';
import { cn, slugifyResource } from '@/lib/utils';
import { Resource } from '@/lib/api/types';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { trackResourceVisit } from '@/lib/utils/resource-visit-tracking';
import { getCategoryPlaceholder } from '@/lib/utils/resource-placeholders';
import { FileText, Share2, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface ResourceCardProps {
  resource: Resource;
}

function getCategoryEmoji(category: ResourceCategory): string {
  switch (category) {
    case ResourceCategory.PROGRAMMING: return '🌳';
    case ResourceCategory.WEB: return '🚀';
    case ResourceCategory.MOBILE: return '📱';
    case ResourceCategory.DATA_SCIENCE: return '📊';
    case ResourceCategory.DESIGN: return '🎨';
    case ResourceCategory.DEVOPS: return '🌐';
    case ResourceCategory.BUSINESS: return '💼';
    default: return '📦';
  }
}

function getCategoryLabel(category: ResourceCategory): string {
  const labels: Record<ResourceCategory, string> = {
    [ResourceCategory.PROGRAMMING]: 'Programming',
    [ResourceCategory.DESIGN]: 'Design',
    [ResourceCategory.BUSINESS]: 'Business',
    [ResourceCategory.DATA_SCIENCE]: 'Data Science',
    [ResourceCategory.DEVOPS]: 'DevOps',
    [ResourceCategory.MOBILE]: 'Mobile',
    [ResourceCategory.WEB]: 'Web',
    [ResourceCategory.OTHER]: 'Other',
  };
  return labels[category] || category;
}

function getTypeBadgeClass(type: ResourceType): string {
  const classes: Record<ResourceType, string> = {
    [ResourceType.ARTICLE]: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    [ResourceType.VIDEO]: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    [ResourceType.COURSE]: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    [ResourceType.BOOK]: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    [ResourceType.TOOL]: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    [ResourceType.DOCUMENTATION]: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  };

  return classes[type] || classes[ResourceType.ARTICLE];
}

function truncateDescription(description: string, maxLength: number = 150): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.slice(0, maxLength).trim() + '...';
}

function formatAccessCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

const ResourceCardComponent = ({ resource }: ResourceCardProps) => {
  const [copied, setCopied] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const resourceSlug = slugifyResource(resource.id, resource.title);

  const handleShare = async () => {
    const url = `${window.location.origin}/resources/${resourceSlug}`;
    const shareData = {
      title: resource.title,
      text: `Check out this resource: ${resource.title}`,
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

  const category = resource.category as ResourceCategory;
  const type = resource.type as ResourceType;
  const truncatedDescription = truncateDescription(resource.description);
  const formattedAccessCount = formatAccessCount(resource.accessCount);

  const hasPDF = Boolean(resource.pdfUrl);
  const formattedFileSize = resource.pdfFileSize ? formatFileSize(resource.pdfFileSize) : null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="p-resource-card group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      role="article"
      aria-label={`Resource: ${resource.title}`}
    >
      {/* Card Image Banner — object-contain prevents cover cropping */}
      <Link href={`/resources/${resourceSlug}`} className="relative block w-full h-44 mb-4 rounded-xl overflow-hidden bg-slate-900/90 border border-border/50 p-2">
        <Image
          src={imageError ? getCategoryPlaceholder(category) : (resource.imageUrl || getCategoryPlaceholder(category))}
          alt={resource.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        {/* Overlay type badge */}
        <span className={cn('absolute top-2 right-2 badge-event text-xs font-semibold px-2.5 py-1 border bg-background/90 backdrop-blur-md', getTypeBadgeClass(type))}>
          {type}
        </span>
      </Link>

      {/* Title & Description */}
      <div className="flex flex-col gap-1 mb-2">
        <span className="text-xs font-bold text-primary dark:text-[#A78BFA] uppercase tracking-wider">
          {getCategoryLabel(category)}
        </span>
        <h3 className="p-resource-title group-hover:text-primary dark:group-hover:text-cyan-light transition-colors m-0">
          <Link href={`/resources/${resourceSlug}`} className="hover:underline">
            {resource.title}
          </Link>
        </h3>
      </div>
      <p className="p-resource-desc line-clamp-3">
        {truncatedDescription}
      </p>

      {/* Action Buttons Section */}
      <div className="flex flex-col gap-2 mt-auto mb-4" onClick={stop}>
        {/* PDF Details if applicable */}
        {hasPDF && resource.pdfFileName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-50" title={resource.pdfFileName}>
              {resource.pdfFileName}
            </span>
            {formattedFileSize && (
              <span className="text-xs opacity-70">({formattedFileSize})</span>
            )}
          </div>
        )}

        {/* Access button pointing to dedicated slug page */}
        <div className="flex gap-2 w-full">
          <Link
            href={`/resources/${resourceSlug}`}
            className="flex-1 btn-redesign btn-redesign-primary btn-redesign-sm rounded-full text-center justify-center font-semibold cursor-pointer inline-flex items-center gap-1.5"
            aria-label={`Access ${resource.title}`}
          >
            <span>Access Resource</span>
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="p-resource-footer" onClick={stop}>
        <div className="p-resource-stats" aria-label={`${resource.accessCount} views`}>
          <span>{formattedAccessCount}</span> visits
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          title={copied ? 'Link copied!' : 'Share'}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
          aria-label={copied ? 'Link copied!' : `Share ${resource.title}`}
          aria-live="polite"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
          ) : (
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </footer>
    </div>
  );
};

export const ResourceCard = React.memo(ResourceCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.resource.id === nextProps.resource.id &&
    prevProps.resource.updatedAt === nextProps.resource.updatedAt &&
    prevProps.resource.accessCount === nextProps.resource.accessCount &&
    prevProps.resource.pdfUrl === nextProps.resource.pdfUrl &&
    prevProps.resource.pdfFileName === nextProps.resource.pdfFileName
  );
});

ResourceCard.displayName = 'ResourceCard';
