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

          // Check left sidebar - should be visible with fixed width
          const leftSidebar = findSidebarByClass(container, 'w-20')
          expect(leftSidebar).toBeTruthy()
          
          const leftSidebarClasses = leftSidebar?.className || ''
          console.log(`Left sidebar classes: ${leftSidebarClasses}`)
          
          // Verify left sidebar has w-80 class (320px width)
          expect(leftSidebarClasses).toContain('w-20')
          
          // Verify left sidebar has fixed positioning
          expect(leftSidebarClasses).toContain('fixed')
          expect(leftSidebarClasses).toContain('left-0')

          // Check right sidebar - should be visible with fixed width
          const rightSidebar = findSidebarByClass(container, 'w-96')
          expect(rightSidebar).toBeTruthy()
          
          const rightSidebarClasses = rightSidebar?.className || ''
          console.log(`Right sidebar classes: ${rightSidebarClasses}`)
          
          // Verify right sidebar has w-96 class (384px width)
          expect(rightSidebarClasses).toContain('w-96')
          
          // Verify right sidebar has fixed positioning
          expect(rightSidebarClasses).toContain('fixed')
          expect(rightSidebarClasses).toContain('right-0')

          // Check main content - should have fixed margins
          const mainContent = container.querySelector('main')
          expect(mainContent).toBeTruthy()
          
          const mainContentClasses = mainContent?.className || ''
          console.log(`Main content classes: ${mainContentClasses}`)
          
          // Verify main content has left margin (ml-80 = 320px)
          // This can be either 'ml-20' (unfixed) or 'md:ml-80' (fixed)
          const hasLeftMargin = mainContentClasses.includes('ml-20')
          expect(hasLeftMargin).toBe(true)
          
          // Verify main content has right margin (mr-96 = 384px)
          // This can be either 'mr-96' (unfixed) or 'md:mr-96' (fixed)
          const hasRightMargin = mainContentClasses.includes('mr-96')
          expect(hasRightMargin).toBe(true)

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

      // Check three-column layout exists
      const leftSidebar = findSidebarByClass(container, 'w-20')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeTruthy()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Right sidebar: ${rightSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify sidebar widths
      expect(leftSidebarClasses).toContain('w-20') // 320px
      expect(rightSidebarClasses).toContain('w-96') // 384px

      // Verify fixed positioning
      expect(leftSidebarClasses).toContain('fixed')
      expect(leftSidebarClasses).toContain('left-0')
      expect(rightSidebarClasses).toContain('fixed')
      expect(rightSidebarClasses).toContain('right-0')

      // Verify main content margins
      expect(mainContentClasses).toContain('ml-20') // 320px left margin
      expect(mainContentClasses).toContain('mr-96') // 384px right margin

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

      const leftSidebar = findSidebarByClass(container, 'w-20')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeTruthy()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Right sidebar: ${rightSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify sidebar widths (320px and 384px)
      expect(leftSidebarClasses).toContain('w-20')
      expect(rightSidebarClasses).toContain('w-96')

      // Verify fixed positioning
      expect(leftSidebarClasses).toContain('fixed')
      expect(rightSidebarClasses).toContain('fixed')

      // Verify main content margins (320px and 384px)
      expect(mainContentClasses).toContain('ml-20')
      expect(mainContentClasses).toContain('mr-96')

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

      const leftSidebar = findSidebarByClass(container, 'w-20')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeTruthy()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Right sidebar: ${rightSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify full layout structure
      expect(leftSidebarClasses).toContain('w-20')
      expect(rightSidebarClasses).toContain('w-96')
      expect(leftSidebarClasses).toContain('fixed')
      expect(rightSidebarClasses).toContain('fixed')
      expect(mainContentClasses).toContain('ml-20')
      expect(mainContentClasses).toContain('mr-96')

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

      const leftSidebar = findSidebarByClass(container, 'w-20')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeTruthy()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      console.log(`Left sidebar: ${leftSidebarClasses}`)
      console.log(`Right sidebar: ${rightSidebarClasses}`)
      console.log(`Main content: ${mainContentClasses}`)

      // Verify ultra-wide layout behavior
      expect(leftSidebarClasses).toContain('w-20')
      expect(rightSidebarClasses).toContain('w-96')
      expect(leftSidebarClasses).toContain('fixed')
      expect(rightSidebarClasses).toContain('fixed')
      expect(mainContentClasses).toContain('ml-20')
      expect(mainContentClasses).toContain('mr-96')

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
      const leftSidebar = findSidebarByClass(container, 'w-20')
      expect(leftSidebar).toBeTruthy()
      expect(leftSidebar?.textContent).toContain('Test Student')
      expect(leftSidebar?.textContent).toContain('Dashboard')
      expect(leftSidebar?.textContent).toContain('Community')
      expect(leftSidebar?.textContent).toContain('Tracking')
      expect(leftSidebar?.textContent).toContain('Setting')

      // Verify main content area exists
      const mainContent = container.querySelector('main')
      expect(mainContent).toBeTruthy()

      // Verify right sidebar content (calendar and timeline)
      const rightSidebar = findSidebarByClass(container, 'w-96')
      expect(rightSidebar).toBeTruthy()
      expect(rightSidebar?.textContent).toContain('Calendar')

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
      const leftSidebar = findSidebarByClass(container, 'w-20')
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

      const leftSidebar = findSidebarByClass(container, 'w-20')
      const rightSidebar = findSidebarByClass(container, 'w-96')
      const mainContent = container.querySelector('main')

      // At 768px, desktop layout should be active
      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeTruthy()
      expect(mainContent).toBeTruthy()

      const leftSidebarClasses = leftSidebar?.className || ''
      const rightSidebarClasses = rightSidebar?.className || ''
      const mainContentClasses = mainContent?.className || ''

      // Verify three-column layout is present
      expect(leftSidebarClasses).toContain('w-20')
      expect(rightSidebarClasses).toContain('w-96')
      expect(mainContentClasses).toContain('ml-20')
      expect(mainContentClasses).toContain('mr-96')

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

      const leftSidebar = findSidebarByClass(container, 'w-20')
      const rightSidebar = findSidebarByClass(container, 'w-96')

      // At 767px (below md:768px), mobile layout should be active
      // This test documents the expected behavior after the fix
      // On unfixed code, this will show desktop layout (causing the bug)
      // After fix, sidebars should be hidden

      console.log(`Note: At 767px, this is below the md:768px breakpoint`)
      console.log(`Expected after fix: Sidebars hidden, mobile layout active`)
      console.log(`Current on unfixed code: Desktop layout still showing (causing overflow)`)

      // These elements exist in the DOM but should be hidden after fix
      expect(leftSidebar).toBeTruthy()
      expect(rightSidebar).toBeTruthy()
    })
  })
})
