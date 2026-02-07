# Testing Guide

This guide covers the comprehensive testing infrastructure for the VELONX platform.

## Overview

The testing infrastructure includes:
- **Unit Tests**: Testing individual functions and components with Vitest
- **Property-Based Tests**: Testing universal properties with fast-check
- **Integration Tests**: Testing API endpoints and service interactions
- **E2E Tests**: Testing complete user flows with Playwright

## Test Structure

```
VELONX/
├── src/__tests__/              # Unit and integration tests
│   ├── setup/                  # Test setup utilities
│   │   └── test-db.ts         # Database setup/teardown
│   ├── helpers/                # Test helpers
│   │   └── property-test-helpers.ts
│   ├── config/                 # Test configuration
│   │   └── property-test.config.ts
│   ├── mocks/                  # Mock data generators
│   │   ├── user.mock.ts
│   │   ├── session.mock.ts
│   │   └── redis.mock.ts
│   ├── utils/                  # Test utilities
│   │   ├── test-helpers.ts
│   │   └── api-test-helpers.ts
│   └── examples/               # Example tests
│       └── example.property.test.ts
├── e2e/                        # E2E tests
│   ├── helpers/                # E2E helpers
│   │   ├── auth.helper.ts
│   │   ├── navigation.helper.ts
│   │   └── assertions.helper.ts
│   └── example.spec.ts
├── vitest.config.ts            # Vitest configuration
├── vitest.setup.ts             # Vitest setup file
└── playwright.config.ts        # Playwright configuration
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

## Writing Unit Tests

### Basic Unit Test

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/utils/my-function'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

### Using Mocks

```typescript
import { createMockUser } from '@/__tests__/mocks/user.mock'
import { createMockRedis } from '@/__tests__/mocks/redis.mock'

describe('User Service', () => {
  it('should create user', async () => {
    const mockUser = createMockUser({ name: 'Test User' })
    const mockRedis = createMockRedis()
    
    // Test implementation
  })
})
```

## Writing Property-Based Tests

Property-based tests verify universal properties across many randomly generated inputs.

### Basic Property Test

```typescript
import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { DEFAULT_PROPERTY_TEST_CONFIG } from '@/__tests__/helpers/property-test-helpers'

// Feature: platform-optimization-improvements, Property 1: Addition is commutative
describe('Math Properties', () => {
  it('should demonstrate addition commutativity', async () => {
    await fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          expect(a + b).toBe(b + a)
        }
      ),
      DEFAULT_PROPERTY_TEST_CONFIG // Runs 100 iterations
    )
  })
})
```

### Using Custom Generators

```typescript
import { arbUserId, arbEmail, arbUserName } from '@/__tests__/helpers/property-test-helpers'

// Feature: platform-optimization-improvements, Property 2: User validation
it('should validate user data', async () => {
  await fc.assert(
    fc.property(
      arbUserId(),
      arbEmail(),
      arbUserName(),
      (id, email, name) => {
        // Test that all generated values are valid
        expect(id).toMatch(/^[0-9a-f]{24}$/)
        expect(email).toContain('@')
        expect(name.trim().length).toBeGreaterThan(0)
      }
    ),
    DEFAULT_PROPERTY_TEST_CONFIG
  )
})
```

## Writing Integration Tests

Integration tests verify API endpoints and service interactions.

### API Route Test

```typescript
import { describe, it, expect } from 'vitest'
import { createMockNextRequest, createAuthenticatedContext } from '@/__tests__/utils/api-test-helpers'
import { GET } from '@/app/api/users/route'

describe('GET /api/users', () => {
  it('should return users for authenticated request', async () => {
    const request = createMockNextRequest({ method: 'GET' })
    const { getServerSession } = createAuthenticatedContext('ADMIN')
    
    // Mock getServerSession
    vi.mock('next-auth', () => ({
      getServerSession,
    }))
    
    const response = await GET(request)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

## Writing E2E Tests

E2E tests verify complete user flows in a real browser.

### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth.helper'
import { navigateToDashboard } from './helpers/navigation.helper'

test.describe('User Dashboard Flow', () => {
  test('should complete user flow', async ({ page }) => {
    // Login
    await login(page, TEST_USERS.student)
    
    // Navigate to dashboard
    await navigateToDashboard(page, 'STUDENT')
    
    // Verify dashboard loaded
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})
```

## Test Coverage

The project aims for minimum 70% code coverage across:
- Lines
- Statements
- Functions
- Branches

View coverage reports:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Best Practices

### Unit Tests
- Test one thing per test
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Test edge cases and error conditions

### Property Tests
- Define clear properties that should always hold
- Use appropriate generators for input data
- Run minimum 100 iterations (configured by default)
- Tag tests with feature and property number
- Document what property is being tested

### Integration Tests
- Test API contracts (request/response format)
- Test authentication and authorization
- Test error handling
- Use test database for data operations
- Clean up test data after tests

### E2E Tests
- Test critical user flows only
- Use page object pattern for reusability
- Wait for elements properly (avoid fixed timeouts)
- Test on multiple browsers and viewports
- Keep tests independent and isolated

## Troubleshooting

### Tests Failing Locally

1. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. Check environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Clear test cache:
   ```bash
   rm -rf node_modules/.vitest
   ```

### E2E Tests Failing

1. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

2. Ensure dev server is running:
   ```bash
   npm run dev
   ```

3. Check Playwright configuration in `playwright.config.ts`

### Coverage Not Generated

1. Install coverage provider:
   ```bash
   npm install --save-dev @vitest/coverage-v8
   ```

2. Run with coverage flag:
   ```bash
   npm run test:coverage
   ```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before deployments

CI configuration runs:
- All unit tests
- All integration tests
- All property tests (with 1000 iterations)
- E2E tests on critical flows
- Coverage reporting

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://fast-check.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
