'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, XIcon, ClockIcon } from 'lucide-react';

/**
 * Search History Item Interface
 */
export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
}

/**
 * Search Bar Props Interface
 */
export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  maxHistory?: number;
  className?: string;
}

/**
 * SearchBar Component
 * 
 * A search input with debounce, search history, and keyboard navigation.
 * 
 * Features:
 * - Debounced search (500ms)
 * - Search history (stored in localStorage)
 * - Clear button
 * - Keyboard navigation (Escape to clear)
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   onSearch={(query) => console.log('Search:', query)}
 *   placeholder="Search rooms, groups, posts..."
 *   maxHistory={5}
 * />
 * ```
 */
export function SearchBar({
  onSearch,
  placeholder = 'Search...',
  maxHistory = 5,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const STORAGE_KEY = 'community-search-history';

  /**
   * Load search history from localStorage
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(
          parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error('[SearchBar] Failed to load history:', error);
    }
  }, []);

  /**
   * Save search history to localStorage
   */
  const saveHistory = (newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('[SearchBar] Failed to save history:', error);
    }
  };

  /**
   * Add query to search history
   */
  const addToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const newHistory = [
      { query: searchQuery, timestamp: new Date() },
      ...history.filter((item) => item.query !== searchQuery),
    ].slice(0, maxHistory);

    saveHistory(newHistory);
  };

  /**
   * Handle search with debounce
   */
  const handleSearch = (searchQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        addToHistory(searchQuery);
        onSearch(searchQuery);
      } else {
        onSearch('');
      }
    }, 500);
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  /**
   * Handle clear
   */
  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  /**
   * Handle history item click
   */
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    onSearch(historyQuery);
    setShowHistory(false);
    addToHistory(historyQuery);
  };

  /**
   * Handle clear history
   */
  const handleClearHistory = () => {
    saveHistory([]);
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
      setShowHistory(false);
    }
  };

  /**
   * Handle click outside to close history
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Cleanup debounce timer
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          aria-label="Search"
          aria-autocomplete="list"
          aria-controls="search-history"
          aria-expanded={showHistory && history.length > 0}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* Search History */}
      {showHistory && history.length > 0 && (
        <div
          ref={historyRef}
          id="search-history"
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
          role="listbox"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-xs font-semibold text-muted-foreground">
              Recent Searches
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="h-auto py-1 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
          {history.map((item, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(item.query)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 group"
              role="option"
              aria-selected={query === item.query}
            >
              <ClockIcon className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{item.query}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
