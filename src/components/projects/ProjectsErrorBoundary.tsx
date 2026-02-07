"use client";

import React, { Component, ReactNode } from "react";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectsErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ProjectsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Projects Error Boundary
 * Specialized error boundary for the projects page
 * Catches React errors in project components and displays a user-friendly fallback UI
 */
export class ProjectsErrorBoundary extends Component<
  ProjectsErrorBoundaryProps,
  ProjectsErrorBoundaryState
> {
  constructor(props: ProjectsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ProjectsErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error("Projects Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      errorInfo,
    });

    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div
          className="min-h-[600px] flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-2xl w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" aria-hidden="true" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Unable to Load Projects
              </h2>
              <p className="text-base text-gray-600 max-w-lg mx-auto">
                We encountered an error while loading the projects page. This might be a
                temporary issue. Please try refreshing the page or come back later.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <details className="mt-6 text-left bg-gray-50 border border-gray-200 rounded-lg">
                <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 rounded-t-lg">
                  Error Details (Development Only)
                </summary>
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-1">
                      Error Message:
                    </h3>
                    <pre className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 overflow-auto max-h-32">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 mb-1">
                        Stack Trace:
                      </h3>
                      <pre className="p-3 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 overflow-auto max-h-48">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 mb-1">
                        Component Stack:
                      </h3>
                      <pre className="p-3 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={this.handleReset}
                className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold px-6 py-3"
                aria-label="Try again to reload the projects"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3"
                aria-label="Reload the entire page"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3"
                aria-label="Go to home page"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Go Home
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 pt-4">
              If the problem persists, please contact support or try again later.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
