/**
 * ResourceCard Component
 * Feature: resources-page-ui-improvements, resource-pdf-upload
 * 
 * Displays individual resource information in a card layout with image,
 * title, description, category, type badge, and access count.
 * Supports PDF resources with view and download functionality.
 * 
 * Requirements:
 * - 4.1: Display title, description, category, type, and image
 * - 4.2: Display image with Next.js Image component
 * - 4.3: Fallback placeholder images by category
 * - 4.4: Description truncation (150 characters)
 * - 4.5: Display type as visual badge
 * - 9.1: Track resource visits with API call
 * - 9.3: Non-blocking navigation on tracking failure
 * - 9.4: Display access count as popularity indicator
 * 
 * PDF Upload Feature Requirements:
 * - 4.1: Display PDF indicator icon when pdfUrl exists
 * - 4.2: Display PDF file name
 * - 4.3: Show appropriate UI based on available access methods
 * - 4.4: Display URL only, PDF only, or both
 * - 4.5: Format and display file size
 * - 5.1: Provide view PDF button that opens in new tab
 * - 5.2: Provide download PDF button
 * - 5.3: Track visits for PDF access
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Resource } from '@/lib/api/types';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { getCategoryPlaceholder } from '@/lib/utils/resource-placeholders';
import { trackResourceVisit } from '@/lib/utils/resource-visit-tracking';
import {
  Eye,
  BookOpen,
  Video,
  GraduationCap,
  Book,
  Wrench,
  FileText,
  FileDown,
  ExternalLink,
  Download
} from 'lucide-react';

export interface ResourceCardProps {
  resource: Resource;
}

/**
 * Get type icon component
 */
function getTypeIcon(type: ResourceType) {
  const iconProps = { className: 'h-3 w-3', 'aria-hidden': true };

  switch (type) {
    case ResourceType.ARTICLE:
      return <FileText {...iconProps} />;
    case ResourceType.VIDEO:
      return <Video {...iconProps} />;
    case ResourceType.COURSE:
      return <GraduationCap {...iconProps} />;
    case ResourceType.BOOK:
      return <Book {...iconProps} />;
    case ResourceType.TOOL:
      return <Wrench {...iconProps} />;
    case ResourceType.DOCUMENTATION:
      return <BookOpen {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
}

/**
 * Get type badge styling
 */
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

/**
 * Get category display name
 */
function getCategoryDisplayName(category: ResourceCategory): string {
  const names: Record<ResourceCategory, string> = {
    [ResourceCategory.PROGRAMMING]: 'Programming',
    [ResourceCategory.DESIGN]: 'Design',
    [ResourceCategory.BUSINESS]: 'Business',
    [ResourceCategory.DATA_SCIENCE]: 'Data Science',
    [ResourceCategory.DEVOPS]: 'DevOps',
    [ResourceCategory.MOBILE]: 'Mobile',
    [ResourceCategory.WEB]: 'Web',
    [ResourceCategory.OTHER]: 'Other',
  };

  return names[category] || 'Other';
}

/**
 * Truncate description to specified length
 */
function truncateDescription(description: string, maxLength: number = 150): string {
  if (description.length <= maxLength) {
    return description;
  }

  return description.slice(0, maxLength).trim() + '...';
}

/**
 * Format access count for display
 */
function formatAccessCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

/**
 * ResourceCard Component
 * 
 * Displays a resource summary with image, title, description, and metadata.
 * Handles visit tracking on click and navigates to resource URL.
 * Supports PDF resources with view and download options.
 * Memoized to prevent unnecessary re-renders.
 */
const ResourceCardComponent = ({ resource }: ResourceCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const [isVisiting, setIsVisiting] = React.useState(false);

  const category = resource.category as ResourceCategory;
  const type = resource.type as ResourceType;
  const imageUrl = resource.imageUrl && !imageError
    ? resource.imageUrl
    : getCategoryPlaceholder(category);
  const truncatedDescription = truncateDescription(resource.description);
  const formattedAccessCount = formatAccessCount(resource.accessCount);

  // Determine available access methods
  const hasURL = Boolean(resource.url);
  const hasPDF = Boolean(resource.pdfUrl);
  const formattedFileSize = resource.pdfFileSize ? formatFileSize(resource.pdfFileSize) : null;

  /**
   * Handle URL click - track visit and navigate to resource URL
   * Requirements: 9.1, 9.3
   */
  const handleURLClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVisiting || !resource.url) return;

    setIsVisiting(true);

    try {
      // Track visit asynchronously (non-blocking)
      await trackResourceVisit(resource.id);
    } catch (error) {
      console.error('Failed to track resource visit:', error);
    } finally {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      setIsVisiting(false);
    }
  };

  /**
   * Handle PDF view - track visit and open PDF in new tab
   * Uses authenticated proxy route to ensure secure access
   */
  const handlePDFView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVisiting || !resource.pdfPublicId) return;

    setIsVisiting(true);

    try {
      await trackResourceVisit(resource.id);
      
      // Get signed URL from proxy route
      const response = await fetch(`/api/resources/pdf/${encodeURIComponent(resource.pdfPublicId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to access PDF');
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.url) {
        window.open(data.data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to access PDF:', error);
      alert('Failed to access PDF. Please try again or contact support.');
    } finally {
      setIsVisiting(false);
    }
  };

  /**
   * Handle PDF download
   * Uses authenticated proxy route to ensure secure access
   */
  const handlePDFDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resource.pdfPublicId || !resource.pdfFileName) return;

    try {
      await trackResourceVisit(resource.id);
      
      // Get signed URL from proxy route
      const response = await fetch(`/api/resources/pdf/${encodeURIComponent(resource.pdfPublicId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to access PDF');
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.url) {
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = data.data.url;
        link.download = resource.pdfFileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again or contact support.');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'flex flex-col h-full bg-card border border-border rounded-2xl'
      )}
      role="article"
      aria-label={`Resource: ${resource.title}`}
    >
      {/* Image Section */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        <Image
          src={imageUrl}
          alt={resource.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Type Badge Overlay */}
        <div className="absolute top-3 right-3">
          <Badge className={cn('text-xs border backdrop-blur-md shadow-lg', getTypeBadgeClass(type))}>
            {getTypeIcon(type)}
            <span className="ml-1.5 font-semibold">{type}</span>
          </Badge>
        </div>

        {/* PDF Indicator Badge */}
        {hasPDF && (
          <div className="absolute top-3 left-3">
            <Badge className="text-xs border backdrop-blur-md shadow-lg bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
              <FileDown className="h-3 w-3" aria-hidden="true" />
              <span className="ml-1.5 font-semibold">PDF</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <article className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
          {truncatedDescription}
        </p>

        {/* PDF Information */}
        {hasPDF && resource.pdfFileName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate" title={resource.pdfFileName}>
              {resource.pdfFileName}
            </span>
            {formattedFileSize && (
              <span className="text-xs text-muted-foreground/70">
                ({formattedFileSize})
              </span>
            )}
          </div>
        )}

        {/* Access Buttons */}
        <div className="flex flex-col gap-2">
          {/* URL Access Button */}
          {hasURL && (
            <button
              onClick={handleURLClick}
              disabled={isVisiting}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                'bg-primary text-primary-foreground font-medium text-sm',
                'hover:bg-primary/90 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Visit resource URL"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span>Visit Resource</span>
            </button>
          )}

          {/* PDF Access Buttons */}
          {hasPDF && (
            <div className="flex gap-2">
              <button
                onClick={handlePDFView}
                disabled={isVisiting}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                  'bg-secondary text-secondary-foreground font-medium text-sm',
                  'hover:bg-secondary/80 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="View PDF"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>View PDF</span>
              </button>
              <button
                onClick={handlePDFDownload}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                  'bg-secondary text-secondary-foreground font-medium text-sm',
                  'hover:bg-secondary/80 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2'
                )}
                aria-label="Download PDF"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer: Category and Access Count */}
        <footer className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <Badge variant="outline" className="text-xs border-border font-medium">
            {getCategoryDisplayName(category)}
          </Badge>

          <div
            className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
            aria-label={`${resource.accessCount} views`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{formattedAccessCount}</span>
          </div>
        </footer>
      </article>
    </Card>
  );
};

/**
 * Memoized ResourceCard to prevent unnecessary re-renders
 */
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
