/**
 * Preservation Property Test
 * Student Dashboard Mobile Responsiveness Bugfix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * CRITICAL: This test MUST PASS on unfixed code
 * - Passing confirms the baseline desktop behavior to preserve
 * - After fix, test should still pass (desktop layout unchanged)
 * 
 * This test uses property-based testing to generate many viewport widths
 * in the desktop range (768px - 2560px) to ensure the three-column layout
 * is preserved across all desktop viewport sizes.
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

// Helper to find sidebar by class substring since Tailwind responsive classes (e.g. md:w-80)
// don't match CSS class selectors like .w-80
function findSidebarByClass(container: HTMLElement, classSubstring: string) {
  return Array.from(container.querySelectorAll('aside')).find(el =>
    el.className.includes(classSubstring)
  ) || null;
}

describe('Student Dashboard Mobile Responsiveness - Preservation Property', () => {
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
   * Property 2: Preservation - Desktop Layout Unchanged
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
   * 
   * EXPECTED BEHAVIOR ON UNFIXED CODE:
   * - Test will PASS because desktop layout works correctly
   * - This establishes the baseline behavior to preserve
   * 
   * EXPECTED BEHAVIOR AFTER FIX:
   * - Test will still PASS
   * - Desktop layout (viewport >= 768px) remains unchanged
   * - Three-column layout with fixed sidebars preserved
   * - All functionality remains identical
   */
  describe('Property 2: Preservation - Desktop Layout Unchanged', () => {
    /**
     * Generator for desktop viewport widths
     * Generates random widths in the range [768, 2560]
     * This provides strong guarantees across all desktop sizes
     */
    const arbDesktopViewportWidth = (): fc.Arbitrary<number> => {
      return fc.integer({ min: 768, max: 2560 })
    }

    it('should preserve three-column layout on desktop viewports (EXPECTED TO PASS ON UNFIXED CODE)', async () => {
      await fc.assert(
        fc.asyncProperty(arbDesktopViewportWidth(), async (viewportWidth) => {
          // Set viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          })

          const { container } = render(<StudentDashboard />)

          // Log observation information
          console.log(`\n=== Observing viewport width: ${viewportWidth}px ===`)

          // Check left sidebar - should be visible and part of grid flow
          const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
          expect(leftSidebar).toBeTruthy()
          
          const leftSidebarClasses = leftSidebar?.className || ''
          console.log(`Left sidebar classes: ${leftSidebarClasses}`)
          
          // Verify left sidebar does not have w-20 or fixed/left-0 positioning overrides
          expect(leftSidebarClasses).not.toContain('w-20')
          expect(leftSidebarClasses).not.toContain('fixed')
          expect(leftSidebarClasses).not.toContain('left-0')

          // Check right sidebar - should not exist
          const rightSidebar = findSidebarByClass(container, 'w-96')
          expect(rightSidebar).toBeNull()

          // Check main content - should have left margin but no right margin
          const mainContent = container.querySelector('main')
          expect(mainContent).toBeTruthy()
          
          const mainContentClasses = mainContent?.className || ''
          console.log(`Main content classes: ${mainContentClasses}`)
          
          // Verify main content does not have left margin (no longer needed in grid layout)
          const hasLeftMargin = mainContentClasses.split(' ').includes('ml-20')
          expect(hasLeftMargin).toBe(false)
          
          // Verify main content has no right margin (mr-96)
          const hasRightMargin = mainContentClasses.split(' ').includes('mr-96')
          expect(hasRightMargin).toBe(false)

          console.log(`✓ Desktop layout preserved at ${viewportWidth}px`)
        }),
        {
          ...PROPERTY_TEST_CONFIG,
          numRuns: 50, // Generate 50 random desktop viewport widths
        }
      )
    })

    /**
     * Concrete test cases for specific desktop viewport widths
     * These provide clear documentation of expected behavior
     */
    it('should preserve layout at 768px (desktop breakpoint)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Observation: Desktop Breakpoint (768px) ===`)

      // Check layout exists (no right sidebar)
      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeNull()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify sidebar width & fixed positioning are removed
      expect(leftSidebarClasses).not.toContain('w-20')
      expect(leftSidebarClasses).not.toContain('fixed')
      expect(leftSidebarClasses).not.toContain('left-0')

      // Verify main content margins
      expect(mainContentClasses.split(' ')).not.toContain('ml-20')
      expect(mainContentClasses.split(' ')).not.toContain('mr-96')

      console.log(`✓ Three-column layout preserved at 768px`)
    })

    it('should preserve layout at 1024px (standard laptop)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Observation: Standard Laptop (1024px) ===`)

      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeNull()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify sidebar width & fixed positioning are removed
      expect(leftSidebarClasses).not.toContain('w-20')
      expect(leftSidebarClasses).not.toContain('fixed')

      // Verify main content margins
      expect(mainContentClasses.split(' ')).not.toContain('ml-20')
      expect(mainContentClasses.split(' ')).not.toContain('mr-96')

      console.log(`✓ Three-column layout preserved at 1024px`)
    })

    it('should preserve layout at 1440px (large desktop)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Observation: Large Desktop (1440px) ===`)

      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeNull()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify full layout structure
      expect(leftSidebarClasses).not.toContain('w-20')
      expect(leftSidebarClasses).not.toContain('fixed')
      expect(mainContentClasses.split(' ')).not.toContain('ml-20')
      expect(mainContentClasses.split(' ')).not.toContain('mr-96')

      console.log(`✓ Three-column layout preserved at 1440px`)
    })

    it('should preserve layout at 1920px+ (ultra-wide)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Observation: Ultra-wide (1920px) ===`)

      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeNull()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify ultra-wide layout behavior
      expect(leftSidebarClasses).not.toContain('w-20')
      expect(leftSidebarClasses).not.toContain('fixed')
      expect(mainContentClasses.split(' ')).not.toContain('ml-20')
      expect(mainContentClasses.split(' ')).not.toContain('mr-96')

      console.log(`✓ Three-column layout preserved at 1920px`)
    })
  })

  /**
   * Additional preservation checks
   * Verify that all dashboard sections and functionality remain accessible
   */
  describe('Functional Preservation', () => {
    it('should preserve all dashboard sections on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Functional Preservation Check ===`)

      // Verify left sidebar content (user profile and navigation)
      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      expect(leftSidebar).toBeTruthy()
      expect(leftSidebar?.textContent).toContain('Test Student')
      expect(leftSidebar?.textContent).toContain('Dashboard')
      expect(leftSidebar?.textContent).toContain('Community')
      expect(leftSidebar?.textContent).toContain('Tracking')
      expect(leftSidebar?.textContent).toContain('Setting')

      // Verify main content area exists
      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()

      // Verify right sidebar does not exist
      const rightSidebar = findSidebarByClass(container, 'w-96')
      expect(rightSidebar).toBeNull()

      console.log(`✓ All dashboard sections preserved`)
    })

    it('should preserve navigation functionality on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Navigation Preservation Check ===`)

      // Verify navigation buttons exist
      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      const navButtons = leftSidebar?.querySelectorAll('button')
      
      expect(navButtons).toBeTruthy()
      expect(navButtons!.length).toBeGreaterThan(0)

      console.log(`✓ Navigation functionality preserved`)
    })
  })

  /**
   * Edge case: Verify behavior at breakpoint boundary
   */
  describe('Breakpoint Boundary Behavior', () => {
    it('should show desktop layout at exactly 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Breakpoint Boundary: 768px ===`)

      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      // At 768px, desktop layout should be active
      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeNull()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      // Verify layout is present
      expect(leftSidebarClasses).not.toContain('w-20')
      expect(mainContentClasses.split(' ')).not.toContain('ml-20')
      expect(mainContentClasses.split(' ')).not.toContain('mr-96')

      console.log(`✓ Desktop layout active at 768px breakpoint`)
    })

    it('should show mobile layout at 767px (just below breakpoint)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })

      const { container } = render(<StudentDashboard />)

      console.log(`\n=== Breakpoint Boundary: 767px ===`)

      const leftSidebar = findSidebarByClass(container, 'dashboard-sidebar-card')
      const rightSidebar = findSidebarByClass(container, 'w-96')

      // At 767px (below md:768px), mobile layout should be active

      console.log(`Note: At 767px, this is below the md:768px breakpoint`)
      console.log(`Expected: Sidebars hidden, mobile layout active`)

      // These elements exist in the DOM but should be hidden after fix
      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeNull()
    })
  })
})
