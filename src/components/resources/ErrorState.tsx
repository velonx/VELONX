/**
 * ErrorState Component
 * Feature: resources-page-ui-improvements
 * 
 * Displays user-friendly error messages with retry functionality.
 * 
 * Requirements:
 * - 6.2: Display error message and retry button
 * 
 * Accessibility:
 * - role="alert" for error announcements
 * - aria-live="polite" for screen readers
 * - Keyboard accessible retry button
 */

'use client';

import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  /**
   * Type of error to display
   */
  type?: 'network' | 'server' | 'client' | 'generic';
  
  /**
   * Custom error message (optional)
   */
  message?: string;
  
  /**
   * Callback when retry button is clicked
   */
  onRetry?: () => void;
  
  /**
   * Whether retry is in progress
   */
  isRetrying?: boolean;
  
  /**
   * Additional error details (optional, collapsed by default)
   */
  details?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Configuration for each error type
 */
const ERROR_CONFIG = {
  network: {
    icon: WifiOff,
    title: 'Network Error',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  server: {
    icon: ServerCrash,
    title: 'Server Error',
    defaultMessage: 'Something went wrong on our end. Please try again in a moment.',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  client: {
    icon: AlertCircle,
    title: 'Invalid Request',
    defaultMessage: 'There was a problem with your request. Please adjust your filters and try again.',
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  generic: {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    defaultMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
} as const;

/**
 * ErrorState Component
 * 
 * Displays contextual error messages with appropriate icons and retry functionality.
 * Handles different error types (network, server, client) with specific messaging.
 */
export function ErrorState({
  type = 'generic',
  message,
  onRetry,
  isRetrying = false,
  details,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div
      className={cn(
        'min-h-[400px] flex items-center justify-center p-6 error-state-enter',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              config.bgColor
            )}
          >
            <Icon 
              className={cn('w-8 h-8', config.iconColor)} 
              aria-hidden="true" 
            />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            {config.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {displayMessage}
          </p>
        </div>

        {/* Error Details (Collapsible) */}
        {details && (
          <div className="space-y-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
              aria-expanded={showDetails}
              aria-controls="error-details"
            >
              {showDetails ? 'Hide' : 'Show'} technical details
            </button>
            {showDetails && (
              <div
                id="error-details"
                className="text-xs text-muted-foreground bg-muted p-3 rounded-md text-left font-mono"
              >
                {details}
              </div>
            )}
          </div>
        )}

        {/* Retry Button */}
        {onRetry && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold px-6 py-3 retry-button-hover"
              aria-label={isRetrying ? 'Retrying...' : 'Retry loading resources'}
            >
              <RefreshCw
                className={cn(
                  'w-4 h-4 mr-2',
                  isRetrying && 'animate-spin'
                )}
                aria-hidden="true"
              />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground pt-2">
          If the problem persists, please try refreshing the page or contact support.
        </p>
      </div>
    </div>
  );
}

ErrorState.displayName = 'ErrorState';
