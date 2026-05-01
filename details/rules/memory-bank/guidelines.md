# Development Guidelines

## Code Quality Standards

### File Headers and Documentation
- **Requirement Comments**: Include feature/requirement references at the top of test files
  ```typescript
  /**
   * Tests for ActiveFiltersDisplay Component
   * Feature: events-page-ui-improvements
   * Validates: Requirements 1.6, 1.7
   */
  ```
- **Script Documentation**: Document purpose, metrics, and requirements in script headers
  ```javascript
  /**
   * Performance Metrics Validation Script
   * 
   * Validates that production build meets target performance metrics:
   * - Page load: 2-3 seconds (60% improvement)
   * Requirements: 8.5
   */
  ```

### TypeScript Type Safety
- **Explicit Interface Definitions**: Define interfaces for all data structures
  ```typescript
  interface MentorSession {
    id: string;
    title: string;
    description?: string;
    date: string;
    duration: number;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    mentor: {
      id: string;
      name: string;
      company: string;
    };
  }
  ```
- **Type Casting**: Use `as` for type assertions when extending types
  ```typescript
  const user = session?.user as ExtendedUser | undefined;
  ```
- **Enum Usage**: Use Prisma enums for type-safe status values
  ```typescript
  type: NotificationType.INFO
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED'
  ```

### Naming Conventions
- **Components**: PascalCase for React components (`ActiveFiltersDisplay`, `StudentDashboard`)
- **Files**: kebab-case for test files (`notification.service.test.ts`), PascalCase for component files (`ActiveFiltersDisplay.tsx`)
- **Functions**: camelCase for functions and methods (`handleCancelSession`, `fetchMentorSessions`)
- **Constants**: SCREAMING_SNAKE_CASE for configuration constants (`TARGETS`, `BASELINE`)
- **Boolean Variables**: Prefix with `is`, `has`, `should` (`isLoading`, `hasReview`, `shouldRender`)
- **Event Handlers**: Prefix with `handle` or `on` (`handleReviewSuccess`, `onClearAll`)

### Code Organization
- **Grouped Imports**: Organize imports by category (external, internal, types, components)
  ```typescript
  // External libraries
  import { describe, it, expect, vi } from 'vitest';
  import { render, screen } from '@testing-library/react';
  
  // Internal utilities
  import { ActiveFiltersDisplay } from '../ActiveFiltersDisplay';
  
  // Types
  import { EventType, EventAvailability } from '@/lib/types/events.types';
  ```
- **Component Structure**: Follow consistent order: imports → interfaces → component → export
- **Hook Placement**: Define custom hooks before component definition
- **State Declarations**: Group related state together at component top

## Testing Standards

### Test Organization
- **Describe Blocks**: Group tests by functionality
  ```typescript
  describe('ActiveFiltersDisplay', () => {
    describe('Rendering', () => { /* ... */ });
    describe('Clear All Functionality', () => { /* ... */ });
    describe('Accessibility', () => { /* ... */ });
  });
  ```
- **Setup/Teardown**: Use `beforeEach` for test setup, `afterEach` for cleanup
  ```typescript
  beforeEach(() => {
    vi.clearAllMocks();
  });
  ```

### Test Naming
- **Descriptive Names**: Use "should" statements for test descriptions
  ```typescript
  it('should not render when no filters are active', () => { /* ... */ });
  it('should call onClearAll when Clear All button is clicked', async () => { /* ... */ });
  ```

### Mocking Patterns
- **Vitest Mocks**: Use `vi.mock()` for module mocking
  ```typescript
  vi.mock('@/lib/prisma', () => ({
    prisma: {
      notification: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    },
  }));
  ```
- **Mock Functions**: Create mock functions with `vi.fn()`
  ```typescript
  const mockOnClearAll = vi.fn();
  const mockOnRemoveFilter = vi.fn();
  ```
- **Mock Data**: Define realistic mock data structures
  ```typescript
  const mockNotification = {
    id: 'n1',
    userId: 'user1',
    title: 'Test Notification',
    read: false,
    createdAt: new Date(),
  };
  ```

### Assertion Patterns
- **Existence Checks**: Use `toBeInTheDocument()` for DOM presence
  ```typescript
  expect(screen.getByText('Workshop')).toBeInTheDocument();
  ```
- **Function Calls**: Verify mock function calls with `toHaveBeenCalledWith`
  ```typescript
  expect(mockOnRemoveFilter).toHaveBeenCalledWith('search', undefined);
  expect(prisma.notification.create).toHaveBeenCalledTimes(3);
  ```
- **Object Matching**: Use `expect.objectContaining` for partial matches
  ```typescript
  expect(result).toEqual(expect.objectContaining({
    userId: 'user1',
    title: 'Test Notification',
  }));
  ```

### Accessibility Testing
- **ARIA Roles**: Test for proper ARIA attributes
  ```typescript
  const region = screen.getByRole('region', { name: 'Active filters' });
  expect(region).toBeInTheDocument();
  ```
- **Screen Reader Support**: Verify aria-live regions and announcements
  ```typescript
  const announcement = screen.getByRole('status');
  expect(announcement).toHaveAttribute('aria-live', 'polite');
  ```
- **Button Labels**: Test descriptive aria-labels
  ```typescript
  expect(screen.getByRole('button', { name: 'Remove Workshop filter' })).toBeInTheDocument();
  ```

## React Component Patterns

### Client Components
- **"use client" Directive**: Add at top of files using client-side features
  ```typescript
  "use client";
  
  import { useState, useEffect } from "react";
  ```

### State Management
- **useState**: Use for local component state
  ```typescript
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  ```
- **useEffect**: Handle side effects with proper dependencies
  ```typescript
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);
  ```
- **useCallback**: Memoize callbacks to prevent re-renders
  ```typescript
  const fetchMentorSessions = useCallback(async () => {
    if (!session?.user?.id) return;
    // fetch logic
  }, [session?.user?.id]);
  ```

### Custom Hooks
- **Data Fetching**: Use custom hooks for API calls
  ```typescript
  const { data: projects, loading: projectsLoading } = useProjects(projectFilters);
  const { data: userStats, loading: statsLoading } = useUserStats(session?.user?.id || 'skip');
  ```
- **Conditional Fetching**: Skip fetching with sentinel values
  ```typescript
  useUserStats(session?.user?.id || 'skip')
  ```

### Component Composition
- **Suspense Boundaries**: Wrap async components in Suspense
  ```typescript
  <Suspense fallback={<LoadingSpinner />}>
    <StudentDashboardContent />
  </Suspense>
  ```
- **Conditional Rendering**: Use early returns for loading/auth states
  ```typescript
  if (status === "loading") {
    return <LoadingSpinner />;
  }
  if (!session) return null;
  ```

### Event Handlers
- **Async Handlers**: Use async/await for asynchronous operations
  ```typescript
  const handleReviewSuccess = async () => {
    setShowReviewDialog(false);
    await fetchMentorSessions();
  };
  ```
- **User Events**: Use `@testing-library/user-event` for testing interactions
  ```typescript
  const user = userEvent.setup();
  await user.click(clearAllButton);
  ```

## API and Service Patterns

### Service Layer Architecture
- **Class-Based Services**: Organize business logic in service classes
  ```typescript
  export class NotificationService {
    async createNotification(data: CreateNotificationData) { /* ... */ }
    async listNotifications(params: ListParams) { /* ... */ }
  }
  ```
- **Error Handling**: Use custom error classes
  ```typescript
  throw new ValidationError('Invalid userId: User does not exist');
  throw new NotFoundError('Notification not found');
  throw new AuthorizationError('You are not authorized');
  ```

### Data Validation
- **Input Validation**: Validate user input before processing
  ```typescript
  if (!userId) {
    throw new ValidationError('userId is required');
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ValidationError('Invalid userId: User does not exist');
  }
  ```

### Pagination Pattern
- **Consistent Pagination**: Return pagination metadata with results
  ```typescript
  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
  ```

### Database Queries
- **Prisma Patterns**: Use Prisma client for type-safe queries
  ```typescript
  await prisma.notification.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });
  ```
- **Batch Operations**: Use `updateMany` and `deleteMany` for bulk operations
  ```typescript
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  ```

## Utility Scripts

### Script Structure
- **Shebang**: Include Node.js shebang for executable scripts
  ```javascript
  #!/usr/bin/env node
  ```
- **Configuration Objects**: Define constants at top
  ```javascript
  const TARGETS = {
    pageLoad: { min: 2000, max: 3000, unit: 'ms', name: 'Page Load Time' },
    bundleSize: { min: 400 * 1024, max: 500 * 1024, unit: 'bytes', name: 'Bundle Size' },
  };
  ```

### Console Output
- **Emoji Indicators**: Use emojis for visual feedback
  ```javascript
  console.log('🌱 Starting database seed...');
  console.log('✅ Created users');
  console.log('⚠️  Warning message');
  console.log('❌ Error occurred');
  ```
- **Colored Output**: Use ANSI color codes for status
  ```javascript
  const color = inRange ? '\\x1b[32m' : '\\x1b[31m'; // Green or Red
  const reset = '\\x1b[0m';
  console.log(`${color}${status}${reset}`);
  ```
- **Formatted Tables**: Display results in table format
  ```javascript
  console.log('Metric                    | Actual              | Status');
  console.log('--------------------------|---------------------|-------');
  ```

### Error Handling
- **Try-Catch Blocks**: Wrap risky operations
  ```javascript
  try {
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  } catch (error) {
    console.error('Error reading file:', error.message);
  }
  ```
- **Exit Codes**: Return appropriate exit codes
  ```javascript
  process.exit(success ? 0 : 1);
  ```

## Database Seeding

### Seed Script Patterns
- **Idempotency Check**: Prevent duplicate seeding
  ```typescript
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('⚠️  Database already contains data. Skipping seed...');
    return;
  }
  ```
- **Password Hashing**: Hash passwords before storage
  ```typescript
  const hashedPassword = await bcrypt.hash('password123', 10);
  ```
- **Batch Creation**: Use `Promise.all` for parallel creation
  ```typescript
  const students = await Promise.all([
    prisma.user.create({ data: { /* ... */ } }),
    prisma.user.create({ data: { /* ... */ } }),
  ]);
  ```

### Data Relationships
- **Reference IDs**: Use created entity IDs for relationships
  ```typescript
  await prisma.eventAttendee.create({
    data: {
      eventId: events[0].id,
      userId: students[0].id,
      status: 'REGISTERED',
    },
  });
  ```

### Seed Summary
- **Progress Logging**: Log each step with counts
  ```typescript
  console.log('👥 Creating users...');
  console.log(`✅ Created ${students.length + 1} users`);
  ```
- **Final Summary**: Display comprehensive summary
  ```typescript
  console.log('📊 Summary:');
  console.log(`   - Users: ${students.length + 1}`);
  console.log('🔐 Test Credentials:');
  console.log('   Admin: admin@velonx.in / password123');
  ```

## Performance Optimization

### Component Optimization
- **Memoization**: Use `useState` with initializer functions
  ```typescript
  const [startDate] = useState(() => new Date().toISOString());
  ```
- **Conditional Fetching**: Skip unnecessary API calls
  ```typescript
  const { data: userStats } = useUserStats(session?.user?.id || 'skip');
  ```

### URL State Management
- **Query Parameters**: Sync state with URL
  ```typescript
  const params = new URLSearchParams(searchParams.toString());
  params.set('projectStatus', status);
  router.push(`?${params.toString()}`, { scroll: false });
  ```

### Loading States
- **Skeleton Screens**: Show loading UI during data fetch
  ```typescript
  if (status === "loading" || projectsLoading) {
    return <LoadingSpinner />;
  }
  ```

## Accessibility Best Practices

### Semantic HTML
- **ARIA Regions**: Use proper ARIA roles
  ```typescript
  <div role="region" aria-label="Active filters">
  <ul role="list" aria-label="Active filter chips">
  <div role="status" aria-live="polite" aria-atomic="true">
  ```

### Icon Accessibility
- **Hidden Icons**: Mark decorative icons as hidden
  ```typescript
  <svg aria-hidden="true">
  ```
- **Button Labels**: Provide descriptive labels
  ```typescript
  <button aria-label={`Remove ${label} filter`}>
  ```

### Screen Reader Support
- **Live Regions**: Announce dynamic changes
  ```typescript
  <span role="status" aria-live="polite" aria-atomic="true">
    {count} filter{count !== 1 ? 's' : ''} active
  </span>
  ```

## Code Style Preferences

### ESLint Directives
- **Image Optimization**: Disable Next.js image warnings when necessary
  ```typescript
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={imageUrl} alt="Description" />
  ```

### String Formatting
- **Template Literals**: Use for string interpolation
  ```typescript
  `Search: "${searchQuery}"`
  `${count} filter${count !== 1 ? 's' : ''} active`
  ```

### Conditional Classes
- **Dynamic Classes**: Use template literals for conditional styling
  ```typescript
  className={`px-6 py-3 rounded-2xl ${
    isActive ? 'bg-[#219EBC] text-white' : 'bg-muted text-muted-foreground'
  }`}
  ```

### Date Formatting
- **Locale Formatting**: Use `toLocaleDateString` and `toLocaleTimeString`
  ```typescript
  const date = new Date(meeting.date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  ```

## Error Prevention

### Null Safety
- **Optional Chaining**: Use `?.` for safe property access
  ```typescript
  session?.user?.name
  project._count?.members
  ```
- **Nullish Coalescing**: Provide defaults with `??` or `||`
  ```typescript
  user?.level || 1
  userStats?.projectsOwned || 0
  ```

### Array Safety
- **Safe Mapping**: Check array existence before operations
  ```typescript
  const display = projects?.map((project) => ({ /* ... */ })) || [];
  ```
- **Safe Filtering**: Use optional chaining with filter
  ```typescript
  const userGroups = groups?.filter(g => g.ownerId === userId) || [];
  ```

## Internal API Usage

### Fetch Patterns
- **API Routes**: Use relative paths for internal APIs
  ```typescript
  const response = await fetch('/api/mentor-sessions?viewAs=student&pageSize=10');
  const data = await response.json();
  if (data.success) {
    setMentorSessions(data.data);
  }
  ```

### Response Handling
- **Success Checks**: Always verify response success
  ```typescript
  if (data.success) {
    // handle success
  } else {
    // handle error
  }
  ```

## Common Idioms

### Pluralization
- **Conditional Plurals**: Use ternary for singular/plural
  ```typescript
  `${count} filter${count !== 1 ? 's' : ''} active`
  ```

### Progress Calculation
- **Percentage Calculation**: Calculate progress with bounds
  ```typescript
  const progress = Math.min(100, Math.max(0, 
    ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  ));
  ```

### Array Reduction
- **Grouping Data**: Use reduce for data transformation
  ```typescript
  const timeline = meetings?.reduce((acc, meeting) => {
    const date = formatDate(meeting.date);
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.items.push(meetingItem);
    } else {
      acc.push({ date, items: [meetingItem] });
    }
    return acc;
  }, []) || [];
  ```
