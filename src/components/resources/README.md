# Resources Components

This directory contains all components for the Resources Page UI/UX improvements.

## Feature: resources-page-ui-improvements

### Directory Structure

```
resources/
├── __tests__/              # Unit tests for components
├── SearchBar.tsx           # Search input with debouncing (Task 2.2)
├── CategoryFilter.tsx      # Category filter pills/dropdown (Task 3.1)
├── TypeFilter.tsx          # Resource type filter (Task 3.2)
├── ActiveFiltersDisplay.tsx # Active filters chips display (Task 3.3)
├── ResourceCard.tsx        # Individual resource card (Task 7.1)
├── ResourcesGrid.tsx       # Grid container for resources (Task 9.4)
├── Pagination.tsx          # Pagination controls (Task 10.1)
├── LoadingState.tsx        # Skeleton loading cards (Task 9.1)
├── ErrorState.tsx          # Error message with retry (Task 9.2)
├── EmptyState.tsx          # No results message (Task 9.3)
├── index.ts                # Component exports
└── README.md               # This file
```

### Component Overview

#### SearchBar
- Provides search input with debouncing
- Includes search icon and clear button
- Accessible with ARIA labels

#### CategoryFilter
- Displays all 8 resource categories
- Toggle selection logic
- Responsive: pills on desktop, dropdown on mobile

#### TypeFilter
- Displays all 6 resource types
- Multi-select functionality
- Type-specific icons

#### ActiveFiltersDisplay
- Shows currently active filters as chips
- Remove button for each filter
- "Clear All Filters" button

#### ResourceCard
- Displays resource information
- Image with fallback placeholder
- Description truncation
- Visit tracking integration

#### ResourcesGrid
- Responsive grid layout (1/2/3/4 columns)
- Conditional rendering of states
- Smooth transitions

#### Pagination
- Page number navigation
- Previous/Next buttons
- Keyboard navigation support

#### LoadingState
- Skeleton cards with shimmer animation
- Configurable count

#### ErrorState
- User-friendly error messages
- Retry button
- Error type handling

#### EmptyState
- No results message
- Different messages for filtered/unfiltered states
- Clear filters button

### Type Definitions

All type definitions are located in `src/lib/types/resources.types.ts`:
- `Resource` - Resource entity interface
- `ResourceCategory` - Category enum
- `ResourceType` - Type enum
- `FilterState` - Filter state interface
- `ResourcesResponse` - API response interface
- `ResourcesQueryParams` - URL query parameters interface
- `ActiveFilters` - Active filters interface

### Testing

Unit tests are located in the `__tests__/` subdirectory and follow the naming convention:
- `ComponentName.test.tsx` for component tests

Property-based tests are located in `src/__tests__/resources/` directory.

### Usage

```typescript
import { 
  SearchBar, 
  CategoryFilter, 
  ResourceCard,
  ResourcesGrid 
} from '@/components/resources';
```

### Related Files

- Page Component: `src/app/resources/page.tsx`
- API Hooks: `src/lib/api/hooks.ts`
- API Client: `src/lib/api/client.ts`
- Type Definitions: `src/lib/types/resources.types.ts`
