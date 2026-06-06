'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Search, X } from 'lucide-react';
import {
  ResourcesGrid,
  Pagination,
  FilterPanel,
} from '@/components/resources';
import { useResources } from '@/lib/hooks/useResources';
import { useResourceFilters } from '@/lib/hooks/useResourceFilters';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { ScreenReaderAnnouncer } from '@/components/screen-reader-announcer';
import { cn } from '@/lib/utils';

function ResourcesPage() {
  // Screen reader announcements
  const [announcement, setAnnouncement] = React.useState('');

  // Use resource filters hook for state management with URL sync
  const {
    filters,
    setSearch,
    toggleCategory,
    toggleType,
    clearAllFilters,
    removeFilter,
    setPage,
  } = useResourceFilters();

  // Fetch resources from API with current filters
  const {
    resources,
    pagination,
    isLoading,
    error,
    refetch,
    retry,
  } = useResources({
    search: filters.search,
    category: filters.categories[0], // API currently supports single category
    type: filters.types[0], // API currently supports single type
    page: filters.page,
    pageSize: filters.pageSize,
  });

  // Track if retry is in progress
  const [isRetrying, setIsRetrying] = React.useState(false);

  // Track if any filters are active (needed for ResourcesGrid)
  const hasActiveFilters = React.useMemo(() => {
    return !!(
      filters.search ||
      filters.categories.length > 0 ||
      filters.types.length > 0
    );
  }, [filters.search, filters.categories.length, filters.types.length]);

  // Announce loading state changes
  React.useEffect(() => {
    if (isLoading) {
      setAnnouncement('Loading resources...');
    } else if (error) {
      setAnnouncement('Error loading resources. Please try again.');
    } else if (resources && resources.length > 0) {
      const count = resources.length;
      const total = pagination?.totalCount || count;
      setAnnouncement(`Loaded ${count} of ${total} resources`);
    } else if (resources && resources.length === 0) {
      setAnnouncement('No resources found');
    }
  }, [isLoading, error, resources, pagination?.totalCount]);

  // Announce filter changes
  React.useEffect(() => {
    if (!isLoading) {
      const filterCount = (filters.search ? 1 : 0) + filters.categories.length + filters.types.length;
      if (filterCount > 0) {
        setAnnouncement(`${filterCount} ${filterCount === 1 ? 'filter' : 'filters'} applied`);
      }
    }
  }, [filters.search, filters.categories.length, filters.types.length, isLoading]);

  // Handle search change
  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearch(value);
    },
    [setSearch]
  );

  // Handle category toggle
  const handleCategoryToggle = React.useCallback(
    (category: ResourceCategory) => {
      toggleCategory(category);
    },
    [toggleCategory]
  );

  // Handle type toggle
  const handleTypeToggle = React.useCallback(
    (type: ResourceType) => {
      toggleType(type);
    },
    [toggleType]
  );

  // Handle clear all filters
  const handleClearAllFilters = React.useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  // Handle page change
  const handlePageChange = React.useCallback(
    (page: number) => {
      setPage(page);
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setPage]
  );

  // Handle retry after error
  const handleRetry = React.useCallback(async () => {
    setIsRetrying(true);
    try {
      await retry();
    } finally {
      setIsRetrying(false);
    }
  }, [retry]);
  return (
    <div className="min-h-screen pt-24 bg-background">
      {/* Screen Reader Announcements */}
      <ScreenReaderAnnouncer message={announcement} politeness="polite" />

      {/* Page Hero */}
      <header className="relative pt-16 pb-12 bg-background overflow-hidden text-center" aria-labelledby="page-title">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <span className="p-section-label">CURATED REPOSITORY</span>
          <h1 id="page-title" className="p-display-1">
            Tech <span className="gradient-text font-black">Resources</span>
          </h1>
          <p className="text-muted-foreground max-w-150 mt-4 text-base md:text-lg leading-relaxed">
            Expertly structured, handpicked roadmaps, cheatsheets, and interview kits designed to level the career playing field.
          </p>
        </div>
      </header>

      {/* Resource Filter Tabs Section */}
      <section className="pb-8 bg-background" aria-labelledby="filters-heading">
        <div className="container mx-auto px-4">
          <h2 id="filters-heading" className="sr-only">Filter Resources</h2>
          {/* Search bar and Filters container */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources, cheat sheets, PDF guides..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 rounded-full bg-card border border-border focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
              />
              {filters.search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Panel - Right Side for Types */}
              <FilterPanel
                selectedCategories={filters.categories}
                selectedTypes={filters.types}
                onCategoryToggle={handleCategoryToggle}
                onTypeToggle={handleTypeToggle}
                onClearAll={handleClearAllFilters}
                resourceCount={pagination?.totalCount}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

      {/* Resources Grid Section */}
      <main className="py-12 bg-background" aria-labelledby="resources-heading">
        <div className="container mx-auto px-4">
          <h2 id="resources-heading" className="sr-only">Available Resources</h2>
          <ResourcesGrid
            resources={resources || []}
            isLoading={isLoading}
            error={error}
            hasActiveFilters={hasActiveFilters}
            onRetry={handleRetry}
            onClearFilters={handleClearAllFilters}
            isRetrying={isRetrying}
          />
        </div>
      </main>

      {/* Pagination Section */}
      {pagination && pagination.totalPages > 1 && (
        <section className="py-8 bg-background border-t">
          <div className="container mx-auto px-4">
            <Pagination
              currentPage={filters.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default function ResourcesClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Search className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-lg text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    }>
      <ResourcesPage />
    </Suspense>
  );
}
