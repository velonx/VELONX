/**
 * Example usage of useEventRegistration hook
 * 
 * This file demonstrates how to use the useEventRegistration hook
 * in a React component for managing event registration and unregistration.
 */

import React from 'react';
import { useEventRegistration } from '../useEventRegistration';
import { Button } from '@/components/ui/button';

interface EventRegistrationButtonProps {
  eventId: string;
  eventTitle: string;
  isRegistered: boolean;
  onRegistrationChange?: () => void;
}

/**
 * Example component showing basic usage of useEventRegistration
 */
export function EventRegistrationButton({
  eventId,
  eventTitle,
  isRegistered,
  onRegistrationChange,
}: EventRegistrationButtonProps) {
  const { register, unregister, isRegistering } = useEventRegistration();

  const handleClick = async () => {
    try {
      if (isRegistered) {
        await unregister(eventId, eventTitle);
      } else {
        await register(eventId, eventTitle);
      }
      // Optionally refresh data after registration change
      onRegistrationChange?.();
    } catch (error) {
      // Error is already handled by the hook with toast notifications
      console.error('Registration action failed:', error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isRegistering}
      variant={isRegistered ? 'outline' : 'default'}
    >
      {isRegistering
        ? 'Processing...'
        : isRegistered
        ? 'Unregister'
        : 'Register Now'}
    </Button>
  );
}

/**
 * Example component showing advanced usage with optimistic UI updates
 */
export function EventCardWithRegistration({
  event,
  onRefresh,
}: {
  event: { id: string; title: string; isUserRegistered: boolean };
  onRefresh: () => void;
}) {
  const { register, unregister, isRegistering, error } = useEventRegistration();
  const [optimisticRegistered, setOptimisticRegistered] = React.useState(
    event.isUserRegistered
  );

  const handleRegister = async () => {
    // Optimistic update
    setOptimisticRegistered(true);

    try {
      await register(event.id, event.title);
      onRefresh(); // Refresh data from server
    } catch (err) {
      // Rollback on error
      setOptimisticRegistered(false);
    }
  };

  const handleUnregister = async () => {
    // Optimistic update
    setOptimisticRegistered(false);

    try {
      await unregister(event.id, event.title);
      onRefresh(); // Refresh data from server
    } catch (err) {
      // Rollback on error
      setOptimisticRegistered(true);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-bold">{event.title}</h3>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          Error: {error.message}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {optimisticRegistered ? (
          <Button
            onClick={handleUnregister}
            disabled={isRegistering}
            variant="outline"
          >
            {isRegistering ? 'Unregistering...' : 'Unregister'}
          </Button>
        ) : (
          <Button
            onClick={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? 'Registering...' : 'Register'}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Example showing usage in a modal/dialog
 */
export function EventDetailsModalExample({
  eventId,
  eventTitle,
  isRegistered,
  onClose,
  onSuccess,
}: {
  eventId: string;
  eventTitle: string;
  isRegistered: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { register, unregister, isRegistering } = useEventRegistration();

  const handleConfirmRegistration = async () => {
    try {
      await register(eventId, eventTitle);
      onSuccess();
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleConfirmUnregistration = async () => {
    try {
      await unregister(eventId, eventTitle);
      onSuccess();
      onClose();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isRegistered ? 'Unregister from Event' : 'Register for Event'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isRegistered
            ? `Are you sure you want to unregister from "${eventTitle}"?`
            : `Confirm your registration for "${eventTitle}"`}
        </p>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isRegistering}
          >
            Cancel
          </Button>
          <Button
            onClick={
              isRegistered ? handleConfirmUnregistration : handleConfirmRegistration
            }
            disabled={isRegistering}
          >
            {isRegistering ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
