/**
 * ProjectCard Component Tests
 *
 * Tests for the ProjectCard including:
 * - Rendering of project details
 * - Edit button visibility (owner-only)
 * - GitHub and Live URL link behavior
 * - Callback invocation for onEdit
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCard } from '../ProjectCard';
import { useSession } from 'next-auth/react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockProject = {
  id: 'project-1',
  title: 'Test Project',
  description: 'A test project description',
  techStack: ['React', 'Next.js'],
  status: 'IN_PROGRESS',
  category: 'WEB_DEV',
  difficulty: 'INTERMEDIATE',
  imageUrl: null,
  githubUrl: 'https://github.com/owner/repo',
  liveUrl: 'https://live.demo',
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  members: [],
  _count: { members: 1 },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProjectCard - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders project title and description', () => {
    render(
      <ProjectCard 
        project={mockProject as any} 
        joinRequestStatus="none"
        onJoinRequest={vi.fn()}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project description')).toBeInTheDocument();
  });

  it('renders tech stack tags', () => {
    render(
      <ProjectCard 
        project={mockProject as any} 
        joinRequestStatus="none"
        onJoinRequest={vi.fn()}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
  });
});

describe('ProjectCard - Edit Button Visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows Edit button when user is the owner and onEdit is provided', () => {
    const onEdit = vi.fn();
    render(
      <ProjectCard 
        project={mockProject as any} 
        currentUserId="user-1" // The owner
        onEdit={onEdit}
        joinRequestStatus="none"
        onJoinRequest={vi.fn()}
        onClick={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: new RegExp(`edit ${mockProject.title}`, 'i') });
    expect(editButton).toBeInTheDocument();
  });

  it('hides Edit button when user is NOT the owner', () => {
    const onEdit = vi.fn();
    render(
      <ProjectCard 
        project={mockProject as any} 
        currentUserId="user-2" // Not the owner
        onEdit={onEdit}
        joinRequestStatus="none"
        onJoinRequest={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: new RegExp(`edit ${mockProject.title}`, 'i') })).not.toBeInTheDocument();
  });

  it('hides Edit button when onEdit is not provided even if owner', () => {
    render(
      <ProjectCard 
        project={mockProject as any} 
        currentUserId="user-1" 
        joinRequestStatus="none"
        onJoinRequest={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: new RegExp(`edit ${mockProject.title}`, 'i') })).not.toBeInTheDocument();
  });
});

describe('ProjectCard - Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onEdit with project when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <ProjectCard 
        project={mockProject as any} 
        currentUserId="user-1" 
        onEdit={onEdit}
        joinRequestStatus="none"
        onJoinRequest={vi.fn()}
        onClick={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: new RegExp(`edit ${mockProject.title}`, 'i') });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockProject.id);
  });

  it('opens GitHub link in new tab when GitHub icon is clicked', async () => {
    const user = userEvent.setup();
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <ProjectCard 
        project={mockProject as any} 
        joinRequestStatus="none"
        onJoinRequest={vi.fn()}
        onClick={vi.fn()}
      />
    );
    
    const githubButton = screen.getByRole('button', { name: /github/i });
    await user.click(githubButton);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://github.com/owner/repo',
      '_blank',
      'noopener,noreferrer'
    );

    windowOpenSpy.mockRestore();
  });
});
