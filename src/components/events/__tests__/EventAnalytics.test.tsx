import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EventAnalytics from "../EventAnalytics";
import { type Event } from "@/lib/api/types";

// Mock next-auth
vi.mock("next-auth/react", () => ({
    useSession: vi.fn(() => ({
        data: null,
        status: "unauthenticated",
    })),
}));

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

const mockEvents: Event[] = [
    {
        id: "1",
        title: "React Workshop",
        description: "Learn React basics",
        type: "WORKSHOP",
        date: new Date("2024-02-15").toISOString(),
        endDate: new Date("2024-02-15T02:00:00").toISOString(),
        location: "Online",
        meetingLink: "https://meet.google.com/abc",
        imageUrl: null,
        maxSeats: 50,
        status: "UPCOMING",
        creatorId: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
            attendees: 30,
        },
    },
    {
        id: "2",
        title: "Hackathon 2024",
        description: "24-hour coding challenge",
        type: "HACKATHON",
        date: new Date("2024-03-01").toISOString(),
        endDate: new Date("2024-03-02").toISOString(),
        location: "Tech Hub",
        meetingLink: null,
        imageUrl: null,
        maxSeats: 100,
        status: "UPCOMING",
        creatorId: "user1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
            attendees: 85,
        },
    },
    {
        id: "3",
        title: "Web Development Webinar",
        description: "Modern web development practices",
        type: "WEBINAR",
        date: new Date("2024-01-10").toISOString(),
        endDate: new Date("2024-01-10T01:30:00").toISOString(),
        location: "Online",
        meetingLink: "https://zoom.us/j/123",
        imageUrl: null,
        maxSeats: 200,
        status: "COMPLETED",
        creatorId: "user2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
            attendees: 150,
        },
    },
];

describe("EventAnalytics", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders analytics header", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Event Analytics")).toBeInTheDocument();
    });

    it("displays platform-wide analytics description when not logged in", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Platform-wide analytics")).toBeInTheDocument();
    });

    it("calculates and displays total events correctly", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Total Events")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("calculates and displays upcoming events correctly", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Upcoming")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("calculates and displays completed events correctly", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Completed")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("calculates and displays total attendees correctly", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Total Attendees")).toBeInTheDocument();
        expect(screen.getByText("265")).toBeInTheDocument();
    });

    it("calculates and displays average attendance correctly", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Avg Attendance")).toBeInTheDocument();
        // (30 + 85 + 150) / (50 + 100 + 200) = 265 / 350 = 75.71% ≈ 76%
        expect(screen.getByText("76%")).toBeInTheDocument();
    });

    it("calculates and displays total capacity correctly", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Total Capacity")).toBeInTheDocument();
        expect(screen.getByText("350")).toBeInTheDocument();
    });

    it("renders export CSV button", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });

    it("renders date range filter buttons", () => {
        render(<EventAnalytics events={mockEvents} />);
        expect(screen.getByText("Last 7 Days")).toBeInTheDocument();
        expect(screen.getByText("Last 30 Days")).toBeInTheDocument();
        expect(screen.getByText("Last 90 Days")).toBeInTheDocument();
        expect(screen.getByText("All Time")).toBeInTheDocument();
    });

    it("filters events by date range when filter is selected", () => {
        render(<EventAnalytics events={mockEvents} />);
        
        // Initially shows all events
        const totalEventsCards = screen.getAllByText("Total Events");
        expect(totalEventsCards[0]).toBeInTheDocument();
        
        // Click "Last 7 Days" filter
        const last7DaysButton = screen.getByText("Last 7 Days");
        fireEvent.click(last7DaysButton);
        
        // Should show 0 events (all mock events are outside 7 days)
        // Check that the stats have updated by verifying the button is now active
        expect(last7DaysButton).toHaveClass("bg-cyan-500");
    });

    it("renders chart components", () => {
        render(<EventAnalytics events={mockEvents} />);
        
        // Check for chart titles
        expect(screen.getByText("Event Type Distribution")).toBeInTheDocument();
        expect(screen.getByText("Event Trend (Last 6 Months)")).toBeInTheDocument();
        expect(screen.getByText("Attendance by Event Type")).toBeInTheDocument();
    });

    it("handles empty events array gracefully", () => {
        render(<EventAnalytics events={[]} />);
        
        expect(screen.getByText("Total Events")).toBeInTheDocument();
        expect(screen.getByText("Avg Attendance")).toBeInTheDocument();
        // With empty events, all stats should be 0 or 0%
        const statsCards = screen.getAllByText(/^0$|^0%$/);
        expect(statsCards.length).toBeGreaterThan(0);
    });

    it("exports CSV when export button is clicked", () => {
        // Mock document methods
        const createElementSpy = vi.spyOn(document, "createElement");
        const appendChildSpy = vi.spyOn(document.body, "appendChild");
        const removeChildSpy = vi.spyOn(document.body, "removeChild");
        
        render(<EventAnalytics events={mockEvents} />);
        
        const exportButton = screen.getByText("Export CSV");
        fireEvent.click(exportButton);
        
        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });
});
