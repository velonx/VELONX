# Projects Components

This directory contains the enhanced Project Page UI components for VELONX.

## Overview

The Project Page UI Improvements feature provides a modern, accessible, and performant project discovery interface with advanced search, filtering, sorting capabilities, detailed project views, and responsive design.

## Feature: project-page-ui-improvements

### Component Structure

```
projects/
├── SearchBar.tsx              # Search input with debouncing ✅
├── FilterPanel.tsx            # Multi-select filter controls ✅
├── SortControl.tsx            # Sort dropdown ✅
├── ProjectCard.tsx            # Enhanced project card ✅
├── ProjectModal.tsx           # Project details modal ✅
├── ProjectsGrid.tsx           # Responsive grid layout ✅
├── TeamAvatarGroup.tsx        # Team member avatars ✅
├── CategoryBadge.tsx          # Category tag component ✅
├── SkeletonLoader.tsx         # Loading placeholder ✅
├── EmptyState.tsx             # Empty state messages ✅
├── ErrorState.tsx             # Error handling UI ✅
├── ProjectsErrorBoundary.tsx  # Error boundary wrapper ✅
├── index.ts                   # Component exports
└── README.md                  # This file
```

### Components

#### SearchBar ✅
Search input with debouncing and accessibility features.

**Features:**
- 300ms debounce to optimize performance
- Search icon and clear button
- Loading indicator support
- Results count announcement for screen readers
- Full keyboard accessibility

**Usage:**
```tsx
import { SearchBar } from '@/components/projects';

<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search projects..."
  isLoading={false}
  resultsCount={42}
/>
```

**Props:**
- `value: string` - Current search term
- `onChange: (value: string) => void` - Callback when search changes
- `placeholder?: string` - Input placeholder text
- `isLoading?: boolean` - Show loading indicator
- `resultsCount?: number` - Number of results for screen reader announcement

**Accessibility:**
- `aria-label="Search projects"`
- `aria-live="polite"` region for results count
- Keyboard accessible (Tab, Enter, Escape)

**Requirements:** 1.1, 1.2, 1.4, 13.1, 13.7, 14.5

---

#### FilterPanel ✅
Multi-select filter controls for tech stack, difficulty, team size, and category.

**Features:**
- Tech stack multi-select with checkboxes
- Difficulty single-select
- Team size range slider
- Category single-select
- Active filter count badge
- "Clear All" button
- Mobile-responsive (full-screen on small screens)

**Usage:**
```tsx
import { FilterPanel } from '@/components/projects';

<FilterPanel
  filters={filters}
  onChange={setFilters}
  availableTechStacks={['React', 'TypeScript', 'Node.js']}
  projectCount={42}
/>
```

**Props:**
- `filters: ProjectFilters` - Current filter state
- `onChange: (filters: ProjectFilters) => void` - Callback when filters change
- `availableTechStacks: string[]` - Available tech stack options
- `projectCount: number` - Number of filtered results

**Accessibility:**
- Proper ARIA labels for all controls
- Keyboard navigation support
- Focus management

**Requirements:** 2.1-2.7, 13.2

---

#### SortControl ✅
Dropdown for selecting sort order with session persistence.

**Features:**
- Sort options: Newest, Most Popular, Team Size, Tech Stack
- Session storage persistence
- Keyboard navigation
- Accessible dropdown

**Usage:**
```tsx
import { SortControl } from '@/components/projects';

<SortControl
  value={sortBy}
  onChange={setSortBy}
/>
```

**Props:**
- `value: SortOption` - Current sort option
- `onChange: (option: SortOption) => void` - Callback when sort changes

**Sort Options:**
- `'newest'` - Sort by creation date (descending)
- `'popular'` - Sort by member count (descending)
- `'teamSize'` - Sort by team size (ascending)
- `'techStack'` - Group by primary technology

**Requirements:** 3.1-3.5, 14.6

---

#### ProjectCard ✅
Enhanced project card with improved visual hierarchy and interactive elements.

**Features:**
- Colored top border based on category
- Category and status badges
- Tech stack tags (max 5 with "+N more")
- Team member avatars (max 4 with "+N more")
- Quick action buttons (GitHub, Demo)
- Join request status display
- Hover effects and animations
- Full keyboard accessibility

**Usage:**
```tsx
import { ProjectCard } from '@/components/projects';

<ProjectCard
  project={project}
  joinRequestStatus="none"
  onJoinRequest={handleJoinRequest}
  onClick={handleProjectClick}
  isJoining={false}
  currentUserId={session?.user?.id}
/>
```

**Props:**
- `project: ExtendedProject` - Project data
- `joinRequestStatus: UserProjectRelationship` - User's relationship to project
- `onJoinRequest: (projectId: string) => void` - Join request callback
- `onClick: (projectId: string) => void` - Card click callback
- `isJoining: boolean` - Loading state for join request
- `currentUserId?: string` - Current user ID

**Requirements:** 5.1-5.4, 9.1-9.5, 10.1-10.5, 11.1-11.5, 12.1-12.3, 13.4, 13.10

---

#### ProjectModal ✅
Full project details modal with focus trap and accessibility features.

**Features:**
- Complete project information display
- Team members with owner highlighting
- Quick action buttons (GitHub, Demo)
- Join request status display
- Focus trap for keyboard navigation
- Background scroll prevention
- Escape key and click-outside to close
- Full ARIA compliance

**Usage:**
```tsx
import { ProjectModal } from '@/components/projects';

<ProjectModal
  projectId={selectedProject?.id || null}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onJoinRequest={handleJoinRequest}
  project={selectedProject}
  joinRequestStatus="none"
  isJoining={false}
/>
```

**Props:**
- `projectId: string | null` - ID of the project to display
- `isOpen: boolean` - Whether the modal is open
- `onClose: () => void` - Callback when modal closes
- `onJoinRequest: (projectId: string) => void` - Callback for join requests
- `project?: ExtendedProject | null` - Project data to display
- `joinRequestStatus?: UserProjectRelationship` - User's relationship to project
- `isJoining?: boolean` - Loading state for join request

**Accessibility:**
- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to title
- `aria-describedby` pointing to description
- Focus trap keeps focus within modal
- Returns focus to trigger element on close
- Escape key closes modal
- Click outside closes modal
- Background scrolling prevented when open

**Requirements:** 4.1-4.8, 10.6, 13.5, 13.6

---

#### ProjectsGrid ✅
Responsive grid layout with loading states and empty states.

**Features:**
- Responsive columns (1/2/3 based on viewport)
- Skeleton loaders for loading state
- Empty state variants
- Virtual scrolling for large lists (>50 items)
- Lazy loading for images
- Performance optimizations

**Usage:**
```tsx
import { ProjectsGrid } from '@/components/projects';

<ProjectsGrid
  projects={filteredProjects}
  isLoading={loading}
  isRefetching={false}
  emptyStateType="no-results"
  onEmptyAction={handleClearFilters}
  emptyActionLabel="Clear Filters"
  joinRequestStatuses={statusMap}
  onJoinRequest={handleJoinRequest}
  onProjectClick={handleProjectClick}
  joiningProjects={joiningSet}
  currentUserId={session?.user?.id}
/>
```

**Props:**
- `projects: ExtendedProject[]` - Projects to display
- `isLoading: boolean` - Initial loading state
- `isRefetching: boolean` - Refetching state
- `emptyStateType: EmptyStateType` - Type of empty state
- `onEmptyAction?: () => void` - Empty state action callback
- `emptyActionLabel?: string` - Empty state action label
- `joinRequestStatuses: Map<string, UserProjectRelationship>` - Join request statuses
- `onJoinRequest: (projectId: string) => void` - Join request callback
- `onProjectClick: (projectId: string) => void` - Project click callback
- `joiningProjects: Set<string>` - Set of projects being joined
- `currentUserId?: string` - Current user ID

**Requirements:** 7.1-7.5, 8.1-8.6, 14.3, 14.4

---

#### TeamAvatarGroup ✅
Team member avatars in overlapping layout.

**Features:**
- Overlapping circle layout
- Image display with fallback to initials
- "+N more" indicator for overflow
- Tooltip on hover showing member name
- Multiple sizes (sm, md, lg)

**Usage:**
```tsx
import { TeamAvatarGroup } from '@/components/projects';

<TeamAvatarGroup
  members={project.members}
  maxDisplay={4}
  size="md"
/>
```

**Props:**
- `members: ProjectMember[]` - Team members to display
- `maxDisplay?: number` - Maximum avatars to show (default: 4)
- `size?: 'sm' | 'md' | 'lg'` - Avatar size (default: 'md')

**Requirements:** 10.1-10.5

---

#### CategoryBadge ✅
Category tag with color coding and click handling.

**Features:**
- Category-specific colors
- Click handler for filtering
- Hover effects
- Accessible

**Usage:**
```tsx
import { CategoryBadge } from '@/components/projects';

<CategoryBadge
  category="WEB_DEV"
  onClick={(category) => handleCategoryFilter(category)}
/>
```

**Props:**
- `category: ProjectCategory` - Project category
- `onClick?: (category: ProjectCategory) => void` - Click callback
- `className?: string` - Additional CSS classes

**Category Colors:**
- Web Dev: Blue (#219EBC)
- Mobile: Purple (#8B5CF6)
- AI/ML: Green (#10B981)
- Data Science: Orange (#F59E0B)
- DevOps: Red (#EF4444)
- Design: Pink (#EC4899)

**Requirements:** 9.1-9.3

---

#### SkeletonLoader ✅
Loading placeholder that matches the ProjectCard layout.

**Features:**
- Shimmer animation with CSS
- Respects `prefers-reduced-motion`
- Configurable count and variant
- Full accessibility support
- Responsive grid layout

**Usage:**
```tsx
import { SkeletonLoader } from '@/components/projects';

// Default (6 cards in grid)
<SkeletonLoader />

// Custom count
<SkeletonLoader count={3} />
```

**Props:**
- `count?: number` - Number of skeleton cards (default: 6)
- `variant?: 'card' | 'list'` - Layout variant (default: 'card')
- `className?: string` - Additional CSS classes

**Accessibility:**
- `role="status"` with `aria-busy="true"`
- `aria-live="polite"` for screen reader announcements
- `aria-label="Loading projects"`
- Respects user's motion preferences

**Requirements:** 7.1-7.3

---

#### EmptyState ✅
Informative message when no projects match filters.

**Features:**
- Multiple variants (no-results, no-projects, no-completed)
- Icon, heading, description, and CTA
- Proper styling and spacing
- Accessible

**Usage:**
```tsx
import { EmptyState } from '@/components/projects';

<EmptyState
  type="no-results"
  onAction={handleClearFilters}
  actionLabel="Clear Filters"
/>
```

**Props:**
- `type: EmptyStateType` - Type of empty state
- `onAction?: () => void` - Action button callback
- `actionLabel?: string` - Action button label

**Variants:**
- `'no-results'` - No projects match filters
- `'no-projects'` - No running projects exist
- `'no-completed'` - No completed projects exist

**Requirements:** 6.1-6.5

---

#### ErrorState ✅
Error handling UI with retry functionality.

**Features:**
- Multiple error types (api, network, timeout, generic)
- Retry button
- User-friendly error messages
- Accessible

**Usage:**
```tsx
import { ErrorState } from '@/components/projects';

<ErrorState
  type="network"
  message="Failed to load projects"
  onRetry={handleRetry}
  isRetrying={false}
/>
```

**Props:**
- `type: ErrorType` - Type of error
- `message?: string` - Error message
- `onRetry: () => void` - Retry callback
- `isRetrying: boolean` - Retry loading state

---

#### ProjectsErrorBoundary ✅
Error boundary wrapper for graceful error handling.

**Features:**
- Catches React errors
- Displays error UI
- Retry functionality
- Logs errors for monitoring

**Usage:**
```tsx
import { ProjectsErrorBoundary } from '@/components/projects';

<ProjectsErrorBoundary>
  <ProjectsPageContent />
</ProjectsErrorBoundary>
```

---

### Related Utilities

Utility functions are located in:
- `src/lib/utils/project-filters.ts` - Filtering and sorting logic
- `src/lib/utils/project-helpers.ts` - Helper functions
- `src/lib/utils/session-storage.ts` - Preference persistence
- `src/lib/hooks/useDebounce.ts` - Debounce hook
- `src/lib/types/project-page.types.ts` - TypeScript types

### Performance Optimizations

The implementation includes several performance optimizations:

1. **Debouncing**: Search input debounced by 300ms
2. **Memoization**: Filter and sort functions memoized with `useMemo`
3. **Callback Memoization**: Event handlers memoized with `useCallback`
4. **Virtual Scrolling**: Implemented for lists > 50 items
5. **Lazy Loading**: Images loaded as they enter viewport
6. **Code Splitting**: Modal component lazy loaded
7. **Session Storage**: Cache preferences to avoid recalculation

### Accessibility Features

All components follow WCAG AA standards:

1. **ARIA Labels**: All interactive elements have descriptive labels
2. **Focus Management**: Modal traps focus, returns to trigger on close
3. **Keyboard Navigation**: All actions accessible via keyboard
4. **Screen Reader Support**: Live regions announce filter results
5. **Color Contrast**: All text meets WCAG AA standards (4.5:1)
6. **Reduced Motion**: Animations respect `prefers-reduced-motion`
7. **Semantic HTML**: Proper heading hierarchy and landmarks

### Browser Compatibility

- **Target**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Minimum**: Last 2 versions of each browser
- **Fallbacks**: Graceful degradation for older browsers

### Testing

Property-based tests for this feature should be tagged with:
```typescript
describe('Feature: project-page-ui-improvements', () => {
  it('Property N: [description]', () => {
    // Test implementation
  });
});
```

### Integration

The main Projects Page (`src/app/projects/page.tsx`) integrates all these components:

```tsx
import { SearchBar, FilterPanel, SortControl, ProjectsGrid, ProjectModal } from '@/components/projects';

// State management
const [searchTerm, setSearchTerm] = useState("");
const [filters, setFilters] = useState(createEmptyFilters());
const [sortBy, setSortBy] = useState('newest');

// Render
<SearchBar value={searchTerm} onChange={setSearchTerm} />
<FilterPanel filters={filters} onChange={setFilters} />
<SortControl value={sortBy} onChange={setSortBy} />
<ProjectsGrid projects={processedProjects} ... />
<ProjectModal projectId={selectedId} ... />
```

### Requirements Coverage

This implementation satisfies all requirements from the specification:

- **Search (1.1-1.4)**: SearchBar with debouncing and state preservation
- **Filtering (2.1-2.7)**: FilterPanel with multi-select and clear all
- **Sorting (3.1-3.6)**: SortControl with persistence and independence
- **Modal (4.1-4.8)**: ProjectModal with full details and accessibility
- **Visual Design (5.1-5.7)**: Enhanced ProjectCard with hierarchy
- **Empty States (6.1-6.5)**: EmptyState with variants and CTAs
- **Loading States (7.1-7.5)**: SkeletonLoader with animations
- **Responsive Grid (8.1-8.6)**: ProjectsGrid with adaptive columns
- **Categories (9.1-9.5)**: CategoryBadge with color coding
- **Team Avatars (10.1-10.6)**: TeamAvatarGroup with overlapping layout
- **Quick Actions (11.1-11.6)**: Quick action buttons on cards
- **Join Requests (12.1-12.5)**: Status display and optimistic updates
- **Accessibility (13.1-13.10)**: Full WCAG AA compliance
- **Performance (14.1-14.6)**: Optimizations and monitoring

---

For more details, see:
- Design Document: `.kiro/specs/project-page-ui-improvements/design.md`
- Requirements: `.kiro/specs/project-page-ui-improvements/requirements.md`
- Tasks: `.kiro/specs/project-page-ui-improvements/tasks.md`
