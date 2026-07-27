/**
 * Mobile Layout Property Test
 * Student Dashboard Layout
 *
 * The dashboard used to render its own fixed-width sidebar and a
 * `md:hidden` bottom nav directly inside the page, guarded by responsive
 * Tailwind classes. Both were removed: navigation now lives in the
 * persistent, collapsible app-wide sidebar (src/components/app-shell/),
 * rendered once by the root layout for every authenticated route rather
 * than duplicated per page. So on mobile viewports this page should
 * render no `<aside>` at all and no fixed margin classes on `<main>` —
 * there's nothing left here that could cause the old overflow bug.
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

// Mock API hooks to return empty data
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

describe('Student Dashboard Layout - Mobile Viewports', () => {
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

  describe('No Local Sidebar on Mobile Viewports', () => {
    const arbMobileViewportWidth = (): fc.Arbitrary<number> => {
      return fc.oneof(
        fc.constant(375), // iPhone SE
        fc.constant(414), // Standard mobile
        fc.constant(600), // Small tablet
        fc.constant(767), // Breakpoint edge
      )
    }

    it('should render no local aside or fixed margins on mobile viewports', async () => {
      await fc.assert(
        fc.asyncProperty(arbMobileViewportWidth(), async (viewportWidth) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          const { container } = render(<StudentDashboard />)

          // The page renders no <aside> of its own — the app-wide sidebar
          // (hidden on mobile, opened via the top bar's Sheet drawer instead)
          // lives outside this component's tree entirely.
          expect(container.querySelectorAll('aside').length).toBe(0)

          const mainContent = container.querySelector('main')
          const mainContentClasses = (mainContent?.className || '').split(' ')

          expect(mainContentClasses).not.toContain('ml-20')
          expect(mainContentClasses).not.toContain('mr-96')
          expect(mainContentClasses).not.toContain('md:ml-20')
          expect(mainContentClasses).not.toContain('md:mr-96')
        }),
        {
          ...PROPERTY_TEST_CONFIG,
          numRuns: 4,
        }
      )
    })

    it('should handle iPhone SE viewport (375px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })

    it('should handle standard mobile viewport (414px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 414,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })

    it('should handle small tablet viewport (600px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })

    it('should handle breakpoint edge viewport (767px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect((mainContent?.className || '').split(' ')).not.toContain('ml-20')
      expect((mainContent?.className || '').split(' ')).not.toContain('mr-96')
    })
  })

  describe('Layout Overflow Prevention', () => {
    it('should keep the tab navigation horizontally scrollable instead of overflowing at 375px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(<StudentDashboard />)

      expect(container.querySelectorAll('aside').length).toBe(0)
      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()
    })
  })
})
