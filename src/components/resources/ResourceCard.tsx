/**
 * ResourceCard Component
 * Updated to match 16:9 widescreen handbook card design
 */

'use client';

import React from 'react';
import { cn, slugifyResource } from '@/lib/utils';
import { Resource } from '@/lib/api/types';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { getCategoryPlaceholder } from '@/lib/utils/resource-placeholders';
import { FileText, Share2, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface ResourceCardProps {
  resource: Resource;
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
    [ResourceType.ARTICLE]: 'bg-[#1E293B]/80 text-blue-400 border-blue-500/30',
    [ResourceType.VIDEO]: 'bg-[#2E1065]/80 text-purple-300 border-purple-500/30',
    [ResourceType.COURSE]: 'bg-[#064E3B]/80 text-emerald-300 border-emerald-500/30',
    [ResourceType.BOOK]: 'bg-[#282015]/90 text-[#F59E0B] border-[#D97706]/40',
    [ResourceType.TOOL]: 'bg-[#831843]/80 text-pink-300 border-pink-500/30',
    [ResourceType.DOCUMENTATION]: 'bg-[#164E63]/80 text-cyan-300 border-cyan-500/30',
  };

  return classes[type] || classes[ResourceType.ARTICLE];
}

function truncateDescription(description: string, maxLength: number = 140): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.slice(0, maxLength).trim() + '...';
}

function formatAccessCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
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

  const hasPDF = Boolean(resource.pdfUrl || resource.pdfFileName);
  const formattedFileSize = resource.pdfFileSize ? formatFileSize(resource.pdfFileSize) : null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <article
      className="bg-card border border-border/60 hover:border-border rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group"
      aria-label={`Resource: ${resource.title}`}
    >
      <div>
        {/* Card Widescreen 16:9 Image Banner */}
        <Link 
          href={`/resources/${resourceSlug}`} 
          className="relative block w-full aspect-video mb-4 rounded-2xl overflow-hidden bg-[#1E2330] border border-border/40 p-2 group-hover:border-primary/40 transition-colors"
        >
          <Image
            src={imageError ? getCategoryPlaceholder(category) : (resource.imageUrl || getCategoryPlaceholder(category))}
            alt={resource.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          {/* Top-Right Type Overlay Badge */}
          <span className={cn('absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 border rounded-full backdrop-blur-md shadow-xs', getTypeBadgeClass(type))}>
            {type}
          </span>
        </Link>

        {/* Category Label */}
        <span className="text-[11px] font-extrabold text-[#226CE0] dark:text-blue-400 uppercase tracking-widest block mb-1">
          {getCategoryLabel(category)}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 leading-tight">
          <Link href={`/resources/${resourceSlug}`} className="hover:underline">
            {resource.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-4">
          {truncatedDescription}
        </p>
      </div>

      <div>
        {/* PDF File Details if present */}
        {hasPDF && resource.pdfFileName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 font-medium">
            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate max-w-45" title={resource.pdfFileName}>
              {resource.pdfFileName}
            </span>
            {formattedFileSize && (
              <span className="text-xs opacity-70">({formattedFileSize})</span>
            )}
          </div>
        )}

        {/* Full-width Access Resource Button */}
        <Link
          href={`/resources/${resourceSlug}`}
          className="w-full py-3 px-4 rounded-full bg-linear-to-r from-[#E86C1F] to-[#F97316] hover:from-[#D45B10] hover:to-[#EA580C] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-orange-500/20 active:translate-y-0.5 cursor-pointer mb-3"
          aria-label={`Access ${resource.title}`}
        >
          <span>Access Resource</span>
        </Link>

        {/* Horizontal Divider */}
        <div className="w-full border-t border-border/40 mb-3" />

        {/* Card Footer */}
        <footer className="flex items-center justify-between" onClick={stop}>
          <div className="text-xs text-muted-foreground font-medium" aria-label={`${resource.accessCount} views`}>
            <span>{formattedAccessCount}</span> visits
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            title={copied ? 'Link copied!' : 'Share'}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
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
    </article>
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
