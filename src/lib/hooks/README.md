# Custom Hooks Documentation

## Resources Page Hooks

### useResources

Custom hook for fetching and managing resources data with automatic refetching on filter changes.

**Location**: `src/lib/hooks/useResources.ts`

**Features**:
- Automatic data fetching on mount and filter changes
- Loading and error state management
- Pagination support
- Manual refetch capability

**Usage**:
```tsx
import { useResources } from '@/lib/hooks/useResources';

function ResourcesPage() {
  const { resources, pagination, isLoading, error, refetch } = useResources({
    search: 'react',
    category: 'PROGRAMMING',
    type: 'DOCUMENTATION',
    page: 1,
    pageSize: 12,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message} <button onClick={refetch}>Retry</button></div>;

  return (
    <div>
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
```

**Parameters**:
- `filters` (optional): ResourceFilters object
  - `search?: string` - Text search query
  - `category?: string` - Resource category
  - `type?: string` - Resource type
  - `page?: number` - Page number (default: 1)
  - `pageSize?: number` - Items per page (default: 12)

**Returns**:
- `resources: Resource[]` - Array of resource objects
- `pagination: PaginationInfo | null` - Pagination metadata
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error object if fetch failed
- `refetch: () => Promise<void>` - Function to manually refetch data

---

### useResourceFilters

Custom hook for managing resource filter state with URL synchronization.

**Location**: `src/lib/hooks/useResourceFilters.ts`

**Features**:
- Filter state management (search, categories, types, page)
- URL synchronization (reads from and updates URL)
- Browser history support (back/forward navigation)
- Active filter count calculation

**Usage**:
```tsx
import { useResourceFilters } from '@/lib/hooks/useResourceFilters';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';

function ResourcesPage() {
  const {
    filters,
    setSearch,
    toggleCategory,
    toggleType,
    setPage,
    clearAllFilters,
    removeFilter,
    activeFilterCount,
  } = useResourceFilters();

  return (
    <div>
      <input
        value={filters.search || ''}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search resources..."
      />

      <button onClick={() => toggleCategory(ResourceCategory.PROGRAMMING)}>
        Programming {filters.categories.includes(ResourceCategory.PROGRAMMING) && '✓'}
      </button>

      <button onClick={() => toggleType(ResourceType.VIDEO)}>
        Videos {filters.types.includes(ResourceType.VIDEO) && '✓'}
      </button>

      {activeFilterCount > 0 && (
        <button onClick={clearAllFilters}>
          Clear All Filters ({activeFilterCount})
        </button>
      )}

      <div>Page: {filters.page}</div>
      <button onClick={() => setPage(filters.page + 1)}>Next Page</button>
    </div>
  );
}
```

**Returns**:
- `filters: FilterState` - Current filter state
  - `search?: string` - Search query
  - `categories: ResourceCategory[]` - Selected categories
  - `types: ResourceType[]` - Selected types
  - `page: number` - Current page
  - `pageSize: number` - Items per page
- `setSearch: (search: string) => void` - Update search query
- `toggleCategory: (category: ResourceCategory) => void` - Toggle category filter
- `toggleType: (type: ResourceType) => void` - Toggle type filter
- `setPage: (page: number) => void` - Change page number
- `clearAllFilters: () => void` - Reset all filters
- `removeFilter: (filterType, value?) => void` - Remove individual filter
- `activeFilterCount: number` - Count of active filters

---

### Using Both Hooks Together

The recommended pattern is to use both hooks together for a complete resources page implementation:

```tsx
'use client';

import { useResources } from '@/lib/hooks/useResources';
import { useResourceFilters } from '@/lib/hooks/useResourceFilters';
import { useDebounce } from '@/lib/hooks/useDebounce';

export default function ResourcesPage() {
  // Manage filter state with URL synchronization
  const {
    filters,
    setSearch,
    toggleCategory,
    toggleType,
    setPage,
    clearAllFilters,
    activeFilterCount,
  } = useResourceFilters();

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch resources based on current filters
  const { resources, pagination, isLoading, error, refetch } = useResources({
    search: debouncedSearch,
    category: filters.categories[0], // API accepts single category
    type: filters.types[0], // API accepts single type
    page: filters.page,
    pageSize: filters.pageSize,
  });

  return (
    <div>
      {/* Search Bar */}
      <SearchBar value={filters.search || ''} onChange={setSearch} />

      {/* Category Filters */}
      <CategoryFilter
        selected={filters.categories}
        onToggle={toggleCategory}
      />

      {/* Type Filters */}
      <TypeFilter selected={filters.types} onToggle={toggleType} />

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <ActiveFiltersDisplay
          activeFilters={{
            search: filters.search,
            categories: filters.categories,
            types: filters.types,
          }}
          onClearAll={clearAllFilters}
        />
      )}

      {/* Resources Grid */}
      <ResourcesGrid
        resources={resources}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

---

## Events Page Hooks

### useEventFilters

Custom hook for managing event filter state with URL synchronization.

**Location**: `src/lib/hooks/useEventFilters.ts`

**Features**:
- Filter state management (search, types, dateRange, availability, myEvents, page)
- URL synchronization (reads from and updates URL)
- Browser history support (back/forward navigation)
- Session storage persistence
- Active filter count calculation

**Usage**:
```tsx
import { useEventFilters } from '@/lib/hooks/useEventFilters';
import { EventType, EventAvailability } from '@/lib/types/events.types';

function EventsPage() {
  const {
    filters,
    setSearch,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    setPage,
    setPageSize,
    clearAllFilters,
    removeFilter,
    activeFilterCount,
    isFiltered,
  } = useEventFilters();

  return (
    <div>
      <input
        value={filters.search || ''}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events..."
      />

      <button onClick={() => toggleType('WORKSHOP')}>
        Workshop {filters.types.includes('WORKSHOP') && '✓'}
      </button>

      <button onClick={() => setAvailability('available')}>
        Available Only
      </button>

      <button onClick={() => setMyEvents(!filters.myEvents)}>
        My Events {filters.myEvents && '✓'}
      </button>

      {isFiltered && (
        <button onClick={clearAllFilters}>
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
```

**Returns**:
- `filters: EventFilterState` - Current filter state
- `setSearch: (search: string) => void` - Update search query
- `toggleType: (type: EventType) => void` - Toggle event type filter
- `setDateRange: (dateRange: DateRange) => void` - Set date range filter
- `setAvailability: (availability: EventAvailability) => void` - Set availability filter
- `setMyEvents: (myEvents: boolean) => void` - Toggle my events filter
- `setPage: (page: number) => void` - Change page number
- `setPageSize: (pageSize: number) => void` - Change page size
- `clearAllFilters: () => void` - Reset all filters
- `removeFilter: (filterType, value?) => void` - Remove individual filter
- `activeFilterCount: number` - Count of active filters
- `isFiltered: boolean` - Whether any filters are active

---

### useEventSearch

Custom hook for managing event search with debouncing on top of useEventFilters.

**Location**: `src/lib/hooks/useEventSearch.ts`

**Features**:
- Immediate search input state for responsive UI
- Debounced search value (300ms default) to reduce API calls
- Automatic sync with useEventFilters for URL persistence
- Loading state indicator during debounce period
- Prevents overwriting user input during typing

**Usage**:
```tsx
import { useEventSearch } from '@/lib/hooks/useEventSearch';

function EventSearchBar() {
  const { searchQuery, setSearchQuery, debouncedQuery, isSearching } = useEventSearch();

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search events..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {isSearching && (
        <div className="absolute right-3 top-3">
          <Spinner size="sm" />
        </div>
      )}
      {debouncedQuery && (
        <p className="text-sm text-gray-600 mt-1">
          Searching for: {debouncedQuery}
        </p>
      )}
    </div>
  );
}
```

**Parameters**:
- `delay?: number` - Debounce delay in milliseconds (default: 300)

**Returns**:
- `searchQuery: string` - Current search query (immediate, not debounced)
- `setSearchQuery: (query: string) => void` - Set the search query (updates immediately)
- `debouncedQuery: string` - Debounced search query (synced with filters and URL)
- `isSearching: boolean` - Whether the search is currently debouncing

**Integration with useEventFilters**:

The `useEventSearch` hook works on top of `useEventFilters` to provide a better search experience:

```tsx
'use client';

import { useEventSearch } from '@/lib/hooks/useEventSearch';
import { useEventFilters } from '@/lib/hooks/useEventFilters';

export default function EventsPage() {
  // useEventSearch internally uses useEventFilters
  const { searchQuery, setSearchQuery, debouncedQuery, isSearching } = useEventSearch();
  
  // You can still access other filters if needed
  const { filters, toggleType, setAvailability } = useEventFilters();

  return (
    <div>
      {/* Search with debouncing */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search events..."
      />
      {isSearching && <Spinner />}

      {/* Other filters */}
      <button onClick={() => toggleType('WORKSHOP')}>Workshop</button>
      <button onClick={() => setAvailability('available')}>Available</button>

      {/* The debouncedQuery is automatically synced with URL */}
      <EventsList searchQuery={debouncedQuery} filters={filters} />
    </div>
  );
}
```

---

## Other Hooks

### useDebounce

Debounces a value with a specified delay to prevent excessive updates.

**Location**: `src/lib/hooks/useDebounce.ts`

**Usage**:
```tsx
import { useDebounce } from '@/lib/hooks/useDebounce';

function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // This will only run 300ms after the user stops typing
    fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
}
```

**Parameters**:
- `value: T` - Value to debounce
- `delay?: number` - Delay in milliseconds (default: 300)

**Returns**:
- `T` - Debounced value

---

### usePerformanceMonitoring

Monitors component performance metrics.

**Location**: `src/lib/hooks/usePerformanceMonitoring.ts`

See file for detailed documentation.
