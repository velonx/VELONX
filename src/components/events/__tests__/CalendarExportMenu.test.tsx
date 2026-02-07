import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarExportMenu } from '../CalendarExportMenu';
import { Event } from '@/lib/api/types';
import * as useCalendarExportModule from '@/lib/hooks/useCalendarExport';

// Mock the useCalendarExport hook
vi.mock('@/lib/hooks/useCalendarExport');

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockEvent: Event = {
  id: '1',
  title: 'Web Development Workshop',
  description: 'Learn modern web development',
  type: 'WORKSHOP',
  date: '2024-03-15T10:00:00Z',
  endDate: '2024-03-15T12:00:00Z',
  location: 'Online',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  imageUrl: null,
  maxSeats: 50,
  status: 'UPCOMING',
  creatorId: 'creator-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('CalendarExportMenu', () => {
  const mockExportToICS = vi.fn();
  const mockExportToGoogle = vi.fn();
  const mockExportToOutlook = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useCalendarExportModule.useCalendarExport).mockReturnValue({
      exportToICS: mockExportToICS,
      exportToGoogle: mockExportToGoogle,
      exportToOutlook: mockExportToOutlook,
      isExporting: false,
    });
  });

  describe('Rendering', () => {
    it('renders the trigger button', () => {
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      expect(button).toBeInTheDocument();
    });

    it('renders with custom variant and size', () => {
      render(
        <CalendarExportMenu 
          event={mockEvent} 
          variant="ghost" 
          size="sm" 
        />
      );
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    it('shows calendar icon', () => {
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Dropdown Menu', () => {
    it('opens dropdown menu on click', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Export to Calendar')).toBeInTheDocument();
      });
    });

    it('displays all export options', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Download ICS File')).toBeInTheDocument();
        expect(screen.getByText('Google Calendar')).toBeInTheDocument();
        expect(screen.getByText('Outlook Calendar')).toBeInTheDocument();
      });
    });

    it('shows registered user message when isRegistered is true', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} isRegistered={true} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/meeting link included/i)).toBeInTheDocument();
      });
    });

    it('does not show registered user message when isRegistered is false', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} isRegistered={false} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText(/meeting link included/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Export Actions', () => {
    it('calls exportToICS when ICS option is clicked', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      const icsOption = await screen.findByText('Download ICS File');
      await user.click(icsOption);
      
      expect(mockExportToICS).toHaveBeenCalledWith(mockEvent);
      expect(mockExportToICS).toHaveBeenCalledTimes(1);
    });

    it('calls exportToGoogle when Google Calendar option is clicked', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      const googleOption = await screen.findByText('Google Calendar');
      await user.click(googleOption);
      
      expect(mockExportToGoogle).toHaveBeenCalledWith(mockEvent);
      expect(mockExportToGoogle).toHaveBeenCalledTimes(1);
    });

    it('calls exportToOutlook when Outlook Calendar option is clicked', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      const outlookOption = await screen.findByText('Outlook Calendar');
      await user.click(outlookOption);
      
      expect(mockExportToOutlook).toHaveBeenCalledWith(mockEvent);
      expect(mockExportToOutlook).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('disables button when isExporting is true', () => {
      vi.mocked(useCalendarExportModule.useCalendarExport).mockReturnValue({
        exportToICS: mockExportToICS,
        exportToGoogle: mockExportToGoogle,
        exportToOutlook: mockExportToOutlook,
        isExporting: true,
      });

      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      expect(button).toBeDisabled();
    });

    it('disables menu items when isExporting is true', async () => {
      const user = userEvent.setup();
      
      // First render with isExporting false to open menu
      const { rerender } = render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      await user.click(button);
      
      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByText('Download ICS File')).toBeInTheDocument();
      });
      
      // Now update to isExporting true
      vi.mocked(useCalendarExportModule.useCalendarExport).mockReturnValue({
        exportToICS: mockExportToICS,
        exportToGoogle: mockExportToGoogle,
        exportToOutlook: mockExportToOutlook,
        isExporting: true,
      });
      
      rerender(<CalendarExportMenu event={mockEvent} />);
      
      // Menu items should be disabled
      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('data-disabled');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on trigger button', () => {
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      expect(button).toHaveAttribute('aria-label', 'Add to calendar');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CalendarExportMenu event={mockEvent} />);
      
      const button = screen.getByRole('button', { name: /add to calendar/i });
      
      // Focus and open with Enter
      button.focus();
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Export to Calendar')).toBeInTheDocument();
      });
    });
  });
});
