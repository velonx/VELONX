"use client";

import React, { Component, ReactNode } from "react";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors in child components and displays a fallback UI
 * Prevents the entire app from crashing due to component errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console for debugging
    console.error("Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Component Stack:", errorInfo.componentStack);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6" role="alert" aria-live="assertive">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-100">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-400">
                We encountered an error while displaying this content. Please try again.
              </p>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    Error details
                  </summary>
                  <pre className="mt-2 p-3 bg-black/30 rounded text-xs text-red-400 overflow-auto max-h-40">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                aria-label="Try again to reload the component"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/5"
                aria-label="Reload the entire page"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Settings Error Boundary
 * Specialized error boundary for the settings page
 */
export function SettingsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log settings-specific errors
        console.error("Settings Error:", {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }}
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-6" role="alert" aria-live="assertive">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-100">
                Unable to load settings
              </h2>
              <p className="text-sm text-gray-400">
                We encountered an error while loading your account settings. This might be a temporary issue.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                aria-label="Reload settings page"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Reload Settings
              </Button>
              <Button
                onClick={() => window.location.href = "/dashboard/student"}
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/5"
                aria-label="Go to dashboard"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
