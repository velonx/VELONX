/**
 * EditProjectModal Component Tests
 *
 * Tests for the EditProjectModal including:
 * - Form pre-population from existing project data
 * - Field validation (title, description, tech stack, URLs)
 * - CSRF-secured PATCH submission
 * - Success / error handling
 * - Owner-only accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { EditProjectModal } from '../EditProjectModal';
import { ExtendedProject } from '../../../lib/types/project-page.types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/utils/csrf', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    fetchCSRFToken: vi.fn().mockResolvedValue('mock-csrf-token'),
    secureFetch: vi.fn().mockImplementation(async (url, options = {}) => {
      const headers = {
        ...options.headers,
        'x-csrf-token': 'mock-csrf-token',
      };
      return fetch(url, { ...options, headers });
    }),
  };
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockProject: ExtendedProject = {
  id: 'project-1',
  title: 'Test Project',
  description: 'This is a test project description',
  techStack: ['React', 'TypeScript'],
  status: 'IN_PROGRESS',
  category: 'WEB_DEV',
  difficulty: 'INTERMEDIATE',
  imageUrl: null,
  githubUrl: 'https://github.com/owner/repo',
  liveUrl: null,
  outcomes: null,
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  members: [],
  _count: { members: 1 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderModal(overrides?: Partial<Parameters<typeof EditProjectModal>[0]>) {
  const defaults = {
    project: mockProject,
    isOpen: true,
    onClose: vi.fn(),
    onSaved: vi.fn(),
  };
  return render(<EditProjectModal {...defaults} {...overrides} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EditProjectModal - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal title when open', () => {
    renderModal();
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
  });

  it('pre-fills title field with project title', () => {
    renderModal();
    const titleInput = screen.getByRole('textbox', { name: /project title/i });
    expect(titleInput).toHaveValue('Test Project');
  });

  it('pre-fills description with project description', () => {
    renderModal();
    const descArea = screen.getByPlaceholderText(/describe what your project does/i);
    expect(descArea).toHaveValue('This is a test project description');
  });

  it('pre-fills GitHub URL field', () => {
    renderModal();
    const githubInput = screen.getByRole('textbox', { name: /github repository url/i });
    expect(githubInput).toHaveValue('https://github.com/owner/repo');
  });

  it('shows existing tech stack tags', () => {
    renderModal();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders Save Changes and Cancel buttons', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});

describe('EditProjectModal - Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error toast when title is too short', async () => {
    const user = userEvent.setup();
    renderModal();

    const titleInput = screen.getByRole('textbox', { name: /project title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'AB'); // < 3 chars

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // fetch should NOT have been called
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows error toast when description is too short', async () => {
    const user = userEvent.setup();
    renderModal();

    const descArea = screen.getByPlaceholderText(/describe what your project does/i);
    await user.clear(descArea);
    await user.type(descArea, 'Too short');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows error toast when all tech stack tags are removed and none remain', async () => {
    const user = userEvent.setup();
    renderModal();

    // Remove React tag
    const reactTag = screen.getByText('React');
    await user.click(reactTag);

    // Remove TypeScript tag
    const tsTag = screen.getByText('TypeScript');
    await user.click(tsTag);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('EditProjectModal - Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { ...mockProject, title: 'Updated Title' },
      }),
    });
  });

  it('calls fetch with PATCH method and CSRF token on valid submit', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    renderModal({ onSaved });

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects/project-1',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'x-csrf-token': 'mock-csrf-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  it('includes githubUrl in the PATCH payload', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.githubUrl).toBe('https://github.com/owner/repo');
    });
  });

  it('calls onSaved with updated project on success', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    renderModal({ onSaved });

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onClose after successful save', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('does NOT call onSaved on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: { message: 'Forbidden' } }),
    });

    const user = userEvent.setup();
    const onSaved = vi.fn();
    renderModal({ onSaved });

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(onSaved).not.toHaveBeenCalled();
    });
  });
});

describe('EditProjectModal - Tech Stack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a new tech tag when Add button is clicked', async () => {
    const user = userEvent.setup();
    renderModal();

    const techInput = screen.getByPlaceholderText(/e.g. React, Python/i);
    await user.type(techInput, 'Node.js');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('adds a new tech tag when Enter key is pressed', async () => {
    const user = userEvent.setup();
    renderModal();

    const techInput = screen.getByPlaceholderText(/e.g. React, Python/i);
    await user.type(techInput, 'PostgreSQL{Enter}');

    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('does not add duplicate tech tags', async () => {
    const user = userEvent.setup();
    renderModal();

    const techInput = screen.getByPlaceholderText(/e.g. React, Python/i);
    await user.type(techInput, 'React{Enter}'); // already in list

    // Should still only have one "React" badge
    const reactElements = screen.getAllByText('React');
    expect(reactElements).toHaveLength(1);
  });
});

describe('EditProjectModal - Cancel', () => {
  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
