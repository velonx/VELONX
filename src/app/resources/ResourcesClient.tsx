'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Search, X, Compass, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  ResourcesGrid,
  Pagination,
  FilterPanel,
  PathCard,
  PathDetailHub
} from '@/components/resources';
import { useResources } from '@/lib/hooks/useResources';
import { useResourceFilters } from '@/lib/hooks/useResourceFilters';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { ScreenReaderAnnouncer } from '@/components/screen-reader-announcer';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function ResourcesPage() {
  const { data: session } = useSession();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<'paths' | 'references'>('paths');

  // Drilldown Learning Path State
  const [activePathId, setActivePathId] = React.useState<string | null>(null);
  const [learningPaths, setLearningPaths] = React.useState<any[]>([]);
  const [loadingPaths, setLoadingPaths] = React.useState(false);
  const [selectedPath, setSelectedPath] = React.useState<any | null>(null);
  const [loadingPathDetails, setLoadingPathDetails] = React.useState(false);

  // Screen reader announcements
  const [announcement, setAnnouncement] = React.useState('');

  // Use resource filters hook for state management with URL sync
  const {
    filters,
    setSearch,
    toggleCategory,
    toggleType,
    clearAllFilters,
    setPage,
  } = useResourceFilters();

  // Fetch resources from API with current filters
  const {
    resources,
    pagination,
    isLoading,
    error,
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

  // Fetch all learning paths
  const fetchPaths = React.useCallback(async () => {
    setLoadingPaths(true);
    try {
      const response = await fetch('/api/learning-paths');
      const data = await response.json();
      if (data.success) {
        setLearningPaths(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch paths:", err);
    } finally {
      setLoadingPaths(false);
    }
  }, []);

  // Fetch single path details
  const fetchPathDetails = React.useCallback(async (id: string) => {
    setLoadingPathDetails(true);
    try {
      const response = await fetch(`/api/learning-paths/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedPath(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch path details:", err);
      toast.error("Failed to load path details");
    } finally {
      setLoadingPathDetails(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'paths') {
      fetchPaths();
    }
  }, [activeTab, fetchPaths]);

  React.useEffect(() => {
    if (activePathId) {
      fetchPathDetails(activePathId);
    } else {
      setSelectedPath(null);
    }
  }, [activePathId, fetchPathDetails]);

  // Announce loading state changes
  React.useEffect(() => {
    if (activeTab === 'references') {
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
    } else {
      if (loadingPaths) {
        setAnnouncement('Loading learning paths...');
      } else if (learningPaths && learningPaths.length > 0) {
        setAnnouncement(`Loaded ${learningPaths.length} learning paths`);
      }
    }
  }, [isLoading, error, resources, pagination?.totalCount, activeTab, loadingPaths, learningPaths]);

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

  // Handle page change
  const handlePageChange = React.useCallback(
    (page: number) => {
      setPage(page);
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
      <header className="relative pt-16 pb-10 bg-background overflow-hidden text-center" aria-labelledby="page-title">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <span className="p-section-label">STUDENT ECOSYSTEM</span>
          <h1 id="page-title" className="p-display-1">
            Tech <span className="gradient-text font-black">Academy & Guides</span>
          </h1>
          <p className="text-muted-foreground max-w-150 mt-4 text-base md:text-lg leading-relaxed">
            Expertly structured career roadmaps, module checkpoints, cheatsheets, and verified certifications designed to level the career playing field.
          </p>
        </div>
      </header>

      {/* Tab Switcher Navigation */}
      <section className="bg-background border-b border-border/40 pb-6 mb-8" aria-label="Ecosystem View Tabs">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="bg-muted/40 p-1.5 rounded-2xl border border-border/60 flex gap-2">
            <button
              onClick={() => {
                setActiveTab('paths');
                setActivePathId(null);
              }}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer",
                activeTab === 'paths'
                  ? "bg-[#1A234A] text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Compass className="w-4 h-4" />
              Learning Paths
            </button>
            <button
              onClick={() => {
                setActiveTab('references');
                setActivePathId(null);
              }}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer",
                activeTab === 'references'
                  ? "bg-[#1A234A] text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <FileText className="w-4 h-4" />
              Quick References
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Main Body Content */}
      <main className="pb-20 bg-background">
        <div className="container mx-auto px-4">
          
          {activeTab === 'references' ? (
            // ==========================================
            // QUICK REFERENCES VIEW (CHEAT SHEETS / DOWNLOADS)
            // ==========================================
            <>
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="relative flex-1 md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search resources, cheat sheets, PDF guides..."
                    value={filters.search || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 rounded-full bg-card border border-border focus:border-[#226CE0] focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
                  />
                  {filters.search && (
                    <button
                      onClick={() => handleSearchChange('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <FilterPanel
                    selectedCategories={filters.categories}
                    selectedTypes={filters.types}
                    onCategoryToggle={handleCategoryToggle}
                    onTypeToggle={handleTypeToggle}
                    onClearAll={clearAllFilters}
                    resourceCount={pagination?.totalCount}
                  />
                </div>
              </div>

              {/* Grid Section */}
              <ResourcesGrid
                resources={resources || []}
                isLoading={isLoading}
                error={error}
                hasActiveFilters={hasActiveFilters}
                onRetry={handleRetry}
                onClearFilters={clearAllFilters}
                isRetrying={isRetrying}
              />

              {/* Pagination Section */}
              {pagination && pagination.totalPages > 1 && (
                <section className="py-8 bg-background border-t border-border/30 mt-8">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </section>
              )}
            </>
          ) : (
            // ==========================================
            // LEARNING PATHS ROADMAPS & CHECKPOINTS VIEW
            // ==========================================
            <>
              {activePathId ? (
                // Drilldown Roadmap Hub
                loadingPathDetails || !selectedPath ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0]"></div>
                  </div>
                ) : (
                  <PathDetailHub
                    path={selectedPath}
                    onBack={() => setActivePathId(null)}
                    onRefresh={() => fetchPathDetails(activePathId)}
                    studentName={session?.user?.name || "A Velonx Student"}
                  />
                )
              ) : (
                // Top-level Roadmaps Listing Grid
                loadingPaths ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">Loading roadmaps...</p>
                  </div>
                ) : learningPaths.length === 0 ? (
                  <div className="text-center py-20 max-w-sm mx-auto space-y-3">
                    <Compass className="w-16 h-16 text-zinc-300 mx-auto animate-pulse" />
                    <h3 className="text-lg font-bold text-[#1A234A] dark:text-white">No roadmaps configured yet</h3>
                    <p className="text-xs text-muted-foreground">
                      Our mentors are designing structured career roadmaps. Check back soon!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {learningPaths.map((path) => (
                      <PathCard
                        key={path.id}
                        path={path}
                        onSelect={(id) => setActivePathId(id)}
                      />
                    ))}
                  </div>
                )
              )}
            </>
          )}

        </div>
      </main>
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
