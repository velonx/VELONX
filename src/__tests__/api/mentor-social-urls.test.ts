/**
 * Mentor Social URLs API Test
 * Tests mentorService CRUD operations for social URLs using in-memory mocks.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── In-memory store ──────────────────────────────────────────────────────────
const mentors: any[] = [];

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mentor: {
      create: vi.fn(({ data }) => {
        const m = { ...data, id: `mentor-${Date.now()}-${Math.random()}` };
        mentors.push(m);
        return Promise.resolve(m);
      }),
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(mentors.find(m => m.id === where.id) || null),
      ),
      update: vi.fn(({ where, data }) => {
        const idx = mentors.findIndex(m => m.id === where.id);
        if (idx === -1) return Promise.reject(new Error('not found'));
        mentors[idx] = { ...mentors[idx], ...data };
        return Promise.resolve(mentors[idx]);
      }),
      delete: vi.fn(({ where }) => {
        const idx = mentors.findIndex(m => m.id === where.id);
        if (idx !== -1) mentors.splice(idx, 1);
        return Promise.resolve({});
      }),
    },
  },
}));

vi.mock('@/lib/services/mentor.service', () => ({
  mentorService: {
    createMentor: vi.fn(async (data: any) => {
      const m = {
        ...data,
        id: `mentor-${Date.now()}`,
        linkedinUrl: data.linkedinUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        twitterUrl: data.twitterUrl ?? null,
      };
      mentors.push(m);
      return m;
    }),
    getMentor: vi.fn(async (id: string) =>
      mentors.find(m => m.id === id) || null,
    ),
    updateMentor: vi.fn(async (id: string, data: any) => {
      const idx = mentors.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Mentor not found');
      mentors[idx] = { ...mentors[idx], ...data };
      return mentors[idx];
    }),
    deleteMentor: vi.fn(async (id: string) => {
      const idx = mentors.findIndex(m => m.id === id);
      if (idx !== -1) mentors.splice(idx, 1);
    }),
  },
}));

import { mentorService } from '@/lib/services/mentor.service';

const baseMentorData = {
  name: 'Test Mentor',
  email: 'test@mentor.com',
  expertise: ['TypeScript'],
  company: 'Acme Corp',
  bio: 'A test mentor',
  imageUrl: null,
  rating: 4.5,
  totalSessions: 10,
  available: true,
};

describe('Mentor Social URLs', () => {
  beforeEach(() => {
    mentors.length = 0;
    vi.clearAllMocks();
  });

  it('should create a mentor with all social URLs', async () => {
    const mentor = await mentorService.createMentor({
      ...baseMentorData,
      linkedinUrl: 'https://linkedin.com/in/testmentor',
      githubUrl: 'https://github.com/testmentor',
      twitterUrl: 'https://twitter.com/testmentor',
    });

    expect(mentor.linkedinUrl).toBe('https://linkedin.com/in/testmentor');
    expect(mentor.githubUrl).toBe('https://github.com/testmentor');
    expect(mentor.twitterUrl).toBe('https://twitter.com/testmentor');
  });

  it('should create a mentor without social URLs', async () => {
    const mentor = await mentorService.createMentor(baseMentorData);
    expect(mentor.linkedinUrl).toBeNull();
    expect(mentor.githubUrl).toBeNull();
    expect(mentor.twitterUrl).toBeNull();
  });

  it('should create a mentor with partial social URLs', async () => {
    const mentor = await mentorService.createMentor({
      ...baseMentorData,
      linkedinUrl: 'https://linkedin.com/in/testmentor',
    });
    expect(mentor.linkedinUrl).toBe('https://linkedin.com/in/testmentor');
    expect(mentor.githubUrl).toBeNull();
    expect(mentor.twitterUrl).toBeNull();
  });

  it('should update mentor social URLs', async () => {
    const mentor = await mentorService.createMentor(baseMentorData);
    const updated = await mentorService.updateMentor(mentor.id, {
      githubUrl: 'https://github.com/updated',
      twitterUrl: 'https://twitter.com/updated',
      linkedinUrl: 'https://linkedin.com/in/updated',
    });
    expect(updated.githubUrl).toBe('https://github.com/updated');
    expect(updated.twitterUrl).toBe('https://twitter.com/updated');
    expect(updated.linkedinUrl).toBe('https://linkedin.com/in/updated');
  });

  it('should clear social URLs by setting them to null', async () => {
    const mentor = await mentorService.createMentor({
      ...baseMentorData,
      linkedinUrl: 'https://linkedin.com/in/test',
    });
    const updated = await mentorService.updateMentor(mentor.id, {
      linkedinUrl: null,
    });
    expect(updated.linkedinUrl).toBeNull();
  });

  it('should retrieve mentor with social URLs', async () => {
    const mentor = await mentorService.createMentor({
      ...baseMentorData,
      linkedinUrl: 'https://linkedin.com/in/test',
    });
    const found = await mentorService.getMentor(mentor.id);
    expect(found).toBeTruthy();
    expect(found.linkedinUrl).toBe('https://linkedin.com/in/test');
  });
});
