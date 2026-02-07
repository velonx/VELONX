/**
 * Resources Page
 * Feature: resources-page-ui-improvements
 * 
 * Main page component for browsing and discovering learning resources.
 * Integrates search, filtering, pagination, and resource display.
 * 
 * Requirements:
 * - 1.1: Real search functionality with debouncing
 * - 1.2: API integration for fetching resources
 * - 1.3: Display search results in grid
 * - 2.1: Complete category filtering
 * - 3.1: Resource type filtering
 * - 5.1: Pagination implementation
 * - 8.4: Page header with title and description
 */

'use client';

import * as React from 'react';
import { Sparkles, Search, X } from 'lucide-react';
import {
  ResourcesGrid,
  Pagination,
  FilterPanel,
} from '@/components/resources';
import { useResources } from '@/lib/hooks/useResources';
import { useResourceFilters } from '@/lib/hooks/useResourceFilters';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { ScreenReaderAnnouncer } from '@/components/screen-reader-announcer';

/**
 * ResourcesPage Component
 * 
 * Main page component that orchestrates:
 * - Search functionality with debouncing
 * - Category and type filtering
 * - Resource grid display with loading/error states
 * - Pagination
 * - URL synchronization for shareable links
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 2.1, 3.1, 5.1, 8.4
 */
export default function ResourcesPage() {
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

      {/* Hero Section / Header */}
      <section className="relative py-16 bg-background overflow-hidden" aria-labelledby="page-title">

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            {/* Title */}
            <h1
              id="page-title"
              className="text-4xl md:text-6xl mb-6 text-foreground"
              style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}
            >
              Master New <span className="text-primary">Skills</span> Every Day
            </h1>

            {/* Description */}
            <p
              className="text-muted-foreground text-xl mb-8 mx-auto whitespace-nowrap"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
            >
              Curated tutorials, articles, courses, and tools to accelerate your learning journey.
            </p>

            {/* Search Bar - Matching Events/Projects Style */}
            <div className="w-full max-w-md mx-auto pt-2 md:pt-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  placeholder="Search resources by title or description..."
                  className="w-full pl-12 pr-12 py-3 md:py-4 rounded-full bg-card border-2 border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                  aria-label="Search resources"
                  type="search"
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                />
                {filters.search && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Filters Section */}
      <section className="py-8 bg-background" aria-labelledby="filters-heading">
        <div className="container mx-auto px-4">
          <h2 id="filters-heading" className="sr-only">Filter Resources</h2>

          <div className="flex items-center justify-end">
            {/* Filter Panel - Right Side */}
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
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

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
