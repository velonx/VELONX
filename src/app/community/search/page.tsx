"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SearchResults } from "@/components/community/SearchResults";
import { SearchBar } from "@/components/community/SearchBar";
import { useSearch } from "@/lib/hooks/useSearch";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTab = (searchParams.get("tab") as "all" | "rooms" | "groups" | "posts" | "users") || "all";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when search or tab changes
  useEffect(() => {
    if (debouncedQuery || activeTab !== "all") {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (activeTab !== "all") params.set("tab", activeTab);
      router.push(`/community/search?${params.toString()}`, { scroll: false });
    }
  }, [debouncedQuery, activeTab, router]);

  // Fetch search results
  const { results, isSearching, search } = useSearch();

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    }
  }, [debouncedQuery, search]);

  const totalResults =
    (results?.groups?.length || 0) +
    (results?.posts?.length || 0) +
    (results?.users?.length || 0);

  return (
    <div className="min-h-screen pt-24 bg-background">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/community" className="hover:text-foreground transition-colors">
              Community
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Search</li>
        </ol>
      </nav>

      {/* Hero Section with Search */}
      <section className="relative py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1
              className="text-4xl md:text-6xl text-foreground font-bold tracking-tight"
            >
              Search Community
            </h1>
            <p
              className="text-muted-foreground text-xl max-w-2xl mx-auto"
            >
              Find rooms, groups, posts, and users across the community.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-md mx-auto pt-2 md:pt-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 md:py-4 rounded-full bg-card border-2 border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                  aria-label="Search community"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            {debouncedQuery && !isSearching && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                </Badge>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Search Results */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {debouncedQuery ? (
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto mb-8">
                <TabsTrigger value="all">
                  All
                  {!isSearching && totalResults > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {totalResults}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="groups">
                  Groups
                  {!isSearching && results?.groups && results.groups.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {results.groups.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="posts">
                  Posts
                  {!isSearching && results?.posts && results.posts.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {results.posts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="users">
                  Users
                  {!isSearching && results?.users && results.users.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {results.users.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <SearchResults
                  results={results}
                  isSearching={isSearching}
                  query={debouncedQuery}
                />
              </TabsContent>

              <TabsContent value="groups">
                <SearchResults
                  results={results}
                  isSearching={isSearching}
                  query={debouncedQuery}
                />
              </TabsContent>

              <TabsContent value="posts">
                <SearchResults
                  results={results}
                  isSearching={isSearching}
                  query={debouncedQuery}
                />
              </TabsContent>

              <TabsContent value="users">
                <SearchResults
                  results={results}
                  isSearching={isSearching}
                  query={debouncedQuery}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start typing to search the community</p>
              <p className="text-sm mt-2">Search for rooms, groups, posts, or users</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
        <div className="text-center">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
