import { render, screen } from '@testing-library/react'
import EventsSidebar from '../EventsSidebar'
import { describe, it, expect, vi } from 'vitest'

vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react')
    return {
        ...actual,
        LayoutGrid: () => <div data-testid="icon-layout" />,
        Calendar: () => <div data-testid="icon-calendar" />,
        Clock: () => <div data-testid="icon-clock" />,
        RotateCcw: () => <div data-testid="icon-rotate" />,
        Plus: () => <div data-testid="icon-plus" />,
        BarChart3: () => <div data-testid="icon-barchart" />,
        Menu: () => <div data-testid="icon-menu" />,
        X: () => <div data-testid="icon-x" />,
    }
})

describe('EventsSidebar', () => {
    it('should have an aria-label on the mobile trigger button', () => {
        render(
            <EventsSidebar
                currentView="events"
                onViewChange={vi.fn()}
                currentStatus="upcoming"
                onStatusChange={vi.fn()}
            />
        )

        const button = screen.getByLabelText('Toggle events navigation menu')
        expect(button).toBeInTheDocument()
    })
})
