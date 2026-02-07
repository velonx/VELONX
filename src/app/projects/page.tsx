"use client";

import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, CheckCircle, Clock, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { useProjects } from "@/lib/api/hooks";
import { SearchBar } from "@/components/projects/SearchBar";
import { FilterPanel } from "@/components/projects/FilterPanel";
import { SortControl } from "@/components/projects/SortControl";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { ProjectsErrorBoundary } from "@/components/projects/ProjectsErrorBoundary";
import { ErrorState } from "@/components/projects/ErrorState";

// Code splitting: Lazy load ProjectModal since it's only needed when user clicks a project
const ProjectModal = lazy(() =>
    import("@/components/projects/ProjectModal").then(mod => ({ default: mod.ProjectModal }))
);
import {
    ExtendedProject,
    ProjectFilters,
    SortOption,
    UserProjectRelationship,
} from "@/lib/types/project-page.types";
import {
    processProjects,
    getUniqueTechStacks,
    createEmptyFilters,
} from "@/lib/utils/project-filters";
import {
    getUserProjectRelationship,
} from "@/lib/utils/project-helpers";
import {
    loadSortPreference,
    loadFilterPreference,
    saveFilterPreference,
} from "@/lib/utils/session-storage";
import { performanceMonitor } from "@/lib/services/performance-monitor.service";
import { usePerformanceMonitoring, useWebVitals } from "@/lib/hooks/usePerformanceMonitoring";

function ProjectsPageContent() {
    const { data: session } = useSession();
    const router = useRouter();

    // Performance monitoring
    usePerformanceMonitoring('ProjectsPage');

    // Web Vitals monitoring (LCP, FID, CLS)
    useWebVitals();

    // State management
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filters, setFilters] = useState<ProjectFilters>(() =>
        loadFilterPreference(createEmptyFilters())
    );
    const [sortBy, setSortBy] = useState<SortOption>(() =>
        loadSortPreference('newest')
    );
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [joiningProjects, setJoiningProjects] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'running' | 'completed'>('running');

    // Fetch projects from API
    const {
        data: runningProjects,
        loading: runningLoading,
        error: runningError,
        refetch: refetchRunning
    } = useProjects({
        status: 'IN_PROGRESS',
        pageSize: 100
    });
    const {
        data: completedProjects,
        loading: completedLoading,
        error: completedError,
        refetch: refetchCompleted
    } = useProjects({
        status: 'COMPLETED',
        pageSize: 100
    });

    // Track retry state
    const [isRetrying, setIsRetrying] = useState(false);

    // Save filter preferences to session storage when they change
    useEffect(() => {
        saveFilterPreference(filters);
    }, [filters]);

    // Convert API projects to ExtendedProject type
    // Memoized to avoid unnecessary conversions on every render
    const extendedRunningProjects = useMemo<ExtendedProject[]>(() => {
        const startTime = performance.now();
        const result = (runningProjects || []).map(project => ({
            ...project,
            category: project.category as any,
            difficulty: project.difficulty as any,
            joinRequests: project.joinRequests as any,
        }));

        // Track conversion time for performance monitoring
        const duration = performance.now() - startTime;
        if (duration > 50) { // Only log if conversion takes more than 50ms
            console.debug(`[Performance] Running projects conversion took ${duration.toFixed(2)}ms`);
        }

        return result;
    }, [runningProjects]);

    const extendedCompletedProjects = useMemo<ExtendedProject[]>(() => {
        const startTime = performance.now();
        const result = (completedProjects || []).map(project => ({
            ...project,
            category: project.category as any,
            difficulty: project.difficulty as any,
            joinRequests: project.joinRequests as any,
        }));

        // Track conversion time for performance monitoring
        const duration = performance.now() - startTime;
        if (duration > 50) { // Only log if conversion takes more than 50ms
            console.debug(`[Performance] Completed projects conversion took ${duration.toFixed(2)}ms`);
        }

        return result;
    }, [completedProjects]);

    // Process projects with search, filters, and sort
    // Memoized to avoid reprocessing on every render
    const processedRunningProjects = useMemo(() => {
        const startTime = performance.now();
        const result = processProjects(extendedRunningProjects, searchTerm, filters, sortBy);

        // Track processing time for performance monitoring
        const duration = performance.now() - startTime;
        if (duration > 100) { // Only log if processing takes more than 100ms
            console.debug(`[Performance] Running projects processing took ${duration.toFixed(2)}ms for ${extendedRunningProjects.length} projects`);
        }

        return result;
    }, [extendedRunningProjects, searchTerm, filters, sortBy]);

    const processedCompletedProjects = useMemo(() => {
        const startTime = performance.now();
        const result = processProjects(extendedCompletedProjects, searchTerm, filters, sortBy);

        // Track processing time for performance monitoring
        const duration = performance.now() - startTime;
        if (duration > 100) { // Only log if processing takes more than 100ms
            console.debug(`[Performance] Completed projects processing took ${duration.toFixed(2)}ms for ${extendedCompletedProjects.length} projects`);
        }

        return result;
    }, [extendedCompletedProjects, searchTerm, filters, sortBy]);

    // Get unique tech stacks for filter panel
    // Memoized to avoid recalculating on every render
    const availableTechStacks = useMemo(() => {
        const allProjects = [...extendedRunningProjects, ...extendedCompletedProjects];
        return getUniqueTechStacks(allProjects);
    }, [extendedRunningProjects, extendedCompletedProjects]);

    // Calculate join request statuses for all projects
    // Memoized to avoid recalculating on every render
    const joinRequestStatuses = useMemo(() => {
        const statusMap = new Map<string, UserProjectRelationship>();
        const allProjects = [...extendedRunningProjects, ...extendedCompletedProjects];

        allProjects.forEach(project => {
            const relationship = getUserProjectRelationship(project, session?.user?.id);
            statusMap.set(project.id, relationship);
        });

        return statusMap;
    }, [extendedRunningProjects, extendedCompletedProjects, session?.user?.id]);

    // Get selected project for modal
    // Memoized to avoid searching on every render
    const selectedProject = useMemo(() => {
        if (!selectedProjectId) return null;

        const allProjects = [...extendedRunningProjects, ...extendedCompletedProjects];
        return allProjects.find(p => p.id === selectedProjectId) || null;
    }, [selectedProjectId, extendedRunningProjects, extendedCompletedProjects]);

    // Handlers - All memoized with useCallback to prevent unnecessary re-renders
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleFilterChange = useCallback((newFilters: ProjectFilters) => {
        setFilters(newFilters);
    }, []);

    const handleSortChange = useCallback((newSort: SortOption) => {
        setSortBy(newSort);
    }, []);

    const handleProjectClick = useCallback((projectId: string) => {
        setSelectedProjectId(projectId);
    }, []);

    const handleModalClose = useCallback(() => {
        setSelectedProjectId(null);
    }, []);

    const handleJoinRequest = useCallback(async (projectId: string) => {
        if (!session?.user?.id) {
            toast.error("Please sign in to join projects");
            router.push('/auth/login');
            return;
        }

        const requestStartTime = performance.now();

        // Optimistic update
        setJoiningProjects(prev => new Set(prev).add(projectId));

        try {
            const response = await fetch(`/api/projects/${projectId}/join-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Join request sent to project owner! They\'ll review it soon.');

                // Refetch projects to update join request status
                await refetchRunning();
                await refetchCompleted();

                // Track successful join request
                const duration = performance.now() - requestStartTime;
                performanceMonitor.trackRequest({
                    endpoint: `/api/projects/${projectId}/join-requests`,
                    method: 'POST',
                    statusCode: 200,
                    duration,
                    timestamp: Date.now(),
                    userId: session.user.id,
                }).catch(err => console.debug('[Performance] Failed to track metric:', err));
            } else {
                toast.error(data.error?.message || 'Failed to send join request');

                // Track failed join request
                const duration = performance.now() - requestStartTime;
                performanceMonitor.trackRequest({
                    endpoint: `/api/projects/${projectId}/join-requests`,
                    method: 'POST',
                    statusCode: response.status,
                    duration,
                    timestamp: Date.now(),
                    userId: session.user.id,
                }).catch(err => console.debug('[Performance] Failed to track metric:', err));
            }
        } catch (error: any) {
            toast.error('Failed to send join request');

            // Track error
            const duration = performance.now() - requestStartTime;
            performanceMonitor.trackRequest({
                endpoint: `/api/projects/${projectId}/join-requests`,
                method: 'POST',
                statusCode: 500,
                duration,
                timestamp: Date.now(),
                userId: session?.user?.id,
            }).catch(err => console.debug('[Performance] Failed to track metric:', err));
        } finally {
            setJoiningProjects(prev => {
                const next = new Set(prev);
                next.delete(projectId);
                return next;
            });
        }
    }, [session?.user?.id, router, refetchRunning, refetchCompleted]);

    const handleSubmitClick = useCallback(() => {
        if (!session?.user?.id) {
            toast.error("Please sign in to submit project ideas");
            router.push('/auth/login');
            return;
        }
        router.push('/submit-project');
    }, [session?.user?.id, router]);

    const handleClearFilters = useCallback(() => {
        setFilters(createEmptyFilters());
        setSearchTerm("");
    }, []);

    // Handle retry for API errors
    const handleRetry = useCallback(async () => {
        setIsRetrying(true);
        try {
            await Promise.all([refetchRunning(), refetchCompleted()]);
        } catch (error) {
            console.error("Retry failed:", error);
        } finally {
            setIsRetrying(false);
        }
    }, [refetchRunning, refetchCompleted]);

    // Determine which projects to show based on active tab
    const currentProjects = activeTab === 'running'
        ? processedRunningProjects
        : processedCompletedProjects;

    // Determine error type based on error message
    const getErrorType = (error: Error | null): "api" | "network" | "timeout" | "generic" => {
        if (!error) return "generic";
        const message = error.message.toLowerCase();
        if (message.includes("network") || message.includes("fetch")) return "network";
        if (message.includes("timeout")) return "timeout";
        return "api";
    };

    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="relative py-16 bg-background overflow-hidden">

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl text-foreground" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}>
                            Build Projects That Matter
                        </h1>
                        <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                            Join active projects, collaborate with peers, and create solutions that make a difference.
                        </p>

                        {/* Search Bar - Matching Events Page Style */}
                        <div className="w-full max-w-md mx-auto pt-2 md:pt-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <input
                                    placeholder="Search projects by title, tech stack, or category..."
                                    className="w-full pl-12 pr-12 py-3 md:py-4 rounded-full bg-card border-2 border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                                    aria-label="Search projects"
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => handleSearchChange("")}
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

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Filters Section */}
            <section className="py-8 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-end gap-3">
                        <FilterPanel
                            filters={filters}
                            onChange={handleFilterChange}
                            availableTechStacks={availableTechStacks}
                            projectCount={currentProjects.length}
                        />
                        <SortControl
                            value={sortBy}
                            onChange={handleSortChange}
                        />
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Projects Section */}
            <section className="py-16 animate-on-scroll">
                <div className="container mx-auto px-4">

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'running' | 'completed')} className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-muted/50 backdrop-blur-sm border border-border p-1 rounded-2xl shadow-lg">
                                <TabsTrigger
                                    value="running"
                                    className="px-6 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 font-semibold gap-2 transition-all duration-300 ease-out"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    <Clock className="w-4 h-4" />
                                    <span>Running Projects</span>
                                    {runningProjects && runningProjects.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20 font-bold">
                                            {runningProjects.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="completed"
                                    className="px-6 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 font-semibold gap-2 transition-all duration-300 ease-out"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Hall of Fame</span>
                                    {completedProjects && completedProjects.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20 font-bold">
                                            {completedProjects.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="running">
                            {runningError ? (
                                <ErrorState
                                    type={getErrorType(runningError)}
                                    message={runningError.message}
                                    onRetry={handleRetry}
                                    isRetrying={isRetrying}
                                />
                            ) : (
                                <ProjectsGrid
                                    projects={processedRunningProjects}
                                    isLoading={runningLoading}
                                    isRefetching={false}
                                    emptyStateType={searchTerm || filters.techStack.length > 0 || filters.difficulty || filters.category || filters.teamSize ? 'no-results' : 'no-projects'}
                                    onEmptyAction={searchTerm || filters.techStack.length > 0 || filters.difficulty || filters.category || filters.teamSize ? handleClearFilters : handleSubmitClick}
                                    emptyActionLabel={searchTerm || filters.techStack.length > 0 || filters.difficulty || filters.category || filters.teamSize ? 'Clear Filters' : 'Submit Project'}
                                    joinRequestStatuses={joinRequestStatuses}
                                    onJoinRequest={handleJoinRequest}
                                    onProjectClick={handleProjectClick}
                                    joiningProjects={joiningProjects}
                                    currentUserId={session?.user?.id}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="completed">
                            {completedError ? (
                                <ErrorState
                                    type={getErrorType(completedError)}
                                    message={completedError.message}
                                    onRetry={handleRetry}
                                    isRetrying={isRetrying}
                                />
                            ) : (
                                <ProjectsGrid
                                    projects={processedCompletedProjects}
                                    isLoading={completedLoading}
                                    isRefetching={false}
                                    emptyStateType={searchTerm || filters.techStack.length > 0 || filters.difficulty || filters.category || filters.teamSize ? 'no-results' : 'no-completed'}
                                    onEmptyAction={searchTerm || filters.techStack.length > 0 || filters.difficulty || filters.category || filters.teamSize ? handleClearFilters : undefined}
                                    emptyActionLabel={searchTerm || filters.techStack.length > 0 || filters.difficulty || filters.category || filters.teamSize ? 'Clear Filters' : undefined}
                                    joinRequestStatuses={joinRequestStatuses}
                                    onJoinRequest={handleJoinRequest}
                                    onProjectClick={handleProjectClick}
                                    joiningProjects={joiningProjects}
                                    currentUserId={session?.user?.id}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Project Modal - Lazy loaded with Suspense */}
            <Suspense fallback={null}>
                <ProjectModal
                    projectId={selectedProjectId}
                    isOpen={!!selectedProjectId}
                    onClose={handleModalClose}
                    onJoinRequest={handleJoinRequest}
                    project={selectedProject}
                    joinRequestStatus={selectedProjectId ? joinRequestStatuses.get(selectedProjectId) : undefined}
                    isJoining={selectedProjectId ? joiningProjects.has(selectedProjectId) : false}
                />
            </Suspense>

            {/* Floating Action Button - Submit Idea */}
            <button
                onClick={handleSubmitClick}
                className="fixed bottom-8 right-8 z-50 group"
                aria-label="Submit project idea"
            >
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Button */}
                    <div className="relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                        <PlusCircle className="w-5 h-5" />
                        <span className="font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Submit Idea</span>
                    </div>
                </div>
            </button>
        </div>
    );
}

/**
 * Projects Page with Error Boundary
 * Wraps the main content with error boundary for graceful error handling
 */
export default function ProjectsPage() {
    return (
        <ProjectsErrorBoundary>
            <ProjectsPageContent />
        </ProjectsErrorBoundary>
    );
}
