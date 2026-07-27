/**
 * Preservation Property Test
 * Student Dashboard Layout
 *
 * The dashboard's own per-page sidebar and mobile bottom nav were removed
 * in favor of a persistent, collapsible app-wide sidebar (see
 * src/components/app-shell/), which is rendered by the root layout, not by
 * this page. So this page should render no local `<aside>` and no
 * responsive margin classes on `<main>` at any viewport width — that
 * concern now lives entirely in the app shell.
 *
 * This test uses property-based testing to generate many viewport widths
 * in the desktop range (768px - 2560px) to confirm that invariant holds
 * across all desktop viewport sizes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import fc from 'fast-check'
import StudentDashboard from '../../app/dashboard/student/page'
import { PROPERTY_TEST_CONFIG } from '../config/property-test.config'

// Mock Next.js dependencies
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '507f1f77bcf86cd799439011',
        name: 'Test Student',
        email: 'student@test.com',
        image: '/avatars/test.png',
        currentStreak: 5,
        longestStreak: 10,
        xp: 500,
        level: 3,
      },
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/dashboard/student',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock API hooks to return minimal data with correct shape
vi.mock('@/lib/api/hooks', () => ({
  useProjects: () => ({
    data: [
      {
        id: 'project-1',
        title: 'Test Project',
        status: 'IN_PROGRESS',
        ownerId: '507f1f77bcf86cd799439011',
        githubUrl: null,
        liveUrl: null,
        _count: { members: 1 },
        completedAt: null,
      },
    ],
    loading: false,
  }),
  useMeetings: () => ({ data: [], loading: false }),
  useUserStats: () => ({ data: {}, loading: false }),
  useCheckIn: () => ({
    checkIn: vi.fn(),
    loading: false,
    data: null
  }),
  useUserStreak: () => ({
    data: { currentStreak: 0, longestStreak: 0 },
    loading: false,
    refetch: vi.fn()
  }),
  useEvents: () => ({ data: [], loading: false }),
}))

vi.mock('@/lib/hooks/useCommunityPosts', () => ({
  useCommunityPosts: () => ({ posts: [], isLoading: false }),
}))

vi.mock('@/lib/hooks/useCommunityGroups', () => ({
  useCommunityGroups: () => ({ groups: [], isLoading: false }),
}))

// Mock fetch for mentor sessions
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, data: [] }),
  })
) as any

// Mock EditProjectModal to avoid rendering the full modal in layout tests
vi.mock('@/components/projects/EditProjectModal', () => ({
  EditProjectModal: () => null,
}))

describe('Student Dashboard Layout - Preservation Property', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  /**
   * Property: No local sidebar/margin classes at any desktop width
   *
   * The page must not reintroduce a local `<aside>` or fixed margin
   * classes on `<main>` — that layout concern belongs to the app-wide
   * shell (src/components/app-shell/AppShell.tsx), not this page.
   */
  describe('Property: No Local Sidebar on Desktop Viewports', () => {
    const arbDesktopViewportWidth = (): fc.Arbitrary<number> => {
      return fc.integer({ min: 768, max: 2560 })
    }

    it('should render no local aside or fixed margin classes on desktop viewports', async () => {
      await fc.assert(
        fc.asyncProperty(arbDesktopViewportWidth(), async (viewportWidth) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          const { container } = render(<StudentDashboard />)

          // The page itself should render no <aside> at all — the sidebar
          // now lives in the app shell, outside this component's tree.
          expect(container.querySelectorAll('aside').length).toBe(0)

          const mainContent = container.querySelector('main')
          expect(mainContent).toBeTruthy()

          const mainContentClasses = (mainContent?.className || '').split(' ')
          expect(mainContentClasses).not.toContain('ml-20')
          expect(mainContentClasses).not.toContain('mr-96')
          expect(mainContentClasses).not.toContain('md:ml-20')
          expect(mainContentClasses).not.toContain('md:mr-96')
        }),
        {
          ...PROPERTY_TEST_CONFIG,
          numRuns: 50,
        }
      )
    })

    it('should have no aside/margins at 768px (desktop breakpoint)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })

    it('should have no aside/margins at 1024px (standard laptop)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })

    it('should have no aside/margins at 1440px (large desktop)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })

    it('should have no aside/margins at 1920px+ (ultra-wide)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })
  })

  /**
   * Functional preservation: the tab navigation and content sections that
   * used to live inside the old sidebar are still reachable, just as a
   * pill row at the top of the content area instead of a left column.
   */
  describe('Functional Preservation', () => {
    it('should preserve tab navigation and content sections', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { container } = render(<StudentDashboard />)

      // Tab pill row should expose the same sections the old sidebar menu did
      expect(container.textContent).toContain('Overview')
      expect(container.textContent).toContain('Community')
      expect(container.textContent).toContain('Activity')
      expect(container.textContent).toContain('Redemptions')
      expect(container.textContent).toContain('Reports')

      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()
    })

    it('should preserve tab navigation buttons', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { container } = render(<StudentDashboard />)

      const tabButtons = container.querySelectorAll('button')
      expect(tabButtons.length).toBeGreaterThan(0)
    })
  })
})
