import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEventRegistration } from '../useEventRegistration';
import { eventsApi, ApiClientError } from '@/lib/api/client';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('@/lib/api/client', () => ({
  eventsApi: {
    register: vi.fn(),
    unregister: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(
      public statusCode: number,
      public code: string,
      message: string,
      public details?: Record<string, any>
    ) {
      super(message);
      this.name = 'ApiClientError';
    }
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useEventRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should successfully register for an event', async () => {
      // Arrange
      const mockResponse = { success: true, data: { message: 'Registered successfully' } };
      vi.mocked(eventsApi.register).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useEventRegistration());

      // Act
      await act(async () => {
        await result.current.register('event-123', 'Web Development Workshop');
      });

      // Assert
      expect(eventsApi.register).toHaveBeenCalledWith('event-123');
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully registered for "Web Development Workshop"! Check your email for details.'
      );
      expect(result.current.isRegistering).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should register without event title', async () => {
      // Arrange
      const mockResponse = { success: true, data: { message: 'Registered successfully' } };
      vi.mocked(eventsApi.register).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useEventRegistration());

      // Act
      await act(async () => {
        await result.current.register('event-123');
      });

      // Assert
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully registered for "the event"! Check your email for details.'
      );
    });

    it('should set isRegistering to true during registration', async () => {
      // Arrange
      let resolveRegister: any;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      vi.mocked(eventsApi.register).mockReturnValue(registerPromise as any);

      const { result } = renderHook(() => useEventRegistration());

      // Act
      act(() => {
        result.current.register('event-123');
      });

      // Assert - should be loading
      expect(result.current.isRegistering).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolveRegister({ success: true, data: { message: 'Success' } });
        await registerPromise;
      });

      // Assert - should no longer be loading
      expect(result.current.isRegistering).toBe(false);
    });

    it('should handle already registered error (409)', async () => {
      // Arrange
      const error = new ApiClientError(409, 'ALREADY_REGISTERED', 'User already registered');
      vi.mocked(eventsApi.register).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.register('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith('You are already registered for this event');
      expect(result.current.error).toEqual(error);
      expect(result.current.isRegistering).toBe(false);
    });

    it('should handle event full error (400)', async () => {
      // Arrange
      const error = new ApiClientError(400, 'EVENT_FULL', 'Event is full');
      vi.mocked(eventsApi.register).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.register('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'This event is full. Registration is no longer available.'
      );
    });

    it('should handle event not found error (404)', async () => {
      // Arrange
      const error = new ApiClientError(404, 'NOT_FOUND', 'Event not found');
      vi.mocked(eventsApi.register).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.register('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith('Event not found');
    });

    it('should handle unauthorized error (401)', async () => {
      // Arrange
      const error = new ApiClientError(401, 'UNAUTHORIZED', 'Not authenticated');
      vi.mocked(eventsApi.register).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.register('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith('Please log in to register for events');
    });

    it('should handle generic API error', async () => {
      // Arrange
      const error = new ApiClientError(500, 'SERVER_ERROR', 'Internal server error');
      vi.mocked(eventsApi.register).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.register('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith('Internal server error');
    });

    it('should handle non-API errors', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(eventsApi.register).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.register('event-123')).rejects.toThrow();
      });

      expect(result.current.error).toBeInstanceOf(ApiClientError);
      expect(result.current.error?.message).toBe('An error occurred during registration');
    });

    it('should clear previous errors on new registration', async () => {
      // Arrange
      const error = new ApiClientError(500, 'ERROR', 'First error');
      vi.mocked(eventsApi.register).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useEventRegistration());

      // First registration fails
      await act(async () => {
        await expect(result.current.register('event-123')).rejects.toThrow();
      });

      expect(result.current.error).toEqual(error);

      // Second registration succeeds
      const mockResponse = { success: true, data: { message: 'Success' } };
      vi.mocked(eventsApi.register).mockResolvedValue(mockResponse as any);

      await act(async () => {
        await result.current.register('event-456');
      });

      // Assert error is cleared
      expect(result.current.error).toBe(null);
    });
  });

  describe('unregister', () => {
    it('should successfully unregister from an event', async () => {
      // Arrange
      const mockResponse = { success: true, data: { message: 'Unregistered successfully' } };
      vi.mocked(eventsApi.unregister).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useEventRegistration());

      // Act
      await act(async () => {
        await result.current.unregister('event-123', 'Web Development Workshop');
      });

      // Assert
      expect(eventsApi.unregister).toHaveBeenCalledWith('event-123');
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully unregistered from "Web Development Workshop"'
      );
      expect(result.current.isRegistering).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should unregister without event title', async () => {
      // Arrange
      const mockResponse = { success: true, data: { message: 'Unregistered successfully' } };
      vi.mocked(eventsApi.unregister).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useEventRegistration());

      // Act
      await act(async () => {
        await result.current.unregister('event-123');
      });

      // Assert
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully unregistered from "the event"'
      );
    });

    it('should set isRegistering to true during unregistration', async () => {
      // Arrange
      let resolveUnregister: any;
      const unregisterPromise = new Promise((resolve) => {
        resolveUnregister = resolve;
      });
      vi.mocked(eventsApi.unregister).mockReturnValue(unregisterPromise as any);

      const { result } = renderHook(() => useEventRegistration());

      // Act
      act(() => {
        result.current.unregister('event-123');
      });

      // Assert - should be loading
      expect(result.current.isRegistering).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolveUnregister({ success: true, data: { message: 'Success' } });
        await unregisterPromise;
      });

      // Assert - should no longer be loading
      expect(result.current.isRegistering).toBe(false);
    });

    it('should handle not found error (404)', async () => {
      // Arrange
      const error = new ApiClientError(404, 'NOT_FOUND', 'Event not found');
      vi.mocked(eventsApi.unregister).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.unregister('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith('Event not found or you are not registered');
    });

    it('should handle unauthorized error (401)', async () => {
      // Arrange
      const error = new ApiClientError(401, 'UNAUTHORIZED', 'Not authenticated');
      vi.mocked(eventsApi.unregister).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.unregister('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith('Please log in to manage your registrations');
    });

    it('should handle generic API error', async () => {
      // Arrange
      const error = new ApiClientError(500, 'SERVER_ERROR', 'Internal server error');
      vi.mocked(eventsApi.unregister).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.unregister('event-123')).rejects.toThrow();
      });

      expect(toast.error).toHaveBeenCalledWith('Internal server error');
    });

    it('should handle non-API errors', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(eventsApi.unregister).mockRejectedValue(error);

      const { result } = renderHook(() => useEventRegistration());

      // Act & Assert
      await act(async () => {
        await expect(result.current.unregister('event-123')).rejects.toThrow();
      });

      expect(result.current.error).toBeInstanceOf(ApiClientError);
      expect(result.current.error?.message).toBe('An error occurred during unregistration');
    });

    it('should clear previous errors on new unregistration', async () => {
      // Arrange
      const error = new ApiClientError(500, 'ERROR', 'First error');
      vi.mocked(eventsApi.unregister).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useEventRegistration());

      // First unregistration fails
      await act(async () => {
        await expect(result.current.unregister('event-123')).rejects.toThrow();
      });

      expect(result.current.error).toEqual(error);

      // Second unregistration succeeds
      const mockResponse = { success: true, data: { message: 'Success' } };
      vi.mocked(eventsApi.unregister).mockResolvedValue(mockResponse as any);

      await act(async () => {
        await result.current.unregister('event-456');
      });

      // Assert error is cleared
      expect(result.current.error).toBe(null);
    });
  });

  describe('state management', () => {
    it('should maintain separate state for multiple hook instances', async () => {
      // Arrange
      const mockResponse = { success: true, data: { message: 'Success' } };
      vi.mocked(eventsApi.register).mockResolvedValue(mockResponse as any);

      const { result: result1 } = renderHook(() => useEventRegistration());
      const { result: result2 } = renderHook(() => useEventRegistration());

      // Act - trigger registration on first instance
      await act(async () => {
        await result1.current.register('event-123');
      });

      // Assert - second instance should not be affected
      expect(result1.current.isRegistering).toBe(false);
      expect(result2.current.isRegistering).toBe(false);
      expect(result1.current.error).toBe(null);
      expect(result2.current.error).toBe(null);
    });

    it('should handle concurrent register and unregister calls', async () => {
      // Arrange
      const registerResponse = { success: true, data: { message: 'Registered' } };
      const unregisterResponse = { success: true, data: { message: 'Unregistered' } };
      
      vi.mocked(eventsApi.register).mockResolvedValue(registerResponse as any);
      vi.mocked(eventsApi.unregister).mockResolvedValue(unregisterResponse as any);

      const { result } = renderHook(() => useEventRegistration());

      // Act - call both methods
      await act(async () => {
        await Promise.all([
          result.current.register('event-123'),
          result.current.unregister('event-456'),
        ]);
      });

      // Assert - both should complete successfully
      expect(eventsApi.register).toHaveBeenCalledWith('event-123');
      expect(eventsApi.unregister).toHaveBeenCalledWith('event-456');
      expect(result.current.isRegistering).toBe(false);
    });
  });
});
