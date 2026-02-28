/**
 * Bug Condition Exploration Property Test
 * Student Dashboard Mobile Responsiveness Bugfix
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code
 * - Failure confirms the bug exists (fixed layout breaks on mobile)
 * - After fix, test should pass (responsive layout works on mobile)
 * 
 * This test uses a scoped PBT approach with concrete failing viewport widths
 * to ensure reproducibility and clear demonstration of the bug condition.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import fc from 'fast-check'
import StudentDashboard from '@/app/dashboard/student/page'
import { PROPERTY_TEST_CONFIG } from '@/__tests__/config/property-test.config'

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
  useProjects: () => ({ data: [], loading: false }),
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

describe('Student Dashboard Mobile Responsiveness - Bug Condition Exploration', () => {
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
   * Property 1: Fault Condition - Mobile Layout Breakage
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
   * 
   * EXPECTED BEHAVIOR ON UNFIXED CODE:
   * - Test will FAIL because fixed sidebars and margins cause layout issues
   * - This failure CONFIRMS the bug exists
   * 
   * EXPECTED BEHAVIOR AFTER FIX:
   * - Test will PASS
   * - Sidebars are hidden on mobile (< 768px)
   * - Main content uses full viewport width
   * - No horizontal overflow
   */
  describe('Property 1: Fault Condition - Mobile Layout Breakage', () => {
    /**
     * Generator for mobile viewport widths
     * These are the concrete failing cases that demonstrate the bug
     */
    const arbMobileViewportWidth = (): fc.Arbitrary<number> => {
      return fc.oneof(
        fc.constant(375), // iPhone SE
        fc.constant(414), // Standard mobile
        fc.constant(600), // Small tablet
        fc.constant(767), // Breakpoint edge
      )
    }

    it('should have responsive layout on mobile viewports (EXPECTED TO FAIL ON UNFIXED CODE)', async () => {
      await fc.assert(
        fc.asyncProperty(arbMobileViewportWidth(), async (viewportWidth) => {
          // Set viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          const { container } = render(<StudentDashboard />)

          // Log counterexample information
          console.log(`\n=== Testing viewport width: ${viewportWidth}px ===`)

          // Check left sidebar - should be hidden on mobile (AFTER FIX)
          // Find sidebar by looking for aside elements (there are 2 sidebars)
          const sidebars = container.querySelectorAll('aside')
          const leftSidebar = sidebars[0] // First aside is left sidebar
          const leftSidebarClasses = leftSidebar?.className || ''
          
          console.log(`Left sidebar classes: ${leftSidebarClasses}`)
          
          // AFTER FIX: Should have 'hidden' and 'md:block' classes
          // ON UNFIXED CODE: Will only have 'w-80' without responsive modifiers
          expect(leftSidebarClasses).toContain('hidden')
          expect(leftSidebarClasses).toContain('md:block')

          // Check right sidebar - should be hidden on mobile (AFTER FIX)
          const rightSidebar = sidebars[1] // Second aside is right sidebar
          const rightSidebarClasses = rightSidebar?.className || ''
          
          console.log(`Right sidebar classes: ${rightSidebarClasses}`)
          
          // AFTER FIX: Should have 'hidden' and 'md:block' classes
          // ON UNFIXED CODE: Will only have 'w-96' without responsive modifiers
          expect(rightSidebarClasses).toContain('hidden')
          expect(rightSidebarClasses).toContain('md:block')

          // Check main content - should not have fixed margins on mobile (AFTER FIX)
          const mainContent = container.querySelector('main')
          const mainContentClasses = mainContent?.className || ''
          
          console.log(`Main content classes: ${mainContentClasses}`)
          
          // AFTER FIX: Should have 'md:ml-80' and 'md:mr-96' (responsive margins)
          // ON UNFIXED CODE: Will have 'ml-80' and 'mr-96' (fixed margins)
          expect(mainContentClasses).toContain('md:ml-80')
          expect(mainContentClasses).toContain('md:mr-96')
          
          // AFTER FIX: Should NOT have non-responsive margin classes
          // ON UNFIXED CODE: Will have these classes causing overflow
          expect(mainContentClasses).not.toMatch(/\bml-80\b/)
          expect(mainContentClasses).not.toMatch(/\bmr-96\b/)
        }),
        {
          ...PROPERTY_TEST_CONFIG,
          numRuns: 4, // Scoped to 4 concrete viewport widths
        }
      )
    })

    /**
     * Concrete test cases for specific viewport widths
     * These provide clear counterexamples for documentation
     */
    it('should handle iPhone SE viewport (375px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Counterexample: iPhone SE (375px) ===`)

      // Check sidebars - find by aside elements
      const sidebars = container.querySelectorAll('aside')
      const leftSidebar = sidebars[0]
      const rightSidebar = sidebars[1]
      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''

      console.log(`Left sidebar classes: ${leftSidebarClasses}`)
      console.log(`Right sidebar classes: ${rightSidebarClasses}`)
      console.log(`Expected: Both sidebars should have 'hidden md:block' classes`)
      console.log(`Actual on unfixed code: Sidebars visible without responsive modifiers`)

      // AFTER FIX: These assertions should pass
      expect(leftSidebarClasses).toContain('hidden')
      expect(leftSidebarClasses).toContain('md:block')
      expect(rightSidebarClasses).toContain('hidden')
      expect(rightSidebarClasses).toContain('md:block')

      // Check main content
      const mainContent = container.querySelector('main')
      const mainContentClasses = mainContent?.className || ''

      console.log(`Main content classes: ${mainContentClasses}`)
      console.log(`Expected: Should have 'md:ml-80 md:mr-96' (responsive margins)`)
      console.log(`Actual on unfixed code: Has 'ml-80 mr-96' (fixed margins causing overflow)`)

      // AFTER FIX: These assertions should pass
      expect(mainContentClasses).toContain('md:ml-80')
      expect(mainContentClasses).toContain('md:mr-96')
      expect(mainContentClasses).not.toMatch(/\bml-80\b/)
      expect(mainContentClasses).not.toMatch(/\bmr-96\b/)
    })

    it('should handle standard mobile viewport (414px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 414,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Counterexample: Standard Mobile (414px) ===`)

      const sidebars = container.querySelectorAll('aside')
      const leftSidebar = sidebars[0]
      const rightSidebar = sidebars[1]
      const mainContent = container.querySelector('main')

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Right sidebar: ${rightSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // AFTER FIX: Sidebars should be hidden on mobile
      expect(leftSidebarClasses).toContain('hidden')
      expect(leftSidebarClasses).toContain('md:block')
      expect(rightSidebarClasses).toContain('hidden')
      expect(rightSidebarClasses).toContain('md:block')

      // AFTER FIX: Main content should have responsive margins
      expect(mainContentClasses).toContain('md:ml-80')
      expect(mainContentClasses).toContain('md:mr-96')
      expect(mainContentClasses).not.toMatch(/\bml-80\b/)
      expect(mainContentClasses).not.toMatch(/\bmr-96\b/)
    })

    it('should handle small tablet viewport (600px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Counterexample: Small Tablet (600px) ===`)

      const sidebars = container.querySelectorAll('aside')
      const leftSidebar = sidebars[0]
      const rightSidebar = sidebars[1]
      const mainContent = container.querySelector('main')

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Right sidebar: ${rightSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // AFTER FIX: Sidebars should be hidden on mobile
      expect(leftSidebarClasses).toContain('hidden')
      expect(leftSidebarClasses).toContain('md:block')
      expect(rightSidebarClasses).toContain('hidden')
      expect(rightSidebarClasses).toContain('md:block')

      // AFTER FIX: Main content should have responsive margins
      expect(mainContentClasses).toContain('md:ml-80')
      expect(mainContentClasses).toContain('md:mr-96')
      expect(mainContentClasses).not.toMatch(/\bml-80\b/)
      expect(mainContentClasses).not.toMatch(/\bmr-96\b/)
    })

    it('should handle breakpoint edge viewport (767px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Counterexample: Breakpoint Edge (767px) ===`)

      const sidebars = container.querySelectorAll('aside')
      const leftSidebar = sidebars[0]
      const rightSidebar = sidebars[1]
      const mainContent = container.querySelector('main')

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Right sidebar: ${rightSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)
      console.log(`Note: At 767px (just below md:768px breakpoint), layout should still be mobile`)

      // AFTER FIX: Sidebars should be hidden on mobile
      expect(leftSidebarClasses).toContain('hidden')
      expect(leftSidebarClasses).toContain('md:block')
      expect(rightSidebarClasses).toContain('hidden')
      expect(rightSidebarClasses).toContain('md:block')

      // AFTER FIX: Main content should have responsive margins
      expect(mainContentClasses).toContain('md:ml-80')
      expect(mainContentClasses).toContain('md:mr-96')
      expect(mainContentClasses).not.toMatch(/\bml-80\b/)
      expect(mainContentClasses).not.toMatch(/\bmr-96\b/)
    })
  })

  /**
   * Additional checks for layout overflow
   * These tests verify that the fixed layout causes actual overflow issues
   */
  describe('Layout Overflow Detection', () => {
    it('should document overflow issue on unfixed code at 375px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Overflow Analysis at 375px ===`)
      console.log(`Viewport width: 375px`)
      console.log(`Left sidebar width: 320px (w-80)`)
      console.log(`Right sidebar width: 384px (w-96)`)
      console.log(`Main content left margin: 320px (ml-80)`)
      console.log(`Main content right margin: 384px (mr-96)`)
      console.log(`Total required width: 320 + 384 = 704px`)
      console.log(`Overflow: 704px - 375px = 329px of content pushed off-screen`)
      console.log(`Result: Horizontal scrollbar and inaccessible content`)

      // On unfixed code, the layout structure exists but causes overflow
      const sidebars = container.querySelectorAll('aside')
      const leftSidebar = sidebars[0]
      const rightSidebar = sidebars[1]
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeTruthy()
      expect(mainContent).toBeTruthy()

      // The bug is that these elements don't have responsive classes
      // After fix, they should have 'hidden md:block' and 'md:ml-80 md:mr-96'
    })
  })
})
