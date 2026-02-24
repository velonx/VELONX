import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { mentorService } from '@/lib/services/mentor.service';

describe('Mentor Social URLs API', () => {
  let testMentorId: string;

  afterEach(async () => {
    // Clean up test data
    if (testMentorId) {
      await prisma.mentor.delete({ where: { id: testMentorId } }).catch(() => {});
    }
  });

  describe('Create Mentor with Social URLs', () => {
    it('should create a mentor with GitHub and Twitter URLs', async () => {
      const mentorData = {
        name: 'Test Mentor',
        email: `test-${Date.now()}@example.com`,
        expertise: ['React', 'Node.js'],
        company: 'Test Company',
        bio: 'Test bio for mentor',
        githubUrl: 'https://github.com/testuser',
        twitterUrl: 'https://twitter.com/testuser',
        linkedinUrl: 'https://linkedin.com/in/testuser',
      };

      const mentor = await mentorService.createMentor(mentorData);
      testMentorId = mentor.id;

      expect(mentor.githubUrl).toBe(mentorData.githubUrl);
      expect(mentor.twitterUrl).toBe(mentorData.twitterUrl);
      expect(mentor.linkedinUrl).toBe(mentorData.linkedinUrl);
    });

    it('should create a mentor with null social URLs', async () => {
      const mentorData = {
        name: 'Test Mentor No Socials',
        email: `test-no-socials-${Date.now()}@example.com`,
        expertise: ['Python'],
        company: 'Test Company',
        bio: 'Test bio for mentor without social profiles',
        githubUrl: null,
        twitterUrl: null,
        linkedinUrl: null,
      };

      const mentor = await mentorService.createMentor(mentorData);
      testMentorId = mentor.id;

      expect(mentor.githubUrl).toBeNull();
      expect(mentor.twitterUrl).toBeNull();
      expect(mentor.linkedinUrl).toBeNull();
    });

    it('should create a mentor with only some social URLs', async () => {
      const mentorData = {
        name: 'Test Mentor Partial',
        email: `test-partial-${Date.now()}@example.com`,
        expertise: ['JavaScript'],
        company: 'Test Company',
        bio: 'Test bio for mentor with partial social profiles',
        githubUrl: 'https://github.com/partialuser',
        twitterUrl: null,
        linkedinUrl: null,
      };

      const mentor = await mentorService.createMentor(mentorData);
      testMentorId = mentor.id;

      expect(mentor.githubUrl).toBe(mentorData.githubUrl);
      expect(mentor.twitterUrl).toBeNull();
      expect(mentor.linkedinUrl).toBeNull();
    });
  });

  describe('Update Mentor Social URLs', () => {
    beforeEach(async () => {
      // Create a test mentor
      const mentor = await mentorService.createMentor({
        name: 'Update Test Mentor',
        email: `update-test-${Date.now()}@example.com`,
        expertise: ['TypeScript'],
        company: 'Test Company',
        bio: 'Test bio for update tests',
      });
      testMentorId = mentor.id;
    });

    it('should update mentor with social URLs', async () => {
      const updateData = {
        githubUrl: 'https://github.com/updateduser',
        twitterUrl: 'https://x.com/updateduser',
        linkedinUrl: 'https://linkedin.com/in/updateduser',
      };

      const updated = await mentorService.updateMentor(testMentorId, updateData);

      expect(updated.githubUrl).toBe(updateData.githubUrl);
      expect(updated.twitterUrl).toBe(updateData.twitterUrl);
      expect(updated.linkedinUrl).toBe(updateData.linkedinUrl);
    });

    it('should clear social URLs by setting to null', async () => {
      // First add social URLs
      await mentorService.updateMentor(testMentorId, {
        githubUrl: 'https://github.com/tempuser',
        twitterUrl: 'https://twitter.com/tempuser',
      });

      // Then clear them
      const updated = await mentorService.updateMentor(testMentorId, {
        githubUrl: null,
        twitterUrl: null,
      });

      expect(updated.githubUrl).toBeNull();
      expect(updated.twitterUrl).toBeNull();
    });

    it('should update only specified social URLs', async () => {
      // Set initial values
      await mentorService.updateMentor(testMentorId, {
        githubUrl: 'https://github.com/initial',
        twitterUrl: 'https://twitter.com/initial',
      });

      // Update only GitHub
      const updated = await mentorService.updateMentor(testMentorId, {
        githubUrl: 'https://github.com/updated',
      });

      expect(updated.githubUrl).toBe('https://github.com/updated');
      expect(updated.twitterUrl).toBe('https://twitter.com/initial');
    });
  });

  describe('Retrieve Mentor with Social URLs', () => {
    beforeEach(async () => {
      // Create a test mentor with social URLs
      const mentor = await mentorService.createMentor({
        name: 'Retrieve Test Mentor',
        email: `retrieve-test-${Date.now()}@example.com`,
        expertise: ['Go', 'Rust'],
        company: 'Test Company',
        bio: 'Test bio for retrieve tests',
        githubUrl: 'https://github.com/retrieveuser',
        twitterUrl: 'https://twitter.com/retrieveuser',
        linkedinUrl: 'https://linkedin.com/in/retrieveuser',
      });
      testMentorId = mentor.id;
    });

    it('should retrieve mentor with all social URLs', async () => {
      const mentor = await mentorService.getMentorById(testMentorId);

      expect(mentor.githubUrl).toBe('https://github.com/retrieveuser');
      expect(mentor.twitterUrl).toBe('https://twitter.com/retrieveuser');
      expect(mentor.linkedinUrl).toBe('https://linkedin.com/in/retrieveuser');
    });

    it('should include social URLs in list mentors', async () => {
      const result = await mentorService.listMentors({ page: 1, pageSize: 10 });
      
      const mentor = result.mentors.find(m => m.id === testMentorId);
      expect(mentor).toBeDefined();
      expect(mentor?.githubUrl).toBe('https://github.com/retrieveuser');
      expect(mentor?.twitterUrl).toBe('https://twitter.com/retrieveuser');
      expect(mentor?.linkedinUrl).toBe('https://linkedin.com/in/retrieveuser');
    });
  });
});
