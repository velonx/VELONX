"use client";

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  /**
   * Type of error to display
   */
  type?: "api" | "network" | "timeout" | "generic";
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
   * Additional details about the error (optional)
   */
  details?: string;
}

/**
 * ErrorState Component
 * Displays user-friendly error messages for API failures
 * Provides retry functionality with loading state
 */
export function ErrorState({
  type = "generic",
  message,
  onRetry,
  isRetrying = false,
  details,
}: ErrorStateProps) {
  // Determine icon and default message based on error type
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: WifiOff,
          title: "Network Error",
          defaultMessage:
            "Unable to connect to the server. Please check your internet connection and try again.",
          iconColor: "text-orange-500",
          bgColor: "bg-orange-500/10",
        };
      case "timeout":
        return {
          icon: AlertCircle,
          title: "Request Timeout",
          defaultMessage:
            "The request took too long to complete. Please try again.",
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
        };
      case "api":
        return {
          icon: AlertCircle,
          title: "Failed to Load Projects",
          defaultMessage:
            "We couldn't load the projects. This might be a temporary issue. Please try again.",
          iconColor: "text-red-500",
          bgColor: "bg-red-500/10",
        };
      default:
        return {
          icon: AlertCircle,
          title: "Something Went Wrong",
          defaultMessage:
            "An unexpected error occurred. Please try again or contact support if the problem persists.",
          iconColor: "text-red-500",
          bgColor: "bg-red-500/10",
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-6"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}
          >
            <Icon className={`w-8 h-8 ${config.iconColor}`} aria-hidden="true" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{config.title}</h3>
          <p className="text-sm text-gray-600">{displayMessage}</p>
          {details && (
            <p className="text-xs text-gray-500 mt-2 italic">{details}</p>
          )}
        </div>

        {/* Retry Button */}
        {onRetry && (
          <div className="flex justify-center pt-2">
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold px-6 py-3"
              aria-label={isRetrying ? "Retrying..." : "Retry loading projects"}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 pt-2">
          If the problem persists, please try refreshing the page or contact support.
        </p>
      </div>
    </div>
  );
}

/**
 * Network Error State
 * Specialized error state for network connectivity issues
 */
export function NetworkErrorState({
  onRetry,
  isRetrying,
}: Pick<ErrorStateProps, "onRetry" | "isRetrying">) {
  return (
    <ErrorState
      type="network"
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}

/**
 * API Error State
 * Specialized error state for API failures
 */
export function APIErrorState({
  message,
  onRetry,
  isRetrying,
  details,
}: ErrorStateProps) {
  return (
    <ErrorState
      type="api"
      message={message}
      onRetry={onRetry}
      isRetrying={isRetrying}
      details={details}
    />
  );
}

/**
 * Timeout Error State
 * Specialized error state for request timeouts
 */
export function TimeoutErrorState({
  onRetry,
  isRetrying,
}: Pick<ErrorStateProps, "onRetry" | "isRetrying">) {
  return (
    <ErrorState
      type="timeout"
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}
