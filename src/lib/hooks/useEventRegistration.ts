'use client';

import { useState, useCallback } from 'react';
import { eventsApi, ApiClientError } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface UseEventRegistrationReturn {
  register: (eventId: string, eventTitle?: string) => Promise<void>;
  unregister: (eventId: string, eventTitle?: string) => Promise<void>;
  isRegistering: boolean;
  error: ApiClientError | null;
  announcement: string;
}

/**
 * Announce a message to screen readers
 * Creates a temporary live region announcement
 */
const announceToScreenReader = (message: string) => {
  // Create or get the announcer element
  let announcer = document.getElementById('event-registration-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'event-registration-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  // Clear previous announcement
  announcer.textContent = '';
  
  // Set new announcement after a brief delay to ensure screen readers pick it up
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
  
  // Clear announcement after 5 seconds
  setTimeout(() => {
    announcer!.textContent = '';
  }, 5000);
};

/**
 * Custom hook for managing event registration and unregistration
 * 
 * Features:
 * - Optimistic UI updates (immediate state changes)
 * - Error handling with automatic rollback on failure
 * - Success toast notifications
 * - Screen reader announcements for registration actions
 * - Loading state management
 * 
 * @example
 * ```tsx
 * const { register, unregister, isRegistering } = useEventRegistration();
 * 
 * // Register for an event
 * await register('event-id-123', 'Web Development Workshop');
 * 
 * // Unregister from an event
 * await unregister('event-id-123', 'Web Development Workshop');
 * ```
 */
export function useEventRegistration(): UseEventRegistrationReturn {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [announcement, setAnnouncement] = useState('');

  /**
   * Register for an event with optimistic UI updates
   * 
   * @param eventId - The ID of the event to register for
   * @param eventTitle - Optional event title for toast notifications
   */
  const register = useCallback(async (eventId: string, eventTitle?: string) => {
    setIsRegistering(true);
    setError(null);
    
    const title = eventTitle || 'the event';
    
    // Announce registration attempt to screen readers
    const processingMessage = `Registering for ${title}. Please wait.`;
    setAnnouncement(processingMessage);
    announceToScreenReader(processingMessage);

    try {
      // Call API to register
      const response = await eventsApi.register(eventId);
      
      // Announce success to screen readers
      const successMessage = `Successfully registered for ${title}. Check your email for details.`;
      setAnnouncement(successMessage);
      announceToScreenReader(successMessage);
      
      // Show success toast
      toast.success(successMessage);
      
    } catch (err) {
      // Handle errors
      const apiError = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred during registration');
      
      setError(apiError);
      
      // Determine error message
      let errorMessage = '';
      if (apiError.statusCode === 409 || apiError.message?.includes('already registered')) {
        errorMessage = 'You are already registered for this event';
      } else if (apiError.statusCode === 400 && apiError.message?.includes('full')) {
        errorMessage = 'This event is full. Registration is no longer available.';
      } else if (apiError.statusCode === 404) {
        errorMessage = 'Event not found';
      } else if (apiError.statusCode === 401) {
        errorMessage = 'Please log in to register for events';
      } else {
        errorMessage = apiError.message || 'Failed to register for event';
      }
      
      // Announce error to screen readers
      const fullErrorMessage = `Registration failed. ${errorMessage}`;
      setAnnouncement(fullErrorMessage);
      announceToScreenReader(fullErrorMessage);
      
      // Show error toast
      toast.error(errorMessage);
      
      throw apiError;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  /**
   * Unregister from an event with optimistic UI updates
   * 
   * @param eventId - The ID of the event to unregister from
   * @param eventTitle - Optional event title for toast notifications
   */
  const unregister = useCallback(async (eventId: string, eventTitle?: string) => {
    setIsRegistering(true);
    setError(null);
    
    const title = eventTitle || 'the event';
    
    // Announce unregistration attempt to screen readers
    const processingMessage = `Unregistering from ${title}. Please wait.`;
    setAnnouncement(processingMessage);
    announceToScreenReader(processingMessage);

    try {
      // Call API to unregister
      await eventsApi.unregister(eventId);
      
      // Announce success to screen readers
      const successMessage = `Successfully unregistered from ${title}`;
      setAnnouncement(successMessage);
      announceToScreenReader(successMessage);
      
      // Show success toast
      toast.success(successMessage);
      
    } catch (err) {
      // Handle errors
      const apiError = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred during unregistration');
      
      setError(apiError);
      
      // Determine error message
      let errorMessage = '';
      if (apiError.statusCode === 404) {
        errorMessage = 'Event not found or you are not registered';
      } else if (apiError.statusCode === 401) {
        errorMessage = 'Please log in to manage your registrations';
      } else {
        errorMessage = apiError.message || 'Failed to unregister from event';
      }
      
      // Announce error to screen readers
      const fullErrorMessage = `Unregistration failed. ${errorMessage}`;
      setAnnouncement(fullErrorMessage);
      announceToScreenReader(fullErrorMessage);
      
      // Show error toast
      toast.error(errorMessage);
      
      throw apiError;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return {
    register,
    unregister,
    isRegistering,
    error,
    announcement,
  };
}
