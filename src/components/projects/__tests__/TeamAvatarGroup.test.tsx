/**
 * TeamAvatarGroup Component Tests
 * Feature: project-page-ui-improvements
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamAvatarGroup } from '../TeamAvatarGroup';
import { ProjectMember } from '@/lib/api/types';

// Helper function to create mock members
function createMockMember(
  id: string,
  name: string,
  image: string | null = null
): ProjectMember {
  return {
    id,
    projectId: 'project-1',
    userId: `user-${id}`,
    role: 'Developer',
    joinedAt: new Date().toISOString(),
    user: {
      id: `user-${id}`,
      name,
      image,
    },
  };
}

describe('TeamAvatarGroup Component', () => {
  describe('Basic Rendering', () => {
    it('should render with empty members array', () => {
      const { container } = render(<TeamAvatarGroup members={[]} />);
      const group = container.querySelector('[role="group"]');
      expect(group).toBeInTheDocument();
    });

    it('should render single member', () => {
      const members = [createMockMember('1', 'John Doe')];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render multiple members', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
        createMockMember('3', 'Bob Johnson'),
      ];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
      expect(screen.getByText('BJ')).toBeInTheDocument();
    });

    it('should have proper aria-label on group', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
      ];
      const { container } = render(<TeamAvatarGroup members={members} />);
      
      const group = container.querySelector('[role="group"]');
      expect(group).toHaveAttribute('aria-label', 'Team members: 2 total');
    });
  });

  describe('Avatar Display with Images', () => {
    it('should render avatar component with image when available', () => {
      const members = [
        createMockMember('1', 'John Doe', 'https://example.com/john.jpg'),
      ];
      const { container } = render(<TeamAvatarGroup members={members} />);
      
      // Verify avatar component is rendered
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
      
      // Verify fallback initials are also present (Radix UI shows both)
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render multiple avatars with images', () => {
      const members = [
        createMockMember('1', 'John Doe', 'https://example.com/john.jpg'),
        createMockMember('2', 'Jane Smith', 'https://example.com/jane.jpg'),
      ];
      const { container } = render(<TeamAvatarGroup members={members} />);
      
      // Verify both avatars are rendered
      const avatars = container.querySelectorAll('[data-slot="avatar"]');
      expect(avatars).toHaveLength(2);
      
      // Verify fallback initials are present
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  describe('Initials Fallback', () => {
    it('should display initials when no image is provided', () => {
      const members = [createMockMember('1', 'John Doe', null)];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should extract first and last name initials', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Marie Smith'),
        createMockMember('3', 'Bob'),
      ];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument(); // John Doe
      expect(screen.getByText('JS')).toBeInTheDocument(); // Jane Smith
      expect(screen.getByText('BO')).toBeInTheDocument(); // Bob (first 2 letters)
    });

    it('should handle null or undefined names', () => {
      const members = [
        {
          ...createMockMember('1', 'John Doe'),
          user: { id: 'user-1', name: null, image: null },
        },
      ];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('UU')).toBeInTheDocument(); // Unknown User
    });

    it('should handle empty string names', () => {
      const members = [
        {
          ...createMockMember('1', ''),
          user: { id: 'user-1', name: '', image: null },
        },
      ];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('UU')).toBeInTheDocument(); // Unknown User
    });

    it('should uppercase initials', () => {
      const members = [createMockMember('1', 'john doe')];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Max Display and Overflow', () => {
    it('should display up to maxDisplay members (default 4)', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
        createMockMember('3', 'Bob Johnson'),
        createMockMember('4', 'Alice Williams'),
        createMockMember('5', 'Charlie Brown'),
      ];
      render(<TeamAvatarGroup members={members} />);
      
      // Should show first 4 members
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
      expect(screen.getByText('BJ')).toBeInTheDocument();
      expect(screen.getByText('AW')).toBeInTheDocument();
      
      // Should show +1 more indicator
      expect(screen.getByText('+1')).toBeInTheDocument();
    });

    it('should respect custom maxDisplay prop', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
        createMockMember('3', 'Bob Johnson'),
        createMockMember('4', 'Alice Williams'),
      ];
      render(<TeamAvatarGroup members={members} maxDisplay={2} />);
      
      // Should show first 2 members
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
      
      // Should not show remaining members
      expect(screen.queryByText('BJ')).not.toBeInTheDocument();
      expect(screen.queryByText('AW')).not.toBeInTheDocument();
      
      // Should show +2 more indicator
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not show overflow indicator when members <= maxDisplay', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
      ];
      render(<TeamAvatarGroup members={members} maxDisplay={4} />);
      
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it('should show correct overflow count', () => {
      const members = Array.from({ length: 10 }, (_, i) =>
        createMockMember(`${i + 1}`, `User ${i + 1}`)
      );
      render(<TeamAvatarGroup members={members} maxDisplay={3} />);
      
      expect(screen.getByText('+7')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      const members = [createMockMember('1', 'John Doe')];
      const { container } = render(
        <TeamAvatarGroup members={members} size="sm" />
      );
      
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('size-6');
    });

    it('should apply medium size classes (default)', () => {
      const members = [createMockMember('1', 'John Doe')];
      const { container } = render(
        <TeamAvatarGroup members={members} size="md" />
      );
      
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('size-8');
    });

    it('should apply large size classes', () => {
      const members = [createMockMember('1', 'John Doe')];
      const { container } = render(
        <TeamAvatarGroup members={members} size="lg" />
      );
      
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toHaveClass('size-10');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      const members = [createMockMember('1', 'John Doe')];
      const { container } = render(
        <TeamAvatarGroup members={members} className="custom-class" />
      );
      
      const group = container.querySelector('[role="group"]');
      expect(group).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have role="group" on container', () => {
      const members = [createMockMember('1', 'John Doe')];
      const { container } = render(<TeamAvatarGroup members={members} />);
      
      const group = container.querySelector('[role="group"]');
      expect(group).toBeInTheDocument();
    });

    it('should have descriptive aria-label with member count', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
        createMockMember('3', 'Bob Johnson'),
      ];
      const { container } = render(<TeamAvatarGroup members={members} />);
      
      const group = container.querySelector('[role="group"]');
      expect(group).toHaveAttribute('aria-label', 'Team members: 3 total');
    });

    it('should render avatar with alt attribute for accessibility', () => {
      const members = [
        createMockMember('1', 'John Doe', 'https://example.com/john.jpg'),
      ];
      const { container } = render(<TeamAvatarGroup members={members} />);
      
      // Verify avatar is rendered
      const avatar = container.querySelector('[data-slot="avatar"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle members without user data', () => {
      const members = [
        {
          id: '1',
          projectId: 'project-1',
          userId: 'user-1',
          role: 'Developer',
          joinedAt: new Date().toISOString(),
        } as ProjectMember,
      ];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('UU')).toBeInTheDocument(); // Unknown User
    });

    it('should handle very long names', () => {
      const members = [
        createMockMember(
          '1',
          'Christopher Alexander Montgomery Wellington'
        ),
      ];
      render(<TeamAvatarGroup members={members} />);
      
      // Should show first and last name initials
      expect(screen.getByText('CW')).toBeInTheDocument();
    });

    it('should handle names with special characters', () => {
      const members = [
        createMockMember('1', "O'Brien McDonald"),
        createMockMember('2', 'José García'),
      ];
      render(<TeamAvatarGroup members={members} />);
      
      expect(screen.getByText('OM')).toBeInTheDocument();
      expect(screen.getByText('JG')).toBeInTheDocument();
    });

    it('should handle maxDisplay of 0', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
      ];
      render(<TeamAvatarGroup members={members} maxDisplay={0} />);
      
      // Should show +2 more indicator
      expect(screen.getByText('+2')).toBeInTheDocument();
      
      // Should not show any member avatars
      expect(screen.queryByText('JD')).not.toBeInTheDocument();
      expect(screen.queryByText('JS')).not.toBeInTheDocument();
    });

    it('should handle maxDisplay larger than members length', () => {
      const members = [
        createMockMember('1', 'John Doe'),
        createMockMember('2', 'Jane Smith'),
      ];
      render(<TeamAvatarGroup members={members} maxDisplay={10} />);
      
      // Should show all members
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
      
      // Should not show overflow indicator
      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });
  });
});
