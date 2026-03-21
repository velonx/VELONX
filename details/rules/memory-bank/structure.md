# Project Structure

## Directory Organization

### Root Configuration
```
/VELONX/
├── .amazonq/rules/memory-bank/     # Amazon Q documentation and rules
├── .github/workflows/              # CI/CD pipeline configurations
├── .next/                          # Next.js build output (generated)
├── e2e/                            # End-to-end tests (Playwright)
├── prisma/                         # Database schema and seed scripts
├── public/                         # Static assets (images, avatars, illustrations)
├── scripts/                        # Utility scripts for maintenance and setup
├── src/                            # Application source code
├── package.json                    # Dependencies and scripts
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── vitest.config.ts                # Unit test configuration
├── playwright.config.ts            # E2E test configuration
└── server.js                       # Custom server entry point
```

### Source Code Structure (`src/`)

#### Application Routes (`src/app/`)
Next.js 16 App Router structure with nested routes:
- `about/` - About page
- `api/` - API route handlers (REST endpoints)
- `api-docs/` - Swagger API documentation
- `apply-mentor/` - Mentor application flow
- `auth/` - Authentication pages (login, signup, verify)
- `blog/` - Blog listing and post pages
- `career/` - Career opportunities (internships, jobs)
- `community/` - Community hub, groups, discussion rooms
- `community-guidelines/` - Community rules and policies
- `contact/` - Contact form
- `dashboard/` - Role-based dashboards (student, admin)
- `events/` - Event listing and detail pages
- `leaderboard/` - XP rankings and leaderboards
- `mentors/` - Mentor directory and booking
- `notifications/` - Notification center
- `privacy/` - Privacy policy
- `projects/` - Project showcase and Hall of Fame
- `referrals/` - Referral program dashboard
- `resources/` - Learning resources library
- `settings/` - User settings and preferences
- `submit-project/` - Project submission form
- `terms/` - Terms of service
- `page.tsx` - Homepage
- `layout.tsx` - Root layout with providers
- `globals.css` - Global styles

#### Components (`src/components/`)
Organized by feature domain:
- `admin/` - Admin dashboard components
- `community/` - Community posts, rooms, groups
- `dashboard/` - Dashboard widgets and cards
- `events/` - Event cards, filters, registration
- `mentors/` - Mentor cards, booking forms
- `projects/` - Project cards, submission forms
- `referral/` - Referral code display and tracking
- `resources/` - Resource cards and filters
- `settings/` - Settings forms and toggles
- `ui/` - Reusable UI primitives (buttons, dialogs, inputs)
- Root-level shared components (navbar, footer, providers, theme)

#### Library Code (`src/lib/`)
Core business logic and utilities:
- `api/` - API client functions and request handlers
- `hooks/` - Custom React hooks
- `middleware/` - API middleware (auth, validation, rate limiting)
- `services/` - Business logic services (notifications, gamification, email)
- `types/` - TypeScript type definitions
- `utils/` - Utility functions (date formatting, XP calculations)
- `validations/` - Zod schemas for input validation
- `websocket/` - WebSocket server for real-time features
- `prisma.ts` - Prisma client singleton
- `redis.ts` - Redis client for caching
- `cloudinary.ts` - Image upload configuration
- `utils.ts` - General utility functions

#### Email Templates (`src/emails/`)
React Email components for transactional emails:
- `base-layout.tsx` - Shared email layout
- `event-confirmation.tsx` - Event registration confirmation
- `event-reminder.tsx` - Event reminder before start
- `project-invite.tsx` - Project collaboration invite
- `reset-password.tsx` - Password reset link
- `session-confirmation.tsx` - Mentor session confirmation
- `verify-email.tsx` - Email verification
- `weekly-digest.tsx` - Weekly activity summary
- `welcome.tsx` - Welcome email for new users

#### Tests (`src/__tests__/`)
Comprehensive test coverage:
- `api/` - API endpoint tests
- `bugfix/` - Regression tests for fixed bugs
- `community/` - Community feature tests
- `components/` - Component unit tests
- `config/` - Configuration tests
- `dashboard/` - Dashboard integration tests
- `examples/` - Test examples and templates
- `helpers/` - Test helper functions
- `integration/` - Integration tests
- `mocks/` - Mock data and services
- `performance/` - Performance benchmarks
- `services/` - Service layer tests
- `setup/` - Test setup and configuration
- `unit/` - Unit tests
- `utils/` - Utility function tests
- `validations/` - Validation schema tests

### Database Layer (`prisma/`)
- `schema.prisma` - Complete database schema with 40+ models
- `seed.ts` - Main seed script
- `seed-badges.ts` - Badge data seeding
- `seed-community.ts` - Community data seeding
- `seed-student.ts` - Student data seeding
- `direct-seed.ts` - Direct database seeding
- `simple-seed.ts` - Minimal seed for testing

### End-to-End Tests (`e2e/`)
- `helpers/` - E2E test helpers (assertions, auth, navigation)
- `example.spec.ts` - Example test suite
- `mentor-booking.spec.ts` - Mentor booking flow tests
- `project-submission.spec.ts` - Project submission tests
- `student-onboarding.spec.ts` - Onboarding flow tests

### Static Assets (`public/`)
- `avatars/` - Default avatar images (cool-ape, punk-dog, robot-hero, space-cat, wizard-owl)
- `illustrations/` - Feature illustrations (community, mentor, projects) in light/dark variants
- `images/` - General images (hero backgrounds, community illustrations)
- `logo.png` - Platform logo
- `sitemap.xml` - SEO sitemap

### Utility Scripts (`scripts/`)
- `check-users.ts` - User database diagnostics
- `diagnose-server.js` - Server health checks
- `optimize-css-*.js` - CSS optimization scripts
- `populate-referral-codes.ts` - Generate referral codes for existing users
- `setup-mongodb-replica.sh` - MongoDB replica set setup
- `test-cloudinary-config.js` - Cloudinary integration test
- `update-backgrounds.js` - Update background images
- `update-colors.js` - Update color schemes
- `validate-performance-metrics.js` - Performance validation

## Core Components and Relationships

### Authentication Flow
```
User → auth/login → NextAuth → Prisma → MongoDB
                  ↓
            Session Cookie → Middleware → Protected Routes
```

### Data Flow Architecture
```
Client Component → API Route → Service Layer → Prisma → MongoDB
                                              ↓
                                          Redis Cache
                                              ↓
                                      WebSocket Server (real-time)
```

### Gamification System
```
User Action → XP Service → XPTransaction Model → User.xp Update
                        ↓
                  Badge Check → UserBadge Creation → Notification
                        ↓
                  Level Check → User.level Update → Achievement
                        ↓
                  Leaderboard Update → Redis Cache
```

### Community Architecture
```
User → CommunityPost → PostReaction/PostComment
    ↓
DiscussionRoom → ChatMessage → WebSocket Broadcast
    ↓
CommunityGroup → GroupMember → GroupModerator
```

### Event Registration Flow
```
User → Event Registration → EventAttendee Creation
                          ↓
                    Capacity Check → Registration Closure
                          ↓
                    Email Confirmation → Notification
                          ↓
                    XP Award → Badge Check
```

## Architectural Patterns

### Design Patterns
1. **Repository Pattern**: Prisma models act as repositories with service layer abstraction
2. **Service Layer Pattern**: Business logic isolated in `src/lib/services/`
3. **Middleware Pattern**: Request processing pipeline in `src/lib/middleware/`
4. **Provider Pattern**: React context providers for theme, auth, and global state
5. **Component Composition**: Radix UI primitives composed into custom components
6. **API Route Handlers**: Next.js route handlers for RESTful endpoints
7. **Server Actions**: Next.js server actions for form submissions
8. **Optimistic Updates**: Client-side optimistic UI updates with server reconciliation

### State Management
- **Server State**: React Server Components with async data fetching
- **Client State**: React hooks (useState, useReducer) for local state
- **Global State**: React Context for theme, auth session
- **Cache State**: Redis for leaderboards, frequently accessed data
- **Real-time State**: WebSocket connections for chat and notifications

### Data Access Patterns
- **Prisma ORM**: Type-safe database queries with relation loading
- **Connection Pooling**: Configured in Prisma schema for MongoDB
- **Caching Strategy**: Redis for hot data, database for cold data
- **Pagination**: Cursor-based pagination for large datasets
- **Eager Loading**: Prisma includes for related data
- **Lazy Loading**: On-demand data fetching for performance

### Security Architecture
- **Authentication**: NextAuth v5 with credential and OAuth providers
- **Authorization**: Role-based access control (STUDENT, ADMIN)
- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in Next.js CSRF tokens
- **Input Validation**: Zod schemas on client and server
- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Prevention**: React automatic escaping
- **Audit Logging**: AuditLog model for security events
- **Rate Limiting**: Middleware-based rate limiting

### Performance Optimizations
- **Image Optimization**: Next.js Image component with AVIF/WebP
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: @next/bundle-analyzer integration
- **CSS Optimization**: Tailwind CSS with PurgeCSS
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Strategic indexes on Prisma models
- **Lazy Loading**: Dynamic imports for heavy components
- **Turbopack**: Next.js 16 default bundler for faster builds

### Testing Strategy
- **Unit Tests**: Vitest for isolated function/component tests
- **Integration Tests**: API route and service integration tests
- **E2E Tests**: Playwright for full user flow testing
- **Component Tests**: React Testing Library for UI components
- **Performance Tests**: Custom performance validation scripts
- **Coverage**: Vitest coverage reports with v8 provider
- **Mocking**: Mock services and data for isolated testing
- **CI/CD**: GitHub Actions workflow for automated testing
