'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Search, X, Compass, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
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
import { getCSRFToken } from '@/lib/utils/csrf';

function ResourcesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<'paths' | 'references'>('paths');

  // Sync tab from URL if present
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'references' || tabParam === 'paths') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Drilldown Learning Path State
  const [activePathId, setActivePathId] = React.useState<string | null>(null);
  const [learningPaths, setLearningPaths] = React.useState<any[]>([]);
  const [loadingPaths, setLoadingPaths] = React.useState(false);
  const [selectedPath, setSelectedPath] = React.useState<any | null>(null);
  const [loadingPathDetails, setLoadingPathDetails] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [creatingPath, setCreatingPath] = React.useState(false);
  const [pathFilter, setPathFilter] = React.useState<'all' | 'official' | 'custom'>('all');

  const handleCreatePath = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreatingPath(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          level: formData.get('level'),
          duration: formData.get('duration'),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Custom roadmap created successfully! 🎉");
        setShowCreateModal(false);
        form.reset();
        fetchPaths();
      } else {
        throw new Error(data.error?.message || "Failed to create roadmap");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create roadmap");
    } finally {
      setCreatingPath(false);
    }
  };

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
          <p className="text-muted-foreground max-w-3xl mt-4 text-sm sm:text-base leading-relaxed">
            Accelerate your engineering journey. Navigate structured <strong className="text-[#226CE0] dark:text-blue-400">Learning Paths</strong> to complete interactive checkpoints, design your own custom learning roadmap, and coordinate offline test evaluations to earn your verified certificate. Use our <strong className="text-[#8B5CF6] dark:text-purple-400">Quick References</strong> library to access downloadable PDF guides, developer cheat sheets, and code templates for your daily coding.
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
                    currentUserId={session?.user?.id}
                    isAdmin={session?.user?.role === 'ADMIN'}
                  />
                )
              ) : (
                // Top-level Roadmaps Listing Grid
                <>
                  {session?.user && (
                    <div className="relative overflow-hidden mb-8 bg-linear-to-r from-[#1A234A]/5 to-[#8B5CF6]/5 dark:from-[#1A234A]/30 dark:to-[#8B5CF6]/10 border border-border/80 p-6 sm:p-8 rounded-3xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
                      {/* Decorative gradient glow orb */}
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-linear-to-br from-[#226CE0]/10 to-[#8B5CF6]/20 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-[#226CE0]/5 rounded-full blur-xl pointer-events-none" />

                      <div className="space-y-1.5 z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#226CE0]/10 text-[#226CE0] dark:bg-[#226CE0]/20 dark:text-blue-300 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                          <Compass className="w-3.5 h-3.5 animate-pulse" />
                          <span>Velonx Roadmap Creator</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#1A234A] to-[#8B5CF6] dark:from-white dark:to-purple-300 leading-tight">
                          Structured Roadmaps
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                          Follow vetted industry blueprints designed by top mentors or bootstrap your own private custom path to certified mastery.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="group shrink-0 h-11 px-5 bg-linear-to-r from-[#226CE0] to-[#8B5CF6] hover:from-[#334DAF] hover:to-[#7C3AED] text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 text-xs z-10"
                      >
                        <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                        <span>Create Custom Roadmap</span>
                      </button>
                    </div>
                  )}

                  {session?.user && (
                    <div className="flex gap-2 mb-6 bg-muted/40 p-1 rounded-xl max-w-sm border border-border/40">
                      <button
                        onClick={() => setPathFilter('all')}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                          pathFilter === 'all'
                            ? "bg-card text-foreground shadow-xs border-border/30"
                            : "text-muted-foreground hover:text-foreground border-transparent"
                        )}
                      >
                        All ({learningPaths.length})
                      </button>
                      <button
                        onClick={() => setPathFilter('official')}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                          pathFilter === 'official'
                            ? "bg-card text-foreground shadow-xs border-border/30"
                            : "text-muted-foreground hover:text-foreground border-transparent"
                        )}
                      >
                        Official ({learningPaths.filter(p => !p.creatorId).length})
                      </button>
                      <button
                        onClick={() => setPathFilter('custom')}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                          pathFilter === 'custom'
                            ? "bg-card text-foreground shadow-xs border-border/30"
                            : "text-muted-foreground hover:text-foreground border-transparent"
                        )}
                      >
                        Custom ({learningPaths.filter(p => !!p.creatorId).length})
                      </button>
                    </div>
                  )}

                  {loadingPaths ? (
                    <div className="text-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                      <p className="text-muted-foreground text-sm">Loading roadmaps...</p>
                    </div>
                  ) : (() => {
                    const filteredPaths = learningPaths.filter(p => {
                      if (pathFilter === 'official') return !p.creatorId;
                      if (pathFilter === 'custom') return !!p.creatorId;
                      return true;
                    });

                    if (filteredPaths.length === 0) {
                      return (
                        <div className="text-center py-20 max-w-sm mx-auto space-y-3">
                          <Compass className="w-16 h-16 text-zinc-300 mx-auto animate-pulse" />
                          <h3 className="text-lg font-bold text-[#1A234A] dark:text-white">No roadmaps found</h3>
                          <p className="text-xs text-muted-foreground">
                            {pathFilter === 'custom'
                              ? "You haven't created any custom roadmaps yet."
                              : "No structured roadmaps fit the selected criteria."}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPaths.map((path) => (
                          <PathCard
                            key={path.id}
                            path={path}
                            onSelect={(id) => setActivePathId(id)}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </>
          )}

          {/* CREATE CUSTOM ROADMAP MODAL */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[#1A234A] dark:text-white">Create Custom Roadmap</h3>
                  <p className="text-xs text-muted-foreground mt-1">Design your own learning path. This path will be private and only visible to you.</p>
                </div>
                
                <form onSubmit={handleCreatePath} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Roadmap Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. My Backend Engineering Path"
                      name="title"
                      className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-xs text-foreground font-medium outline-none focus:border-[#226CE0]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Description *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="What is your goal for this custom path?"
                      name="description"
                      className="w-full p-3 bg-muted border border-border rounded-xl text-xs text-foreground font-medium outline-none focus:border-[#226CE0] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Difficulty Level</label>
                      <select
                        name="level"
                        className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-xs text-foreground font-medium outline-none focus:border-[#226CE0]"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Duration</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 4 Weeks"
                        name="duration"
                        className="w-full h-10 px-3 bg-muted border border-border rounded-xl text-xs text-foreground font-medium outline-none focus:border-[#226CE0]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="h-10 px-4 rounded-xl border border-border text-foreground hover:bg-muted font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingPath}
                      className="h-10 px-5 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                    >
                      {creatingPath ? "Creating..." : "Create Roadmap"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
