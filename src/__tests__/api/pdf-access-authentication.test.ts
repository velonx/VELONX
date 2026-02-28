/**
 * PDF Access Authentication Tests
 * Feature: resource-pdf-upload
 * 
 * Tests authentication requirements for PDF access through the proxy route.
 * 
 * Requirements:
 * - 6.4: Verify request is from authenticated user before serving PDF
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/resources/pdf/[publicId]/route';
import { NextRequest } from 'next/server';

// Mock the auth module
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock the PDF upload service
vi.mock('@/lib/services/pdf-upload.service', () => ({
  generateSignedPDFUrl: vi.fn((publicId: string) => `https://cloudinary.com/signed/${publicId}`),
}));

// Mock error handler
vi.mock('@/lib/utils/errors', () => ({
  handleError: vi.fn((error) => {
    return new Response(JSON.stringify({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR',
      },
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
}));

describe('PDF Access Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Requirements', () => {
    it('should reject unauthenticated requests', async () => {
      // Mock no session (unauthenticated)
      const { auth } = await import('@/auth');
      (auth as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/resources/pdf/test-pdf-id');
      const params = { publicId: 'test-pdf-id' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toContain('Authentication required');
    });

    it('should reject requests with session but no user', async () => {
      // Mock session without user
      const { auth } = await import('@/auth');
      (auth as any).mockResolvedValue({ user: null });

      const request = new NextRequest('http://localhost:3000/api/resources/pdf/test-pdf-id');
      const params = { publicId: 'test-pdf-id' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should allow authenticated requests', async () => {
      // Mock authenticated session
      const { auth } = await import('@/auth');
      (auth as any).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/resources/pdf/test-pdf-id');
      const params = { publicId: 'test-pdf-id' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.url).toBeDefined();
      expect(data.data.expiresIn).toBe(3600);
    });
  });

  describe('Request Validation', () => {
    beforeEach(async () => {
      // Mock authenticated session for these tests
      const { auth } = await import('@/auth');
      (auth as any).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });
    });

    it('should reject requests without publicId', async () => {
      const request = new NextRequest('http://localhost:3000/api/resources/pdf/');
      const params = { publicId: '' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
      expect(data.error.message).toContain('public ID is required');
    });

    it('should handle URL-encoded publicId', async () => {
      const encodedPublicId = encodeURIComponent('velonx/resources/pdfs/test-file');
      const request = new NextRequest(`http://localhost:3000/api/resources/pdf/${encodedPublicId}`);
      const params = { publicId: encodedPublicId };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.url).toContain('velonx/resources/pdfs/test-file');
    });
  });

  describe('Signed URL Generation', () => {
    beforeEach(async () => {
      // Mock authenticated session
      const { auth } = await import('@/auth');
      (auth as any).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });
    });

    it('should return signed URL with expiration', async () => {
      const request = new NextRequest('http://localhost:3000/api/resources/pdf/test-pdf-id');
      const params = { publicId: 'test-pdf-id' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.url).toBeDefined();
      expect(data.data.url).toContain('signed');
      expect(data.data.expiresIn).toBe(3600);
    });

    it('should call generateSignedPDFUrl with correct parameters', async () => {
      const { generateSignedPDFUrl } = await import('@/lib/services/pdf-upload.service');
      
      const request = new NextRequest('http://localhost:3000/api/resources/pdf/my-pdf-file');
      const params = { publicId: 'my-pdf-file' };

      await GET(request, { params });

      expect(generateSignedPDFUrl).toHaveBeenCalledWith('my-pdf-file', 3600);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      // Mock authenticated session
      const { auth } = await import('@/auth');
      (auth as any).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      });
    });

    it('should handle errors from signed URL generation', async () => {
      const { generateSignedPDFUrl } = await import('@/lib/services/pdf-upload.service');
      vi.mocked(generateSignedPDFUrl).mockImplementation(() => {
        throw new Error('Cloudinary error');
      });

      const request = new NextRequest('http://localhost:3000/api/resources/pdf/test-pdf-id');
      const params = { publicId: 'test-pdf-id' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
