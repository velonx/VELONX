/**
 * Unit tests for signup page referral code functionality
 * Tests Requirements 3.1, 3.2, 3.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock API client
vi.mock('@/lib/api/client', () => ({
  authApi: {
    signup: vi.fn(),
  },
}));

// Mock SplineScene component
vi.mock('@/components/SplineScene', () => ({
  default: () => <div data-testid="spline-scene">Spline Scene</div>,
}));

describe('Signup Page - Referral Code Functionality', () => {
  const mockPush = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useSearchParams as any).mockReturnValue({ get: mockGet });
    
    // Mock fetch for referral validation
    global.fetch = vi.fn();
  });

  it('should extract and pre-fill referral code from URL query parameter', async () => {
    // Requirement 3.1, 3.2: Extract ref parameter and pre-fill field
    mockGet.mockReturnValue('ABC12345');
    
    // Mock successful validation
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { valid: true, referrerId: 'user123' },
      }),
    });

    const SignupPage = (await import('@/app/auth/signup/page')).default;
    render(<SignupPage />);

    // Wait for the referral code to be pre-filled
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Enter referral code') as HTMLInputElement;
      expect(input.value).toBe('ABC12345');
    });

    // Verify validation was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/referral/validate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: 'ABC12345' }),
        })
      );
    });
  });

  it('should display error message for invalid referral code', async () => {
    // Requirement 3.3: Display error for invalid code
    mockGet.mockReturnValue(null);
    
    const SignupPage = (await import('@/app/auth/signup/page')).default;
    const { container } = render(<SignupPage />);

    const referralInput = screen.getByPlaceholderText('Enter referral code');

    // Mock invalid validation response
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { valid: false },
      }),
    });

    // Type invalid code
    fireEvent.change(referralInput, { target: { value: 'INVALID' } });
    fireEvent.blur(referralInput);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid referral code/i)).toBeInTheDocument();
    });
  });

  it('should allow registration to proceed without referral code', async () => {
    // Requirement 3.3: Allow registration without referral
    mockGet.mockReturnValue(null);
    
    const SignupPage = (await import('@/app/auth/signup/page')).default;
    render(<SignupPage />);

    // Verify referral code field is optional
    const referralInput = screen.getByPlaceholderText('Enter referral code');
    expect(referralInput).not.toBeRequired();

    // Verify label shows (Optional)
    expect(screen.getByText(/Optional/i)).toBeInTheDocument();
  });

  it('should show validation spinner while checking referral code', async () => {
    // Test loading state during validation
    mockGet.mockReturnValue(null);
    
    const SignupPage = (await import('@/app/auth/signup/page')).default;
    render(<SignupPage />);

    const referralInput = screen.getByPlaceholderText('Enter referral code');

    // Mock slow validation
    (global.fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ success: true, data: { valid: true } }),
      }), 100))
    );

    fireEvent.change(referralInput, { target: { value: 'TEST123' } });
    fireEvent.blur(referralInput);

    // Should show spinner
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('should show success indicator for valid referral code', async () => {
    // Test success state
    mockGet.mockReturnValue(null);
    
    const SignupPage = (await import('@/app/auth/signup/page')).default;
    render(<SignupPage />);

    const referralInput = screen.getByPlaceholderText('Enter referral code');

    // Mock valid validation
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { valid: true, referrerId: 'user123' },
      }),
    });

    fireEvent.change(referralInput, { target: { value: 'VALID123' } });
    fireEvent.blur(referralInput);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Valid referral code/i)).toBeInTheDocument();
    });
  });

  it('should clear error when user starts typing after validation error', async () => {
    // Test error clearing behavior
    mockGet.mockReturnValue(null);
    
    const SignupPage = (await import('@/app/auth/signup/page')).default;
    render(<SignupPage />);

    const referralInput = screen.getByPlaceholderText('Enter referral code');

    // Mock invalid validation
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { valid: false },
      }),
    });

    fireEvent.change(referralInput, { target: { value: 'INVALID' } });
    fireEvent.blur(referralInput);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/Invalid referral code/i)).toBeInTheDocument();
    });

    // Start typing again
    fireEvent.change(referralInput, { target: { value: 'INVALID2' } });

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/Invalid referral code/i)).not.toBeInTheDocument();
    });
  });
});
