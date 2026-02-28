'use client';

import { useState, useCallback } from 'react';
import { ApiClientError } from '@/lib/api/client';
import { CompletionCelebrationData, CompleteProjectResponse, ProjectCompletionError } from '@/lib/types/project.types';
import toast from 'react-hot-toast';

interface UseProjectCompletionReturn {
  completeProject: (projectId: string, projectTitle?: string) => Promise<void>;
  isCompleting: boolean;
  error: ApiClientError | null;
  showCelebration: boolean;
  celebrationData: CompletionCelebrationData | null;
  dismissCelebration: () => void;
}

/**
 * Custom hook for managing project completion workflow
 * 
 * Features:
 * - Project completion with API call
 * - Loading state management
 * - Error handling with user-friendly messages
 * - Success toast notifications
 * - Celebration modal state management
 * - Optimistic updates support
 * 
 * Requirements: 2.1, 2.6, 9.1
 * 
 * @example
 * ```tsx
 * const { 
 *   completeProject, 
 *   isCompleting, 
 *   showCelebration, 
 *   celebrationData,
 *   dismissCelebration 
 * } = useProjectCompletion();
 * 
 * // Complete a project
 * await completeProject('project-id-123', 'My Awesome Project');
 * 
 * // Celebration modal will automatically show on success
 * // Dismiss celebration modal
 * dismissCelebration();
 * ```
 */
export function useProjectCompletion(): UseProjectCompletionReturn {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<CompletionCelebrationData | null>(null);

  /**
   * Complete a project and trigger celebration
   * 
   * @param projectId - The ID of the project to complete
   * @param projectTitle - Optional project title for notifications
   */
  const completeProject = useCallback(async (projectId: string, projectTitle?: string) => {
    setIsCompleting(true);
    setError(null);
    
    const title = projectTitle || 'the project';

    try {
      // Get CSRF token
      const { getCSRFToken } = await import('@/lib/utils/csrf');
      const csrfToken = await getCSRFToken();

      // Call API to complete project
      const response = await fetch(`/api/projects/${projectId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ProjectCompletionError;
        throw new ApiClientError(
          response.status,
          errorData.error.code,
          errorData.error.message,
          errorData.error.details
        );
      }

      const successData = data as CompleteProjectResponse;
      
      // Prepare celebration data
      const celebration: CompletionCelebrationData = {
        projectId: successData.data.project.id,
        projectTitle: successData.data.project.title,
        xpAwarded: successData.data.project.xpAwarded.owner,
        hallOfFameUrl: `/projects?tab=hall-of-fame`,
        completedAt: new Date(successData.data.project.completedAt),
      };
      
      setCelebrationData(celebration);
      setShowCelebration(true);
      
      // Show success toast
      toast.success(`${title} completed successfully! You earned ${celebration.xpAwarded} XP!`);
      
    } catch (err) {
      // Handle errors
      const apiError = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred while completing the project');
      
      setError(apiError);
      
      // Determine user-friendly error message
      let errorMessage = '';
      
      switch (apiError.code) {
        case 'UNAUTHORIZED':
          errorMessage = 'Only the project owner can mark the project as complete';
          break;
        case 'INVALID_STATUS':
          errorMessage = 'Project must be in progress to be completed';
          break;
        case 'ALREADY_COMPLETED':
          errorMessage = 'This project has already been marked as complete';
          break;
        case 'PROJECT_NOT_FOUND':
          errorMessage = 'Project not found';
          break;
        case 'UNAUTHENTICATED':
          errorMessage = 'Please log in to complete projects';
          break;
        default:
          errorMessage = apiError.message || 'Failed to complete project';
      }
      
      // Show error toast
      toast.error(errorMessage);
      
      throw apiError;
    } finally {
      setIsCompleting(false);
    }
  }, []);

  /**
   * Dismiss the celebration modal
   */
  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
    // Keep celebration data for a moment in case it's needed
    setTimeout(() => {
      setCelebrationData(null);
    }, 500);
  }, []);

  return {
    completeProject,
    isCompleting,
    error,
    showCelebration,
    celebrationData,
    dismissCelebration,
  };
}
