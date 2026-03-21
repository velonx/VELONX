# Technology Stack

## Programming Languages
- **TypeScript 5**: Primary language for type-safe development
- **JavaScript**: Node.js runtime scripts and configuration files
- **CSS**: Styling with Tailwind CSS and custom CSS modules

## Core Framework & Runtime
- **Next.js 16.1.6**: React framework with App Router, Server Components, and Turbopack
- **React 18.3.1**: UI library with concurrent features
- **Node.js 20**: Runtime environment (specified in .nvmrc)
- **tsx 4.21.0**: TypeScript execution for scripts and custom server

## Database & ORM
- **MongoDB 7.0.0**: NoSQL database with replica set support
- **Prisma 5.22.0**: Type-safe ORM with schema-first approach
- **@prisma/client 5.22.0**: Generated database client
- **@auth/prisma-adapter 2.11.1**: NextAuth adapter for Prisma

## Authentication & Authorization
- **NextAuth 5.0.0-beta.30**: Authentication library with multiple providers
- **bcryptjs 3.0.3**: Password hashing
- **jsonwebtoken 9.0.2**: JWT token generation and verification

## Caching & Real-time
- **Redis**: Caching layer for leaderboards and hot data
  - **@upstash/redis 1.36.1**: Serverless Redis client
  - **ioredis 5.9.2**: Full-featured Redis client
- **ws 8.18.0**: WebSocket server for real-time chat and notifications

## UI Components & Styling
- **Radix UI**: Accessible component primitives
  - @radix-ui/react-avatar, checkbox, dialog, dropdown-menu, label, popover, progress, scroll-area, select, separator, slider, slot, tabs, tooltip
- **Tailwind CSS 4**: Utility-first CSS framework
- **tailwindcss-animate 1.0.7**: Animation utilities
- **tailwind-merge 3.4.0**: Merge Tailwind classes
- **class-variance-authority 0.7.1**: Component variant management
- **Framer Motion 12.29.2**: Animation library
- **GSAP 3.14.2**: Advanced animations
- **Lucide React 0.562.0**: Icon library
- **@tabler/icons-react 3.36.1**: Additional icons
- **react-icons 5.6.0**: Icon collection

## Form & Validation
- **Zod 4.3.5**: TypeScript-first schema validation
- **react-hot-toast 2.6.0**: Toast notifications

## Data Visualization & UI Libraries
- **Recharts 3.7.0**: Chart library for analytics
- **Swiper 12.1.2**: Carousel/slider component
- **react-window 2.2.5**: Virtualized list rendering
- **@splinetool/react-spline 4.1.0**: 3D graphics

## Email & Communication
- **React Email 5.2.6**: Email template framework
- **@react-email/components 1.0.7**: Email component library
- **Resend 6.9.1**: Email delivery service

## File Upload & Media
- **Cloudinary 2.9.0**: Image and file upload service

## API Documentation
- **next-swagger-doc 0.4.1**: Swagger documentation generator
- **swagger-ui-react 5.17.10**: Swagger UI for API docs

## Utilities
- **es-toolkit 1.45.0**: Modern utility library
- **clsx 2.1.1**: Conditional className utility
- **focus-trap-react 11.0.6**: Accessibility focus management

## Testing

### Unit & Integration Testing
- **Vitest 4.0.17**: Fast unit test framework
- **@vitest/coverage-v8 4.0.17**: Code coverage
- **@vitejs/plugin-react 5.1.2**: React plugin for Vitest
- **jsdom 27.4.0**: DOM implementation for testing

### Component Testing
- **@testing-library/react 16.3.2**: React component testing utilities
- **@testing-library/jest-dom 6.9.1**: Custom Jest matchers
- **@testing-library/user-event 14.6.1**: User interaction simulation

### E2E Testing
- **@playwright/test 1.57.0**: End-to-end testing framework

### API Testing
- **supertest 7.2.2**: HTTP assertion library

### Property-Based Testing
- **fast-check 4.5.3**: Property-based testing library

## Build Tools & Optimization
- **Turbopack**: Next.js 16 default bundler (faster than Webpack)
- **@next/bundle-analyzer 16.1.4**: Bundle size analysis
- **PostCSS**: CSS processing
  - **@tailwindcss/postcss 4**: Tailwind PostCSS plugin
  - **autoprefixer 10.4.24**: CSS vendor prefixing
  - **cssnano 7.1.2**: CSS minification

## Code Quality & Linting
- **ESLint 9**: JavaScript/TypeScript linting
- **eslint-config-next 16.1.6**: Next.js ESLint configuration

## DevOps & Infrastructure
- **Docker Compose**: MongoDB replica set setup (docker-compose.mongodb.yml)
- **GitHub Actions**: CI/CD pipeline (.github/workflows/ci.yml)

## SEO & Analytics
- **next-sitemap 4.2.3**: Sitemap generation

## Type Definitions
- **@types/node 20**: Node.js type definitions
- **@types/react 18**: React type definitions
- **@types/react-dom 18**: React DOM type definitions
- **@types/bcryptjs 2.4.6**: bcryptjs types
- **@types/ioredis 4.28.10**: ioredis types
- **@types/jsonwebtoken 9.0.10**: jsonwebtoken types
- **@types/react-window 1.8.8**: react-window types
- **@types/supertest 6.0.3**: supertest types
- **@types/swagger-ui-react 5.18.0**: swagger-ui-react types
- **@types/ws 8.18.1**: ws types

## Environment & Configuration
- **dotenv 17.3.1**: Environment variable management
- **.nvmrc**: Node.js version specification (v20)
- **components.json**: shadcn/ui component configuration

## Development Commands

### Development
```bash
npm run dev              # Start development server with custom server.js
npm run dev:next         # Start Next.js dev server directly
npm run dev:legacy       # Start with legacy OpenSSL provider
```

### Build & Production
```bash
npm run build            # Build production bundle
npm run postbuild        # Generate sitemap after build
npm run build:analyze    # Build with bundle analyzer
npm run start            # Start production server with custom server.js
npm run start:next       # Start Next.js production server directly
```

### Testing
```bash
npm run test             # Run unit tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Run tests with Vitest UI
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with Playwright UI
npm run test:e2e:headed  # Run E2E tests in headed mode
npm run test:e2e:debug   # Debug E2E tests
```

### Code Quality
```bash
npm run lint             # Run ESLint
```

### Database
```bash
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma db seed       # Seed database (runs prisma/seed.ts)
npx prisma studio        # Open Prisma Studio GUI
```

## Configuration Files

### Next.js Configuration (next.config.ts)
- Compression enabled for text assets
- React strict mode enabled
- Image optimization with AVIF/WebP formats
- Remote image patterns for dicebear, cloudinary, unsplash
- Console log removal in production
- Optimized package imports for lucide-react, framer-motion, radix-ui
- Production source maps disabled
- Bundle analyzer integration

### TypeScript Configuration (tsconfig.json)
- Strict type checking enabled
- Module resolution: bundler
- JSX: preserve
- Path aliases configured
- Incremental compilation enabled

### Vitest Configuration (vitest.config.ts)
- jsdom environment for DOM testing
- React plugin enabled
- Coverage provider: v8
- Setup file: vitest.setup.ts

### Playwright Configuration (playwright.config.ts)
- Multiple browser testing (Chromium, Firefox, WebKit)
- Test directory: e2e/
- Report generation in playwright-report/

### ESLint Configuration (eslint.config.mjs)
- Next.js recommended rules
- TypeScript support

### PostCSS Configuration (postcss.config.mjs)
- Tailwind CSS processing
- Autoprefixer for vendor prefixes

## Package Management
- **npm**: Primary package manager
- **package-lock.json**: Dependency lock file
- **overrides**: Security overrides for dompurify (^3.2.4) and immutable (^4.3.8)

## Memory & Performance Settings
- Node.js max old space size: 4096MB (for large builds)
- Image cache TTL: 60 seconds
- Device sizes: 320, 420, 640, 750, 828, 1080, 1200, 1920
- Image sizes: 16, 32, 48, 64, 96, 128, 256, 384

## Database Schema Highlights
- 40+ Prisma models
- MongoDB with Prisma relation mode
- Enums for type safety (UserRole, EventType, ProjectStatus, etc.)
- Comprehensive indexing for performance
- Cascade delete rules for data integrity
- Audit logging for security events
- Gamification models (Badge, Achievement, XPTransaction, LeaderboardSnapshot)
- Community models (DiscussionRoom, CommunityGroup, CommunityPost, ChatMessage)
- Referral system models (ReferralRelationship)
