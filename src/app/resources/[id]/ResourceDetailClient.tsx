'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  FileText, 
  Share2, 
  Check, 
  Loader2, 
  ExternalLink, 
  Download, 
  Eye, 
  Clock, 
  Compass,
  Sparkles
} from 'lucide-react';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { trackResourceVisit } from '@/lib/utils/resource-visit-tracking';
import { getCategoryPlaceholder } from '@/lib/utils/resource-placeholders';
import { cn, slugifyResource } from '@/lib/utils';
import type { Resource } from '@/lib/api/types';

export interface ResourceDetailClientProps {
  resource: Resource;
  relatedResources: Resource[];
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

export function ResourceDetailClient({ resource, relatedResources }: ResourceDetailClientProps) {
  const [isVisiting, setIsVisiting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const category = resource.category as ResourceCategory;
  const type = resource.type as ResourceType;
  const hasURL = Boolean(resource.url);
  const hasPDF = Boolean(resource.pdfUrl || resource.pdfPublicId);
  const formattedFileSize = resource.pdfFileSize ? formatFileSize(resource.pdfFileSize) : null;
  const formattedAccessCount = formatAccessCount(resource.accessCount);
  const resourceSlug = slugifyResource(resource.id, resource.title);

  const handleShare = async () => {
    const url = `${window.location.origin}/resources/${resourceSlug}`;
    const shareData = {
      title: `${resource.title} - Quick Reference | Velonx`,
      text: resource.description,
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleURLClick = async () => {
    if (isVisiting || !resource.url) return;
    setIsVisiting(true);
    try {
      await trackResourceVisit(resource.id);
    } catch (error) {
      console.error('Failed to track resource visit:', error);
    } finally {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      setIsVisiting(false);
    }
  };

  const handlePDFView = async () => {
    if (isVisiting || !resource.pdfPublicId) return;
    setIsVisiting(true);
    try {
      await trackResourceVisit(resource.id);
      const response = await fetch(`/api/resources/pdf/${encodeURIComponent(resource.pdfPublicId)}`);
      if (!response.ok) throw new Error('Failed to access PDF');
      const data = await response.json();
      if (data.success && data.data?.url) {
        window.open(data.data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to access PDF:', error);
      alert('Failed to access PDF. Please try again.');
    } finally {
      setIsVisiting(false);
    }
  };

  const handlePDFDownload = async () => {
    if (!resource.pdfPublicId || !resource.pdfFileName) return;
    try {
      await trackResourceVisit(resource.id);
      const response = await fetch(`/api/resources/pdf/${encodeURIComponent(resource.pdfPublicId)}`);
      if (!response.ok) throw new Error('Failed to access PDF');
      const data = await response.json();
      if (data.success && data.data?.url) {
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
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb & Navigation Header */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-between">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/resources?tab=references" className="hover:text-foreground transition-colors">Resources</Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-bold truncate max-w-50 sm:max-w-xs" aria-current="page">
              {resource.title}
            </li>
          </ol>

          <Link
            href="/resources?tab=references"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-card border border-border/60 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Guides</span>
          </Link>
        </nav>

        {/* Main Resource Article Hub */}
        <article className="bg-card border border-border/60 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden mb-12">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Image Banner — object-contain prevents cover truncation */}
            <div className="lg:col-span-5 relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-900/90 border border-border/50 p-3 shadow-md">
              <Image
                src={imageError ? getCategoryPlaceholder(category) : (resource.imageUrl || getCategoryPlaceholder(category))}
                alt={resource.title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain"
                onError={() => setImageError(true)}
                priority
              />
              <span className={cn('absolute top-3 right-3 badge-event text-xs font-bold px-3 py-1 border bg-background/90 backdrop-blur-md shadow-xs', getTypeBadgeClass(type))}>
                {type}
              </span>
            </div>

            {/* Right Column: Resource Details & Actions */}
            <div className="lg:col-span-7 flex flex-col h-full justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-xs font-extrabold text-primary dark:text-[#A78BFA] uppercase tracking-widest">
                    {getCategoryLabel(category)}
                  </span>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold cursor-pointer"
                    aria-label="Share resource"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug mb-4">
                  {resource.title}
                </h1>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                  {resource.description}
                </p>

                {/* Metadata badges */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-primary" />
                    <span><strong className="text-foreground">{formattedAccessCount}</strong> visits</span>
                  </div>
                  {hasPDF && resource.pdfFileName && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="truncate max-w-45" title={resource.pdfFileName}>{resource.pdfFileName}</span>
                      {formattedFileSize && <span className="opacity-75">({formattedFileSize})</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>Added {new Date(resource.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                {hasURL && (
                  <button
                    onClick={handleURLClick}
                    disabled={isVisiting}
                    className="flex-1 px-6 py-3 bg-[#1A234A] hover:bg-[#226CE0] text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isVisiting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Visit Resource</span>
                      </>
                    )}
                  </button>
                )}

                {hasPDF && (
                  <>
                    <button
                      onClick={handlePDFView}
                      disabled={isVisiting}
                      className="flex-1 px-5 py-3 bg-card hover:bg-muted border border-border/80 text-foreground font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isVisiting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                          <Eye className="w-4 h-4 text-primary" />
                          <span>View PDF</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handlePDFDownload}
                      className="flex-1 px-5 py-3 bg-linear-to-r from-[#226CE0] to-[#8B5CF6] hover:from-[#334DAF] hover:to-[#7C3AED] text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>
        </article>

        {/* Related Quick References Section */}
        {relatedResources.length > 0 && (
          <section className="space-y-6" aria-labelledby="related-resources-heading">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-[#A78BFA] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>More in {getCategoryLabel(category)}</span>
                </div>
                <h2 id="related-resources-heading" className="text-xl font-bold text-foreground">
                  Related Quick References
                </h2>
              </div>
              <Link
                href="/resources?tab=references"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Explore all</span>
                <Compass className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedResources.map((rel) => (
                <ResourceCard key={rel.id} resource={rel} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
