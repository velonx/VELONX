/**
 * ProjectModal Component Tests
 * Feature: project-page-ui-improvements
 * 
 * Tests for ProjectModal accessibility and functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectModal } from '../ProjectModal';
import { ExtendedProject } from '@/lib/types/project-page.types';

// Mock project data
const mockProject: ExtendedProject = {
  id: 'project-1',
  title: 'Test Project',
  description: 'This is a test project description',
  techStack: ['React', 'TypeScript', 'Node.js'],
  status: 'IN_PROGRESS',
  category: 'WEB_DEV',
  difficulty: 'INTERMEDIATE',
  imageUrl: null,
  githubUrl: 'https://github.com/test/project',
  liveUrl: 'https://demo.test.com',
  outcomes: 'Successfully deployed and tested',
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  members: [
    {
      id: 'member-1',
      userId: 'user-1',
      projectId: 'project-1',
      role: 'Project Lead',
      joinedAt: '2024-01-01T00:00:00.000Z',
      user: {
        id: 'user-1',
        name: 'John Doe',
        image: null,
      },
    },
    {
      id: 'member-2',
      userId: 'user-2',
      projectId: 'project-1',
      role: 'Frontend Developer',
      joinedAt: '2024-01-02T00:00:00.000Z',
      user: {
        id: 'user-2',
        name: 'Jane Smith',
        image: null,
      },
    },
  ],
  _count: {
    members: 2,
  },
};

describe('ProjectModal - Accessibility', () => {
  const mockOnClose = vi.fn();
  const mockOnJoinRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have proper ARIA attributes when open', () => {
    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Check for dialog role (provided by Radix UI)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Check for title with proper ID
    const title = screen.getByText('Test Project');
    expect(title).toHaveAttribute('id', 'project-modal-title');

    // Check for description with proper ID
    const description = screen.getByText('This is a test project description');
    expect(description).toHaveAttribute('id', 'project-modal-description');
  });

  it('should display project owner with visual indicator', () => {
    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Check for owner badge
    const ownerBadge = screen.getByText('Owner');
    expect(ownerBadge).toBeInTheDocument();

    // Check that John Doe (owner) is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display all team members', () => {
    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Check team members count
    expect(screen.getByText('Team Members (2)')).toBeInTheDocument();

    // Check both members are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check roles are displayed
    expect(screen.getByText('Project Lead')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should display quick action buttons with proper labels', () => {
    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Check GitHub button
    const githubButton = screen.getByRole('button', {
      name: /view github repository/i,
    });
    expect(githubButton).toBeInTheDocument();

    // Check Live Demo button
    const demoButton = screen.getByRole('button', {
      name: /view live demo/i,
    });
    expect(demoButton).toBeInTheDocument();
  });

  it('should display join request button with proper status', () => {
    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="pending"
      />
    );

    // Check for pending status
    const joinButton = screen.getByRole('button', {
      name: /request pending/i,
    });
    expect(joinButton).toBeInTheDocument();
    expect(joinButton).toBeDisabled();
  });

  it('should prevent background scrolling when open', () => {
    const { rerender } = render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Check that body overflow is hidden
    expect(document.body.style.overflow).toBe('hidden');

    // Close modal
    rerender(
      <ProjectModal
        projectId="project-1"
        isOpen={false}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Check that body overflow is restored
    expect(document.body.style.overflow).toBe('');
  });

  it('should display all project details', () => {
    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Check title
    expect(screen.getByText('Test Project')).toBeInTheDocument();

    // Check description
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();

    // Check tech stack
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();

    // Check status
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Check category
    expect(screen.getByText('Web Dev')).toBeInTheDocument();

    // Check outcomes
    expect(screen.getByText('Successfully deployed and tested')).toBeInTheDocument();
  });

  it('should call onJoinRequest when join button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    const joinButton = screen.getByRole('button', {
      name: /request to join/i,
    });

    await user.click(joinButton);

    expect(mockOnJoinRequest).toHaveBeenCalledWith('project-1');
  });

  it('should open external links in new tab', async () => {
    const user = userEvent.setup();
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <ProjectModal
        projectId="project-1"
        isOpen={true}
        onClose={mockOnClose}
        onJoinRequest={mockOnJoinRequest}
        project={mockProject}
        joinRequestStatus="none"
      />
    );

    // Click GitHub button
    const githubButton = screen.getByRole('button', {
      name: /view github repository/i,
    });
    await user.click(githubButton);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://github.com/test/project',
      '_blank',
      'noopener,noreferrer'
    );

    // Click Demo button
    const demoButton = screen.getByRole('button', {
      name: /view live demo/i,
    });
    await user.click(demoButton);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://demo.test.com',
      '_blank',
      'noopener,noreferrer'
    );

    windowOpenSpy.mockRestore();
  });
});
